import {useEffect,useRef,useState} from 'react'
import usePet from './usePet'
export default function PetChat({notice='',action='study',onBusy}){
 const store=usePet(),[messages,setMessages]=useState([]),[input,setInput]=useState(''),[reply,setReply]=useState('回來啦。今天想和我一起研究哪個成語？'),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const controller=useRef(null),state=useRef({}),automaticFailed=useRef(false)
 state.current={store,messages,busy,action,onBusy,input}
 async function ask(text,automatic=false){
  const s=state.current;if(!s.store||s.busy)return
  const next=[...s.messages,{role:'user',content:text}].slice(-11),abort=new AbortController();controller.current=abort;state.current.busy=true;setBusy(true);s.onBusy?.(true);setError('')
  try{const r=await fetch('/api/dingding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next,memory:s.store.profiles[s.store.active].history.slice(0,20),quiet:false,petState:s.action}),signal:abort.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'連線暫時中斷。');if(!abort.signal.aborted){setMessages([...next,{role:'assistant',content:data.text.slice(0,1200)}]);setReply(data.text);if(!automatic)setInput('')}}catch(e){if(!abort.signal.aborted){setError(e.message);if(automatic)automaticFailed.current=true}}finally{if(!abort.signal.aborted){state.current.busy=false;setBusy(false);s.onBusy?.(false)}}
 }
 useEffect(()=>{if(!store?.active)return;automaticFailed.current=false;setMessages([]);setError('');let timer
  const tick=()=>{if(!document.hidden&&!state.current.input&&!automaticFailed.current)ask('請根據我的近期學習，主動跟我說一句自然的近況提醒，最多兩句、80字；沒有紀錄就邀請我開始學習。',true);timer=setTimeout(tick,90000+Math.random()*60000)}
  timer=setTimeout(tick,2500)
  return()=>{clearTimeout(timer);controller.current?.abort();state.current.busy=false;state.current.onBusy?.(false)}
 },[store?.active])
 useEffect(()=>{if(notice){controller.current?.abort();state.current.busy=false;setBusy(false);onBusy?.(false);setError('');setReply(notice)}},[notice])
 return <div className="dd-conversation"><div className="dd-speech" aria-live="polite"><strong>鼎鼎 <span>{busy?'連線中':'◉'}</span></strong><p>{error||reply}</p></div><form onSubmit={e=>{e.preventDefault();if(input.trim())ask(input.trim())}}><input aria-label="對鼎鼎說話" placeholder="對鼎鼎說點什麼…" value={input} onChange={e=>setInput(e.target.value)} maxLength={1200} disabled={busy}/><button className="dd-send" disabled={busy||!input.trim()||!store} aria-label="送出訊息">{busy?'•••':'↗'}</button></form><span className="dd-api-note">Claude 互動 · 使用近期學習摘要 · AI 回覆請以教材為準</span></div>
}
