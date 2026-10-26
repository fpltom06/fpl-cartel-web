import {TrendingUp,Zap,Crown} from 'lucide-react';
import type {PlayerProjection} from '../../types/projections';
import {pointsFor} from '../../services/projections';
export function SummaryCards({players,week}:{players:PlayerProjection[];week:number|'all'}){
const sorted=[...players].sort((a,b)=>pointsFor(b,week)-pointsFor(a,week));
const value=[...players].sort((a,b)=>pointsFor(b,week)/b.price-pointsFor(a,week)/a.price)[0];
return <section className="summary-grid">{[{label:'Highest Projected',player:sorted[0],icon:TrendingUp,note:'Leading the projections'},{label:'Best Value',player:value,icon:Zap,note:value?(pointsFor(value,week)/value.price).toFixed(2)+' pts per £1m':'No matching players'},{label:'Best Captain',player:sorted[0],icon:Crown,note:'Highest expected points · before 2×'}].map(({label,player,icon:Icon,note})=><article className="summary-card" key={label}><div className="summary-label"><span>{label}</span><Icon size={17}/></div><div className="summary-main"><div><h3>{player?.name??'No players'}</h3><span>{player?.club??'Adjust your filters'}</span></div><strong>{player?pointsFor(player,week).toFixed(1):'—'}<small> pts</small></strong></div><p>{note}</p></article>)}</section>}
