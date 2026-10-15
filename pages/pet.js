import PetAnimation from '../components/PetAnimation'
import PetHelp,{growthTitle,PetQuickGuide} from '../components/PetHelp'
import Head from 'next/head'
import {useEffect,useRef,useState} from 'react'
import PetChat from '../components/PetChat'
import {PetLook} from '../components/GameControls'
import usePet from '../components/usePet'
import CATALOG from '../components/petCatalog.json'
import {careForPet,wearOutfit,unlocked,wearDecoration,canWearDecoration} from '../components/petMemory'
const LABELS={study:'我在這裡陪你，一起聊個成語吧！',eat:'謝謝你的點心，真好吃！',shy:'嘿嘿，謝謝你摸摸我！',sleep:'呼……我先睡一會，醒來再陪你。',happy:'和你在一起真開心！'}
export default function PetHome(){
 const store=usePet(),p=store?.profiles[store.active], [action,setAction]=useState('study'),[notice,setNotice]=useState(''),[closet,setCloset]=useState(false),[busy,setBusy]=useState(false),[help,setHelp]=useState(false)
 const timer=useRef(null),dialog=useRef(null),idleTimer=useRef(null),stateRef=useRef({})
 stateRef.current={action,busy}
 useEffect(()=>{
  let stopped=false
  function schedule(){idleTimer.current=setTimeout(()=>{
   if(!document.hidden&&!stateRef.current.busy&&stateRef.current.action==='study'){
    setAction(Math.random()<.7?'sleep':'happy')
    timer.current=setTimeout(()=>setAction('study'),12000)
   }
   if(!stopped)schedule()
  },35000+Math.random()*25000)}
  if(Math.random()<.3){setAction('sleep');timer.current=setTimeout(()=>setAction('study'),12000)}
  schedule();return()=>{stopped=true;clearTimeout(timer.current);clearTimeout(idleTimer.current)}
 },[])
 useEffect(()=>{if(busy){clearTimeout(timer.current);setAction('study')}},[busy])
 useEffect(()=>{if(closet)dialog.current?.showModal();else dialog.current?.close()},[closet])
 function care(kind){if(!p)return;setNotice(careForPet(kind));if(kind==='feed'&&!p.food)return;clearTimeout(timer.current);setAction(kind==='feed'?'eat':kind==='pat'?'shy':'sleep');timer.current=setTimeout(()=>setAction('study'),5600)}
 function equip(id){if(wearOutfit(id)){setCloset(false);setNotice(id?`換好啦！今天用「${id}」的模樣陪你。`:'回到你最熟悉的鼎鼎。')}else setNotice('這套造型還沒解鎖，先一起學習吧。')}
 const owned=CATALOG.filter(c=>unlocked(p?.lessons[c.idiom]))
 return <><Head><title>寵物的家｜成語穿越者</title></Head><main className="dd-home">
 <header className="dd-header"><a className="dd-key" href="/?view=challenge">← 返回</a><div className="dd-title"><span className="dd-status-dot"/><h1>寵物的家</h1></div><button className="dd-key dd-help-trigger" onClick={()=>setHelp(true)} aria-label="養成說明">? 說明</button><div className="dd-stats"><span title="每 100 經驗升一級">等級 Lv. {Math.floor((p?.xp||0)/100)+1} <small className="dd-growth-title">{growthTitle(p?.xp||0)}</small><progress max={100} value={(p?.xp||0)%100} aria-label="升級進度"/><small className="dd-next-level">距升級 {100-(p?.xp||0)%100} 經驗</small></span><span title="知識點心">🍪 點心 {p?.food||0}</span><span title="親密度">♥ 親密度 {p?.bond||0}<small className="dd-growth-title">{(p?.bond||0)>=100?'默契知己':(p?.bond||0)>=30?'熟悉夥伴':'新朋友'}</small></span></div></header>
 <section className="dd-room" aria-label="鼎鼎的成語小屋"><div className="dd-room-scene"><img className="dd-room-art" src="/images/dingding-home/room-furnished.png" alt="淡色小屋，兩側有小書桌、沙發與邊桌，中央留給鼎鼎"/>{p?.decoration&&canWearDecoration(p,p.decoration)&&<div className={`dd-bond-decor dd-decor-${p.decoration}`} aria-label="已套用的親密度裝飾"><span>{p.decoration==='hearts'?'♡ ♡ ♡':p.decoration==='stars'?'☆ ✧ ☆':'🌷 🪴'}</span><span>{p.decoration==='hearts'?'♡ ♡ ♡':p.decoration==='stars'?'☆ ✧ ☆':'🪴 🌷'}</span></div>}<div className="dd-action-bubble" role="status"><span/> {busy?'鼎鼎正在想怎麼回答你…':LABELS[action]}</div><div className={`dd-resident dd-${action}`}><PetAnimation action={action} label={LABELS[action]}/>{p?.outfit&&<span className="dd-outfit-pin" title={`${p.outfit}造型`}>{CATALOG.find(c=>c.idiom===p.outfit)?.emoji}</span>}</div><button className="dd-room-hotspot" onClick={()=>care('pat')} aria-label="摸摸鼎鼎（相知相惜）" title="相知相惜：摸摸鼎鼎"/><div className="dd-floor-label">鼎鼎的小天地 · {p?.outfit||'初始造型'}</div></div></section>
 <section className="dd-console" aria-label="陪鼎鼎玩一會"><nav className="dd-actions" aria-label="照顧鼎鼎"><button className="dd-key" onClick={()=>care('feed')} disabled={!p}><span>◈</span> 典故點心 <small>−1🍪 / +5♥</small></button><button className="dd-key" onClick={()=>care('pat')} disabled={!p}><span>♡</span> 相知相惜 <small>+2♥</small></button><button className="dd-key" onClick={()=>care('rest')} disabled={!p}><span>☾</span> 養精蓄銳 <small>+2♥</small></button><button className="dd-key" onClick={()=>setCloset(true)}><span>▦</span> 造型 <small>{owned.length}/40</small></button></nav><PetChat notice={notice} action={action} onBusy={setBusy} onCelebrate={()=>{clearTimeout(timer.current);setAction('happy');timer.current=setTimeout(()=>setAction('study'),6500)}}/></section>
 <PetQuickGuide profile={p} onDecoration={id=>{if(wearDecoration(id))setNotice(id?'新的陪伴裝飾已放好啦！':'已收起陪伴裝飾。')}}/></main><dialog ref={dialog} className="dd-closet" onCancel={()=>setCloset(false)} onClose={()=>setCloset(false)}><header><h2>典故造型櫃</h2><button className="dd-key" onClick={()=>setCloset(false)} aria-label="關閉造型櫃">✕</button></header><ol><li>讀過該成語典故。</li><li>完成四階段練習，或挑戰答對該成語兩次。</li><li>點選已解鎖造型，即可換上。</li></ol><button className="dd-key" onClick={()=>equip(null)}>原本的鼎鼎</button><div className="dd-wardrobe-grid">{CATALOG.map(c=>{const ready=unlocked(p?.lessons[c.idiom]);return <button className={`dd-outfit ${ready?'unlocked':''}`} key={c.id} onClick={()=>equip(c.idiom)} disabled={!ready}><PetLook size={72} outfit={c.idiom}/><strong>{c.idiom}</strong><small>{p?.outfit===c.idiom?'使用中':ready?'換上':'尚未解鎖'}</small><small>{p?.lessons[c.idiom]?.read?'✓ 已讀':'未讀典故'} · 練習 {Object.keys(p?.lessons[c.idiom]?.stages||{}).length}/4 · 挑戰 {Math.min(2,p?.lessons[c.idiom]?.challengeCorrect||0)}/2</small></button>})}</div></dialog><PetHelp open={help} onClose={()=>setHelp(false)} profile={p}/></>
}
