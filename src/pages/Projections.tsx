import {useMemo,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Search,SlidersHorizontal,RotateCcw,Info} from 'lucide-react';
import type {Position,SortKey} from '../types/projections';
import {pointsFor} from '../services/projections';
import {useProjections} from '../components/projections/ProjectionProvider';
import {SummaryCards} from '../components/projections/SummaryCards';
import {ProjectionTable} from '../components/projections/ProjectionTable';
export function Projections(){
const {dataset,loading,error,refresh}=useProjections();
const players=dataset?.players??[], gameweeks=dataset?.gameweeks??[];
const range=gameweeks.slice(0,5);
const [params,setParams]=useSearchParams();
const requestedWeek=Number(params.get('gw'));
const selectedWeek:number|'all'=params.get('view')==='all'?'all':gameweeks.includes(requestedWeek)?requestedWeek:gameweeks[0]??0;
const [position,setPosition]=useState('All'),[club,setClub]=useState('All clubs'),[search,setSearch]=useState(''),[minimum,setMinimum]=useState(0),[sort,setSort]=useState<SortKey>('points'),[direction,setDirection]=useState<'asc'|'desc'>('desc');
const clubs=useMemo(()=>[...new Set(players.map(p=>p.club))].sort(),[players]);
const filtered=useMemo(()=>players.filter(p=>(position==='All'||p.position===position)&&(club==='All clubs'||p.club===club)&&p.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())&&p.minutesFactor>=minimum),[players,position,club,search,minimum]);
const rows=useMemo(()=>[...filtered].sort((a,b)=>{const result=sort==='name'?a.name.localeCompare(b.name):sort==='price'?a.price-b.price:pointsFor(a,selectedWeek)-pointsFor(b,selectedWeek);return (direction==='asc'?result:-result)||a.name.localeCompare(b.name)}),[filtered,sort,direction,selectedWeek]);
function changeWeek(w:number|'all'){setParams(w==='all'?{view:'all'}:{gw:String(w)});setSort('points');setDirection('desc')}
function onSort(key:SortKey){setDirection(key===sort?(direction==='asc'?'desc':'asc'):key==='name'?'asc':'desc');setSort(key)}
function reset(){setPosition('All');setClub('All clubs');setSearch('');setMinimum(0)}
return <><div className="page-heading"><div><div className="eyebrow">PROJECTIONS / PLAYER INSIGHTS</div><h1>Player Projections<span className="mint">.</span></h1><p>FPL Cartel Model <span className="subtitle-divider">/</span> Your next decision, backed by data.</p></div><span className="outline-badge">{dataset?.source==='model'?'MODEL DATA':dataset?.source==='mock'?'MOCK DATA':'DATA UNAVAILABLE'}</span></div>
<div className="week-toolbar"><div className="week-tabs" role="group" aria-label="Select gameweek">{gameweeks.map(g=><button aria-pressed={selectedWeek===g} className={selectedWeek===g?'selected':''} key={g} onClick={()=>changeWeek(g)}>GW{g}</button>)}<span className="tab-divider"/><button aria-pressed={selectedWeek==='all'} className={selectedWeek==='all'?'selected':''} onClick={()=>changeWeek('all')}>Next 5 GWs</button></div><span className="week-label"><span className="status-dot"/>{selectedWeek==='all'?(range.length?'GW'+range[0]+' – GW'+range[range.length-1]+' outlook':'No available gameweeks'):'Gameweek '+selectedWeek+' outlook'}</span></div>
<SummaryCards players={filtered} week={selectedWeek}/>
<section className="filters" aria-label="Projection filters"><label className="search-field"><span>Search player</span><div><Search size={16}/><input type="search" placeholder="Search player..." value={search} onChange={e=>setSearch(e.target.value)}/></div></label><label><span>Position</span><select aria-label="Position" value={position} onChange={e=>setPosition(e.target.value)}>{(['All','GK','DEF','MID','FWD'] as (Position|'All')[]).map(v=><option key={v}>{v}</option>)}</select></label><label><span>Club</span><select aria-label="Club" value={club} onChange={e=>setClub(e.target.value)}>{['All clubs',...clubs].map(v=><option key={v}>{v}</option>)}</select></label><label><span className="minutes-label"><SlidersHorizontal size={12}/> Minimum Minutes Factor</span><select aria-label="Minimum Minutes Factor" value={minimum} onChange={e=>setMinimum(Number(e.target.value))}><option value={0}>Any minutes</option><option value={0.8}>80% or higher</option><option value={0.9}>90% or higher</option><option value={0.95}>95% or higher</option></select></label><button className="reset-button" onClick={reset} aria-label="Reset filters"><RotateCcw size={16}/></button></section>
{loading?<div className="empty-state" role="status">Loading projections…</div>:error?<div className="empty-state" role="alert">{error} <button className="primary-button" onClick={refresh}>Retry</button></div>:!gameweeks.length?<div className="empty-state">No future projections are available. The season may be complete.</div>:<ProjectionTable gameweeks={range} source={dataset?.source??'model'} players={rows} week={selectedWeek} sort={sort} direction={direction} onSort={onSort}/>}
<p className="data-note"><Info size={14}/> {dataset?.source==='model'?'Saved Python model projections. Next 5 GWs uses the first five available gameweeks. Minutes factor comes from the model.':dataset?.source==='mock'?'Development fallback data. No real model projections are displayed.':'Run the Python web exporter to supply model projections.'}</p></>
}

