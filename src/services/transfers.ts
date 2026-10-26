import {requestApi,adaptTeamSheet,type ApiTeamSheet} from './api';
import type {TeamSheetResult} from '../types/teamSheet';
import type {TransferOption} from '../types/transfers';
interface ExistingBody {
 teamId:number;gameweeks?:number[];modelUpdatedAt?:string;count?:number;hit?:number;bank?:number|null;
 excludedIds?:number[];moves?:{outId:number;inId:number}[];
}
export async function transferRequest<T>(action:'load'|'optimize'|'preview',input:unknown,signal?:AbortSignal):Promise<T>{
 const body=input as ExistingBody;
 if(action==='load'){
   const result=await requestApi<TeamSheetResult>('/team/'+body.teamId+(body.modelUpdatedAt?'?modelUpdatedAt='+encodeURIComponent(body.modelUpdatedAt):''),undefined,signal);
   return result as T;
 }
 const request={teamId:body.teamId,gameweeks:body.gameweeks,modelUpdatedAt:body.modelUpdatedAt,
   numberOfTransfers:body.count??1,bankOverride:body.bank??null,transferHit:body.hit??0,excludedPlayerIds:body.excludedIds??[]};
 if(action==='optimize'){
   const result=await requestApi<{originalSquad:TeamSheetResult;moneyInBank:number;bankUsed:number;recommendations:TransferOption[];originalTeamSheet:ApiTeamSheet;searchNote:string}>('/optimize/transfers',request,signal);
   return {team:adaptTeamSheet(result.originalTeamSheet),apiBank:result.moneyInBank,bankUsed:result.bankUsed,
     recommendations:result.recommendations,searchNote:result.searchNote} as T;
 }
 const result=await requestApi<{updatedTeamSheet:ApiTeamSheet;originalTotal:number;updatedTotal:number;grossTeamGain:number;netTeamGain:number}>('/optimize/transfers/preview',{...request,moves:body.moves??[]},signal);
 return {...result,team:adaptTeamSheet(result.updatedTeamSheet)} as T;
}

