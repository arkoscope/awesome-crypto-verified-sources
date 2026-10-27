import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';

test('real stdio handshake, bounded lookup, evidence fidelity and no write surface', async () => {
 const dataPath=new URL('../sources.json',import.meta.url);
 const before=await readFile(dataPath);
 const registry=JSON.parse(before);
 const client=new Client({name:'arkoscope-registry-test',version:'1.0.0'});
 const transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('./server.mjs',import.meta.url))],stderr:'pipe'});
 try {
  await client.connect(transport);
  const tools=await client.listTools();
  assert.deepEqual(tools.tools.map(t=>t.name).sort(),['get_project_sources','list_projects']);
  for(const t of tools.tools){assert.equal(t.annotations.readOnlyHint,true);assert.equal(t.annotations.destructiveHint,false);}
  const all=await client.callTool({name:'list_projects',arguments:{}});
  assert.equal(all.structuredContent.count,35);
  const wave=await client.callTool({name:'list_projects',arguments:{wave:3}});
  assert.equal(wave.structuredContent.count,10);
  const sol=await client.callTool({name:'get_project_sources',arguments:{project:'SOL'}});
  assert.equal(sol.structuredContent.record.project,'Solana');
  assert.deepEqual(sol.structuredContent.record.xEvidence,registry.projects.find(p=>p.ticker==='SOL').xEvidence);
  assert.equal(sol.structuredContent.iosPublicDownloadAvailable,false);
  const gram=await client.callTool({name:'get_project_sources',arguments:{project:'GRAM'}});
  assert.equal(gram.structuredContent.record.project,'The Open Network');
  const unknown=await client.callTool({name:'get_project_sources',arguments:{project:'../../.env'}});
  assert.equal(unknown.structuredContent.status,'not_found');
  const arbitraryURL=await client.callTool({name:'get_project_sources',arguments:{project:'https://example.com/private'}});
  assert.equal(arbitraryURL.structuredContent.status,'not_found');
  const invalid=await client.callTool({name:'list_projects',arguments:{query:'x'.repeat(81)}}).catch(e=>({isError:true}));
  assert.equal(invalid.isError,true);
  const resources=await client.listResources();assert.equal(resources.resources.length,1);
  const resource=await client.readResource({uri:'arkoscope://public/sources'});
  assert.equal(JSON.parse(resource.contents[0].text).registry.projects.length,35);
  assert.equal(createHash('sha256').update(await readFile(dataPath)).digest('hex'),createHash('sha256').update(before).digest('hex'));
 } finally { await client.close(); }
});
