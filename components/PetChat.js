import {useEffect,useRef,useState} from 'react'
import usePet from './usePet'
import CATALOG from './petCatalog.json'
import {readClaudeStream} from './readClaudeStream'
export default function PetChat({notice='',action='study',onBusy}){
 const store=usePet(),[messages,setMessages]=useState([]),[input,setInput]=useState(''),[reply,setReply]=useState('回來啦。今天想和我一起研究哪個成語？'),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const request=useRef(null),state=useRef({}),automaticFailed=useRef(false)
 state.current={store,messages,action,onBusy,input}
 function cancel(){request.current?.abort.abort();request.current=null;setBusy(false);state.current.onBusy?.(false)}
 async function ask(text,automatic=false){
  const s=state.current
  if(!s.store||(automatic&&request.current))return
  // A new student question takes priority over an older automatic reminder.
  request.current?.abort.abort()
  const next=[...s.messages,{role:'user',content:text}].slice(-11),job={abort:new AbortController()}
  request.current=job;setBusy(true);s.onBusy?.(true);setError('')
  if(!automatic){setReply('收到，我正在想怎樣說得更清楚…');setInput('')}
  try{
   const r=await fetch('/api/dingding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next,memory:s.store.profiles[s.store.active].history.slice(0,20),quiet:false,petState:s.action,stream:true}),signal:job.abort.signal})
   if(!r.ok){const data=await r.json();throw Error(data.error||'連線暫時中斷。')}
   const text=r.headers.get('content-type')?.includes('text/event-stream')
    ?await readClaudeStream(r.body,value=>{if(request.current===job)setReply(value)})
    :(await r.json()).text
   if(request.current===job){setMessages([...next,{role:'assistant',content:text.slice(0,1200)}]);setReply(text)}
  }catch(e){if(request.current===job){setError(e.message);if(automatic)automaticFailed.current=true}}
  finally{if(request.current===job){request.current=null;setBusy(false);state.current.onBusy?.(false)}}
 }
 useEffect(()=>{
  if(!store?.active)return
  automaticFailed.current=false;setMessages([]);setError('');setBusy(false)
  const latest=store.profiles[store.active].history[0],lesson=CATALOG.find(c=>c.idiom===latest?.idiom)
  setReply(lesson?'剛才學到「'+lesson.idiom+'」，'+lesson.meaning:'回來啦。今天想和我一起研究哪個成語？')
  let timer
  const tick=()=>{if(!document.hidden&&!state.current.input&&!automaticFailed.current)ask('請根據我的近期學習，主動跟我說一句自然的近況提醒，最多兩句、80字；沒有紀錄就邀請我開始學習。',true);timer=setTimeout(tick,90000+Math.random()*60000)}
  tick()
  return()=>{clearTimeout(timer);request.current?.abort.abort();request.current=null;state.current.onBusy?.(false)}
 },[store?.active])
 useEffect(()=>{if(notice){cancel();setError('');setReply(notice)}},[notice])
 return <div className="dd-conversation"><div className="dd-speech" aria-live="polite"><strong>鼎鼎 <span>{busy?'正在回覆…':'◉'}</span></strong><p>{reply}</p>{error&&<small role="alert">{error}</small>}</div><form onSubmit={e=>{e.preventDefault();if(input.trim())ask(input.trim())}}><input aria-label="對鼎鼎說話" placeholder="對鼎鼎說點什麼…" value={input} onChange={e=>setInput(e.target.value)} maxLength={1200}/><button className="dd-send" disabled={!input.trim()||!store} aria-label="送出訊息">↗</button></form><span className="dd-api-note">Claude 互動 · 使用近期學習摘要 · AI 回覆請以教材為準</span></div>
}
