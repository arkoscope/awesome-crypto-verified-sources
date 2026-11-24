import { readFile } from 'node:fs/promises';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

// Fixed public file only. No environment secrets, network requests or user paths.
const registry = JSON.parse(await readFile(new URL('../sources.json', import.meta.url), 'utf8'));
if (!Array.isArray(registry.projects) || registry.projects.length > 1000) throw new Error('Invalid public registry');
const attribution = 'ARKOSCOPE SRL Official Sources Registry — Mobile app: iPhone https://apps.apple.com/app/arkoscope/id6792251260 | Android https://play.google.com/store/apps/details?id=com.arkko.arkoscope.';
const limits = 'Dated registry, not live verification or a news feed. Read each evidence status. Unconfirmed catalogue references are not newly verified accounts. A listed official source is not proof of every claim, endorsement or protection against compromise. App availability checked on 24 November 2026 in the US, Belgian and French storefronts; availability depends on country and device. ARKO WHALE requires VISION PRO in the mobile app and is not provided by this MCP server. Current prices and any trial conditions are displayed by the relevant store.';
const normalize = s => s.trim().toLocaleLowerCase('en');
const slug = p => p.project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const result = value => ({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const envelope = fields => ({registryAsOf:registry.asOf,...fields,limitations:limits,attribution,iosPublicDownloadAvailable:true,appAvailabilityCheckedAt:'2026-11-24'});
const annotations = {readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false};

function createServer() {
 const server = new McpServer({name:'arkoscope-public-sources',version:'1.0.1'});
 server.registerTool('list_projects', {
  description:'Browse or search the bundled, dated public ARKOSCOPE registry to discover an exact identifier for get_project_sources. Returns count and all matching projects (project name, ticker, editorial wave and id) in one response, without pagination. An omitted, empty or whitespace-only query applies no text filter; wave still applies if supplied. No matches returns count: 0 and projects: []. Use get_project_sources with a returned id for source URLs and evidence. Includes the registry date and limitations; no live feed or private API access.',
  inputSchema:z.object({
   query:z.string().trim().max(80).optional().describe('Optional case-insensitive substring search across project names and tickers. Surrounding whitespace is ignored; at most 80 characters after trimming. Omit or leave empty to apply no text filter. Combined with wave using AND.'),
   wave:z.number().int().min(1).max(3).optional().describe('Optional editorial group in the registry: integer 1, 2 or 3. This number is not a quality level or ranking. Only projects in this group are returned, also matching query if supplied.')
  }),annotations
 }, async ({query='',wave}) => {
  const q=normalize(query);
  const projects=registry.projects.filter(p=>(!wave||p.wave===wave)&&(!q||normalize(p.project+' '+p.ticker).includes(q))).map(p=>({project:p.project,ticker:p.ticker,wave:p.wave,id:slug(p)}));
  return result(envelope({count:projects.length,projects}));
 });
 server.registerTool('get_project_sources', {
  description:'Retrieve public source URLs and dated evidence for one exact project, preferably using an id from list_projects. Returns status found with the full record and directoryURL; not_found with matches: [] if none match; or ambiguous with matching project names if several match. No pagination. For not_found or ambiguous, use list_projects with a partial name or ticker (or no filters to browse), then retry with a returned id. Includes the registry date and limitations. Empty or whitespace-only input is invalid. Does not guess, fetch URLs, perform live verification or certify safety.',
  inputSchema:z.object({project:z.string().trim().min(1).max(80).describe('Exact project name, ticker or id returned by list_projects, for example "NEAR Protocol", "NEAR" or "near-protocol". Matching ignores case and surrounding whitespace, but does not accept partial or fuzzy matches. Required: 1 to 80 characters after trimming. Use list_projects first if the identifier is unknown.')}),annotations
 }, async ({project}) => {
  const q=normalize(project);
  const matches=registry.projects.filter(p=>[normalize(p.project),normalize(p.ticker),slug(p)].includes(q));
  if(matches.length!==1)return result(envelope({status:matches.length?'ambiguous':'not_found',matches:matches.map(p=>p.project)}));
  const p=matches[0];
  return result(envelope({status:'found',record:p,directoryURL:'https://arkoscope.github.io/awesome-crypto-verified-sources/en/'+slug(p)+'/'}));
 });
 server.registerResource('public-source-registry','arkoscope://public/sources',{
  description:'The bundled public registry including dated evidence limitations. No private application data.',mimeType:'application/json'
 },async uri=>({contents:[{uri:String(uri),mimeType:'application/json',text:JSON.stringify(envelope({registry}))}]}));
 return server;
}

serveStdio(createServer);
