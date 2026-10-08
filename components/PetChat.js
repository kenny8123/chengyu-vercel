import {useEffect,useRef,useState} from 'react'
import usePet from './usePet'
export default function PetChat(){
 const store=usePet(),[messages,setMessages]=useState([]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),controller=useRef(null)
 useEffect(()=>{controller.current?.abort();setMessages([]);setError('');setInput('');setBusy(false);return()=>controller.current?.abort()},[store?.active])
 async function send(e){e.preventDefault();if(!input.trim()||busy||!store)return
  const text=input.trim(),next=[...messages,{role:'user',content:text}].slice(-11),abort=new AbortController();controller.current=abort;setBusy(true);setError('')
  try{const r=await fetch('/api/dingding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next,memory:store.profiles[store.active].history.slice(0,20),quiet:false}),signal:abort.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'暫時無法連線。');if(!abort.signal.aborted){setMessages([...next,{role:'assistant',content:data.text}]);setInput('')}}catch(e){if(!abort.signal.aborted)setError(e.message)}finally{if(!abort.signal.aborted)setBusy(false)}
 }
 return <section className="pet-letter pet-chat"><h2>和鼎鼎聊聊</h2><p>Claude 會參考 40 個典故，以及這個檔案最近的學習紀錄。送出後，對話文字與最近 20 筆成語學習摘要會交給 Claude 回覆，不包含學生暱稱。</p><div className="pet-chat-log" aria-live="polite">{messages.length?messages.map((m,i)=><p key={i} className={m.role}><strong>{m.role==='user'?'你':'鼎鼎'}：</strong>{m.content}</p>):<p>可以問：「我上次哪個成語還不熟？」或「幫我想一個生活例子」。</p>}</div><form onSubmit={send}><label htmlFor="pet-chat-input">想跟鼎鼎說什麼？</label><textarea id="pet-chat-input" value={input} onChange={e=>setInput(e.target.value)} maxLength={1200} rows={3} disabled={busy}/><button className="btn btn-go" disabled={busy||!input.trim()||!store}>{busy?'鼎鼎想一想…':'送出給鼎鼎'}</button></form>{error&&<p role="alert">{error}</p>}<small>AI 回覆可能有誤，典故內容請以教材為準。對話只保留在本次頁面，切換學生會清空。</small></section>
}
