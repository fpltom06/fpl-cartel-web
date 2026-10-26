import type { PlayerProjection, Position } from '../types/projections';
export const gameweeks = [8,9,10,11,12];
const seeds: [string,string,Position,number,number,number[]][] = [
['Erling Haaland','Man City','FWD',14.5,.97,[8.2,7.4,9.1,6.8,8.7]],
['Bukayo Saka','Arsenal','MID',10,.94,[7.1,6.8,7.6,6.1,7.3]],
['Bruno Fernandes','Man Utd','MID',9,.96,[6.7,7.2,5.8,6.9,7]],
['Antoine Semenyo','Bournemouth','MID',7.5,.92,[6.1,5.7,6.8,4.9,6.2]],
['Gabriel','Arsenal','DEF',6,.96,[5.8,5.4,6.1,4.3,5.9]],
['João Pedro','Chelsea','FWD',7.5,.81,[5.6,6.3,5.1,6.7,5.8]],
['David Raya','Arsenal','GK',5.5,1,[5.2,4.8,5.6,3.9,5.3]],
['Cole Palmer','Chelsea','MID',10.5,.89,[7.5,6.6,7.2,8,6.4]],
['Alexander Isak','Liverpool','FWD',10.5,.85,[6.6,7.1,6.8,5.7,7.5]],
['Virgil van Dijk','Liverpool','DEF',6,.98,[5.1,4.7,5.9,5.2,4.8]],
['Ollie Watkins','Aston Villa','FWD',9,.90,[6,5.5,6.7,6.2,5.8]],
['Bryan Mbeumo','Man Utd','MID',8,.91,[6.3,6.1,5.7,6.5,6.8]],
['Jordan Pickford','Everton','GK',5.5,1,[4.5,4.9,3.8,4.7,5.1]],
['Pedro Porro','Spurs','DEF',5.5,.88,[4.9,5.2,4.5,5.6,4.8]],
['Morgan Rogers','Aston Villa','MID',7,.86,[5.5,5.1,6,5.7,5.3]],
['Daniel Muñoz','Crystal Palace','DEF',5.5,.93,[5,4.6,5.3,4.8,5.5]],
['Nick Pope','Newcastle','GK',5,.94,[4.4,4.8,4.1,5.2,4.7]],
['Chris Wood','Nott’m Forest','FWD',7.5,.78,[5.3,4.9,5.8,5.1,5.6]],
['Anthony Gordon','Newcastle','MID',7.5,.84,[5.8,5.3,6.2,5,6]],
['Jarrod Bowen','West Ham','MID',8,.96,[5.7,6,5.2,6.3,5.5]]
];
const opponents=['AVL','BRE','FUL','NEW','EVE','BOU','SUN','LEE','WHU','CRY'];
export const mockProjections:PlayerProjection[]=seeds.map(([name,club,position,price,minutesFactor,points],i)=>({
playerId:i+1,name,club,position,price,minutesFactor,
weeks:gameweeks.map((gameweek,j)=>({playerId:i+1,name,club,position,price,minutesFactor,gameweek,fixture:opponents[(i+j)%opponents.length]+' ('+(j%2===0?'H':'A')+')',projectedPoints:points[j]}))
}));
