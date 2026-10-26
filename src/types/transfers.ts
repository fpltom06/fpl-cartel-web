import type {TeamSheetResult,TeamSheetMode} from './teamSheet';
export interface TransferPlayer {playerId:number;name:string;club:string;position:string;price:number}
export interface TransferOption {
 id:string;moves:{out:TransferPlayer;in:TransferPlayer}[];outgoingProjection:number;incomingProjection:number;
 grossGain:number;transferCost:number;netGain:number;cost:number;bankAfter:number;
 breakdown:{gameweek:number;out:number;in:number;gain:number}[];
}
export interface TransferRequest {teamId:number;gameweeks:number[];mode:TeamSheetMode;modelUpdatedAt:string;count:number;hit:number;bank:number|null;excludedIds:number[]}
export interface TransferResults {team:TeamSheetResult;apiBank:number;bankUsed:number;recommendations:TransferOption[];searchNote:string}
export interface TransferPreview {team:TeamSheetResult;originalTotal:number;updatedTotal:number;grossTeamGain:number;netTeamGain:number}


