import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
async function files(dir,prefix=''){
 const entries=await readdir(dir,{withFileTypes:true});const result=[];
 for(const entry of entries){const name=prefix+entry.name;result.push(...entry.isDirectory()?await files(path.join(dir,entry.name),name+'/'):[name])}
 return result;
}
const output=await files(path.join(root,'dist'));
const allowed=/^(index\.html|_redirects|api-unavailable\.json|data\/projections\.json|assets\/[^/]+\.(js|css))$/;
assert(output.every(name=>allowed.test(name)),'Unexpected file in deployment output');
assert(output.includes('_redirects')&&output.includes('data/projections.json')&&output.some(n=>n.endsWith('.js'))&&output.some(n=>n.endsWith('.css')));
const original=await readFile(path.join(root,'public/data/projections.json'));
const exported=await readFile(path.join(root,'dist/data/projections.json'));
assert(original.equals(exported),'Bundled projections differ from source');
const data=JSON.parse(exported);
const manifest=JSON.parse(await readFile(path.join(root,'DATA_VERSION.json'),'utf8'));
assert.equal(manifest.sha256,createHash('sha256').update(exported).digest('hex'),'Regenerate DATA_VERSION.json for the current projection export');
assert.equal(manifest.modelUpdatedAt,data.modelUpdatedAt);
assert.equal(manifest.rowCount,data.projections.length);
assert.deepEqual(Object.keys(data).sort(),['exportedAt','modelUpdatedAt','projections','schemaVersion']);
const allowedFields=['club','fixture','gameweek','minutesFactor','name','playerId','position','price','projectedPoints'].sort();
for(const row of data.projections)assert.deepEqual(Object.keys(row).sort(),allowedFields);
for(const name of output){
 const content=await readFile(path.join(root,'dist',name),'utf8');
 assert(!/C:\\Users\\|C:\\\\Users|C:\/Users|file:\/\/|127\.0\.0\.1|BEGIN (?:RSA |EC )?PRIVATE KEY|AKIA[0-9A-Z]{16}/i.test(content),'Local path or credential marker in '+name);
}
const source=await files(path.join(root,'src'));
for(const name of source){
 const text=await readFile(path.join(root,'src',name),'utf8');
 assert(!/C:\\Users\\|C:\/Users|file:\/\/|localhost|127\.0\.0\.1/i.test(text),'Local dependency in first-party browser source: '+name);
}
const redirects=await readFile(path.join(root,'dist/_redirects'),'utf8');
assert(redirects.includes('/* /index.html 200'));
assert(redirects.indexOf('/api/*')<redirects.indexOf('/* /index.html'),'API guard must precede SPA fallback');
const netlify=await readFile(path.join(root,'netlify.toml'),'utf8');
assert(netlify.includes('command = "npm run build"')&&netlify.includes('publish = "dist"'));
console.log(JSON.stringify({status:'passed',files:output,players:new Set(data.projections.map(p=>p.playerId)).size,rows:data.projections.length,gameweeks:[...new Set(data.projections.map(p=>p.gameweek))].sort((a,b)=>a-b),projectionBytes:exported.length,notes:['First-party browser source contains no local host/path dependencies.','React Router bundle contains two localhost dummy URL bases for URL parsing, not network endpoints.','This checks local artifacts; hosted routing and private access still require an approved Netlify deployment.']},null,2));

