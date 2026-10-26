import type {PlayerProjection, Projection, Position} from '../types/projections';

export interface ProjectionDataset {
  players: PlayerProjection[];
  gameweeks: number[];
  modelUpdatedAt: string | null;
  source: 'model' | 'mock';
}
const positions: readonly Position[] = ['GK','DEF','MID','FWD'];
const finite = (value:unknown):value is number => typeof value==='number' && Number.isFinite(value);
export function parseProjectionExport(input:unknown):ProjectionDataset {
  if(!input || typeof input!=='object') throw new Error('Invalid projection export.');
  const payload=input as Record<string,unknown>;
  if(payload.schemaVersion!==1 || !Array.isArray(payload.projections) ||
    typeof payload.modelUpdatedAt!=='string' || !Number.isFinite(Date.parse(payload.modelUpdatedAt))) {
    throw new Error('Unsupported projection export. Regenerate the web data.');
  }
  const players=new Map<number,PlayerProjection>(), pairs=new Set<string>(), weeks=new Set<number>();
  for(const raw of payload.projections) {
    if(!raw || typeof raw!=='object') throw new Error('Invalid projection row.');
    const row=raw as Record<string,unknown>;
    if(!finite(row.playerId)||!Number.isInteger(row.playerId)||row.playerId<=0||
      !finite(row.gameweek)||!Number.isInteger(row.gameweek)||row.gameweek<1||row.gameweek>38||
      typeof row.name!=='string'||!row.name.trim()||typeof row.club!=='string'||!row.club.trim()||
      !positions.includes(row.position as Position)||!finite(row.price)||row.price<=0||
      typeof row.fixture!=='string'||!finite(row.projectedPoints)||!finite(row.minutesFactor)||row.minutesFactor<0) {
      throw new Error('Invalid projection fields. Regenerate the web data.');
    }
    const p=row as unknown as Projection;
    const key=p.playerId+':'+p.gameweek;
    if(pairs.has(key)) throw new Error('Duplicate Player ID + Gameweek: '+key);
    pairs.add(key); weeks.add(p.gameweek);
    const player=players.get(p.playerId);
    if(player) {
      if(player.name!==p.name||player.club!==p.club||player.position!==p.position||player.price!==p.price||player.minutesFactor!==p.minutesFactor)
        throw new Error('Inconsistent player details for ID '+p.playerId);
      player.weeks.push(p);
    } else {
      players.set(p.playerId,{playerId:p.playerId,name:p.name,club:p.club,position:p.position,price:p.price,minutesFactor:p.minutesFactor,weeks:[p]});
    }
  }
  const gameweeks=[...weeks].sort((a,b)=>a-b);
  for(const player of players.values()){
    player.weeks.sort((a,b)=>a.gameweek-b.gameweek);
    if(player.weeks.length!==gameweeks.length) throw new Error('Incomplete gameweeks for Player ID '+player.playerId);
  }
  return {players:[...players.values()],gameweeks,modelUpdatedAt:payload.modelUpdatedAt,source:'model'};
}
export async function getProjections():Promise<ProjectionDataset> {
  const response=await fetch('/data/projections.json',{cache:'no-store'});
  const type=response.headers.get('content-type')||'';
  if(response.status===404 || (response.ok && type.includes('text/html'))) {
    // Opt-in development fallback only when the real file is absent. Never hide bad real data.
    if(import.meta.env.DEV && new URLSearchParams(location.search).get('mockFallback')==='1') {
      const {mockProjections,gameweeks}=await import('../data/mockProjections');
      return {players:mockProjections,gameweeks,source:'mock',modelUpdatedAt:null};
    }
    throw new Error('Projection export unavailable. Run the Python web exporter and retry.');
  }
  if(!response.ok) throw new Error('Projection export unavailable. Run the Python web exporter and retry.');
  if(!type.includes('application/json')) throw new Error('Projection JSON missing. Run the Python web exporter.');
  return parseProjectionExport(await response.json());
}
export function pointsFor(player:PlayerProjection,week:number|'all'):number {
  return week==='all'
    ? [...player.weeks].sort((a,b)=>a.gameweek-b.gameweek).slice(0,5).reduce((sum,p)=>sum+p.projectedPoints,0)
    : player.weeks.find(p=>p.gameweek===week)?.projectedPoints??0;
}

