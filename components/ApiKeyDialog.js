import {useEffect,useRef,useState} from 'react'
import {clearKey,saveKey,useApiKey,validKey} from './userApiKey'
const mask=k=>k.slice(0,10)+'…'+k.slice(-4)
export default function ApiKeyDialog({open,onClose}){
 const dialog=useRef(null),current=useApiKey(),[value,setValue]=useState(''),[remember,setRemember]=useState(false),[error,setError]=useState(''),[show,setShow]=useState(false)
 useEffect(()=>{if(open){setValue('');setError('');setShow(false);setRemember(!!current?.remember);dialog.current?.showModal()}else dialog.current?.close()},[open])
 function submit(e){
  e.preventDefault()
  if(!validKey(value))return setError('金鑰格式不正確：應以 sk-ant- 開頭，請整條複製貼上。')
  if(!saveKey(value,remember))return setError('瀏覽器不允許儲存，請檢查私密瀏覽或儲存設定。')
  onClose?.()
 }
 return <dialog ref={dialog} className="dd-closet dd-key-dialog" onCancel={onClose} onClose={onClose}>
 <header><h2>🔑 鼎鼎的 Claude 金鑰</h2><button type="button" className="dd-key" onClick={onClose} aria-label="關閉金鑰設定">✕</button></header>
 <p>和鼎鼎聊天要用你自己的 Claude API 金鑰，費用由你的 Anthropic 帳戶支付。沒有金鑰也可以照顧鼎鼎、換造型。</p>
 {current?<p className="dd-key-status">目前使用：<code>{mask(current.key)}</code>（{current.remember?'已記住在這部裝置':'只限這個分頁，關閉後自動清除'}）</p>:<p className="dd-key-status">目前未輸入金鑰。</p>}
 <form onSubmit={submit}>
  <label htmlFor="dd-api-key">{current?'換一條新金鑰':'貼上你的金鑰'}</label>
  <div className="dd-key-row"><input id="dd-api-key" type={show?'text':'password'} value={value} onChange={e=>{setValue(e.target.value);setError('')}} placeholder="sk-ant-..." autoComplete="off" spellCheck={false}/><button type="button" className="dd-key" onClick={()=>setShow(s=>!s)}>{show?'隱藏':'顯示'}</button></div>
  <label className="dd-key-remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> 在這部裝置記住金鑰（公用或學校電腦請不要勾選）</label>
  {error&&<p role="alert">{error}</p>}
  <div className="dd-quiz-actions"><button className="dd-key" disabled={!value.trim()}>儲存金鑰</button>{current&&<button type="button" className="dd-key" onClick={()=>{clearKey();onClose?.()}}>刪除金鑰</button>}</div>
 </form>
 <small>金鑰只存在你的瀏覽器；每次聊天經本站伺服器轉交 Anthropic，伺服器不會儲存或記錄。到 <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noreferrer">Claude 開發者平台</a> 建立金鑰，並建議設定每月用量上限。</small>
 </dialog>
}
