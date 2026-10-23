import Head from 'next/head'
import {useEffect,useRef,useState} from 'react'
import CompletionReward from '../components/CompletionReward'
import {recordLearning,startRewardRun,completeRewardRun,readPet,unlockScrolls} from '../components/petMemory'
import {outfitAsset} from '../components/outfitAssets'
import CATALOG from '../components/petCatalog.json'
import LIFE from '../components/lifeSentences.json'
import {CAST,XIAOYUE,UNITS,BOSS} from '../components/lifeAdventure'
import {sfx,unlockSfx} from '../components/adventureSfx'

// 成語穿越者：生活成語地圖冒險（設計構思：遊戲作者）
// 學習單地圖 × 射擊：每站穿越到回憶，句子裏的成語被吸走變成墨跡，用成語光線槍把正確的成語補回句子裏，再看一條線索。
// 單元一至四是地圖（每單元十站，共四十個成語）；單元五是決戰空白魔王（四十個成語輪流出題，射中一個魔王少一格血），打贏後看結局。
const INK=new Set(['moying','momo'])   // 墨影／墨墨：用整團墨水圖，不用半身像
const BLANK='＿＿＿＿'
const KEY='life-adventure-v1'
// 圖片更新後改呢個數字，瀏覽器就會重新下載，唔會顯示舊圖
const ASSET_VERSION='20261023'
const IMG=n=>`/images/life-adventure/${n}.webp?v=${ASSET_VERSION}`
const LEFT=new Set(['xiaoyue','dingding'])
// 四個射擊角度：槍口（燈泡）在圖中的位置（比例）和圖的闊高比；按目標方向選最接近的角度
const AIM={ul:{m:[.355,.166],r:481/512},ur:{m:[.77,.158],r:481/512},l:{m:[.295,.277],r:531/512},r:{m:[.814,.264],r:531/512}}
const aimDir=deg=>deg<-150?'l':deg<-90?'ul':deg<-30?'ur':'r'
// 小越這幾個表情本身已望向右，站在左邊時不用左右反轉
const FACES_RIGHT=new Set(['puzzled','wonder','oops','determined'])
const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const meaning=idiom=>CATALOG.find(c=>c.idiom===idiom)?.meaning||''
const lifeOf=idiom=>LIFE.find(x=>x.idiom===idiom)
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}}
const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}}
const faceOf=(sp,mood,talking)=>sp==='dingding'?IMG(talking?'dingding-talk':'dingding-wave'):sp==='xiaoyue'?IMG(XIAOYUE[mood]||XIAOYUE.wave):sp==='moying'?IMG('moying-giggle'):IMG(CAST[sp].img)

function speak(text,on){
 if(!on||typeof window==='undefined'||!window.speechSynthesis)return
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/＿＿＿＿/g,'，墨跡，'));u.lang='zh-TW';u.rate=.9;speechSynthesis.speak(u)}catch{}
}

// 墨跡：被擦走的成語；射中後變回成語
function Gap({idiom,hit}){return hit?<b className="la-found">{idiom}</b>:<span className="la-ink" aria-label="被擦走的成語"><i/><i/><i/></span>}
function Said({text,idiom,hit}){const [a,b]=text.split(BLANK);return <>{a}<Gap idiom={idiom} hit={hit}/>{b}</>}
// 光束打中的位置：射中爆出星星，射錯冒出灰色墨點
function Burst({x,y,ok}){return <span className={`la-burst${ok?' ok':' no'}`} style={{left:x,top:y}} aria-hidden="true">{Array.from({length:8},(_,n)=><i key={n} style={{'--a':`${n*45}deg`}}/>)}</span>}
// 遊戲字：漸層填色＋粗描邊
function GameText({text,className=''}){return <span className={`la-gtext ${className}`} data-t={text}><span>{text}</span></span>}

export default function LifeAdventure(){
 const [ui,setUi]=useState(0),unit=UNITS[ui],chapters=unit.chapters
 const [phase,setPhase]=useState('cover'),[stop,setStop]=useState(0),[step,setStep]=useState(0)
 const prog=useRef({units:{}})
 const [done,setDone]=useState({}),[typed,setTyped]=useState(0),[voice,setVoice]=useState(true),[introSeen,setIntroSeen]=useState(false)
 const [targets,setTargets]=useState([]),[gone,setGone]=useState([]),[wrong,setWrong]=useState(0),[hint,setHint]=useState(''),[hit,setHit]=useState(false),[beam,setBeam]=useState(null)
 const [reward,setReward]=useState(null),[walkFrom,setWalkFrom]=useState(null),[walking,setWalking]=useState(false)
 const [pose,setPose]=useState('aim'),[dir,setDir]=useState('ur'),[gift,setGift]=useState(null)
 const [boss,setBoss]=useState(null),[bossNote,setBossNote]=useState(''),[bossAtk,setBossAtk]=useState(false)
 // 遊戲手感：音效開關、射中時的星星爆開、射錯時畫面震一震、魔王關連續第一次就射中的連擊數
 const [sound,setSound]=useState(true),[burst,setBurst]=useState(null),[shake,setShake]=useState(false),[combo,setCombo]=useState(0)
 const run=useRef(null),stageRef=useRef(null),gunRef=useRef(null)
 // 手機畫面矮：射錯／射中後的提示在射擊場下面，看不到時就把畫面輕輕捲下去
 useEffect(()=>{if(!hint&&!hit&&!bossNote)return
  const t=setTimeout(()=>{const els=document.querySelectorAll('.la-hint'),el=els[els.length-1]
   if(el&&el.getBoundingClientRect().bottom>innerHeight)el.scrollIntoView({block:'end',behavior:'smooth'})},60)
  return()=>clearTimeout(t)},[hint,hit,bossNote])
 const ch=chapters[stop],life=lifeOf(ch.idiom),sentence=life.sentences[0],sayer=ch.say||'xiaoyue'
 // 擦走成語的是誰（預設墨影）、射擊時旁邊有沒有墨墨幫忙：可按單元或按站設定
 const thief=ch.thief||unit.thief,partner=ch.partner||unit.partner
 const bq=boss&&LIFE[boss.order[boss.i]],bossSentence=bq?.sentences[1]||''   // 魔王關用另一句例句

 // 對白次序：intro＝開場；story＝穿越到回憶 → 手錶報告 → 生活對話 → 關鍵句（墨跡）→ 墨影；clue＝射中後的一條線索
 // bossIntro／bossMid／bossEnd＝魔王關的開場、墨墨歸隊、結局
 const at=l=>({bg:ch.bg,cast:ch.cast,line:l})
 const atBoss=l=>({bg:BOSS.bg,cast:[],line:l})
 const seq=phase==='intro'?[...(unit.prologue||[]).map(([bg,...l])=>({bg,cast:[],line:l,pro:true})),...unit.intro.map(l=>({bg:'bg-time-library',cast:[],line:l}))]
  :phase==='story'?[{portal:'穿越到回憶……'},at(['watch',ch.alert]),...ch.lines.map(at),
    {...at([sayer,sentence]),key:true},at(thief?[thief.who,thief.line]:['moying','嘻嘻！我把句子裏的成語吸走了，看你能不能把它補回去！'])]
  :phase==='clue'?ch.clue.map(l=>({...at(l),bg:ch.clueBg||ch.bg}))
  :phase==='bossIntro'?BOSS.intro.map(atBoss):phase==='bossMid'?BOSS.mid.map(atBoss):phase==='bossEnd'?BOSS.ending.map(atBoss):[]
 const VN=['intro','story','clue','bossIntro','bossMid','bossEnd']
 const cur=seq[step]

 // 進度按單元分開儲存：{units:{0:{done,run,introSeen},1:{…}},voice}；同一個學習檔案才接續
 const unitSave=i=>{const u=prog.current.units[i];return u&&u.run?.profileId===readPet().active?u:null}
 const allDone=i=>Object.keys(unitSave(i)?.done||{}).length===UNITS[i].chapters.length
 const unlocked=i=>i===0||allDone(i-1)
 function loadUnit(i){
  const u=unitSave(i)
  setUi(i);setDone(u?.done||{});setIntroSeen(!!u?.introSeen);setReward(null);setWalkFrom(null)
  run.current=u?.run||startRewardRun('adventure')
  return !!u?.introSeen
 }
 useEffect(()=>{
  let x=load()
  if(x&&!x.units&&x.done)x={units:{0:{done:x.done,run:x.run,introSeen:x.introSeen}},voice:x.voice}  // 舊格式（只有單元一）
  prog.current=x?.units?x:{units:{}}
  setVoice(prog.current.voice!==false);setSound(prog.current.sfx!==false);setBoss(prog.current.boss||null)
  // 以前完成的站也補開卷軸館藏
  unlockScrolls(UNITS.flatMap((u,k)=>Object.keys(unitSave(k)?.done||{}).map(n=>u.chapters[n]?.idiom).filter(Boolean)))
  // 由最後一個已開放、未完成的單元開始
  let i=0;while(i+1<UNITS.length&&allDone(i))i++
  loadUnit(i)
 },[])
 const persist=(d,extra={})=>{
  const {voice:v=voice,...rest}=extra
  prog.current={...prog.current,voice:v,units:{...prog.current.units,[ui]:{done:d,run:run.current,introSeen:true,...rest}}}
  save(prog.current)
 }
 function toggleVoice(){const v=!voice;setVoice(v);persist(done,{voice:v});try{speechSynthesis.cancel()}catch{}}
 function toggleSound(){const v=!sound;setSound(v);prog.current={...prog.current,sfx:v};save(prog.current)}
 // 遊戲作者提供的聲音：按鈕聲（按任何按鈕）＋四段背景音樂，按畫面切換、循環播放
 // 封面／地圖／完成＝cover；角色對話＝talk；射擊＝stage；決戰空白魔王＝boss
 // 背景音樂只用「一個」播放器換曲（手機上幾個播放器會互相干擾、亂串）；每首記住播到哪裏，換回來時接着播
 const BGM={cover:['cover-bgm',.2],talk:['dialogue-bgm',.22],stage:['stage-bgm',.18],boss:['boss-bgm',.2]}
 const btnSfx=useRef(null),bgm=useRef(null),bgmPos=useRef({})
 useEffect(()=>{
  btnSfx.current=new Audio('/audio/life-adventure/button.mp3');btnSfx.current.volume=.35
  bgm.current=new Audio();bgm.current.loop=true
  return()=>bgm.current?.pause()
 },[])
 useEffect(()=>{
  const onClick=e=>{const b=e.target.closest?.('button,a');if(!b||b.disabled||b.classList.contains('la-target'))return
   if(!sound||!btnSfx.current)return;try{btnSfx.current.currentTime=0;btnSfx.current.play().catch(()=>{})}catch{}}
  document.addEventListener('click',onClick,true);return()=>document.removeEventListener('click',onClick,true)
 },[sound])
 const bgmName=VN.includes(phase)?'talk':phase==='shoot'?'stage':phase==='boss'?'boss':'cover'
 const wantBgm=useRef(null);wantBgm.current=sound?bgmName:null
 useEffect(()=>{
  const a=bgm.current;if(!a)return
  if(!sound){a.pause();return}
  if(a.dataset.track!==bgmName){
   if(a.dataset.track)bgmPos.current[a.dataset.track]=a.currentTime
   const [file,vol]=BGM[bgmName];a.pause();a.src=`/audio/life-adventure/${file}.mp3`;a.dataset.track=bgmName;a.volume=vol
   const pos=bgmPos.current[bgmName]||0;if(pos)a.addEventListener('loadedmetadata',()=>{if(a.dataset.track===bgmName)a.currentTime=pos},{once:true})
  }
  if(!document.hidden)a.play().catch(()=>{})
 },[bgmName,sound])
 // 瀏覽器要等玩家按畫面才准播聲（iPhone 要「按下的一刻」播）：每次按畫面時，如果音樂應該在播但停了，就補播；
 // 第一次按時也喚醒音效引擎。切去其他分頁時暫停。
 useEffect(()=>{
  let primed=false
  const kick=()=>{
   if(!primed){primed=true;unlockSfx()}
   const a=bgm.current;if(a&&wantBgm.current&&a.dataset.track&&a.paused&&!document.hidden)a.play().catch(()=>{})
  }
  const vis=()=>{const a=bgm.current;if(!a||!wantBgm.current)return;if(document.hidden)a.pause();else a.play().catch(()=>{})}
  // iPhone 的手指點擊要用 touchend／click 才算「按下」，pointerdown 不算
  for(const ev of ['touchend','click','keydown'])document.addEventListener(ev,kick,true)
  document.addEventListener('visibilitychange',vis)
  return()=>{for(const ev of ['touchend','click','keydown'])document.removeEventListener(ev,kick,true);document.removeEventListener('visibilitychange',vis)}
 },[])
 function missFx(){sfx('miss',sound);setShake(true);setTimeout(()=>setShake(false),420)}
 function goUnit(i){if(!unlocked(i))return;try{speechSynthesis.cancel()}catch{};const seen=loadUnit(i);setStep(0);setPhase(seen?'map':'intro')}

 // 逐字出現 + 朗讀；對話框自動捲到最新一句
 useEffect(()=>{
  if(!cur)return
  if(cur.portal){const t=setTimeout(next,1600);return()=>clearTimeout(t)}
  setTyped(0);speak(cur.line[1],voice)
  const len=cur.line[1].length;let n=0
  const t=setInterval(()=>{n+=1;setTyped(n);if(n>=len)clearInterval(t)},45)
  return()=>clearInterval(t)
 },[phase,stop,step])

 // 回到地圖時，小越由剛完成的一站走到下一站
 useEffect(()=>{
  if(phase!=='map'||walkFrom===null)return
  const a=setTimeout(()=>setWalking(true),80),b=setTimeout(()=>{setWalkFrom(null);setWalking(false)},1700)
  return()=>{clearTimeout(a);clearTimeout(b)}
 },[phase,walkFrom])

 // 射中後先播「命中！」，再自動看線索
 useEffect(()=>{
  if(phase!=='shoot'||!hit)return
  const t=setTimeout(toClue,2300)
  return()=>clearTimeout(t)
 },[phase,hit])

 function next(){
  if(cur&&!cur.portal&&typed<cur.line[1].length){setTyped(cur.line[1].length);return}
  if(step+1<seq.length){setStep(step+1);return}
  if(phase==='intro'){setIntroSeen(true);persist(done);setPhase('map');return}
  if(phase==='story'){startShoot();return}
  if(phase==='clue')backToMap()
  if(phase==='bossIntro'||phase==='bossMid'){saveBoss({...boss,started:true});setPhase('boss');return}
  if(phase==='bossEnd')setPhase('cert')
 }
 function start(){if(introSeen)setPhase('map');else{setStep(0);setPhase('intro')}}
 function openStop(i){setStop(i);setStep(0);setHit(false);setHint('');setWrong(0);setGone([]);setGift(null);setPhase('story')}
 function startShoot(){
  const others=chapters.map(c=>c.idiom).filter(x=>![ch.idiom,life.near,life.far].includes(x))
  setTargets(shuffle([ch.idiom,life.near,life.far,shuffle(others)[0]]))
  setGone([]);setWrong(0);setHint('');setHit(false);setBeam(null);setBurst(null);setPose('aim');setDir('ur');setPhase('shoot')
  speak(sentence,voice)
 }
 // 小越先轉身面向目標（選最接近的射擊角度），光束由該角度的槍口直線射向目標，不會轉彎
 function aimAt(e,isHit){
  const st=stageRef.current?.getBoundingClientRect(),r=e.currentTarget.getBoundingClientRect(),g=gunRef.current?.getBoundingClientRect()
  if(st&&g){
   const gcx=g.left+g.width/2,tx=r.left+r.width/2,ty=r.top+r.height/2
   const d=aimDir(Math.atan2(ty-(g.top+g.height*.55),tx-gcx)*180/Math.PI),w=g.height*AIM[d].r
   const x1=gcx-w/2+w*AIM[d].m[0]-st.left,y1=g.top+g.height*AIM[d].m[1]-st.top,x2=tx-st.left,y2=ty-st.top
   setDir(d);setBeam({x:x1,y:y1,len:Math.hypot(x2-x1,y2-y1),deg:Math.atan2(y2-y1,x2-x1)*180/Math.PI,k:Date.now()})
   setBurst({x:x2,y:y2,ok:isHit,k:Date.now()})
  }
  sfx('zap',sound)
  setPose('fire');setTimeout(()=>setPose(isHit?'cheer':'aim'),isHit?520:300)
 }
 function shoot(idiom,e){
  if(hit||gone.includes(idiom))return
  const isHit=idiom===ch.idiom
  aimAt(e,isHit)
  const fresh=!(stop in done)
  if(isHit){
   setHit(true);setHint('')
   if(fresh){
    recordLearning({idiom:ch.idiom,kind:'answer',correct:wrong===0})
    if(unlockScrolls([ch.idiom]))setGift(ch.idiom)
    const d={...done,[stop]:wrong===0};setDone(d);persist(d)
   }
   speak(sentence.replace(BLANK,ch.idiom),voice);setTimeout(()=>sfx('hit',sound),120)
   return
  }
  if(wrong===0&&fresh)recordLearning({idiom:ch.idiom,kind:'answer',correct:false})
  missFx()
  const w=wrong+1;setWrong(w);setGone([...gone,idiom])
  const h=w===1?`「${idiom}」的意思是：${meaning(idiom)}和這句話說的事不一樣，再讀一次吧。`:`提示：要找的成語，意思是「${meaning(ch.idiom)}」`
  setHint(h);speak(h,voice)
 }
 function toClue(){recordLearning({idiom:ch.idiom,kind:'read'});setStep(0);setPhase('clue')}
 function backToMap(){
  try{speechSynthesis.cancel()}catch{}
  if(Object.keys(done).length===chapters.length&&!reward){
   const answers=chapters.map((_,i)=>({correct:done[i]===true}))
   setReward(completeRewardRun(run.current,answers)||{already:true});setPhase('done');return
  }
  setWalkFrom(stop);setWalking(false);setPhase('map')
 }
 function restart(){if(!window.confirm('重新開始會清除這張地圖的進度，確定嗎？'))return;run.current=startRewardRun('adventure');setDone({});setReward(null);setWalkFrom(null);persist({});setPhase('map')}

 // ── 單元五：決戰空白魔王 ──
 // 進度存在 prog.boss：{order,i,hp,hearts,first,joined,started,finished,run}；中途離開下次可接續
 const bossReady=()=>allDone(UNITS.length-1)
 function saveBoss(b){setBoss(b);prog.current={...prog.current,boss:b};save(prog.current)}
 function newBoss(){return {order:shuffle(LIFE.map((_,n)=>n)),i:0,hp:BOSS.hp,hearts:BOSS.hearts,first:{},joined:false,started:false,finished:false,run:startRewardRun('boss')}}
 function startBoss(fresh=false){
  if(!bossReady())return
  try{speechSynthesis.cancel()}catch{}
  const b=prog.current.boss,ok=!fresh&&b&&b.run?.profileId===readPet().active&&!b.finished
  const nb=ok?b:newBoss();saveBoss(nb);setReward(null);setBossNote('');setCombo(0);setStep(0)
  setPhase(nb.started?'boss':'bossIntro')
 }
 // 每題：正確成語＋相近＋無關＋另一個成語
 useEffect(()=>{
  if(phase!=='boss'||!bq)return
  const others=LIFE.map(x=>x.idiom).filter(x=>![bq.idiom,bq.near,bq.far].includes(x))
  setTargets(shuffle([bq.idiom,bq.near,bq.far,shuffle(others)[0]]))
  setGone([]);setWrong(0);setHint('');setHit(false);setBeam(null);setBurst(null);setPose('aim');setDir('ur')
  speak(bossSentence,voice)
 },[phase,boss?.i])
 function bossShoot(idiom,e){
  if(hit||gone.includes(idiom)||!bq)return
  const isHit=idiom===bq.idiom
  aimAt(e,isHit);setBossNote('')
  if(isHit){
   setHit(true);setHint('')
   const first={...boss.first};if(!(bq.idiom in first)){first[bq.idiom]=wrong===0;recordLearning({idiom:bq.idiom,kind:'answer',correct:wrong===0})}
   unlockScrolls([bq.idiom])
   const c=wrong===0?combo+1:0;setCombo(c)
   setTimeout(()=>sfx(c>=3?'combo':'bossHurt',sound),120)
   const hp=boss.hp-1,joinNow=!boss.joined&&hp<=BOSS.half
   speak(bossSentence.replace(BLANK,bq.idiom),voice)
   setTimeout(()=>{
    if(hp<=0){
     const answers=boss.order.map(n=>({correct:first[LIFE[n].idiom]===true}))
     setReward(completeRewardRun(boss.run,answers)||{already:true})
     saveBoss({...boss,hp:0,first,finished:true});setStep(0);setPhase('bossEnd');return
    }
    saveBoss({...boss,hp,first,i:boss.i+1,joined:boss.joined||joinNow})
    if(joinNow){setStep(0);setPhase('bossMid')}
   },1300)
   return
  }
  // 射錯：空白波打中小越，少一顆心；心用完時墨墨補滿
  missFx();setCombo(0)
  const w=wrong+1;setWrong(w);setGone([...gone,idiom])
  const first=bq.idiom in boss.first?boss.first:{...boss.first,[bq.idiom]:false}
  if(!(bq.idiom in boss.first))recordLearning({idiom:bq.idiom,kind:'answer',correct:false})
  setBossAtk(true);setTimeout(()=>setBossAtk(false),900)
  let hearts=boss.hearts-1
  if(hearts<=0){hearts=BOSS.hearts;setBossNote(`【${CAST.momo.name}】${BOSS.revive[1]}`)}
  saveBoss({...boss,hearts,first})
  const h=`空白波！「${idiom}」的意思是：${meaning(idiom)}和這句話說的事不一樣。`
  setHint(h);speak(h,voice)
 }
 const bossFirst=boss?Object.values(boss.first).filter(v=>v===true).length:0
 const no=i=>ui*10+i+1   // 全劇的站號（第 1–40 站）

 const nextStop=chapters.findIndex((_,i)=>!(i in done)),firstCount=Object.values(done).filter(v=>v===true).length
 const heroAt=walkFrom!==null&&!walking?walkFrom:nextStop>=0?nextStop:chapters.length-1
 const lastXy=[...seq.slice(0,step+1)].reverse().find(s=>s.line?.[0]==='xiaoyue'&&s.line[2])?.line[2]
 const costume=outfitAsset(ch.idiom,'celebrate','large')?.gif

 const worksheet=<aside className="la-sheet" aria-label="學習單">
  <h3>📜 學習單・{unit.title.split('・')[0]}</h3>
  <ol start={no(0)}>{chapters.map((c,i)=>{const ok=i in done
   return <li key={c.idiom} className={ok?(done[i]?'ok':'retry'):''}><Said text={lifeOf(c.idiom).sentences[0]} idiom={c.idiom} hit={ok}/></li>})}</ol>
 </aside>

 return <>
  <Head><title>成語穿越者・地圖冒險</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>

  {phase==='cover'&&<main className="la-cover" style={{backgroundImage:`url(${IMG('cover')})`}}>
   <div className="la-cover-in">
    <p className="la-kicker">✦ 生活成語冒險 ✦</p>
    <h1 className="la-title" aria-label="成語穿越者">{[...'成語穿越者'].map((c,i)=><span key={i} className="la-tch mint" data-t={c} style={{animationDelay:`${i*.15}s`}}><span>{c}</span></span>)}</h1>
    <p className="la-title2" aria-label="地圖冒險">{[...'地圖冒險'].map((c,i)=><span key={i} className="la-tch honey" data-t={c} style={{animationDelay:`${.4+i*.15}s`}}><span>{c}</span></span>)}</p>
    <div className="la-cover-btns">
     <button className="la-cbtn gold" onClick={start}>{Object.keys(done).length?'繼續冒險':'開始冒險'}</button>
     <div className="la-cbtn-row">
      <button className="la-cbtn" onClick={toggleVoice} aria-pressed={voice}>{voice?'🔊 朗讀：開':'🔇 朗讀：關'}</button>
      <a className="la-cbtn" href="/?view=challenge">← 回挑戰系統</a>
     </div>
    </div>
   </div>
  </main>}

  {phase!=='cover'&&<main className="la-wrap">
   <header className="la-top">
    <button className="la-back" onClick={()=>{try{speechSynthesis.cancel()}catch{};setPhase(phase==='map'||phase==='intro'||phase==='done'?'cover':'map')}}>{phase==='map'||phase==='intro'||phase==='done'?'← 封面':'← 地圖'}</button>
    <h1>{/^boss|cert/.test(phase)?`⚔️ ${BOSS.title}`:`🗺️ ${unit.title}`}</h1>
    <button className="la-back" onClick={toggleSound} aria-pressed={sound} aria-label={sound?'關閉音效':'開啟音效'}>{sound?'🎵':'🎵✕'}</button>
    <button className="la-back" onClick={toggleVoice} aria-pressed={voice} aria-label={voice?'關閉朗讀':'開啟朗讀'}>{voice?'🔊 開':'🔇 關'}</button>
   </header>

   {phase==='map'&&<div className="la-mapview">
    <div className="la-map">
     <img src={IMG(unit.map)} alt={`${unit.title}冒險地圖`} className="la-mapimg"/>
     <img src={IMG(unit.hideoutImg||'moying-float')} alt={unit.hideoutImg?'空白魔王躲在這裏':'墨影躲在這裏'} className="la-hideout" style={{left:unit.hideout[0]+'%',top:unit.hideout[1]+'%'}}/>
     {unit.stops.map(([x,y],i)=>{const st=i in done?'done':i===nextStop?'now':'lock'
      return <button key={i} className={`la-stop ${st}`} style={{left:x+'%',top:y+'%'}} onClick={()=>st!=='lock'&&openStop(i)} disabled={st==='lock'} aria-label={`第 ${no(i)} 站${st==='done'?`：${chapters[i].idiom}（已完成，可重玩）`:st==='now'?'：按一下出發':'：未開放'}`}>{st==='done'?'✓':no(i)}</button>})}
     <div className="la-party" style={{left:unit.stops[heroAt][0]+'%',top:unit.stops[heroAt][1]+'%'}}>
      <img src={IMG(walkFrom!==null?'xiaoyue-walk':'xiaoyue-bounce')} alt="小越" className="la-hero"/>
      {unit.partner&&<img src={IMG(unit.partner)} alt="墨墨和小越一起出發" className="la-partner"/>}
     </div>
    </div>
    <div className="la-side">
     <div className="la-units" role="tablist" aria-label="選擇單元">{UNITS.map((u,i)=><button key={u.title} role="tab" aria-selected={ui===i} disabled={!unlocked(i)} className={ui===i?'on':''} onClick={()=>goUnit(i)}>{unlocked(i)?'':'🔒 '}{u.title.split('・')[0]}<small>{u.title.split('・')[1]}</small></button>)}
      <button role="tab" aria-selected={false} disabled={!bossReady()} className="boss" onClick={()=>startBoss()}>{bossReady()?'⚔️ ':'🔒 '}{BOSS.title.split('・')[0]}<small>{BOSS.title.split('・')[1]}</small></button></div>
     <p className="la-tip">{nextStop>=0?<>★ 按地圖上發光的第 <b>{no(nextStop)}</b> 站出發。先讀大家的對話，想想哪個成語適合，再用成語光線槍把它補回句子裏。</>:'★ 十站都完成了！'}</p>
     {gift&&<p className="la-tip gift" role="status">📜 成語送回圖書館了！<a href="/pet">寵物的家</a>的成語卷軸館藏打開了「{gift}」卷軸。</p>}
     {worksheet}
     {Object.keys(done).length>0&&<button className="la-link" onClick={restart}>重新開始這張地圖</button>}
    </div>
   </div>}

   {VN.includes(phase)&&cur&&<div className="la-play">
    <div className={`la-stage scene${cur.portal?' portal':''}`} style={cur.portal?{backgroundImage:`url(${IMG('bg-time-portal')})`}:undefined} onClick={next}>
     {cur.portal?<p className="la-portal-text"><GameText text={cur.portal}/></p>:<>
      <div className="la-bg" style={{backgroundImage:`url(${IMG(cur.bg)})`}}/>
      {/* RPG 式：只顯示說話的人的半身立繪，小越在左下角、其他角色在右下角，站在對話框前面（busts.mjs 統一頭部大小） */}
      {!CAST[cur.line[0]].sys&&<img key={step} src={cur.line[0]==='moying'?IMG('moying-float'):cur.line[0]==='momo'?IMG('moying-happy'):cur.line[0]==='boss'?IMG('bust-boss-'+(cur.line[2]||'laugh')):IMG('bust-'+(cur.line[0]==='xiaoyue'?XIAOYUE[cur.line[2]]||XIAOYUE.wave:cur.line[0]==='dingding'?'dingding-talk':CAST[cur.line[0]].talk||CAST[cur.line[0]].img))} alt={CAST[cur.line[0]].name} className={`la-actor ${cur.line[0]==='xiaoyue'?'left':'right'}${INK.has(cur.line[0])?' moying':''}${CAST[cur.line[0]].holo?' holo':''}${CAST[cur.line[0]].boss?' bossy':''}${FACES_RIGHT.has(cur.line[2])?' noflip':''}`}/>}
      {cur.key&&<img src={IMG(thief?.img||'moying-suck-float')} alt={`${thief?.name||'墨影'}正在擦走成語`} className={`la-moying${thief?' glowthief':''}`}/>}
      {/* 情境對話（RPG 式）：小越在左、其他角色在右，說話的人亮起；底部一個大對話框 */}
      <div className={`la-vn ${CAST[cur.line[0]].sys?'sys':CAST[cur.line[0]].holo?'sys pr':cur.line[0]==='xiaoyue'?'pl':'pr'}${cur.key?' key':''}${INK.has(cur.line[0])?' ink':''}${CAST[cur.line[0]].boss?' bossbox':''}${CAST[cur.line[0]].narr?' narr':''}`} aria-live="polite">
       <b>【{CAST[cur.line[0]].name}】</b>
       <p>{cur.key?(typed<cur.line[1].length?cur.line[1].slice(0,typed).replace(BLANK,'⋯⋯'):<Said text={cur.line[1]} idiom={ch.idiom} hit={false}/>):cur.line[1].slice(0,typed)}</p>
       {typed>=cur.line[1].length&&<span className="la-vn-more" aria-hidden="true">▼</span>}
      </div>
     </>}
    </div>
    {!cur.portal&&<div className="la-chat-btns">
     {/* 已完成的站重玩時，可以跳過對白直接射擊 */}
     {cur.pro&&<button onClick={()=>{try{speechSynthesis.cancel()}catch{};setStep(seq.findIndex(s=>!s.pro))}}>⏩ 跳過前情提要</button>}
     {phase==='story'&&stop in done&&!cur.key&&<button onClick={()=>{try{speechSynthesis.cancel()}catch{};setStep(seq.findIndex(s=>s.key))}}>⏩ 跳到關鍵句</button>}
     <button onClick={()=>speak(cur.line[1],true)} aria-label="再聽一次">🔊 再聽</button>
     <button className="la-next" onClick={next}>{step+1<seq.length?'下一句 ▶':phase==='intro'?'出發 ▶':phase==='story'?'補回成語 ▶':'回到地圖 ▶'}</button>
    </div>}
   </div>}

   {phase==='shoot'&&<div className="la-play">
    <div className={`la-msg big ${LEFT.has(sayer)?'left':'right'} key`}>
     <img src={faceOf(sayer,'think',false)} alt="" className="la-face"/>
     <div className="la-bub"><b>{CAST[sayer].name}</b><p><Said text={sentence} idiom={ch.idiom} hit={hit}/></p></div>
     <button className="la-say" onClick={()=>speak(hit?sentence.replace(BLANK,ch.idiom):sentence,true)} aria-label="朗讀句子">🔊</button>
    </div>
    <div ref={stageRef} className={`la-stage shoot${shake?' shake':''}`} style={{backgroundImage:`url(${IMG(ch.bg)})`}}>
     <img src={IMG(hit?(thief?.hurt||'moying-sad-float'):(thief?.fly||'moying-float'))} alt={thief?.name||'墨影'} className={`la-moying fly${thief?' glowthief':''}`}/>
     {partner&&<img src={IMG(partner)} alt="墨墨在旁邊幫忙" className="la-momo-help"/>}
     {targets.map((t,n)=><button key={t} className={`la-target t${n}${gone.includes(t)?' gone':''}${hit&&t===ch.idiom?' win':''}${hit&&t!==ch.idiom?' fade':''}`} onClick={e=>shoot(t,e)} disabled={hit||gone.includes(t)} aria-label={`射向「${t}」`}><GameText text={t}/></button>)}
     {beam&&<span key={beam.k} className="la-beam" style={{left:beam.x,top:beam.y,width:beam.len,transform:`rotate(${beam.deg}deg)`}}/>}
     {/* 小越拿着成語光線槍：瞄準 → 開槍 → 後座力；射中後歡呼 */}
     <img ref={gunRef} src={IMG(pose==='cheer'?'shooter-cheer':`shoot-${dir}-${pose}`)} alt="小越拿着成語光線槍" className={`la-shooter ${pose}`}/>
     {burst&&<Burst key={'burst'+burst.k} {...burst}/>}
     {hit&&<p className="la-hitfx" role="status"><GameText text="命中！"/><small>句子修好了！</small></p>}
    </div>
    <p className={`la-hint${hint?' on':''}${hit?' ok':''}`}>{hit?`「${ch.idiom}」：${meaning(ch.idiom)}`:hint||'★ 讀一讀上面那句話，想想墨跡那裏應該是哪個四字成語，再按它，用成語光線槍把成語補回句子裏。'}</p>
   </div>}

   {phase==='boss'&&boss&&bq&&<div className="la-play boss-play">
    {/* 魔王血量和小越的心 */}
    <div className="la-bossbar" aria-live="polite">
     <span className="la-bossname">空白魔王</span>
     <span className="la-hp" role="progressbar" aria-valuemin={0} aria-valuemax={BOSS.hp} aria-valuenow={boss.hp} aria-label="空白魔王血量"><i style={{width:`${boss.hp/BOSS.hp*100}%`}}/></span>
     <span className="la-hpnum">{boss.hp} / {BOSS.hp}</span>
     {combo>=2&&<span className="la-combo" key={combo}>🔥 {combo} 連擊</span>}
     <span className="la-hearts" aria-label={`小越還有 ${boss.hearts} 顆心`}>{Array.from({length:BOSS.hearts},(_,n)=><b key={n} className={n<boss.hearts?'on':''}>♥</b>)}</span>
    </div>
    <div className="la-msg big right key">
     <img src={IMG('bust-boss-laugh')} alt="" className="la-face bossface"/>
     <div className="la-bub"><b>第 {boss.i+1} / 40 題・空白魔王把成語擦成墨跡</b><p><Said text={bossSentence} idiom={bq.idiom} hit={hit}/></p></div>
     <button className="la-say" onClick={()=>speak(hit?bossSentence.replace(BLANK,bq.idiom):bossSentence,true)} aria-label="朗讀句子">🔊</button>
    </div>
    <div ref={stageRef} className={`la-stage shoot bossfield${shake?' shake':''}`} style={{backgroundImage:`url(${IMG(BOSS.bg)})`}}>
     <img src={IMG(hit?'boss-hurt':bossAtk?'boss-attack':'boss-laugh')} alt="空白魔王" className={`la-bossimg${hit?' hurt':''}`}/>
     <span className="la-pages" aria-hidden="true"><i/><i/><i/><i/><i/></span>
     {boss.joined&&<img src={IMG('moying-happy')} alt="墨墨在旁邊幫忙" className="la-momo-help"/>}
     {targets.map((t,n)=><button key={t} className={`la-target t${n}${gone.includes(t)?' gone':''}${hit&&t===bq.idiom?' win':''}${hit&&t!==bq.idiom?' fade':''}${boss.joined&&!hit&&t===bq.idiom?' glowhint':''}`} onClick={e=>bossShoot(t,e)} disabled={hit||gone.includes(t)} aria-label={`射向「${t}」`}><GameText text={t}/></button>)}
     {beam&&<span key={beam.k} className="la-beam" style={{left:beam.x,top:beam.y,width:beam.len,transform:`rotate(${beam.deg}deg)`}}/>}
     <img ref={gunRef} src={IMG(pose==='cheer'?'shooter-cheer':`shoot-${dir}-${pose}`)} alt="小越拿着成語光線槍" className={`la-shooter ${pose}`}/>
     {burst&&<Burst key={'burst'+burst.k} {...burst}/>}
     {hit&&<p className="la-hitfx" role="status"><GameText text={combo>=2?`${combo} 連擊！`:'命中！'}/><small>空白魔王 −1</small></p>}
    </div>
    {bossNote&&<p className="la-hint ok">{bossNote}</p>}
    <p className={`la-hint${hint?' on':''}${hit?' ok':''}`}>{hit?`「${bq.idiom}」：${meaning(bq.idiom)}`:hint||(boss.joined?'★ 墨墨歸隊了！發光的卷軸就是正確答案的提示。':'★ 讀一讀上面那句話，想想墨跡那裏應該是哪個成語，再用成語光線槍把成語補回句子裏。')}</p>
   </div>}

   {phase==='cert'&&boss&&<div className="la-done la-cert">
    <h2><GameText text="結局證書"/></h2>
    <p className="la-cert-name">成語穿越者・小越 任務完成！</p>
    <ul className="la-cert-list">
     <li>打敗空白魔王，四十卷卷軸全部亮起</li>
     <li>決戰中第一次就射中：<b>{bossFirst}</b> / 40 個成語</li>
     <li>成語卷軸館藏：<b>{(readPet().profiles[readPet().active]?.scrolls||[]).length}</b> / 40 卷</li>
    </ul>
    {reward&&!reward.already&&<CompletionReward reward={reward}/>}
    <p className="la-cert-credit">故事構思：遊戲作者</p>
    <div className="la-actions">
     <a className="btn btn-go" href="/pet">去卷軸館藏看明信片 →</a>
     <button className="btn btn-ghost" onClick={()=>{if(window.confirm('再挑戰一次空白魔王？'))startBoss(true)}}>再挑戰魔王</button>
     <button className="btn btn-ghost" onClick={()=>setPhase('cover')}>回到封面</button>
    </div>
   </div>}

   {phase==='done'&&<div className="la-done">
    <h2><GameText text="十卷卷軸全部亮起了！"/></h2>
    <p>{unit.ending}</p>
    {reward&&!reward.already&&<CompletionReward reward={reward}/>}
    {worksheet}
    <div className="la-actions">
     {UNITS[ui+1]&&<button className="btn btn-go" onClick={()=>goUnit(ui+1)}>前往{UNITS[ui+1].title.split('・')[0]} →</button>}
     {!UNITS[ui+1]&&<button className="btn btn-go" onClick={()=>startBoss()}>⚔️ 前往決戰空白魔王 →</button>}
     <button className="btn btn-ghost" onClick={()=>setPhase('map')}>看地圖</button>
     <button className="btn btn-ghost" onClick={restart}>重新開始</button>
    </div>
    {/* 總報告：完成單元後才顯示成績，地圖上的學習單不顯示分數 */}
    <section className="la-report" aria-label="總報告">
     <h3>📊 總報告</h3>
     <p className="la-report-score">第一次就射中：<b>{firstCount}</b> / {chapters.length}</p>
     <p><b>✅ 已掌握：</b>{chapters.filter((_,i)=>done[i]===true).map(c=>c.idiom).join('、')||'（下次加油！）'}</p>
     {chapters.some((_,i)=>done[i]===false)&&<><p><b>📝 再溫習：</b></p><ul>{chapters.map((c,i)=>done[i]===false&&<li key={c.idiom}><b>{c.idiom}</b>：{meaning(c.idiom)}</li>)}</ul></>}
    </section>
   </div>}
  </main>}

  <style jsx global>{`
   .la-cover{min-height:100vh;min-height:100dvh;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:24px 16px}
   .la-cover::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(255,248,230,.55),rgba(255,240,220,.15) 60%,rgba(80,40,90,.25))}
   .la-cover-in{position:relative;z-index:2;text-align:center;max-width:640px;width:100%}
   .la-kicker{margin:0 0 4px;font-weight:900;letter-spacing:.3em;color:#7a4a1c;text-shadow:0 2px 0 #fff6d8}
   .la-title,.la-title2{margin:0;line-height:1.08;font-family:'Noto Sans TC',sans-serif;font-weight:900}
   .la-title{font-size:clamp(3rem,11vw,6.2rem)}
   .la-title2{font-size:clamp(2.2rem,8vw,4.4rem);margin-top:-.05em}
   /* 封面字：上光下深的糖果漸層＋奶油色內框＋紫色外框，每個字輕輕搖擺 */
   .la-tch{position:relative;display:inline-block;margin:0 .03em;animation:la-letter 2.6s ease-in-out infinite}
   .la-tch::before,.la-tch::after{content:attr(data-t);position:absolute;left:0;top:0}
   .la-tch::before{z-index:0;color:#5b2a5e;-webkit-text-stroke:.17em #5b2a5e;text-shadow:0 .09em 0 #5b2a5e,0 .14em .2em rgba(91,42,94,.45)}
   .la-tch::after{z-index:1;color:#fff8e8;-webkit-text-stroke:.08em #fff8e8}
   .la-tch>span{position:relative;z-index:2;color:transparent;-webkit-text-fill-color:transparent;-webkit-background-clip:text;background-clip:text}
   .la-tch.mint>span{background-image:linear-gradient(180deg,#f0fff2 0%,#a6f3bd 42%,#3fbf80 56%,#1f7f5a 100%)}
   .la-tch.honey>span{background-image:linear-gradient(180deg,#fffbe0 0%,#ffdd73 42%,#f0991c 57%,#b05f0e 100%)}
   .la-cover-btns{margin-top:22px;display:flex;flex-direction:column;gap:10px;align-items:center}
   .la-cbtn-row{display:flex;gap:10px}
   .la-cbtn{min-width:150px;border:2px solid rgba(255,255,255,.8);background:rgba(255,250,240,.88);color:#5b2a5e;font-weight:800;font-size:1.05rem;border-radius:16px;padding:12px 18px;cursor:pointer;text-decoration:none;box-shadow:0 4px 0 rgba(91,42,94,.25)}
   .la-cbtn.gold{min-width:320px;background:linear-gradient(180deg,#ffe58a,#ffc94d);border-color:#fff3c4;font-size:1.25rem;padding:14px 20px;box-shadow:0 5px 0 #d39a22}
   .la-gtext{position:relative;display:inline-block;font-weight:900;font-family:'Noto Sans TC',sans-serif;letter-spacing:.03em}
   .la-gtext::before{content:attr(data-t);position:absolute;left:0;top:0;z-index:0;-webkit-text-stroke:.28em #3b0f45;color:#3b0f45;text-shadow:0 .12em 0 #ff4f9a,0 0 .4em rgba(255,79,154,.6)}
   .la-gtext>span{position:relative;z-index:1;background:linear-gradient(180deg,#fff68a 0%,#ffd23f 45%,#ff8db0 72%,#ff3d8b 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
   .la-wrap{max-width:1180px;margin:0 auto;padding:14px 16px 60px}
   .la-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
   .la-top h1{flex:1;margin:0;font-size:1.5rem;font-weight:800;color:var(--choc);text-shadow:2px 2px 0 #ffd98a}
   .la-back{background:#fff;border:2px solid #e8d8bd;border-radius:999px;padding:8px 14px;font-weight:700;color:var(--choc);cursor:pointer;font-size:.95rem;white-space:nowrap}
   /* 地圖頁上下排：地圖在上，單元分頁、提示、學習單在下 */
   .la-mapview{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;max-width:1000px;margin:0 auto}
   @media(min-width:900px){.la-sheet ol{columns:2;column-gap:28px}.la-sheet li{break-inside:avoid}}
   .la-map{position:relative;border-radius:18px;overflow:hidden;box-shadow:0 10px 26px rgba(90,61,43,.25)}
   .la-mapimg{display:block;width:100%;height:auto}
   .la-stop{position:absolute;transform:translate(-50%,-50%);width:6.4%;aspect-ratio:1;min-width:34px;border-radius:50%;border:3px solid #fff;font-weight:800;font-size:clamp(.8rem,1.6vw,1.15rem);display:flex;align-items:center;justify-content:center;padding:0}
   .la-stop.lock{background:radial-gradient(circle,#3b3561 55%,#25213f);color:#9c95c9;cursor:not-allowed;opacity:.92}
   .la-stop.now{background:var(--sun);color:var(--choc);cursor:pointer;animation:la-pulse 1.2s infinite;box-shadow:0 0 0 6px rgba(255,201,77,.45)}
   .la-stop.done{background:var(--gold);color:#fff;cursor:pointer}
   .la-hideout{position:absolute;width:11%;transform:translate(-50%,-55%);pointer-events:none}
   .la-party{position:absolute;width:8%;transform:translate(-50%,-96%);transition:left 1.5s ease-in-out,top 1.5s ease-in-out;pointer-events:none}
   .la-hero{width:100%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}
   .la-partner{position:absolute;width:95%;left:62%;bottom:18%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3));animation:la-float 2s ease-in-out infinite}
   .la-moying.glowthief{filter:drop-shadow(0 0 14px rgba(255,255,255,.9)) drop-shadow(0 0 6px rgba(150,110,220,.7))}
   .la-side{display:flex;flex-direction:column;gap:12px}
   .la-units{display:flex;gap:8px;flex-wrap:wrap}
   .la-units button{flex:1;min-width:96px;border:3px solid #e8d8bd;background:#fff;border-radius:14px;padding:6px 10px;font-weight:800;color:var(--choc);cursor:pointer;display:flex;flex-direction:column;line-height:1.3}
   .la-units button small{font-weight:600;font-size:.78rem;color:var(--choc-soft)}
   .la-units button.on{border-color:var(--sun);background:#fff7dc}
   .la-units button:disabled{opacity:.55;cursor:not-allowed}
   .la-tip{margin:0;background:#fffaf0;border:3px dashed var(--sun);border-radius:16px;padding:10px 14px;line-height:1.7;font-weight:500}
   .la-sheet{background:#fff;border:3px solid #e8d8bd;border-radius:18px;padding:12px 16px 12px 12px}
   .la-sheet h3{margin:0 0 6px;font-size:1.1rem}
   .la-sheet ol{margin:0;padding-left:1.8em;line-height:1.9;font-size:.95rem}
   .la-sheet li{padding:2px 0;border-bottom:1px dashed #efe3cf;color:#8b7461}
   .la-sheet li.ok,.la-sheet li.retry{color:var(--choc)}
   .la-sheet li.retry .la-found{color:var(--sun-dark)}
   .la-link{background:none;border:none;color:var(--choc-soft);text-decoration:underline;cursor:pointer;align-self:flex-start}
   .la-ink{display:inline-block;position:relative;width:4.4em;height:1.05em;vertical-align:-.15em;margin:0 .15em;background:#2e2852;border-radius:48% 52% 44% 56%/60% 42% 58% 40%;box-shadow:inset 0 -.12em .2em rgba(0,0,0,.35)}
   .la-ink i{position:absolute;background:#2e2852;border-radius:50%}
   .la-ink i:nth-child(1){width:.38em;height:.38em;left:-.22em;top:.1em}
   .la-ink i:nth-child(2){width:.26em;height:.42em;left:40%;bottom:-.3em;border-radius:40% 40% 50% 50%}
   .la-ink i:nth-child(3){width:.3em;height:.3em;right:-.25em;top:-.12em}
   .la-found{white-space:nowrap;color:var(--grass-dark);background:#eafbe9;border-radius:6px;padding:0 .2em;margin:0 .1em;animation:la-pop .5s}
   .la-play{max-width:1000px;margin:0 auto}
   .la-stage{position:relative;aspect-ratio:16/9;max-height:60vh;width:100%;background-size:cover;background-position:center;border-radius:18px;overflow:hidden;box-shadow:0 10px 26px rgba(90,61,43,.25);cursor:pointer;user-select:none}
   .la-stage.portal{animation:la-zoom 1.6s ease-in}
   .la-portal-text{position:absolute;inset:auto 0 12%;text-align:center;font-size:clamp(1.6rem,4vw,2.6rem);margin:0}
   .la-bg{position:absolute;inset:-12px;background-size:cover;background-position:center;filter:blur(1.5px) brightness(.95)}
   .la-actor{position:absolute;bottom:0;height:56%;width:auto;max-width:30%;object-fit:cover;object-position:top center;z-index:4;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));animation:la-in .3s ease-out}
   .la-actor.left{left:1%;scale:-1 1}
   .la-actor.left.noflip{scale:1 1}
   .la-actor.right{right:1%}
   .la-actor.moying{height:44%;bottom:6%;object-fit:contain}
   @keyframes la-in{from{opacity:0;transform:translateY(6%)}}
   .la-vn{position:absolute;left:2%;right:2%;bottom:3%;z-index:3;min-height:27%;background:rgba(24,22,58,.86);border:3px solid #e8c873;border-radius:14px;padding:10px 18px 14px;color:#fff;box-shadow:0 0 0 3px rgba(24,22,58,.5),0 8px 20px rgba(0,0,0,.35);cursor:pointer}
   .la-vn.pl{padding-left:29%}.la-vn.pr{padding-right:29%}
   /* 回溯手錶、簡簡：科技聲音，用青藍色全息對話框 */
   .la-vn.sys{background:rgba(8,48,70,.86);border-color:#6fe7ff;box-shadow:0 0 0 3px rgba(8,48,70,.45),0 0 18px rgba(111,231,255,.45);padding-left:5%;padding-right:5%}
   .la-vn.sys b{color:#8ff1ff}
   .la-vn.sys p{font-family:'Noto Sans TC',monospace;letter-spacing:.03em}
   .la-vn.sys.pr{padding-left:5%;padding-right:29%}
   /* 前情提要的旁白：暖色羊皮紙對話框 */
   .la-vn.sys.narr{background:rgba(66,42,24,.86);border-color:#e8c873;box-shadow:0 0 0 3px rgba(66,42,24,.45),0 8px 20px rgba(0,0,0,.35)}
   .la-vn.sys.narr b{color:#ffd98a}
   .la-vn.sys.narr p{font-family:inherit;letter-spacing:normal}
   .la-actor.holo{filter:drop-shadow(0 0 14px rgba(111,231,255,.8)) drop-shadow(0 0 4px #bff6ff);opacity:.95}
   .la-vn b{color:#ffb35c;font-size:1.05rem;letter-spacing:.05em}
   .la-vn p{margin:4px 0 0;font-size:clamp(1.05rem,2.2vw,1.35rem);line-height:1.75;color:#fff}
   .la-vn.key{border-color:#ffd84d;box-shadow:0 0 0 3px rgba(24,22,58,.5),0 0 18px rgba(255,216,77,.55)}
   .la-vn.ink{background:rgba(46,40,82,.9);border-color:#b9b0e6}
   .la-vn .la-ink{background:#9b8cf0}.la-vn .la-ink i{background:#9b8cf0}
   .la-vn-more{position:absolute;right:16px;bottom:8px;color:#e8c873;animation:la-blink 1s infinite}
   @keyframes la-blink{50%{opacity:.2}}
   .la-dd{position:absolute;bottom:2%;left:22%;height:36%;filter:brightness(.92);transition:transform .2s}
   .la-dd.talk{filter:none;transform:translateY(-5%)}
   .la-moying{position:absolute;top:2%;left:50%;transform:translateX(-50%);width:17%;z-index:3;pointer-events:none}
   .la-moying.fly{width:14%;top:2%;left:auto;right:3%;transform:none}
   .la-chat{margin-top:12px;max-height:34vh;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:4px 2px;scroll-behavior:smooth}
   .la-msg{display:flex;align-items:flex-end;gap:10px;max-width:86%}
   .la-msg.left{align-self:flex-start}
   .la-msg.right{align-self:flex-end;flex-direction:row-reverse}
   .la-face{width:58px;height:58px;object-fit:contain;background:#fff;border-radius:50%;border:3px solid var(--sun);flex:0 0 auto}
   .la-msg.right .la-face{border-color:var(--berry)}
   .la-bub{position:relative;background:#fffaf0;border:3px solid #e8d8bd;border-radius:18px;padding:8px 14px}
   .la-msg.left .la-bub{border-bottom-left-radius:4px}
   .la-msg.right .la-bub{border-bottom-right-radius:4px;background:#fff;border-color:#f5c6d3}
   .la-msg.ink .la-bub{background:#f1eefc;border-color:#b9b0e6}
   .la-msg.key .la-bub{border-color:var(--sun);box-shadow:0 0 0 4px rgba(255,201,77,.25)}
   .la-bub b{font-size:.9rem;color:var(--berry-dark)}
   .la-msg.left .la-bub b{color:#2a8a6a}
   .la-bub p{margin:2px 0 0;font-size:1.15rem;line-height:1.75}
   .la-chat-btns{display:flex;justify-content:flex-end;gap:10px;margin-top:10px}
   .la-chat-btns button{border:none;border-radius:999px;padding:10px 18px;font-weight:800;cursor:pointer;background:#fff;box-shadow:0 3px 0 #e0d2bc;font-size:1rem}
   .la-chat-btns .la-next{background:var(--berry);color:#fff;box-shadow:0 3px 0 var(--berry-dark)}
   .la-msg.big{max-width:100%;width:100%;margin-bottom:12px;align-items:center}
   .la-msg.big .la-bub{flex:1}
   .la-msg.big .la-bub p{font-size:1.4rem;font-weight:600}
   .la-msg.big .la-face{width:70px;height:70px}
   .la-say{border:none;background:#fff;border-radius:50%;width:46px;height:46px;font-size:1.2rem;cursor:pointer;flex:0 0 auto;box-shadow:0 3px 0 #e0d2bc}
   .la-stage.shoot{cursor:crosshair;max-height:64vh}
   .la-target{position:absolute;padding:6px 12px;border-radius:16px;border:2px solid rgba(255,214,240,.85);background:rgba(43,18,66,.42);font-size:clamp(1.5rem,3.6vw,2.3rem);cursor:crosshair;transition:opacity .4s,transform .4s;backdrop-filter:blur(1px)}
   .la-target.t0{left:7%;top:20%;animation:la-drift0 6s ease-in-out infinite}
   .la-target.t1{left:57%;top:28%;animation:la-drift1 7s ease-in-out infinite}
   .la-target.t2{left:16%;top:54%;animation:la-drift2 6.5s ease-in-out infinite}
   .la-target.t3{left:58%;top:60%;animation:la-drift0 7.5s ease-in-out infinite reverse}
   .la-target:hover:not(:disabled){background:rgba(43,18,66,.62);border-color:#fff}
   .la-target.gone{opacity:0;animation:none;transform:scale(.3) rotate(-20deg);pointer-events:none}
   .la-target.fade{opacity:.2}
   .la-target.win{border-color:#b6f5b6;background:rgba(30,110,60,.55);animation:la-glow 1s infinite;opacity:1}
   .la-beam{position:absolute;height:7px;transform-origin:0 50%;background:linear-gradient(90deg,#fff6a8,#ffd84d);border-radius:6px;box-shadow:0 0 16px #ffe27a;animation:la-beam .45s ease-out forwards;pointer-events:none}
   .la-shooter{position:absolute;bottom:-2%;left:50%;height:40%;transform:translateX(-50%);pointer-events:none;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));transition:transform .08s}
   .la-shooter.aim{animation:la-sway 2.4s ease-in-out infinite}
   .la-shooter.recoil{transform:translateX(-50%) translateY(4%)}
   .la-shooter.cheer{height:44%}
   @keyframes la-sway{50%{transform:translateX(-50%) translateY(-2%) rotate(-1deg)}}
   .la-hitfx{position:absolute;left:0;right:0;top:34%;text-align:center;margin:0;font-size:clamp(2.6rem,7vw,4.6rem);z-index:5;animation:la-pop .5s;pointer-events:none}
   .la-hitfx small{display:block;font-size:1rem;font-weight:800;color:#fff;text-shadow:0 2px 6px rgba(60,20,80,.8);margin-top:6px}
   .la-hint.ok{border-color:var(--grass);background:#eefbea}
   /* 手感：射錯震一震、打中位置爆開 */
   .la-stage.shake{animation:la-shake .4s}
   @keyframes la-shake{20%{transform:translateX(-8px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(3px)}}
   .la-burst{position:absolute;width:0;height:0;z-index:6;pointer-events:none}
   .la-burst i{position:absolute;left:-7px;top:-7px;width:14px;height:14px;border-radius:50%;animation:la-burst .6s ease-out forwards}
   .la-burst.ok i{background:radial-gradient(circle,#fffbe0,#ffd84d 60%,#ff8db0);box-shadow:0 0 10px #ffe27a}
   .la-burst.no i{background:#4a4370;width:11px;height:11px}
   @keyframes la-burst{from{transform:rotate(var(--a)) translateX(0) scale(1.2);opacity:1}to{transform:rotate(var(--a)) translateX(64px) scale(.2);opacity:0}}
   .la-report{text-align:left;background:#fff;border:3px solid #e8d8bd;border-radius:18px;padding:12px 18px;margin:20px 0 0;line-height:1.8}
   .la-report h3{margin:0 0 6px;font-size:1.2rem}
   .la-report p{margin:4px 0}
   .la-report-score{font-size:1.15rem;font-weight:700}
   .la-report ul{margin:0;padding-left:1.2em}
   .la-report li b{color:var(--berry-dark)}
   .la-combo{font-weight:900;color:#ffd84d;animation:la-pop .5s}
   @media(prefers-reduced-motion:reduce){.la-stage.shake,.la-burst i{animation:none}.la-burst{display:none}}
   /* 魔王關 */
   .la-units button.boss:not(:disabled){border-color:#b9b0e6;background:#f3f0ff;color:#3b2a6b}
   .la-bossbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#241f4a;color:#fff;border-radius:16px;padding:10px 14px;margin-bottom:10px;border:3px solid #e8c873}
   .la-bossname{font-weight:900;letter-spacing:.08em;color:#ffd6f0}
   .la-hp{flex:1;min-width:140px;height:16px;background:#4a4380;border-radius:999px;overflow:hidden;border:2px solid #fff3}
   .la-hp i{display:block;height:100%;background:linear-gradient(90deg,#fff,#d9e8ff);transition:width .5s}
   .la-hpnum{font-weight:800;font-size:.9rem;min-width:56px}
   .la-hearts b{color:#6b6390;font-size:1.25rem;margin-left:2px}.la-hearts b.on{color:#ff6b9a}
   .la-stage.bossfield{filter:none}
   .la-stage.bossfield::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.35),rgba(40,30,80,.45) 70%);pointer-events:none}
   .la-bossimg{position:absolute;top:0;left:50%;width:34%;transform:translateX(-50%);filter:drop-shadow(0 0 24px rgba(255,255,255,.9)) drop-shadow(0 0 10px rgba(150,110,220,.7));animation:la-float 2.6s ease-in-out infinite;pointer-events:none}
   .la-bossimg.hurt{animation:la-hurt .5s}
   @keyframes la-hurt{30%{transform:translateX(-46%) scale(.94);filter:grayscale(1) brightness(2)}60%{transform:translateX(-54%) scale(.96)}}
   .la-pages{position:absolute;inset:0;pointer-events:none}
   .la-pages i{position:absolute;width:5%;aspect-ratio:3/4;background:#fffef8;border:1px solid #ddd;border-radius:2px;box-shadow:0 2px 6px rgba(0,0,0,.2);animation:la-page 6s linear infinite}
   .la-pages i:nth-child(1){left:20%;top:10%;animation-delay:0s}.la-pages i:nth-child(2){left:70%;top:16%;animation-delay:1.2s}
   .la-pages i:nth-child(3){left:35%;top:30%;animation-delay:2.4s}.la-pages i:nth-child(4){left:80%;top:40%;animation-delay:3.6s}.la-pages i:nth-child(5){left:12%;top:45%;animation-delay:4.8s}
   @keyframes la-page{0%{transform:translateY(0) rotate(0);opacity:0}15%{opacity:.9}100%{transform:translateY(-60%) rotate(200deg);opacity:0}}
   .la-momo-help{position:absolute;left:3%;bottom:4%;width:16%;animation:la-float 2s ease-in-out infinite;pointer-events:none}
   .la-target.glowhint{border-color:#ffe27a;box-shadow:0 0 18px #ffe27a}
   .la-face.bossface{border-color:#8f7fd6;background:#2a2450}
   .la-actor.bossy{filter:drop-shadow(0 0 22px rgba(255,255,255,.85)) drop-shadow(0 0 8px rgba(150,110,220,.7));height:64%}
   .la-vn.bossbox{background:rgba(30,26,60,.9);border-color:#fff;box-shadow:0 0 22px rgba(255,255,255,.6)}
   .la-cert{background:#fffaf0;border:4px solid var(--gold);border-radius:24px;padding:22px 18px}
   .la-cert-name{font-size:1.4rem;font-weight:900;color:var(--choc)}
   .la-cert-list{text-align:left;display:inline-block;line-height:2;font-weight:600}
   .la-cert-credit{color:var(--choc-soft);font-size:.9rem}
   @media(prefers-reduced-motion:reduce){.la-pages i,.la-bossimg,.la-momo-help{animation:none}}
   .la-hint{margin:12px 0 0;background:#fffaf0;border:3px dashed #e8d8bd;border-radius:16px;padding:10px 14px;line-height:1.7;font-weight:500}
   .la-hint.on{border-color:var(--berry);background:#fff0f4}
   .la-gift{color:var(--choc-soft)}
   .la-done{max-width:760px;margin:0 auto;text-align:center}
   .la-done h2{font-size:clamp(1.6rem,4vw,2.4rem)}
   .la-done .la-sheet{text-align:left;margin:16px 0}
   .la-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
   .la-actions .btn{padding:14px 26px;font-size:1.05rem;text-decoration:none}
   @keyframes la-letter{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-.08em) rotate(2deg)}}
   @keyframes la-pulse{50%{transform:translate(-50%,-50%) scale(1.15)}}
   @keyframes la-zoom{from{background-size:100%}to{background-size:130%}}
   @keyframes la-drift0{50%{transform:translate(16%,-28%) rotate(2deg)}}
   @keyframes la-drift1{50%{transform:translate(-14%,24%) rotate(-2deg)}}
   @keyframes la-drift2{50%{transform:translate(20%,16%) rotate(1deg)}}
   @keyframes la-beam{0%{opacity:1;clip-path:inset(0 100% 0 0)}60%{opacity:1;clip-path:inset(0 0 0 0)}100%{opacity:0;clip-path:inset(0 0 0 0)}}
   @keyframes la-glow{50%{box-shadow:0 0 22px #9be59b}}
   @keyframes la-pop{40%{transform:scale(1.15)}}
   @media(prefers-reduced-motion:reduce){.la-target,.la-stop.now,.la-tch,.la-stage.portal{animation:none!important}.la-party{transition:none}}
   @media(max-width:900px){.la-mapview{grid-template-columns:1fr}}
   /* 電腦大螢幕：射擊／對話畫面按螢幕高度放大，一頁內睇晒（句子＋射擊場＋提示），兩邊唔留咁多空位 */
   @media(min-width:901px){
    .la-wrap{max-width:1640px}
    .la-play{max-width:min(1500px,max(760px,calc((100dvh - 290px)*16/9)))}
    .la-play.boss-play{max-width:min(1500px,max(760px,calc((100dvh - 360px)*16/9)))}
    .la-stage,.la-stage.shoot{max-height:none}
    .la-mapview{max-width:1200px}
   }
   @media(max-width:640px){
    .la-wrap{padding:10px 10px 40px}
    .la-top{gap:6px}
    .la-top h1{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .la-back{padding:6px 9px;font-size:.85rem}
    .la-cbtn.gold{min-width:260px}.la-cbtn{min-width:120px}
    .la-cover{background-position:68% center}
    .la-face{width:44px;height:44px}
    .la-bub p{font-size:1.05rem}
    .la-msg{max-width:94%}
    .la-chat{max-height:none}
    .la-msg.big .la-bub p{font-size:1.15rem}.la-msg.big .la-face{width:50px;height:50px}
    .la-stage.shoot{aspect-ratio:3/4;max-height:60vh;min-height:320px}
    .la-target{padding:4px 8px}
    .la-target.t0{left:4%;top:24%}.la-target.t1{left:50%;top:34%}.la-target.t2{left:6%;top:50%}.la-target.t3{left:48%;top:63%}
    .la-stage.scene{aspect-ratio:3/4;max-height:66vh}
    /* 手機：角色企喺對話框上面，文字用盡對話框闊度，唔會被立繪逼到好窄 */
    .la-actor{max-width:52%;height:40%;bottom:33%}
    .la-actor.moying{height:30%;bottom:34%}
    .la-actor.bossy{height:44%}
    .la-vn{min-height:30%;padding:8px 14px 12px;z-index:5}
    .la-vn.pl,.la-vn.pr,.la-vn.sys,.la-vn.sys.pr{padding-left:14px;padding-right:14px}
    .la-vn.pr b{display:block;text-align:right}
    .la-shooter{height:30%}
   }
  `}</style>
 </>
}
