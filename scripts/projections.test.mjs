import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source=await readFile(new URL('../src/services/projections.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {parseProjectionExport,pointsFor}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const payload=JSON.parse(await readFile(new URL('../public/data/projections.json',import.meta.url),'utf8'));
const dataset=parseProjectionExport(payload);
test('real export preserves every player/gameweek and its exact points',()=>{
  const actual=new Map(dataset.players.flatMap(p=>p.weeks.map(w=>[w.playerId+':'+w.gameweek,w.projectedPoints])));
  assert.equal(actual.size,payload.projections.length);
  for(const row of payload.projections) assert.equal(actual.get(row.playerId+':'+row.gameweek),row.projectedPoints);
});
test('next five totals stop at five and use dynamic sorted gameweeks',()=>{
  for(const player of dataset.players){
    const expected=payload.projections.filter(r=>r.playerId===player.playerId&&dataset.gameweeks.slice(0,5).includes(r.gameweek)).reduce((sum,r)=>sum+r.projectedPoints,0);
    assert.equal(pointsFor(player,'all'),expected);
  }
  const shifted={...payload,projections:payload.projections.filter(r=>r.gameweek>=10)};
  assert.equal(parseProjectionExport(shifted).gameweeks[0],10);
});
test('duplicate identities fail visibly',()=>{
  assert.throws(()=>parseProjectionExport({...payload,projections:[payload.projections[0],payload.projections[0]]}),/Duplicate/);
});
test('invalid IDs, positions, prices and nonfinite points are rejected',()=>{
  for(const change of [{playerId:0},{position:'UNKNOWN'},{price:0},{projectedPoints:Infinity}]){
    assert.throws(()=>parseProjectionExport({...payload,projections:[{...payload.projections[0],...change}]}),/Invalid/);
  }
});
test('incomplete player horizons are not silently undercounted',()=>{
  assert.throws(()=>parseProjectionExport({...payload,projections:payload.projections.slice(1)}),/Incomplete/);
});
test('same-name players use independent FPL IDs',()=>{
  const one=payload.projections[0];
  const result=parseProjectionExport({...payload,projections:[one,{...one,playerId:99999}]});
  assert.equal(result.players.length,2);
});
test('complete season payload has no available gameweeks',()=>{
  assert.deepEqual(parseProjectionExport({...payload,projections:[]}).gameweeks,[]);
});

