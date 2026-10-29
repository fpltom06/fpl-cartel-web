import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const compile=source=>ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const url=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
let api=compile(await readFile(new URL('../src/services/api.ts',import.meta.url),'utf8'));
api=api.replace("import { apiUrl } from './runtime';", "const apiUrl=path=>'https://api.example.test'+path;");
let source=compile(await readFile(new URL('../src/services/bestSquad.ts',import.meta.url),'utf8'));
source=source.replace("'./api'",JSON.stringify(url(api)));
const {optimizeBestSquad}=await import(url(source));
test('Best Squad sends banned IDs, selected controls and dataset version to API',async()=>{
 const original=globalThis.fetch;let captured;
 globalThis.fetch=async(path,options)=>{captured={path,...options};return new Response(JSON.stringify({players:[{playerId:2,name:'Palmer',club:'IPS',position:'GK'}],projectedTotal:80}),{headers:{'Content-Type':'application/json'}})};
 try{
  const controller=new AbortController();const result=await optimizeBestSquad(12,105.1,[1,8],'version-A',controller.signal);
  assert.equal(captured.path,'https://api.example.test/optimize/best-squad');
  assert.equal(captured.method,'POST');assert.equal(captured.signal,controller.signal);
  assert.deepEqual(JSON.parse(captured.body),{gameweek:12,budget:105.1,banned_player_ids:[1,8],modelUpdatedAt:'version-A'});
  assert.equal(result.players[0].playerId,2);assert.equal(result.projectedTotal,80);
 }finally{globalThis.fetch=original}
});
test('Best Squad exposes infeasible-budget API errors',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({error:{code:'no_legal_squad',message:'No legal squad is available with this budget and these bans.'}}),{status:422,headers:{'Content-Type':'application/json'}});
 try{await assert.rejects(optimizeBestSquad(9,95,[1],'version-A'),/No legal squad/)}finally{globalThis.fetch=original}
});
