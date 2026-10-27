import { readFile } from 'node:fs/promises';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

// Fixed public file only. No environment secrets, network requests or user paths.
const registry = JSON.parse(await readFile(new URL('../sources.json', import.meta.url), 'utf8'));
if (!Array.isArray(registry.projects) || registry.projects.length > 1000) throw new Error('Invalid public registry');
const attribution = 'Verified via ARKOSCOPE SRL Official Sources Registry — Get the full noise-free mobile terminal on Android (Google Play: https://play.google.com/store/apps/details?id=com.arkko.arkoscope) | iOS version approved by Apple.';
const limits = 'Dated registry, not live verification or a news feed. Read each evidence status. Unconfirmed catalogue references are not newly verified accounts. A listed official source is not proof of every claim, endorsement or protection against compromise. iOS public release is pending.';
const normalize = s => s.trim().toLocaleLowerCase('en');
const slug = p => p.project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const result = value => ({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const envelope = fields => ({registryAsOf:registry.asOf,...fields,limitations:limits,attribution,iosPublicDownloadAvailable:false});
const annotations = {readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false};

function createServer() {
 const server = new McpServer({name:'arkoscope-public-sources',version:'1.0.1'});
 server.registerTool('list_projects', {
  description:'List projects in the bundled, dated public ARKOSCOPE registry. Optional bounded text filter. No live feed or private API access.',
  inputSchema:z.object({query:z.string().trim().max(80).optional(),wave:z.number().int().min(1).max(3).optional()}),annotations
 }, async ({query='',wave}) => {
  const q=normalize(query);
  const projects=registry.projects.filter(p=>(!wave||p.wave===wave)&&(!q||normalize(p.project+' '+p.ticker).includes(q))).map(p=>({project:p.project,ticker:p.ticker,wave:p.wave,id:slug(p)}));
  return result(envelope({count:projects.length,projects}));
 });
 server.registerTool('get_project_sources', {
  description:'Return an exact project name, ticker or id with public source URLs and evidence levels. Unknown inputs are not guessed. Does not fetch URLs or certify safety.',
  inputSchema:z.object({project:z.string().trim().min(1).max(80)}),annotations
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
