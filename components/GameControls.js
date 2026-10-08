import usePetRoam from './usePetRoam'
import {useState,useEffect} from 'react'
import usePet from './usePet'
import CATALOG from './petCatalog.json'
import {readPet,savePet,nextReminder} from './petMemory'
export function BotFace({size=64,mood='idle'}){
 const [failed,setFailed]=useState(false)
 const safeMood=['idle','thinking','happy','sad','celebrate'].includes(mood)?mood:'idle'
 const labels={idle:'待機',thinking:'思考',happy:'開心',sad:'再接再厲',celebrate:'慶祝'}
 return failed ? <span aria-label="鼎鼎">🤖</span> : <picture className="dingding-picture"><source media="(prefers-reduced-motion: reduce)" srcSet={`/images/dingding-pixel/${safeMood}.png`}/><img src={`/images/dingding-pixel/${safeMood}.gif`} alt={`鼎鼎・${labels[safeMood]}`} className="bot-face pixel-dingding" data-mood={safeMood} style={{width:size,height:size,verticalAlign:'middle',imageRendering:'pixelated',objectFit:'contain'}} onError={()=>setFailed(true)}/></picture>
}
export function PlayerFace({size=64,mood='idle'}){
 const [failed,setFailed]=useState(false)
 const safeMood=['idle','thinking','happy','sad','celebrate'].includes(mood)?mood:'idle'
 const labels={idle:'待機',thinking:'思考',happy:'開心',sad:'再接再厲',celebrate:'慶祝'}
 return failed ? <span aria-label="你">🧑‍🚀</span> : <picture className="dingding-picture"><source media="(prefers-reduced-motion: reduce)" srcSet={`/images/player-pixel/${safeMood}.png`}/><img src={`/images/player-pixel/${safeMood}.gif`} alt={`你・${labels[safeMood]}`} className="bot-face pixel-dingding pixel-player" data-mood={safeMood} style={{width:size,height:size,verticalAlign:'middle',imageRendering:'pixelated',objectFit:'contain'}} onError={()=>setFailed(true)}/></picture>
}
export function PetLook({size=80,mood='idle',outfit=null}){
 const c=CATALOG.find(c=>c.idiom===outfit)
 return <span className={`pet-look ${c?'dressed':''}`} style={{'--pet-hue':`${(c?.id||0)*137.5%360}deg`,width:size,height:size}}><BotFace size={size} mood={mood}/>{c&&<><span className="pet-hat" aria-hidden="true">{c.emoji}</span><span className="pet-badge" aria-hidden="true">{c.emoji}</span></>}</span>
}
export function Guide({tip,open,onToggle,mood='idle',quiet=false}){
 const store=usePet(),p=store?.profiles[store.active],[paused,setPaused]=useState(false),[hover,setHover]=useState(false)
 const position=usePetRoam(quiet,paused||hover)
 return <aside className={`guide-wrap pet-roaming ${quiet?'pet-quiet':''} ${paused?'pet-paused':''}`} aria-label="鼎鼎陪伴區" style={{visibility:position?.hidden||!position?'hidden':'visible',transition:position?.jump?'none':undefined,left:position?.x??'auto',top:position?.y??110,right:position? 'auto':8,bottom:'auto'}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocus={()=>setHover(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHover(false)}}>
 <a className="guide-avatar" href={quiet?undefined:'/pet'} aria-label={quiet?'鼎鼎安靜陪考':'回鼎鼎的家'} tabIndex={quiet?-1:0}><span className="guide-face"><PetLook size={64} mood={quiet?'idle':mood} outfit={quiet?null:p?.outfit}/></span></a>
 <span className="pet-level">{quiet?'安靜陪考':`Lv. ${Math.floor((p?.xp||0)/100)+1} · 鼎鼎`}</span>
 {!quiet&&<button className="pet-pause" onClick={()=>setPaused(v=>!v)} aria-pressed={paused}>{paused?'繼續散步':'原地陪伴'}</button>}
 </aside>
}

export function TextScaleControl({scale,onChange}){
  return(
    <div className="text-scale-ctrl">
      <span className="ts-label">Aa</span>
      <button className={scale==='sm'?'active':''} onClick={()=>onChange('sm')}>小</button>
      <button className={scale==='md'?'active':''} onClick={()=>onChange('md')}>中</button>
      <button className={scale==='lg'?'active':''} onClick={()=>onChange('lg')}>大</button>
    </div>
  )
}

