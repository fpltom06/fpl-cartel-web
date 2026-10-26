import {apiUrl} from './runtime';
import type {TeamSheetResult,WeeklyTeamSheet} from '../types/teamSheet';

export interface ApiWeekly extends Omit<WeeklyTeamSheet,'captainId'|'viceCaptainId'|'projectedXI'> {
 captainPlayerId:number;viceCaptainPlayerId:number;xiProjection:number;
}
export interface ApiTeamSheet {team:TeamSheetResult;gameweeks:ApiWeekly[];overall:TeamSheetResult['overall']}
export function adaptTeamSheet(data:ApiTeamSheet):TeamSheetResult{
 return {...data.team,gameweeks:data.gameweeks.map(w=>w.gameweek),overall:data.overall,
 weeks:data.gameweeks.map(w=>({...w,captainId:w.captainPlayerId,viceCaptainId:w.viceCaptainPlayerId,projectedXI:w.xiProjection}))};
}
export async function requestApi<T>(path:string,body?:unknown,signal?:AbortSignal):Promise<T>{
 let response:Response;
 try{response=await fetch(apiUrl(path),{method:body===undefined?'GET':'POST',
   headers:body===undefined?undefined:{'Content-Type':'application/json'},
   body:body===undefined?undefined:JSON.stringify(body),signal,cache:'no-store'})}
 catch(error){if(signal?.aborted)throw error;throw new Error('The Python API is unavailable. Check the API service and connection.')}
 if(!(response.headers.get('content-type')??'').includes('application/json'))throw new Error('The API returned an unexpected response. Check its configured URL.');
 const data=await response.json();
 if(!response.ok)throw new Error(data.error?.message??'The API could not complete this request.');
 return data as T;
}

