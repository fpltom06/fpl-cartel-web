import {requestApi,type ApiWeekly} from './api';
import type {TeamSheetPlayer} from '../types/teamSheet';
export interface BestSquadResult extends ApiWeekly {
 players:TeamSheetPlayer[];captain:TeamSheetPlayer;squadCost:number;budget:number;
 squadProjection:number;modelUpdatedAt:string;
}
export function optimizeBestSquad(gameweek:number,budget:number,banned_player_ids:number[],modelUpdatedAt:string,signal?:AbortSignal){
 return requestApi<BestSquadResult>('/optimize/best-squad',{gameweek,budget,banned_player_ids,modelUpdatedAt},signal);
}
