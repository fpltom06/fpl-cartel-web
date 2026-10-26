import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import {Layout} from './components/layout/Layout';
import {Dashboard} from './pages/Dashboard';
import {Projections} from './pages/Projections';
import {Transfers} from './pages/Transfers';
import {TeamSheet} from './pages/TeamSheet';
import {ComingSoon} from './pages/ComingSoon';
import './styles.css';
import {modelApiEnabled} from './services/runtime';
import {HostedToolUnavailable} from './components/ui/HostedToolUnavailable';
import {ProjectionProvider} from './components/projections/ProjectionProvider';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><ProjectionProvider><Routes><Route element={<Layout/>}><Route index element={<Dashboard/>}/><Route path="projections" element={<Projections/>}/><Route path="team-sheet" element={modelApiEnabled?<TeamSheet/>:<HostedToolUnavailable title="Team Sheet Optimizer"/>}/><Route path="transfers" element={modelApiEnabled?<Transfers/>:<HostedToolUnavailable title="Transfer Optimizer"/>}/><Route path="*" element={<ComingSoon/>}/></Route></Routes></ProjectionProvider></BrowserRouter></React.StrictMode>);



