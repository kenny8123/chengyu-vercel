import {useEffect,useRef,useState} from 'react'
export default function usePetSounds(){
 const bank=useRef({}),active=useRef(null),mutedRef=useRef(false)
 const [muted,setMuted]=useState(false)
 useEffect(()=>{
  mutedRef.current=localStorage.getItem('dingding-muted')==='true';setMuted(mutedRef.current)
  for(const name of ['study','eat','shy','sleep','happy','outfit']){const a=new Audio('/audio/dingding/'+({eat:'eat-user.mp3',shy:'pat-user.mp3'}[name]||(name+(['sleep','happy'].includes(name)?'-v2':'')+'.wav')));a.preload='auto';a.volume=.45;bank.current[name]=a}
  const stop=()=>{if(document.hidden)active.current?.pause()}
  document.addEventListener('visibilitychange',stop)
  return()=>{document.removeEventListener('visibilitychange',stop);Object.values(bank.current).forEach(a=>{a.pause();a.removeAttribute('src');a.load()});bank.current={}}
 },[])
 function play(name){
  active.current?.pause()
  if(mutedRef.current||document.hidden)return
  const a=bank.current[name];if(!a)return
  a.currentTime=0;active.current=a;a.play().catch(()=>{})
 }
 function toggle(){const value=!mutedRef.current;mutedRef.current=value;setMuted(value);localStorage.setItem('dingding-muted',String(value));if(value)active.current?.pause()}
 return {play,muted,toggle}
}
