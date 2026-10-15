import {useEffect,useState,useRef} from 'react'
const STATES=['study','eat','shy','sleep','happy']
// Keep every decoder mounted. Switch only after the requested GIF is loaded,
// retaining the previous frame rather than removing the pet during downloads.
export default function PetAnimation({action,label}){
 const images=useRef({})
 const [ready,setReady]=useState({}),[shown,setShown]=useState('study')
 useEffect(()=>{const loaded={}; for(const state of STATES){const img=images.current[state]; if(img?.complete&&img.naturalWidth>0)loaded[state]=true} setReady(prev=>({...prev,...loaded}))},[])
 useEffect(()=>{if(ready[action])setShown(action)},[action,ready])
 return <div className="dd-animation" role="img" aria-label={label}>
 <img className="dd-animation-fallback" src="/images/dingding-home/companion.png" alt="" style={{opacity:ready[shown]?0:1}}/>
 {STATES.map(state=><picture key={state} className="dd-animation-layer" style={{opacity:ready[shown]&&shown===state?1:0}} aria-hidden="true"><source media="(prefers-reduced-motion: reduce)" srcSet={`/images/dingding-home/animated/${state}.png`}/><img ref={el=>{images.current[state]=el}} src={`/images/dingding-home/animated/${state}.gif?v=2`} alt="" loading="eager" decoding="sync" onLoad={()=>setReady(prev=>prev[state]?prev:{...prev,[state]:true})}/></picture>)}
 </div>
}
