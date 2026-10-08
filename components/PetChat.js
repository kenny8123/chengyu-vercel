import {useEffect,useRef,useState} from 'react'
import usePet from './usePet'
import CATALOG from './petCatalog.json'
import {readClaudeStream} from './readClaudeStream'
export default function PetChat({notice='',action='study',onBusy}){
 const store=usePet(),[messages,setMessages]=useState([]),[input,setInput]=useState(''),[reply,setReply]=useState('回來啦。今天想和我一起研究哪個成語？'),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const request=useRef(null),state=useRef({}),automaticFailed=useRef(false),lastQuestion=useRef('')
 state.current={store,messages,action,onBusy,input}
 function cancel(){request.current?.abort.abort();request.current=null;setBusy(false);state.current.onBusy?.(false)}
 async function ask(text,automatic=false){
  const s=state.current
  if(!s.store||(automatic&&request.current))return
  // A new student question takes priority over an older automatic reminder.
  request.current?.abort.abort()
  const next=[...s.messages,{role:'user',content:text}].slice(-11),job={abort:new AbortController()}
  request.current=job;setBusy(true);s.onBusy?.(true);setError('')
  if(!automatic){lastQuestion.current=text;setReply('收到，我正在想怎樣說得更清楚…');setInput('')}
  const deadline=setTimeout(()=>job.abort.abort(),50000)
  try{
   const r=await fetch('/api/dingding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next,memory:s.store.profiles[s.store.active].history.slice(0,20),quiet:false,petState:s.action,stream:true}),signal:job.abort.signal})
   if(!r.ok){const data=await r.json();throw Error(data.error||'連線暫時中斷。')}
   let text
   try{
    text=r.headers.get('content-type')?.includes('text/event-stream')?await readClaudeStream(r.body,value=>{if(request.current===job)setReply(value)}):(await r.json()).text
   }catch(e){
    if(job.abort.signal.aborted)throw e
    // Some proxies interrupt SSE. Retry once as a complete JSON response.
    const fallback=await fetch('/api/dingding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next,memory:s.store.profiles[s.store.active].history.slice(0,20),petState:s.action}),signal:job.abort.signal})
    const data=await fallback.json();if(!fallback.ok)throw Error(data.error||'連線暫時中斷。');text=data.text
   }
   if(typeof text!=='string'||!text.trim())throw Error('這次回覆不完整，請重試原問題。')
   if(request.current===job){setMessages([...next,{role:'assistant',content:text.slice(0,1200)}]);setReply(text)}
  }catch(e){if(request.current===job){setError(e.name==='AbortError'?'等候較久，請按重試。你的問題仍保留。':e.message);if(automatic)automaticFailed.current=true}}
  finally{clearTimeout(deadline);if(request.current===job){request.current=null;setBusy(false);state.current.onBusy?.(false)}}
 }
 useEffect(()=>{
  if(!store?.active)return
  automaticFailed.current=false;setMessages([]);setError('');setBusy(false)
  const latest=store.profiles[store.active].history[0],lesson=CATALOG.find(c=>c.idiom===latest?.idiom)
  setReply(lesson?'剛才學到「'+lesson.idiom+'」，'+lesson.meaning:'回來啦。今天想和我一起研究哪個成語？')
  return()=>{request.current?.abort.abort();request.current=null;state.current.onBusy?.(false)}
 },[store?.active])
 useEffect(()=>{if(notice){cancel();setError('');setReply(notice)}},[notice])
 return <div className="dd-conversation"><div className="dd-speech" aria-live="polite"><strong>鼎鼎 <span>{busy?'正在回覆…':'◉'}</span></strong><p>{reply}</p>{error&&<div role="alert"><small>{error}</small> <button type="button" className="dd-key" onClick={()=>ask(lastQuestion.current)} disabled={busy}>重試原問題</button></div>}</div><form onSubmit={e=>{e.preventDefault();if(input.trim())ask(input.trim())}}><input aria-label="對鼎鼎說話" placeholder="對鼎鼎說點什麼…" value={input} onChange={e=>setInput(e.target.value)} maxLength={1200}/><button className="dd-send" disabled={!input.trim()||!store} aria-label="送出訊息">↗</button></form><span className="dd-api-note">Claude 互動 · 使用近期學習摘要 · AI 回覆請以教材為準</span></div>
}
