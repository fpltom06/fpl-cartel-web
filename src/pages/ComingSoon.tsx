import {Link,useLocation} from 'react-router-dom';
import {ArrowLeft,Compass} from 'lucide-react';
const names:Record<string,string>={'/settings':'Settings'};
export function ComingSoon(){const name=names[useLocation().pathname];return <div className="coming-soon"><span className="tool-icon"><Compass size={32}/></span><div className="eyebrow mint">THE NEXT CHAPTER</div><h1>{name||'Page not found'}</h1><span className="outline-badge">{name?'Coming soon':'404'}</span><p>{name?'We’re building more ways to find your edge. Explore Player Projections while this tool takes shape.':'This route does not exist. Return to your workspace.'}</p><Link className="primary-button" to={name?'/projections':'/'}><ArrowLeft size={16}/>{name?'Explore projections':'Back to Dashboard'}</Link></div>}
