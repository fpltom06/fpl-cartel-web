import {useState} from 'react';
import {NavLink,Outlet,Link} from 'react-router-dom';
import {ChartNoAxesCombined,LayoutDashboard,Users,ArrowLeftRight,Layers,Settings,PanelLeftClose,PanelLeftOpen,Menu,X,RefreshCw,ChevronDown,Shield,Target} from 'lucide-react';
import {useProjections} from '../projections/ProjectionProvider';
const groups=[{label:'',items:[{path:'/',name:'Dashboard',icon:LayoutDashboard}]},{label:'PROJECTIONS',items:[{path:'/projections',name:'Player Projections',icon:ChartNoAxesCombined}]},{label:'MY TEAM',items:[{path:'/team-sheet',name:'Team Sheet',icon:Users},{path:'/transfers',name:'Transfers',icon:ArrowLeftRight}]},{label:'OPTIMIZERS',items:[{path:'/best-squad',name:'Best Squad',icon:Layers}]}];
export function Layout(){
const {dataset,loading,refresh}=useProjections();
const planning=dataset?.gameweeks[0];
const updated=dataset?.modelUpdatedAt?new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/London'}).format(new Date(dataset.modelUpdatedAt)):'Unavailable';

const [collapsed,setCollapsed]=useState(false),[mobile,setMobile]=useState(false),[notice,setNotice]=useState('');
return <div className={'app '+(collapsed?'is-collapsed':'')}>
{mobile&&<button className="scrim" aria-label="Close navigation" onClick={()=>setMobile(false)}/>}
<aside className={'sidebar '+(mobile?'mobile-open':'')}>
<Link to="/" className="brand" onClick={()=>setMobile(false)}><span className="brand-icon"><Shield size={23}/></span><span className="brand-word">FPL <b>CARTEL</b><small>THE EDGE IS IN THE DATA</small></span></Link>
<button className="mobile-close icon-button" aria-label="Close menu" onClick={()=>setMobile(false)}><X/></button>
<div className="workspace"><span className="status-dot"/> Analytics workspace <span className="version">V.01</span></div>
<nav aria-label="Main navigation">{groups.map(g=><div className="nav-group" key={g.label}>{g.label&&<div className="nav-label">{g.label}</div>}{g.items.map(({path,name,icon:Icon})=><NavLink end={path==='/'} title={collapsed?name:undefined} key={path} to={path} onClick={()=>setMobile(false)} className={({isActive})=>'nav-link '+(isActive?'active':'')}><Icon size={18}/><span>{name}</span>{path==='/projections'&&<span className="nav-dot"/>}</NavLink>)}</div>)}</nav>
<div className="sidebar-bottom"><div className="model-note"><Target size={20}/><strong>Your next move, informed.</strong><p>A sharper view of every gameweek.</p></div><NavLink to="/settings" className="nav-link" onClick={()=>setMobile(false)}><Settings size={18}/><span>Settings</span></NavLink><button className="collapse-button" onClick={()=>setCollapsed(!collapsed)} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'}>{collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}<span>Collapse sidebar</span></button></div>
</aside>
<div className="main-area"><header className="topbar"><button className="mobile-toggle icon-button" onClick={()=>setMobile(true)} aria-label="Open menu"><Menu/></button><div className="top-title">Fantasy Premier League Analytics</div><div className="top-actions"><span className="gw-pill"><span className="status-dot"/> Planning <b>{planning?'GW'+planning:'—'}</b></span><div className="update"><span>Last model update</span><strong>{updated}</strong></div><button className="refresh-button" aria-label="Refresh" title="Reload exported JSON; does not run Python" disabled={loading} onClick={refresh}><RefreshCw size={15}/><span>Refresh</span></button><button className="account" onClick={()=>setNotice('Discord login is coming soon. This prototype does not use authentication.')} aria-label="Account — login coming soon"><span>FC</span><ChevronDown size={14}/></button></div></header>
<main><Outlet/></main><footer><span>FPL CARTEL <span className="footer-separator">/</span> An edge in every gameweek.</span><span><span className="status-dot"/> {dataset?.source==='model'?'Python model · Exported data':dataset?.source==='mock'?'Frontend prototype · Mock data':loading?'Loading model data…':'Model data unavailable'}</span></footer></div>
{notice&&<div role="status" className="toast">{notice}<button className="icon-button" onClick={()=>setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
</div>}

