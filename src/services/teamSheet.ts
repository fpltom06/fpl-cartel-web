import type {TeamSheetMode,TeamSheetResult} from '../types/teamSheet';
import {requestApi,adaptTeamSheet,type ApiTeamSheet} from './api';
export async function loadTeamSheet(teamId:number,mode:TeamSheetMode,modelUpdatedAt:string,signal:AbortSignal,availableGameweeks:number[]):Promise<TeamSheetResult>{
 const gameweeks=mode==='next'?availableGameweeks.slice(0,1):mode==='five'?availableGameweeks.slice(0,5):availableGameweeks;
 const result=await requestApi<ApiTeamSheet>('/optimize/team-sheet',{teamId,gameweeks,modelUpdatedAt},signal);
 return adaptTeamSheet(result);
}

