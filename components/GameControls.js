import {useState} from 'react'
function BotFace({size=64}){
 const [failed,setFailed]=useState(false)
 return failed ? <span aria-label="鼎鼎">🤖</span> : <img src="/images/robot.gif" alt="鼎鼎" className="bot-face" style={{width:size,height:size,verticalAlign:'middle'}} onError={()=>setFailed(true)}/>
}
export function Guide({tip,open,onToggle}){
  return(
    <div className="guide-wrap">
      {open&&(
        <div className="guide-bubble">
          <button className="guide-close" onClick={onToggle} aria-label="收起嚮導">×</button>
          <p>{tip}</p>
        </div>
      )}
      <button className="guide-avatar" onClick={onToggle} aria-label="打開嚮導">
        <span className="guide-face"><BotFace size={64}/></span>
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

