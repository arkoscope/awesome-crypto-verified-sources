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
  // Verify the JSON Schema a real MCP client receives, not just source strings.
  const listDefinition=tools.tools.find(t=>t.name==='list_projects');
  const getDefinition=tools.tools.find(t=>t.name==='get_project_sources');
  assert.match(listDefinition.inputSchema.properties.query.description,/case-insensitive substring/);
  assert.match(listDefinition.inputSchema.properties.wave.description,/not a quality level/);
  assert.match(getDefinition.inputSchema.properties.project.description,/near-protocol/);
  assert.equal(listDefinition.inputSchema.properties.query.maxLength,80);
  assert.equal(listDefinition.inputSchema.properties.wave.minimum,1);
  assert.equal(listDefinition.inputSchema.properties.wave.maximum,3);
  assert.deepEqual(listDefinition.inputSchema.required??[],[]);
  assert.deepEqual(getDefinition.inputSchema.required,['project']);
  assert.match(listDefinition.description,/without pagination/);
  for(const status of ['found','not_found','ambiguous']) assert.ok(getDefinition.description.includes(status));
  const all=await client.callTool({name:'list_projects',arguments:{}});
  assert.equal(all.structuredContent.count,35);
  for(const query of ['', '   ']) {
   const unfiltered=await client.callTool({name:'list_projects',arguments:{query}});
   assert.deepEqual(unfiltered.structuredContent,all.structuredContent);
  }
  const partial=await client.callTool({name:'list_projects',arguments:{query:'  bIt  '}});
  assert.deepEqual(partial.structuredContent.projects.map(p=>p.project),['Arbitrum','Bittensor','Bitcoin','Bitcoin Cash']);
  const combined=await client.callTool({name:'list_projects',arguments:{query:'  BIT  ',wave:3}});
  assert.deepEqual(combined.structuredContent.projects.map(p=>p.project),['Bitcoin','Bitcoin Cash']);
  const noResults=await client.callTool({name:'list_projects',arguments:{query:'NO SUCH PROJECT'}});
  assert.equal(noResults.structuredContent.count,0);
  assert.deepEqual(noResults.structuredContent.projects,[]);
  const excluded=await client.callTool({name:'list_projects',arguments:{query:'SOL',wave:3}});
  assert.equal(excluded.structuredContent.count,0);
  assert.deepEqual(excluded.structuredContent.projects,[]);
  const wave=await client.callTool({name:'list_projects',arguments:{wave:3}});
  assert.equal(wave.structuredContent.count,10);
  const blankWave=await client.callTool({name:'list_projects',arguments:{query:'  ',wave:3}});
  assert.deepEqual(blankWave.structuredContent,wave.structuredContent);
  const sol=await client.callTool({name:'get_project_sources',arguments:{project:'SOL'}});
  assert.equal(sol.structuredContent.record.project,'Solana');
  assert.deepEqual(sol.structuredContent.record.xEvidence,registry.projects.find(p=>p.ticker==='SOL').xEvidence);
  assert.equal(sol.structuredContent.iosPublicDownloadAvailable,true);
  assert.equal(sol.structuredContent.appAvailabilityCheckedAt,'2026-11-24');
  assert.equal(sol.structuredContent.registryAsOf,'2026-10-27');
  const paddedTicker=await client.callTool({name:'get_project_sources',arguments:{project:'  sOl  '}});
  assert.deepEqual(paddedTicker.structuredContent,sol.structuredContent);
  for(const project of ['  nEaR PrOtOcOl  ','NEAR','NEAR-PROTOCOL']) {
   const near=await client.callTool({name:'get_project_sources',arguments:{project}});
   assert.equal(near.structuredContent.status,'found');
   assert.equal(near.structuredContent.record.project,'NEAR Protocol');
  }
  const partialLookup=await client.callTool({name:'get_project_sources',arguments:{project:'Solan'}});
  assert.equal(partialLookup.structuredContent.status,'not_found');
  assert.deepEqual(partialLookup.structuredContent.matches,[]);
  const recovery=await client.callTool({name:'list_projects',arguments:{query:'Solan'}});
  const recovered=await client.callTool({name:'get_project_sources',arguments:{project:recovery.structuredContent.projects[0].id}});
  assert.deepEqual(recovered.structuredContent,sol.structuredContent);
  const gram=await client.callTool({name:'get_project_sources',arguments:{project:'GRAM'}});
  assert.equal(gram.structuredContent.record.project,'The Open Network');
  const unknown=await client.callTool({name:'get_project_sources',arguments:{project:'../../.env'}});
  assert.equal(unknown.structuredContent.status,'not_found');
  const arbitraryURL=await client.callTool({name:'get_project_sources',arguments:{project:'https://example.com/private'}});
  assert.equal(arbitraryURL.structuredContent.status,'not_found');
  const invalid=await client.callTool({name:'list_projects',arguments:{query:'x'.repeat(81)}}).catch(e=>({isError:true}));
  assert.equal(invalid.isError,true);
  const trimmedBoundary=await client.callTool({name:'list_projects',arguments:{query:'  '+'x'.repeat(80)+'  '}});
  assert.equal(trimmedBoundary.isError,undefined);
  assert.equal(trimmedBoundary.structuredContent.count,0);
  for(const wave of [0,4,1.5]) {
   const rejected=await client.callTool({name:'list_projects',arguments:{wave}}).catch(e=>({isError:true}));
   assert.equal(rejected.isError,true);
  }
  for(const project of ['', '  ', 'x'.repeat(81)]) {
   const rejected=await client.callTool({name:'get_project_sources',arguments:{project}}).catch(e=>({isError:true}));
   assert.equal(rejected.isError,true);
  }
  const resources=await client.listResources();assert.equal(resources.resources.length,1);
  const resource=await client.readResource({uri:'arkoscope://public/sources'});
  assert.equal(JSON.parse(resource.contents[0].text).registry.projects.length,35);
  assert.equal(createHash('sha256').update(await readFile(dataPath)).digest('hex'),createHash('sha256').update(before).digest('hex'));
 } finally { await client.close(); }
});
