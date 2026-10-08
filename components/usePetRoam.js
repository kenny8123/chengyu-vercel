import {useEffect,useState} from 'react'
// The page reserves this rail, so the entire route is clear of learning content.
export default function usePetRoam(quiet,paused){
 const [position,setPosition]=useState(null)
 useEffect(()=>{
  let timer;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
  function place(random,force=false){const mobile=innerWidth<=600,lane=mobile?78:104
   const y0=mobile?90:110,y1=Math.max(y0,innerHeight-180)
   setPosition(prev=>paused&&prev&&!force?prev:{x:innerWidth-lane+Math.floor(random?Math.random()*12:6),y:random?Math.round(y0+Math.random()*(y1-y0)):y1})
  }
  function next(){if(!document.hidden&&!quiet&&!paused&&!reduced.matches)place(true);timer=setTimeout(next,24000+Math.random()*14000)}
  function resize(){place(false,true)}
  place(!quiet&&!paused&&!reduced.matches);timer=setTimeout(next,24000+Math.random()*14000)
  window.addEventListener('resize',resize)
  return()=>{clearTimeout(timer);window.removeEventListener('resize',resize)}
 },[quiet,paused])
 return position
}
