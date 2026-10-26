import type {TeamSheetPlayer} from '../../types/teamSheet';
export function PlayerCard({player,benchLabel}:{player:TeamSheetPlayer;benchLabel?:string}){
 return <article className={'ts-player '+(player.isCaptain?'ts-captain':'')+(benchLabel?' ts-bench-player':'')} aria-label={player.name+(player.isCaptain?', captain':player.isViceCaptain?', vice captain':'')}>
 <div className="ts-card-top"><span>{benchLabel??player.position}</span>{player.isCaptain?<b className="ts-armband" title="Captain">C</b>:player.isViceCaptain?<b className="ts-armband ts-vice" title="Vice Captain">VC</b>:<span className="ts-shirt-mark" aria-hidden="true">FC</span>}</div>
 <h3 title={player.name}>{player.name}</h3><div className="ts-player-club">{player.club}</div>
 <div className="ts-player-fixture" title={player.fixture}>{player.fixture}</div>
 <div className="ts-player-points">{player.projectedPoints.toFixed(2)} <small>pts</small></div>
 </article>
}
