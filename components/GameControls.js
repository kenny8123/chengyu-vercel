import {useState} from 'react'
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
export function Guide({tip,open,onToggle,mood='idle'}){
  return(
    <div className="guide-wrap">
      {open&&(
        <div className="guide-bubble">
          <button className="guide-close" onClick={onToggle} aria-label="收起嚮導">×</button>
          <p>{tip}</p>
        </div>
      )}
      <button className="guide-avatar" onClick={onToggle} aria-label="打開嚮導">
        <span className="guide-face"><BotFace size={80} mood={mood}/></span>
      </button>
    </div>
  )
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

