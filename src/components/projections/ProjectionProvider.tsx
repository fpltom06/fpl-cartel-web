import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {getProjections,type ProjectionDataset} from '../../services/projections';

interface ProjectionState {
  dataset:ProjectionDataset|null; loading:boolean; error:string|null; refresh:()=>void;
}
const ProjectionContext=createContext<ProjectionState|null>(null);
export function ProjectionProvider({children}:{children:ReactNode}) {
  const [dataset,setDataset]=useState<ProjectionDataset|null>(null);
  const [loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null),[revision,setRevision]=useState(0);
  const refresh=useCallback(()=>setRevision(value=>value+1),[]);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError(null);setDataset(null);
    getProjections().then(data=>{if(active)setDataset(data)})
      .catch(reason=>{if(active)setError(reason instanceof Error?reason.message:'Could not load model projections.')})
      .finally(()=>{if(active)setLoading(false)});
    return ()=>{active=false};
  },[revision]);
  return <ProjectionContext.Provider value={{dataset,loading,error,refresh}}>{children}</ProjectionContext.Provider>;
}
export function useProjections(){
  const state=useContext(ProjectionContext);
  if(!state) throw new Error('ProjectionProvider is required.');
  return state;
}

