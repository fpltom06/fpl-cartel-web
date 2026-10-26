import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Users,ArrowRight,LoaderCircle,Info} from 'lucide-react';
import {useProjections} from '../components/projections/ProjectionProvider';
import {Pitch} from '../components/team-sheet/Pitch';
import {TeamSummary} from '../components/team-sheet/TeamSummary';
import {ExcludePlayers} from '../components/team-sheet/ExcludePlayers';
import {TransferRecommendation,signed} from '../components/team-sheet/TransferRecommendation';
import {transferRequest} from '../services/transfers';
import type {TeamSheetResult,TeamSheetMode} from '../types/teamSheet';
import type {TransferResults,TransferRequest,TransferPreview} from '../types/transfers';
import '../team-sheet.css';
import '../transfers.css';
function savedId(){try{return localStorage.getItem('fpl-cartel.team-id')??''}catch{return ''}}
export function Transfers(){
 const {dataset}=useProjections();
 const [id,setId]=useState(savedId),[team,setTeam]=useState<TeamSheetResult|null>(null);
 const [bank,setBank]=useState(''),[count,setCount]=useState(1),[mode,setMode]=useState<TeamSheetMode>('next'),[hit,setHit]=useState(0),[banned,setBanned]=useState<number[]>([]);
 const [busy,setBusy]=useState(false),[previewBusy,setPreviewBusy]=useState(false),[error,setError]=useState(''),[previewError,setPreviewError]=useState('');
 const [results,setResults]=useState<TransferResults|null>(null),[request,setRequest]=useState<TransferRequest|null>(null),[selected,setSelected]=useState(''),[preview,setPreview]=useState<TransferPreview|null>(null),[tab,setTab]=useState(0);
 const task=useRef<AbortController|null>(null);
 const version=dataset?.modelUpdatedAt;
 useEffect(()=>{task.current?.abort();setBusy(false);setResults(null);setPreview(null);setError('')},[bank,count,mode,hit,banned,version]);
 useEffect(()=>()=>task.current?.abort(),[]);
 useEffect(()=>{
   setPreview(null);setPreviewError('');setPreviewBusy(false);
   if(!results||!request)return;
   const option=results.recommendations.find(r=>r.id===selected);if(!option)return;
   const controller=new AbortController();setPreviewBusy(true);
   transferRequest<TransferPreview>('preview',{...request,moves:option.moves.map(m=>({outId:m.out.playerId,inId:m.in.playerId}))},controller.signal).then(data=>{if(!controller.signal.aborted){setPreview(data);setTab(data.team.gameweeks[0]??0)}}).catch(e=>{if(!controller.signal.aborted)setPreviewError(e.message)}).finally(()=>{if(!controller.signal.aborted)setPreviewBusy(false)});
   return()=>controller.abort();
 },[results,selected,request]);
 async function load(event:FormEvent){
   event.preventDefault();task.current?.abort();const controller=new AbortController();task.current=controller;
   setError('');setResults(null);setPreview(null);setTeam(null);
   if(!/^\d+$/.test(id)||Number(id)<1||Number(id)>2147483647){setError('Enter a valid positive FPL Team ID.');return}
   setBusy(true);
   try{
     const data=await transferRequest<TeamSheetResult>('load',{teamId:Number(id),modelUpdatedAt:version},controller.signal);
     if(controller.signal.aborted)return;setTeam(data);setBank(data.bank.toFixed(1));
     if(data.diagnostics.squadCount===15){try{localStorage.setItem('fpl-cartel.team-id',String(data.teamId))}catch{/* optional */}}
   }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Could not load team.')}finally{if(!controller.signal.aborted)setBusy(false)}
 }
 async function optimize(){
   if(!team||!version)return;
   if(bank.trim()===''||!Number.isFinite(Number(bank))||Number(bank)<0){setError('Enter a valid non-negative bank value.');return}
   task.current?.abort();const controller=new AbortController();task.current=controller;
   const body:TransferRequest={teamId:team.teamId,gameweeks:range??[],mode,modelUpdatedAt:version,count,hit,bank:Number(bank),excludedIds:banned};
   setBusy(true);setError('');setResults(null);setPreview(null);
   try{const data=await transferRequest<TransferResults>('optimize',body,controller.signal);if(!controller.signal.aborted){setResults(data);setRequest(body);setSelected(data.recommendations[0]?.id??'')}}
   catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Transfer search failed.')}
   finally{if(!controller.signal.aborted)setBusy(false)}
 }
 const current=results?.team??team,match=current?.diagnostics;
 const option=results?.recommendations.find(r=>r.id===selected),sheet=preview?.team.weeks.find(w=>w.gameweek===tab);
 const range=mode==='next'?dataset?.gameweeks.slice(0,1):mode==='five'?dataset?.gameweeks.slice(0,5):dataset?.gameweeks;
 const stale=current&&current.modelUpdatedAt!==version;
 return <><div className="page-heading"><div><div className="eyebrow">MY TEAM / YOUR NEXT MOVE</div><h1>Transfer Optimizer<span className="mint">.</span></h1><p>Find the best transfers for your FPL squad using the FPL Cartel model.</p></div><span className="outline-badge">PYTHON MODEL</span></div>
 <form className="tr-load" onSubmit={load}><label><span>FPL Team ID</span><input aria-label="FPL Team ID" inputMode="numeric" placeholder="5406" value={id} onChange={e=>setId(e.target.value)}/></label><button className="primary-button" disabled={busy||dataset?.source!=='model'}><Users size={16}/>Load Team</button>{current&&<div className="tr-bank-api">API money in bank<strong>£{current.bank.toFixed(1)}m</strong></div>}</form>
 {error&&<div className="ts-error" role="alert">{error}</div>}
 {match&&<><div className="ts-squad-info"><strong>{match.matchedCount}/15 squad players matched.</strong><span>Team {current.teamId} · Permanent squad from GW{current.sourceGameweek}</span></div>{current.sourceNote&&<p className="ts-source-note">{current.sourceNote}</p>}<details className="ts-diagnostics" open={match.missingPlayers.length>0}><summary>Squad matching diagnostics</summary><p>{match.squadCount} permanent squad IDs · {match.matchedCount} matched</p>{match.missingPlayers.map(p=><p key={p.playerId}>Missing projection: {p.name} ({p.club}, {p.position}, ID {p.playerId})</p>)}<p>Squad IDs: {match.squadPlayerIds.join(', ')}</p></details></>}
 {team&&<><section className="tr-settings" aria-label="Transfer controls"><label><span>Money in Bank (£m)</span><input aria-label="Money in Bank" type="number" min="0" step="0.1" value={bank} onChange={e=>setBank(e.target.value)} disabled={busy}/><small>API bank: £{team.bank.toFixed(1)}m · editable override</small></label>
 <label><span>Number of Transfers</span><select aria-label="Number of Transfers" value={count} onChange={e=>setCount(Number(e.target.value))} disabled={busy}>{[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
 <label><span>Planning Horizon</span><select aria-label="Planning Horizon" value={mode} onChange={e=>setMode(e.target.value as TeamSheetMode)} disabled={busy}><option value="next">Next GW</option><option value="five">Next 5 GWs</option><option value="all">All Remaining GWs</option></select></label>
 <label><span>Transfer Cost</span><select aria-label="Transfer Cost" value={hit} onChange={e=>setHit(Number(e.target.value))} disabled={busy}>{[0,4,8,12].map(n=><option key={n} value={n}>{n} points</option>)}</select></label></section>
 <ExcludePlayers players={dataset?.players??[]} value={banned} onChange={setBanned}/>
 <div className="tr-run"><p>GW{range?.[0]}{(range?.length??0)>1?'–GW'+range?.[range.length-1]:''} · Up to {count} transfer{count===1?'':'s'} · Same-position replacements</p><button className="primary-button" onClick={optimize} disabled={busy||team.diagnostics.squadCount!==15||team.diagnostics.matchedCount!==15||!!stale}>{busy?<LoaderCircle className="ts-spinner" size={16}/>:<ArrowRight size={16}/>} {count===0?'Show Current Team':'Find Transfers'}</button></div>{stale&&<p className="ts-error">Projections changed. Load Team again.</p>}</>}
 {busy&&<div className="ts-loading" role="status"><LoaderCircle className="ts-spinner"/><h2>{team?'Finding your next move':'Loading your permanent squad'}</h2><p>Using the existing Python transfer and squad rules.</p></div>}
 {!team&&!busy&&!error&&<div className="ts-empty"><div className="eyebrow mint">MAKE EVERY MOVE COUNT</div><h2>Find the moves that matter.</h2><p>Load your FPL team to compare legal transfers using real projections, your budget and the selected horizon.</p></div>}
 {results&&!busy&&<>{count>0&&results.recommendations[0]&&<TransferRecommendation option={results.recommendations[0]}/>}
 {count>0&&<><div className="section-heading"><div><h2>Top Transfer Options</h2><p>Ranked by transfer net gain · up to {count} moves</p></div></div><div className="table-panel"><div className="table-scroll" tabIndex={0} role="region" aria-label="Transfer options"><table><thead><tr><th>Rank</th><th>Out</th><th>In</th><th>Net Spend</th><th>Outgoing Projection</th><th>Incoming Projection</th><th>Gross Gain</th><th>Net Gain</th><th>Preview</th></tr></thead><tbody>{results.recommendations.map((r,i)=><tr key={r.id}><td>{i+1}</td><td>{r.moves.map(m=>m.out.name).join(', ')||'Roll transfer'}</td><td>{r.moves.map(m=>m.in.name).join(', ')||'—'}</td><td>£{r.cost.toFixed(1)}m</td><td>{r.outgoingProjection.toFixed(2)}</td><td>{r.incomingProjection.toFixed(2)}</td><td>{signed(r.grossGain)}</td><td className="mint">{signed(r.netGain)}</td><td><button className={'tr-select '+(selected===r.id?'selected':'')} aria-pressed={selected===r.id} onClick={()=>setSelected(r.id)}>{selected===r.id?'Selected':'View team'}</button></td></tr>)}</tbody></table></div></div><p className="data-note"><Info size={14}/>{results.searchNote}</p></>}
 {option&&option.id!==results.recommendations[0]?.id&&count>0&&<div className="tr-selected-detail"><h2>Selected option</h2><TransferRecommendation option={option}/></div>}
 {previewBusy&&<p className="ts-range-note" role="status"><LoaderCircle className="ts-spinner" size={15}/> Optimizing the updated XI independently for each selected gameweek…</p>}
 {previewError&&<p className="ts-error" role="alert">{previewError}</p>}
 {preview&&!previewBusy&&<><div className="section-heading"><div><h2>{option?.moves.length?'Updated Team':'Current Optimized Team'}</h2><p>XI comparison includes the captain bonus once; excludes bench points.</p></div></div><div className="ts-summary">{[{label:'Original Team · XI Total',value:preview.originalTotal},{label:'Updated Team · XI Total',value:preview.updatedTotal},{label:'XI Gross Gain',value:preview.grossTeamGain},{label:'XI Net Gain After Hit',value:preview.netTeamGain}].map(m=><article key={m.label}><span>{m.label}</span><strong>{m.value.toFixed(2)}</strong></article>)}</div><p className="data-note"><Info size={14}/>Transfer gain compares incoming/outgoing player projections. XI gain also reflects captain and bench selection, so the two can differ.</p><div className="ts-gameweek-tabs" role="group" aria-label="Updated Team gameweeks">{preview.team.gameweeks.map(g=><button key={g} className={tab===g?'selected':''} aria-pressed={tab===g} onClick={()=>setTab(g)}>GW{g}</button>)}</div>{sheet&&<><TeamSummary sheet={sheet}/><Pitch sheet={sheet}/></>}</>}
 </>}
 </>
}



