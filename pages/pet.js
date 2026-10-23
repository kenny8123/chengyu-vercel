import usePetSounds from '../components/usePetSounds'
import PetAnimation from '../components/PetAnimation'
import {outfitAsset} from '../components/outfitAssets'
import PetHelp,{growthTitle} from '../components/PetHelp'
import ScrollCollection from '../components/ScrollCollection'
import Head from 'next/head'
import {useEffect,useRef,useState} from 'react'
import {PetLook} from '../components/GameControls'
import usePet from '../components/usePet'
import CATALOG from '../components/petCatalog.json'
import {careForPet,wearOutfit,unlocked,outfitBond} from '../components/petMemory'
const LABELS={study:'我在這裡陪你，一起學成語吧！',eat:'謝謝你的點心，真好吃！',shy:'嘿嘿，謝謝你摸摸我！',sleep:'呼……我先睡一會，醒來再陪你。',happy:'和你在一起真開心！'}
export default function PetHome(){
 const sounds=usePetSounds()
 const store=usePet(),p=store?.profiles[store.active], [action,setAction]=useState('study'),[notice,setNotice]=useState(''),[closet,setCloset]=useState(false),[help,setHelp]=useState(false),[scrolls,setScrolls]=useState(false)
 const timer=useRef(null),dialog=useRef(null),idleTimer=useRef(null),noticeTimer=useRef(null),stateRef=useRef({})
 stateRef.current={action}
 useEffect(()=>{
  let stopped=false
  function schedule(){idleTimer.current=setTimeout(()=>{
   if(!document.hidden&&stateRef.current.action==='study'){
    setAction(Math.random()<.7?'sleep':'happy')
    timer.current=setTimeout(()=>setAction('study'),12000)
   }
   if(!stopped)schedule()
  },35000+Math.random()*25000)}
  if(Math.random()<.3){setAction('sleep');timer.current=setTimeout(()=>setAction('study'),12000)}
  schedule();return()=>{stopped=true;clearTimeout(timer.current);clearTimeout(idleTimer.current);clearTimeout(noticeTimer.current)}
 },[])
 useEffect(()=>{if(closet)dialog.current?.showModal();else dialog.current?.close()},[closet])
 // 照顧鼎鼎後的回應顯示在鼎鼎頭頂的對話框，幾秒後消失
 function say(text){clearTimeout(noticeTimer.current);setNotice(text);noticeTimer.current=setTimeout(()=>setNotice(''),5600)}
 function care(kind){if(!p)return;say(careForPet(kind));if(kind==='feed'&&!p.food)return;sounds.play(kind==='feed'?'eat':kind==='pat'?'shy':'sleep');clearTimeout(timer.current);setAction(kind==='feed'?'eat':kind==='pat'?'shy':'sleep');timer.current=setTimeout(()=>setAction('study'),5600)}
 function equip(id){if(wearOutfit(id)){sounds.play('outfit');setCloset(false);say(id?`換好啦！今天用「${id}」的模樣陪你。`:'回到你最熟悉的鼎鼎。')}else say('這套造型還沒解鎖，多照顧我、多學成語吧。')}
 const owned=CATALOG.filter(c=>unlocked(p,c.idiom))
 return <><Head><title>寵物的家｜成語穿越者</title></Head><main className="dd-home">
 <header className="dd-header"><a className="dd-key" href="/?view=challenge">← 返回</a><div className="dd-title"><span className="dd-status-dot"/><h1>寵物的家</h1></div><button className="dd-key dd-help-trigger" onClick={()=>setHelp(true)} aria-label="養成說明">? 說明</button><div className="dd-stats"><span title="每 100 經驗升一級">等級 Lv. {Math.floor((p?.xp||0)/100)+1} <span className="dd-xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={(p?.xp||0)%100} aria-label={`升級進度，稱號：${growthTitle(p?.xp||0)}`}><i style={{width:`${(p?.xp||0)%100}%`}}/><b>{growthTitle(p?.xp||0)}</b></span><small className="dd-next-level">距升級 {100-(p?.xp||0)%100} 經驗</small></span><span title="知識點心">🍪 點心 {p?.food||0}</span><span title={`親密度：每 20 解鎖一套造型，距下一套還差 ${20-(p?.bond||0)%20}`}><span className="dd-xpbar dd-bondbar" role="progressbar" aria-valuemin={0} aria-valuemax={20} aria-valuenow={(p?.bond||0)%20} aria-label={`親密度 ${p?.bond||0}`}><i style={{width:`${(p?.bond||0)%20*5}%`}}/><b>♥ 親密度 {p?.bond||0}</b></span></span></div></header>
 <section className="dd-room" aria-label="鼎鼎的成語小屋"><div className="dd-room-scene"><img className="dd-room-art" src="/images/dingding-home/room-cozy.png" alt="淡色小屋，兩側有小書桌、沙發與邊桌，中央留給鼎鼎"/><div className="dd-action-bubble" role="status"><span/> {notice||LABELS[action]}</div><div className={`dd-resident dd-${action}`}><PetAnimation action={action} label={LABELS[action]} outfit={p?.outfit}/>{p?.outfit&&!outfitAsset(p.outfit)&&<span className="dd-outfit-pin" title={`${p.outfit}造型`}>{CATALOG.find(c=>c.idiom===p.outfit)?.emoji}</span>}</div><button className="dd-room-hotspot" onClick={()=>care('pat')} aria-label="摸摸鼎鼎（相知相惜）" title="相知相惜：摸摸鼎鼎"/><div id="pet-music-control"/><button className="dd-sound-toggle" onClick={sounds.toggle} aria-pressed={sounds.muted} aria-label={sounds.muted?'開啟鼎鼎音效':'關閉鼎鼎音效'}>{sounds.muted?'音效：關':'♫ 音效：開'}</button><div className="dd-floor-label">鼎鼎的小天地 · {p?.outfit||'初始造型'}</div></div></section>
 <section className="dd-console" aria-label="陪鼎鼎玩一會"><nav className="dd-actions" aria-label="照顧鼎鼎"><button className="dd-key" onClick={()=>care('feed')} disabled={!p}><span>◈</span> 典故點心 <small>−1🍪 / +5♥</small></button><button className="dd-key" onClick={()=>care('pat')} disabled={!p}><span>♡</span> 相知相惜 <small>+2♥</small></button><button className="dd-key" onClick={()=>care('rest')} disabled={!p}><span>☾</span> 養精蓄銳 <small>+2♥</small></button><button className="dd-key" onClick={()=>{sounds.play('outfit');setCloset(true)}}><span>▦</span> 造型 <small>{owned.length}/40</small></button><button className="dd-key" onClick={()=>{sounds.play('outfit');setScrolls(true)}}><span>📜</span> 卷軸館藏 <small>{(p?.scrolls||[]).length}/40</small></button></nav></section>
 </main><dialog ref={dialog} className="dd-closet" onCancel={()=>setCloset(false)} onClose={()=>setCloset(false)}><header><h2>典故造型櫃</h2><button className="dd-key" onClick={()=>setCloset(false)} aria-label="關閉造型櫃">✕</button></header><p>每累積 20 親密度，依序解鎖 1 套造型。點選即可換上，不扣親密度。</p><button className="dd-key" onClick={()=>equip(null)}>原本的鼎鼎</button><div className="dd-wardrobe-grid">{CATALOG.map(c=>{const ready=unlocked(p,c.idiom);return <button className={`dd-outfit ${ready?'unlocked':''}`} key={c.id} onClick={()=>equip(c.idiom)} disabled={!ready}><PetLook size={72} outfit={c.idiom}/><strong>{c.idiom}</strong><small>{p?.outfit===c.idiom?'使用中':ready?'換上':'尚未解鎖'}</small><small>{ready?'已解鎖':`還差 ${Math.max(0,outfitBond(c.idiom)-(p?.bond||0))} 親密度`}</small></button>})}</div></dialog><PetHelp open={help} onClose={()=>setHelp(false)} profile={p}/><ScrollCollection open={scrolls} onClose={()=>setScrolls(false)} profile={p}/></>
}

