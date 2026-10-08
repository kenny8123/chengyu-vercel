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
export function Guide({tip,open,onToggle,mood='idle',quiet=false,feedback=false,summary=''}){
 const store=usePet(),p=store?.profiles[store.active], [memory,setMemory]=useState(''),[petted,setPetted]=useState(false),[resting,setResting]=useState(false),[side,setSide]=useState('right')
 useEffect(()=>{if(!petted)return;const t=setTimeout(()=>setPetted(false),2000);return()=>clearTimeout(t)},[petted])
 function speak(focusRecent=false){const x=readPet(),r=nextReminder(x.profiles[x.active],CATALOG,focusRecent===true);x.profiles[x.active]=r.profile;savePet(x);const topic=CATALOG.find(c=>r.text.includes('「'+c.idiom+'」'));setMemory(topic?'一起想想「'+topic.idiom+'」：'+topic.meaning:'今天也一起學一個新成語吧。')}
 useEffect(()=>{if(!quiet)speak(true)},[quiet,tip,store?.active])
 if(resting&&!quiet)return <button className="pet-wake back-btn" onClick={()=>setResting(false)}>喚醒鼎鼎</button>
 return <div className={`guide-wrap ${quiet?'pet-quiet':''} ${side==='left'?'pet-left':''}`}>
 {!quiet&&open&&<div className="guide-bubble pet-bubble"><button className="guide-close" onClick={onToggle} aria-label="收起嚮導">×</button><p>{feedback?(summary||'這次的學習已經記好了。'):''}{petted?'謝謝你摸摸我！我會陪你慢慢學會。':memory||tip}</p><button className="back-btn" onClick={()=>setSide(side==='right'?'left':'right')}>換邊</button><button className="back-btn" onClick={()=>setResting(true)}>收起</button><a className="back-btn" href="/pet">鼎鼎的家</a></div>}
 <button className="guide-avatar" disabled={quiet} onClick={onToggle} aria-label={quiet?'鼎鼎安靜陪考':'打開嚮導'}><span className="guide-face"><PetLook size={80} mood={quiet?'idle':petted?'happy':mood} outfit={quiet?null:p?.outfit}/></span></button>
 <span className="pet-level">{quiet?'安靜陪考':`Lv. ${Math.floor((p?.xp||0)/100)+1} · 鼎鼎`}</span>
 </div>
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

