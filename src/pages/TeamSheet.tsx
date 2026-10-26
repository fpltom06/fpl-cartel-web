import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Users,ArrowRight,LoaderCircle,ShieldCheck,Info,AlertCircle} from 'lucide-react';
import {useProjections} from '../components/projections/ProjectionProvider';
import {loadTeamSheet} from '../services/teamSheet';
import type {TeamSheetMode,TeamSheetResult} from '../types/teamSheet';
import {Pitch} from '../components/team-sheet/Pitch';
import {TeamSummary} from '../components/team-sheet/TeamSummary';
import {Overall} from '../components/team-sheet/Overall';
import '../team-sheet.css';
const storageKey='fpl-cartel.team-id';
function rememberedId(){try{return localStorage.getItem(storageKey)??''}catch{return ''}}
export function TeamSheet(){
 const {dataset,loading:projectionsLoading}=useProjections();
 const [teamId,setTeamId]=useState(rememberedId),[loadedId,setLoadedId]=useState<number|null>(null);
 const [mode,setMode]=useState<TeamSheetMode>('next'),[revision,setRevision]=useState(0);
 const [result,setResult]=useState<TeamSheetResult|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [tab,setTab]=useState<number|'overall'>(0);const request=useRef(0);
 const available=dataset?.gameweeks??[];
 const range=mode==='next'?available.slice(0,1):mode==='five'?available.slice(0,5):available;
 useEffect(()=>{
   if(loadedId===null||!dataset?.modelUpdatedAt||dataset.source!=='model'){setBusy(false);setResult(null);return;}
   const controller=new AbortController(),id=++request.current;
   setBusy(true);setError('');setResult(null);
   loadTeamSheet(loadedId,mode,dataset.modelUpdatedAt,controller.signal,dataset.gameweeks).then(data=>{
     if(id!==request.current||controller.signal.aborted)return;
     setResult(data);setTab(data.gameweeks[0]??'overall');
     if(data.diagnostics.squadCount===15){try{localStorage.setItem(storageKey,String(loadedId))}catch{/* Storage is optional. */}}
   }).catch(reason=>{
     if(!controller.signal.aborted&&id===request.current)setError(reason instanceof Error?reason.message:'Could not load your team.');
   }).finally(()=>{if(!controller.signal.aborted&&id===request.current)setBusy(false)});
   return ()=>controller.abort();
 },[loadedId,mode,dataset,revision]);
 function submit(event:FormEvent){
   event.preventDefault();
   if(!/^\d+$/.test(teamId.trim())||!Number.isSafeInteger(Number(teamId))||Number(teamId)<1||Number(teamId)>2147483647){setError('Enter a valid positive FPL Team ID.');return}
   setLoadedId(Number(teamId));setRevision(value=>value+1);
 }
 const stale=result&&result.modelUpdatedAt!==dataset?.modelUpdatedAt;
 const active=result?.weeks.find(week=>week.gameweek===tab);
 const ready=!projectionsLoading&&dataset?.source==='model'&&available.length>0;
 const squadValue=result?.weeks[0]?[...result.weeks[0].startingXI,...result.weeks[0].bench].reduce((sum,p)=>sum+p.price,0):null;
 return <><div className="page-heading"><div><div className="eyebrow">MY TEAM / YOUR BEST XI</div><h1>Team Sheet Optimizer<span className="mint">.</span></h1><p>Optimize your starting XI, captain and bench using the FPL Cartel model.</p></div><span className="outline-badge"><ShieldCheck size={13}/> PYTHON MODEL</span></div>
 <form className="ts-controls" onSubmit={submit}><label><span>FPL Team ID</span><input inputMode="numeric" autoComplete="off" value={teamId} onChange={event=>setTeamId(event.target.value)} placeholder="e.g. 5406" aria-label="FPL Team ID"/></label>
 <button className="primary-button" type="submit" disabled={busy||!ready}>{busy?<LoaderCircle className="ts-spinner" size={16}/>:<Users size={16}/>} {busy?'Loading team…':'Load Team'}</button>
 <label className="ts-mode"><span>Gameweek</span><select aria-label="Gameweek mode" value={mode} onChange={event=>setMode(event.target.value as TeamSheetMode)} disabled={busy}><option value="next">Next GW</option><option value="five">Next 5 GWs</option><option value="all">All Remaining GWs</option></select></label>
 <div className="ts-no-transfers"><span>Number of transfers</span><strong>0 <small>Fixed squad</small></strong></div></form>
 <p className="ts-range-note"><Info size={13}/>{range.length?'Planning GW'+range[0]+(range.length>1?'–GW'+range[range.length-1]:'')+' · '+range.length+' gameweek'+(range.length===1?'':'s')+' · XI optimized independently each week.':'Real projection data is required to load your team.'}</p>
 {error&&<div className="ts-error" role="alert"><AlertCircle size={18}/><div><strong>Could not load team</strong><p>{error}</p></div></div>}
 {busy&&<div className="ts-loading" role="status"><LoaderCircle className="ts-spinner" size={24}/><h2>Building your game plan</h2><p>Loading your permanent squad and optimizing each selected gameweek with the Python model.</p></div>}
 {!busy&&!result&&!error&&<div className="ts-empty"><div className="ts-empty-pitch" aria-hidden="true"><span/><Users size={38}/></div><div className="eyebrow mint">YOUR SQUAD. ITS FULL POTENTIAL.</div><h2>Put your best XI on the pitch.</h2><p>Enter your FPL Team ID to load your permanent 15-player squad. We’ll find the best legal formation, captain and bench for every selected gameweek.</p><span className="outline-badge">No transfers · No chips · Real model projections</span></div>}
 {result&&!busy&&!stale&&<><div className="ts-squad-info"><div><span className="status-dot"/><strong>{result.diagnostics.matchedCount}/15 squad players matched.</strong><span>Team {result.teamId} · Permanent squad from GW{result.sourceGameweek}</span></div><div><span>Bank <b>£{result.bank.toFixed(1)}m</b></span>{squadValue!==null&&<span>Squad prices <b>£{squadValue.toFixed(1)}m</b></span>}</div></div>
 {result.sourceNote&&<div className="ts-source-note"><ShieldCheck size={17}/><span>{result.sourceNote}</span></div>}
 <details className="ts-diagnostics" open={result.diagnostics.missingPlayers.length>0||result.diagnostics.squadCount!==15}><summary>Squad matching diagnostics</summary><p>{result.diagnostics.squadCount} permanent squad IDs returned. {result.diagnostics.matchedCount} matched by FPL Player ID.</p>{result.diagnostics.missingPlayers.map(player=><p className="ts-missing" key={player.playerId}>Missing projection: {player.name} ({player.club}, {player.position}, ID {player.playerId})</p>)}<p>Squad IDs: {result.diagnostics.squadPlayerIds.join(', ')}</p>{result.ignoredFreeHitGameweeks.length>0&&<p>Temporary Free Hit squads ignored: {result.ignoredFreeHitGameweeks.map(g=>'GW'+g).join(', ')}</p>}{!result.weeks.length&&<p>All 15 players must match before an XI can be optimized. Refresh the model export and try again.</p>}</details>
 {result.weeks.length>0&&<><div className="ts-gameweek-tabs" role="group" aria-label="Team Sheet gameweeks">{result.gameweeks.map(gw=><button key={gw} aria-pressed={tab===gw} className={tab===gw?'selected':''} onClick={()=>setTab(gw)}>GW{gw}</button>)}{result.gameweeks.length>1&&<button aria-pressed={tab==='overall'} className={tab==='overall'?'selected':''} onClick={()=>setTab('overall')}>OVERALL <ArrowRight size={13}/></button>}</div>
 {tab==='overall'?<Overall result={result}/>:active&&<><TeamSummary sheet={active}/><Pitch sheet={active}/></>}
 <p className="data-note"><Info size={14}/> Existing Python optimizer · 0 transfers · Captain bonus counted once · Bench points excluded</p></>}</>}
 {stale&&<div className="ts-error" role="status">Projection data changed. Load your team again.</div>}
 </>
}


