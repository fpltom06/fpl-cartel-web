import type {TeamSheetResult} from '../../types/teamSheet';
export function Overall({result}:{result:TeamSheetResult}){
 const overall=result.overall;if(!overall)return null;
 return <section className="ts-overall"><div className="section-heading"><div><h2>The full game plan</h2><p>One permanent squad. An independent XI for every gameweek.</p></div><span>{result.weeks.length} GAMEWEEKS</span></div><div className="ts-summary">
 <article><span>Total Projected Points</span><strong>{overall.total.toFixed(2)}</strong><small>Across selected gameweeks</small></article>
 <article><span>Average per GW</span><strong>{overall.average.toFixed(2)}</strong><small>Including normal captain bonus</small></article>
 <article><span>Most Captained Player</span><strong className="ts-summary-name">{overall.mostCaptained.name}</strong><small>{overall.mostCaptained.count} of {result.weeks.length} gameweeks</small></article>
 <article><span>Highest Projected Gameweek</span><strong>GW{overall.highestGameweek.gameweek}</strong><small>{overall.highestGameweek.projectedTotal.toFixed(2)} projected points</small></article></div>
 <div className="table-panel"><div className="table-scroll" tabIndex={0} role="region" aria-label="Overall weekly results"><table><thead><tr><th>Gameweek</th><th>Formation</th><th>Captain</th><th>Projected XI</th><th>Captain Bonus</th><th>Projected Total</th></tr></thead><tbody>{result.weeks.map(week=><tr key={week.gameweek}><td>GW{week.gameweek}</td><td>{week.formation}</td><td>{week.startingXI.find(p=>p.isCaptain)?.name}</td><td>{week.projectedXI.toFixed(2)}</td><td>+{week.captainBonus.toFixed(2)}</td><td><span className="points">{week.projectedTotal.toFixed(2)}</span></td></tr>)}</tbody></table></div></div></section>
}
