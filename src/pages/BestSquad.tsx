import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Layers,LoaderCircle,Search,X,AlertCircle} from 'lucide-react';
import {useProjections} from '../components/projections/ProjectionProvider';
import {Pitch} from '../components/team-sheet/Pitch';
import {optimizeBestSquad,type BestSquadResult} from '../services/bestSquad';
import '../team-sheet.css';
import '../best-squad.css';
export function BestSquad(){
 const {dataset,loading,error:dataError}=useProjections();
 const [week,setWeek]=useState(0),[budget,setBudget]=useState(100);
 const [bans,setBans]=useState<number[]>([]),[search,setSearch]=useState('');
 const [result,setResult]=useState<BestSquadResult|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const pending=useRef<AbortController|null>(null);
 const weeks=dataset?.gameweeks??[],gameweek=weeks.includes(week)?week:weeks[0];
 const players=dataset?.players??[];
 const matches=search.trim()?players.filter(p=>!bans.includes(p.playerId)&&(p.name+' '+p.club+' '+p.position).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).slice(0,20):[];
 useEffect(()=>{pending.current?.abort();setResult(null);setBusy(false);setError('');return ()=>pending.current?.abort()},[gameweek,budget,bans,dataset?.modelUpdatedAt]);
 async function submit(event:FormEvent){
  event.preventDefault();if(!dataset?.modelUpdatedAt||!gameweek||dataset.source!=='model')return;
  pending.current?.abort();const controller=new AbortController();pending.current=controller;
  setBusy(true);setError('');setResult(null);
  try{const data=await optimizeBestSquad(gameweek,budget,bans,dataset.modelUpdatedAt,controller.signal);if(!controller.signal.aborted)setResult(data)}
  catch(reason){if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'Could not build a squad.')}
  finally{if(!controller.signal.aborted)setBusy(false)}
 }
 const sheet=result?{...result,captainId:result.captainPlayerId,viceCaptainId:result.viceCaptainPlayerId,projectedXI:result.xiProjection}:null;
 return <>
 <div className="page-heading"><div><div className="eyebrow">BEST SQUAD / OPTIMIZER</div><h1>Best Squad<span className="mint">.</span></h1><p>Build the highest projected legal FPL squad using the FPL Cartel model.</p></div><span className="outline-badge"><Layers size={14}/> PYTHON MODEL</span></div>
 <form onSubmit={submit} className="bs-form">
 <fieldset disabled={busy||loading||!dataset} className="ts-controls bs-controls">
 <label><span>Gameweek</span><select aria-label="Gameweek" value={gameweek??''} onChange={e=>setWeek(Number(e.target.value))}>{weeks.map(g=><option key={g} value={g}>GW{g}</option>)}</select></label>
 <label className="bs-budget"><span>Squad Budget (£m)</span><div><input aria-label="Squad budget slider" type="range" min="95" max="115" step="0.1" value={budget} onChange={e=>setBudget(Number(e.target.value))}/><input aria-label="Squad budget" type="number" min="95" max="115" step="0.1" required value={Number.isNaN(budget)?'':budget} onChange={e=>setBudget(e.target.valueAsNumber)}/></div></label>
 <button className="primary-button" type="submit" disabled={!gameweek||dataset?.source!=='model'}>{busy?<LoaderCircle size={16} className="ts-spinner"/>:<Layers size={16}/>} {busy?'Building squad…':'Build Best Squad'}</button>
 </fieldset>
 <fieldset disabled={busy||loading||!dataset} className="bs-bans">
 <label htmlFor="ban-search">Ban Players</label><div className="bs-search"><Search size={15}/><input id="ban-search" type="search" placeholder="Search player, club or position…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
 {search.trim()&&<div className="bs-options" role="group" aria-label="Players to ban">{matches.length?matches.map(p=><button type="button" key={p.playerId} onClick={()=>{setBans([...bans,p.playerId]);setSearch('')}}>{p.name} ({p.club}, {p.position}) <span>Ban +</span></button>):<p>No matching players available.</p>}</div>}
 <div className="bs-chips">{bans.map(id=>{const p=players.find(p=>p.playerId===id);return <button type="button" key={id} aria-label={'Unban '+p?.name+' ('+p?.club+', '+p?.position+')'} onClick={()=>setBans(bans.filter(x=>x!==id))}>{p?`${p.name} (${p.club}, ${p.position})`:id}<X size={12}/></button>})}</div>
 <small>Selected players cannot be included in your squad.</small>
 </fieldset>
 </form>
 <p className="ts-range-note">2 GK · 5 DEF · 5 MID · 3 FWD · Maximum 3 players per club · £95.0m–£115.0m</p>
 {(error||dataError)&&<div className="ts-error" role="alert"><AlertCircle size={18}/><div><strong>Could not build squad</strong><p>{error||dataError}</p></div></div>}
 {busy&&<div className="ts-loading" role="status"><LoaderCircle className="ts-spinner"/><h2>Building your best squad</h2><p>Finding a legal 15-player squad using the existing Python optimizer.</p></div>}
 {sheet&&result&&<>
 <section className="ts-summary bs-summary" aria-label="Best squad summary">{[
 ['Formation',result.formation,'Legal starting XI'],['Squad Cost','£'+result.squadCost.toFixed(1)+'m','Budget £'+result.budget.toFixed(1)+'m'],['Projected GW Points',result.projectedTotal.toFixed(2),'XI '+result.xiProjection.toFixed(2)+' + captain '+result.captainBonus.toFixed(2)],['Captain',result.captain.name,result.captain.club+' · '+result.captain.projectedPoints.toFixed(2)+' pts']
 ].map(([label,value,note])=><article key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</section>
 <Pitch sheet={sheet} forwardFirst/>
 <p className="data-note">Existing Streamlit optimizer maximizes the 15-player squad projection ({result.squadProjection.toFixed(2)}). The legal XI is then optimized within that squad; displayed GW points include the captain bonus once and exclude the bench.</p>
 </>}
 {!result&&!busy&&!error&&!dataError&&<div className="ts-empty"><Layers size={30}/><h2>Your budget. Your best squad.</h2><p>{loading?'Loading projections…':!weeks.length?'No projected gameweeks are available.':'Choose a gameweek, set your budget and ban any players before building your squad.'}</p></div>}
 </>
}
