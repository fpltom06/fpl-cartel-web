import {Link} from 'react-router-dom';
import {Server,ArrowRight} from 'lucide-react';
export function HostedToolUnavailable({title}:{title:string}){
 return <><div className="page-heading"><div><div className="eyebrow">FPL CARTEL / PRIVATE TEST BUILD</div><h1>{title}<span className="mint">.</span></h1><p>Player Projections is available in this static test version.</p></div><span className="outline-badge">BACKEND REQUIRED</span></div><section className="coming-soon" style={{minHeight:'50vh'}}><span className="tool-icon"><Server size={30}/></span><h2>Hosted optimizer service required</h2><p>Team loading and per-user optimization need the Python service. These tools are unavailable in this static test build.</p><Link to="/projections" className="primary-button">Open Player Projections <ArrowRight size={16}/></Link></section></>
}

