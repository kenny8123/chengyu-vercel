import {useEffect,useRef,useState} from 'react'
import {useRouter} from 'next/router'
import usePet from './usePet'

export default function GameAudio(){
 const router=useRouter(),store=usePet(),previous=useRef(null),music=useRef(null),level=useRef(null),enabledRef=useRef(true),unlocked=useRef(false),route=useRef(router.pathname)
 const [enabled,setEnabled]=useState(true),[playing,setPlaying]=useState(false)
 route.current=router.pathname
 useEffect(()=>{
  try{enabledRef.current=localStorage.getItem('game-bgm-muted')!=='true'}catch{}
  setEnabled(enabledRef.current)
  const bg=new Audio('/audio/dingding/game-bgm-user.mp3'),up=new Audio('/audio/dingding/level-up-user.mp3')
  music.current=bg;level.current=up;bg.loop=true;bg.volume=.16;bg.preload='auto';up.volume=.5;up.preload='auto'
  const sync=()=>{if(unlocked.current&&enabledRef.current&&route.current==='/'&&!document.hidden)bg.play().catch(()=>{});else bg.pause()}
  const activate=(event)=>{if(event?.target?.closest?.(".game-music-toggle"))return;unlocked.current=true;sync()}
  const onPlay=()=>setPlaying(true),onPause=()=>setPlaying(false)
  bg.addEventListener('play',onPlay);bg.addEventListener('pause',onPause)
  const visibility=()=>{sync();if(document.hidden)up.pause()}
  const duck=()=>{bg.volume=.04},restore=()=>{bg.volume=.16}
  up.addEventListener('play',duck);up.addEventListener('ended',restore);up.addEventListener('pause',restore)
  document.addEventListener('pointerdown',activate);document.addEventListener('keydown',activate);document.addEventListener('visibilitychange',visibility)
  return()=>{document.removeEventListener('pointerdown',activate);document.removeEventListener('keydown',activate);document.removeEventListener('visibilitychange',visibility);bg.removeEventListener('play',onPlay);bg.removeEventListener('pause',onPause);bg.pause();up.pause();bg.removeAttribute('src');up.removeAttribute('src');bg.load();up.load()}
 },[])
 useEffect(()=>{const a=music.current;if(!a)return;if(router.pathname==='/'&&unlocked.current&&enabledRef.current&&!document.hidden)a.play().catch(()=>{});else a.pause()},[router.pathname])
 useEffect(()=>{
  if(!store)return
  const current={id:store.active,level:Math.floor((store.profiles[store.active]?.xp||0)/100)+1},old=previous.current
  previous.current=current
  if(!old||old.id!==current.id||current.level<=old.level||document.hidden)return
  try{if(localStorage.getItem('dingding-muted')==='true')return}catch{}
  const a=level.current;if(a){a.pause();a.currentTime=0;a.play().catch(()=>{})}
 },[store])
 function toggle(){const value=!(enabledRef.current&&playing);enabledRef.current=value;setEnabled(value);unlocked.current=true;try{localStorage.setItem('game-bgm-muted',String(!value))}catch{};if(value)music.current?.play().catch(()=>{});else music.current?.pause()}
 if(router.pathname!=='/')return null
 return <button className="game-music-toggle" onClick={toggle} aria-label={enabled&&playing?'關閉背景音樂':'開啟背景音樂'} aria-pressed={enabled&&playing}>{enabled&&playing?'♫ 音樂：開':'♫ 音樂：關'}</button>
}
