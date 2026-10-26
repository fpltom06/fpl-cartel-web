import type {Position} from './projections';
export type TeamSheetMode='next'|'five'|'all';
export interface TeamSheetPlayer {
 playerId:number;name:string;club:string;position:Position;price:number;fixture:string;
 projectedPoints:number;isCaptain:boolean;isViceCaptain:boolean;
}
export interface WeeklyTeamSheet {
 gameweek:number;formation:string;startingXI:TeamSheetPlayer[];bench:TeamSheetPlayer[];
 captainId:number;viceCaptainId:number;projectedXI:number;captainBonus:number;projectedTotal:number;
}
export interface MissingPlayer {playerId:number;name:string;club:string;position:string}
export interface TeamSheetResult {
 teamId:number;modelUpdatedAt:string;loadedAt:string;gameweeks:number[];transfers:0;bank:number;
 sourceGameweek:number;planningGameweek:number;ignoredFreeHitGameweeks:number[];sourceNote:string;
 diagnostics:{squadCount:number;matchedCount:number;missingPlayers:MissingPlayer[];squadPlayerIds:number[]};
 weeks:WeeklyTeamSheet[];
 overall:null|{total:number;average:number;mostCaptained:{playerId:number;name:string;count:number};highestGameweek:{gameweek:number;projectedTotal:number}};
}
