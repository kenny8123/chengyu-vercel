import {useEffect,useRef,useState} from 'react'
import usePet from './usePet'
import CATALOG from './petCatalog.json'
import {readClaudeStream} from './readClaudeStream'
import {rewardStoryAnswer} from './petMemory'
const questionFor=c=>'「'+c.idiom+'」讓你想到甚麼意思？也可以說一個生活例子給我聽。'
const chooseLesson=(profile,previous)=>{const recent=CATALOG.find(c=>c.idiom===profile?.history?.[0]?.idiom&&c.id!==previous?.id);const pool=CATALOG.filter(c=>c.id!==previous?.id);return recent||pool[Math.floor(Math.random()*pool.length)]}
export default function PetChat({notice='',action='study',onBusy,onCelebrate}){
 const store=usePet(),[messages,setMessages]=useState([]),[input,setInput]=useState(''),[reply,setReply]=useState('回來啦，今天一起聊個成語吧。'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[question,setQuestion]=useState(null),[rewardNote,setRewardNote]=useState('')
 const request=useRef(null),state=useRef({}),lastQuestion=useRef(null)
 state.current={store,messages,action,onBusy,onCelebrate,input,question}
 function cancel(){request.current?.abort.abort();request.current=null;setBusy(false);state.current.onBusy?.(false)}
 async function ask(text,retry=false){
  const s=state.current;if(!s.store)return
  if(!retry&&/^(換題|換個題目|再問我|再問一題|換個典故)[！!。？?]?$/.test(text)){
   cancel();const c=chooseLesson(s.store.profiles[s.store.active],s.question);setQuestion(c);setReply('好呀，換個成語聊聊。'+questionFor(c));setInput('');setError('');setRewardNote('');return
  }
  const stopping=!retry&&/^(先聊天|不想答|先不答|不要考我|停止提問)[！!。？?]?$/.test(text)
  if(stopping){cancel();setQuestion(null);setReply('好，我們輕鬆聊。你想問哪個成語或故事？想繼續時說「再問我」就好。');setInput('');setError('');setRewardNote('');return}
  request.current?.abort.abort()
  const activeQuestion=retry?lastQuestion.current?.lesson:s.question
  const next=[...s.messages,{role:'user',content:text}].slice(-11),job={abort:new AbortController()},profileId=s.store.active
  request.current=job;lastQuestion.current={text,lesson:activeQuestion};setBusy(true);s.onBusy?.(true);setError('');setRewardNote('');setReply('我聽到了，讓我想一想…');setInput('')
  const deadline=setTimeout(()=>job.abort.abort(),50000)
  const payload={messages:next,memory:s.store.profiles[s.store.active].history.slice(0,20),petState:s.action,...(activeQuestion?{quiz:{id:activeQuestion.id,answer:text},conversationQuiz:true}:{stream:true})}
  try{
   const r=await fetch('/api/dingding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:job.abort.signal})
   if(!r.ok){const data=await r.json();throw Error(data.error||'連線暫時中斷。')}
   let response
   if(activeQuestion){
    const data=await r.json()
    if(data.idiom!==activeQuestion.idiom||typeof data.feedback!=='string'||!(data.correct===null||typeof data.correct==='boolean'))throw Error('回覆不完整，請重試原問題。')
    response=data.feedback
    if(request.current!==job)return
    if(data.correct===true){
     const reward=rewardStoryAnswer(activeQuestion.idiom,profileId)
     s.onCelebrate?.()
     setRewardNote(reward?.food?'♥ 親密度 +3　🍪 典故點心 +1':reward?'這個成語今天已領過獎勵，你仍然答得很好！':'獎勵未能儲存，請檢查瀏覽器儲存設定。')
     const c=chooseLesson(s.store.profiles[s.store.active],activeQuestion);setQuestion(c)
     response+='\n\n再和你聊一個：'+questionFor(c)
    }
   }else{
    try{response=r.headers.get('content-type')?.includes('text/event-stream')?await readClaudeStream(r.body,value=>{if(request.current===job)setReply(value)}):(await r.json()).text}
    catch(e){
     if(job.abort.signal.aborted)throw e
     const fallback=await fetch('/api/dingding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,stream:false}),signal:job.abort.signal})
     const data=await fallback.json();if(!fallback.ok)throw Error(data.error||'連線暫時中斷。');response=data.text
    }
   }
   if(typeof response!=='string'||!response.trim())throw Error('這次回覆不完整，請重試原問題。')
   if(request.current===job){setMessages([...next,{role:'assistant',content:response.slice(0,1200)}]);setReply(response)}
  }catch(e){if(request.current===job)setError(e.name==='AbortError'?'等候較久，請按重試。你的文字仍保留。':e.message)}
  finally{clearTimeout(deadline);if(request.current===job){request.current=null;setBusy(false);state.current.onBusy?.(false)}}
 }
 useEffect(()=>{
  if(!store?.active)return
  setMessages([]);setError('');setBusy(false);setRewardNote('')
  const c=chooseLesson(store.profiles[store.active]);setQuestion(c);setReply('回來啦，想聽聽你的想法！'+questionFor(c))
  return()=>{request.current?.abort.abort();request.current=null;state.current.onBusy?.(false)}
 },[store?.active])
 useEffect(()=>{if(notice){cancel();setError('');setRewardNote('');setReply(notice+(state.current.question?'\n\n'+questionFor(state.current.question):''))}},[notice])
 return <div className="dd-conversation"><div className="dd-speech" aria-live="polite"><strong>鼎鼎 <span>{busy?'正在回覆…':'◉'}</span></strong><p>{reply}</p>{rewardNote&&<div className="dd-chat-reward" role="status">{rewardNote}</div>}{error&&<div role="alert"><small>{error}</small> <button type="button" className="dd-key" onClick={()=>ask(lastQuestion.current.text,true)} disabled={busy}>重試原問題</button></div>}</div><form onSubmit={e=>{e.preventDefault();if(input.trim())ask(input.trim())}}><input aria-label="對鼎鼎說話" placeholder="回答鼎鼎，或問問你想知道的事…" value={input} onChange={e=>setInput(e.target.value)} maxLength={600}/><button className="dd-send" disabled={!input.trim()||!store} aria-label="送出訊息">↗</button></form></div>
}
