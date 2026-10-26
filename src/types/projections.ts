export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export interface Projection { playerId:number; name:string; club:string; position:Position; price:number; gameweek:number; fixture:string; projectedPoints:number; minutesFactor:number; }
export interface PlayerProjection { playerId:number; name:string; club:string; position:Position; price:number; minutesFactor:number; weeks:Projection[]; }
export type SortKey = 'name' | 'price' | 'points';
