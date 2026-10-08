import {useEffect,useRef,useState} from 'react'
import CATALOG from './petCatalog.json'
import usePet from './usePet'
import {rewardStoryAnswer} from './petMemory'
export default function StoryQuiz({open,onClose}){
 const dialog=useRef(null),job=useRef(null),store=usePet()
 const [lesson,setLesson]=useState(null),[answer,setAnswer]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState('')
 function next(){job.current?.abort();job.current=null;setBusy(false);setLesson(old=>{const pool=CATALOG.filter(c=>c.id!==old?.id);return pool[Math.floor(Math.random()*pool.length)]});setAnswer('');setResult(null);setError('')}
 useEffect(()=>{if(open){next();dialog.current?.showModal()}else{dialog.current?.close();job.current?.abort();job.current=null;setBusy(false)}return()=>{job.current?.abort();job.current=null}},[open,store?.active])
 async function submit(e){
  e.preventDefault();if(job.current||!answer.trim()||!lesson||!store)return
  const controller=new AbortController(),profileId=store.active;job.current=controller;setBusy(true);setError('')
  const timer=setTimeout(()=>controller.abort(),50000)
  try{
   const r=await fetch('/api/dingding',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({messages:[{role:'user',content:answer}],quiz:{id:lesson.id,answer}})})
   const data=await r.json();if(!r.ok)throw Error(data.error||'評閱暫時中斷，請重試。')
   if(typeof data.correct!=='boolean'||data.idiom!==lesson.idiom)throw Error('評閱結果不完整，請重試。')
   if(job.current!==controller)return
   const reward=data.correct?rewardStoryAnswer(lesson.idiom,profileId):null
   setResult({...data,reward})
  }catch(e){if(job.current===controller)setError(e.name==='AbortError'?'評閱較久，答案已保留，請重試。':e.message)}
  finally{clearTimeout(timer);if(job.current===controller){job.current=null;setBusy(false)}}
 }
 return <dialog ref={dialog} className="dd-closet dd-story-quiz" onCancel={onClose} onClose={onClose}>
 <header><h2>與鼎鼎・典故切磋</h2><button className="dd-key" onClick={onClose} aria-label="關閉典故切磋">✕</button></header>
 {lesson&&<><p className="dd-question">「{lesson.idiom}」是甚麼意思？請用自己的話解釋，並舉一個適合的生活例子。</p>
 <p>答對：親密度 +3、典故點心 +1。同一成語每天領一次；答錯可以修改再試。</p>
 <form onSubmit={submit}><label htmlFor="story-answer">我的理解</label><textarea id="story-answer" value={answer} onChange={e=>setAnswer(e.target.value)} maxLength={600} rows={4} disabled={busy||result?.correct} placeholder="我覺得這個成語是指……例如……"/>
 <div className="dd-quiz-actions"><button className="dd-key" disabled={busy||!answer.trim()||result?.correct}>{busy?'鼎鼎正在評閱…':error?'重試評閱':'請鼎鼎評閱'}</button><button type="button" className="dd-key" onClick={next}>換個典故</button></div></form>
 {error&&<p role="alert">{error}</p>}{result&&<div role="status" className="dd-quiz-result"><strong>{result.correct?'領會其意！':'再想一想'}</strong><p>{result.feedback}</p>{result.correct&&<p>{result.reward?.food?'已獲得：親密度 +3、典故點心 +1。':result.reward?'今天這個典故的獎勵已領取，理解得很好！':'獎勵未能儲存，請確認學習檔案及瀏覽器儲存設定。'}</p>}</div>}
 <small>AI 依教材評閱，可能有誤；可與老師核對。切磋不改變正式測驗成績。</small></>}
 </dialog>
}
