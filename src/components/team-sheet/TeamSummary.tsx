import type {WeeklyTeamSheet} from '../../types/teamSheet';
export function TeamSummary({sheet}:{sheet:WeeklyTeamSheet}){
 return <section className="ts-summary" aria-label="Gameweek summary">{[
 {label:'Formation',value:sheet.formation,note:'Legal starting XI'},
 {label:'Projected XI',value:sheet.projectedXI.toFixed(2),note:'11 starters · base points'},
 {label:'Captain Bonus',value:'+'+sheet.captainBonus.toFixed(2),note:'One additional captain score'},
 {label:'Projected Total',value:sheet.projectedTotal.toFixed(2),note:'XI + captain · bench excluded'}
 ].map(({label,value,note})=><article key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</section>
}
