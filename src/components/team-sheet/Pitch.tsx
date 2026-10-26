import type {WeeklyTeamSheet} from '../../types/teamSheet';
import {PlayerCard} from './PlayerCard';
const positions=['GK','DEF','MID','FWD'] as const;
export function Pitch({sheet}:{sheet:WeeklyTeamSheet}){
 return <><section className="ts-pitch" aria-label={'GW'+sheet.gameweek+' starting XI, formation '+sheet.formation}>
 <div className="ts-pitch-lines" aria-hidden="true"><div className="ts-halfway"/><div className="ts-center"/><div className="ts-penalty ts-penalty-top"/><div className="ts-penalty ts-penalty-bottom"/></div>
 <div className="ts-pitch-heading"><span>STARTING XI</span><span>GW{sheet.gameweek} <b>•</b> {sheet.formation}</span></div>
 <div className="ts-formation">{positions.map(position=><div className="ts-pitch-row" key={position} aria-label={position+' players'}>{sheet.startingXI.filter(player=>player.position===position).map(player=><PlayerCard key={player.playerId} player={player}/>)}</div>)}</div>
 <div className="ts-pitch-legend"><span><b>C</b> Captain · 2× points</span><span><b>VC</b> Vice captain · no extra points</span></div>
 </section><section className="ts-bench"><div className="ts-bench-heading"><h2>BENCH</h2><span>Not included in projected total</span></div><div className="ts-bench-grid">{sheet.bench.map((player,index)=><PlayerCard key={player.playerId} player={player} benchLabel={index===0?'GK':String(index)}/>)}</div></section></>
}
