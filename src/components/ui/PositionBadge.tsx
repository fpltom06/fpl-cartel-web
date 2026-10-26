import type {Position} from '../../types/projections';
export function PositionBadge({position}:{position:Position}){return <span className={'position position-'+position}>{position}</span>}
