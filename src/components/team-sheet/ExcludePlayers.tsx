import {useState} from 'react';
import {X,Search} from 'lucide-react';
import type {PlayerProjection} from '../../types/projections';
export function ExcludePlayers({players,value,onChange}:{players:PlayerProjection[];value:number[];onChange:(ids:number[])=>void}){
 const [search,setSearch]=useState('');
 const matches=search.trim()?players.filter(p=>!value.includes(p.playerId)&&(p.name+' '+p.club+' '+p.position).toLocaleLowerCase().includes(search.toLocaleLowerCase())).slice(0,20):[];
 return <div className="tr-exclusions"><label><span>Exclude Players</span><div className="tr-exclude-search"><Search size={15}/><input aria-label="Search players to exclude" placeholder="Search player, club or position…" value={search} onChange={e=>setSearch(e.target.value)}/></div></label>
 {matches.length>0&&<div className="tr-exclude-options" role="group" aria-label="Players to exclude">{matches.map(p=><button type="button" key={p.playerId} onClick={()=>{onChange([...value,p.playerId]);setSearch('')}}>{p.name} <small>({p.club}, {p.position})</small><span>Exclude +</span></button>)}</div>}
 <div className="tr-exclude-chips">{value.map(id=>{const p=players.find(p=>p.playerId===id);return <button type="button" key={id} onClick={()=>onChange(value.filter(i=>i!==id))} aria-label={'Remove exclusion '+p?.name}>{p?.name??id} <X size={12}/></button>})}</div><small className="muted">Exclusions apply only to incoming players. Existing squad players remain available.</small></div>
}
