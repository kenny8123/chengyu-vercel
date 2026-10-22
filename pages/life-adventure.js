import Head from 'next/head'
import {useEffect,useRef,useState} from 'react'
import CompletionReward from '../components/CompletionReward'
import {recordLearning,startRewardRun,completeRewardRun,readPet,giftOutfit} from '../components/petMemory'
import {outfitAsset} from '../components/outfitAssets'
import CATALOG from '../components/petCatalog.json'
import LIFE from '../components/lifeSentences.json'
import {CAST,XIAOYUE,UNITS} from '../components/lifeAdventure'

// 成語穿越者：生活成語地圖冒險（設計構思：遊戲作者）
// 學習單地圖 × 射擊：每站先看今天的生活對話，句子裏的成語被墨影吸走變成墨跡，
// 用鼎鼎的燈泡光射回正確的成語，再穿越到古代看它的典故。
const BLANK='＿＿＿＿'
const KEY='life-adventure-v1'
const IMG=n=>`/images/life-adventure/${n}.webp`
const LEFT=new Set(['xiaoyue','dingding'])
const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const meaning=idiom=>CATALOG.find(c=>c.idiom===idiom)?.meaning||''
const lifeOf=idiom=>LIFE.find(x=>x.idiom===idiom)
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}}
const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}}
const faceOf=(sp,mood,talking)=>sp==='dingding'?IMG(talking?'dingding-talk':'dingding-wave'):sp==='xiaoyue'?IMG(XIAOYUE[mood]||XIAOYUE.wave):sp==='moying'?IMG('moying-giggle'):IMG(CAST[sp].img)

function speak(text,on){
 if(!on||typeof window==='undefined'||!window.speechSynthesis)return
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/＿＿＿＿/g,'，墨跡，'));u.lang='zh-HK';u.rate=.9;speechSynthesis.speak(u)}catch{}
}

// 墨跡：被墨影吸走的成語；射中後變回成語
function Gap({idiom,hit}){return hit?<b className="la-found">{idiom}</b>:<span className="la-ink" aria-label="被墨影吸走的成語"><i/><i/><i/></span>}
function Said({text,idiom,hit}){const [a,b]=text.split(BLANK);return <>{a}<Gap idiom={idiom} hit={hit}/>{b}</>}
// 遊戲字：漸層填色＋粗描邊
function GameText({text,className=''}){return <span className={`la-gtext ${className}`} data-t={text}><span>{text}</span></span>}

export default function LifeAdventure(){
 const unit=UNITS[0],chapters=unit.chapters
 const [phase,setPhase]=useState('cover'),[stop,setStop]=useState(0),[step,setStep]=useState(0)
 const [done,setDone]=useState({}),[typed,setTyped]=useState(0),[voice,setVoice]=useState(true),[introSeen,setIntroSeen]=useState(false)
 const [targets,setTargets]=useState([]),[gone,setGone]=useState([]),[wrong,setWrong]=useState(0),[hint,setHint]=useState(''),[hit,setHit]=useState(false),[beam,setBeam]=useState(null)
 const [reward,setReward]=useState(null),[walkFrom,setWalkFrom]=useState(null),[walking,setWalking]=useState(false),[teacher,setTeacher]=useState(false)
 const run=useRef(null),stageRef=useRef(null)
 const ch=chapters[stop],life=lifeOf(ch.idiom),sentence=life.sentences[0],sayer=ch.modern.say||'xiaoyue'

 // 對白次序：intro＝開場；story＝今天的生活 → 關鍵句（墨跡）→ 墨影；ancient＝穿越到古代看典故
 const seq=phase==='intro'?unit.intro.map(l=>({bg:'bg-time-library',cast:[],line:l}))
  :phase==='story'?[...ch.modern.lines.map(l=>({bg:ch.modern.bg,cast:ch.modern.cast,line:l})),
    {bg:ch.modern.bg,cast:ch.modern.cast,line:[sayer,sentence],key:true},
    {bg:ch.modern.bg,cast:ch.modern.cast,line:['moying','嘻嘻！我把句子裏的成語吸走了，看你能不能射回去！']}]
  :phase==='ancient'?[{portal:'穿越到古代……'},...ch.ancient.lines.map(l=>({bg:ch.ancient.bg,cast:ch.ancient.cast,line:l}))]:[]
 const cur=seq[step]

 // 讀取上次的進度（同一個學習檔案才接續）
 useEffect(()=>{
  const x=load(),pid=readPet().active
  if(x&&x.run?.profileId===pid&&x.unit===0){setDone(x.done||{});run.current=x.run;setIntroSeen(!!x.introSeen);setVoice(x.voice!==false)}
  else run.current=startRewardRun('adventure')
 },[])
 const persist=(d,extra={})=>save({unit:0,done:d,run:run.current,introSeen:true,voice,...extra})
 function toggleVoice(){const v=!voice;setVoice(v);persist(done,{voice:v});try{speechSynthesis.cancel()}catch{}}

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

 function next(){
  if(cur&&!cur.portal&&typed<cur.line[1].length){setTyped(cur.line[1].length);return}
  if(step+1<seq.length){setStep(step+1);return}
  if(phase==='intro'){setIntroSeen(true);persist(done);setPhase('map');return}
  if(phase==='story'){startShoot();return}
  if(phase==='ancient')backToMap()
 }
 function start(){if(introSeen)setPhase('map');else{setStep(0);setPhase('intro')}}
 function openStop(i){setStop(i);setStep(0);setHit(false);setHint('');setWrong(0);setGone([]);setPhase('story')}
 function startShoot(){
  const others=chapters.map(c=>c.idiom).filter(x=>![ch.idiom,life.near,life.far].includes(x))
  setTargets(shuffle([ch.idiom,life.near,life.far,shuffle(others)[0]]))
  setGone([]);setWrong(0);setHint('');setHit(false);setBeam(null);setPhase('shoot')
  speak(sentence,voice)
 }
 function shoot(idiom,e){
  if(hit||gone.includes(idiom))return
  // 光束：由鼎鼎（舞台底部中間）射向被按的成語
  const st=stageRef.current?.getBoundingClientRect(),r=e.currentTarget.getBoundingClientRect()
  if(st){const x1=st.width/2,y1=st.height-30,x2=r.left+r.width/2-st.left,y2=r.top+r.height/2-st.top;setBeam({x:x1,y:y1,len:Math.hypot(x2-x1,y2-y1),deg:Math.atan2(y2-y1,x2-x1)*180/Math.PI,k:Date.now()})}
  const fresh=!(stop in done)
  if(idiom===ch.idiom){
   setHit(true);setHint('')
   if(fresh){
    recordLearning({idiom:ch.idiom,kind:'answer',correct:wrong===0})
    giftOutfit(ch.idiom)
    const d={...done,[stop]:wrong===0};setDone(d);persist(d)
   }
   speak(sentence.replace(BLANK,ch.idiom),voice)
   return
  }
  if(wrong===0&&fresh)recordLearning({idiom:ch.idiom,kind:'answer',correct:false})
  const w=wrong+1;setWrong(w);setGone([...gone,idiom])
  const h=w===1?`「${idiom}」的意思是：${meaning(idiom)}和這句話說的事不一樣，再讀一次吧。`:`提示：要找的成語，意思是「${meaning(ch.idiom)}」`
  setHint(h);speak(h,voice)
 }
 function toAncient(){recordLearning({idiom:ch.idiom,kind:'read'});setStep(0);setPhase('ancient')}
 function backToMap(){
  try{speechSynthesis.cancel()}catch{}
  if(Object.keys(done).length===chapters.length&&!reward){
   const answers=chapters.map((_,i)=>({correct:done[i]===true}))
   setReward(completeRewardRun(run.current,answers)||{already:true});setPhase('done');return
  }
  setWalkFrom(stop);setWalking(false);setPhase('map')
 }
 function restart(){if(!window.confirm('重新開始會清除這張地圖的進度，確定嗎？'))return;run.current=startRewardRun('adventure');setDone({});setReward(null);setWalkFrom(null);persist({});setPhase('map')}

 const nextStop=chapters.findIndex((_,i)=>!(i in done)),firstCount=Object.values(done).filter(v=>v===true).length
 const heroAt=walkFrom!==null&&!walking?walkFrom:nextStop>=0?nextStop:chapters.length-1
 const lastXy=[...seq.slice(0,step+1)].reverse().find(s=>s.line?.[0]==='xiaoyue'&&s.line[2])?.line[2]
 const costume=outfitAsset(ch.idiom,'celebrate','large')?.gif

 const worksheet=<aside className="la-sheet" aria-label="學習單">
  <h3>📜 學習單・{unit.title.split('・')[0]}</h3>
  <ol>{chapters.map((c,i)=>{const ok=i in done
   return <li key={c.idiom} className={ok?(done[i]?'ok':'retry'):''}><Said text={lifeOf(c.idiom).sentences[0]} idiom={c.idiom} hit={ok}/></li>})}</ol>
  <p className="la-score">第一次就射中：<b>{firstCount}</b> / 10</p>
 </aside>

 return <>
  <Head><title>成語穿越者・地圖冒險</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>

  {phase==='cover'&&<main className="la-cover" style={{backgroundImage:`url(${IMG('cover')})`}}>
   <div className="la-cover-in">
    <p className="la-kicker">✦ 生活成語冒險 ✦</p>
    <h1 className="la-title" aria-label="成語穿越者">{[...'成語穿越者'].map((c,i)=><span key={i} className="la-tch mint" data-t={c} style={{animationDelay:`${i*.15}s`}}><span>{c}</span></span>)}</h1>
    <p className="la-title2" aria-label="地圖冒險">{[...'地圖冒險'].map((c,i)=><span key={i} className="la-tch honey" data-t={c} style={{animationDelay:`${.4+i*.15}s`}}><span>{c}</span></span>)}</p>
    <p className="la-tag">穿越古今，把被墨影吸走的成語，一個一個找回來</p>
    <div className="la-cover-btns">
     <button className="la-cbtn gold" onClick={start}>{Object.keys(done).length?'繼續冒險':'開始冒險'}</button>
     <div className="la-cbtn-row">
      <button className="la-cbtn" onClick={toggleVoice} aria-pressed={voice}>{voice?'🔊 朗讀：開':'🔇 朗讀：關'}</button>
      <button className="la-cbtn" onClick={()=>setTeacher(t=>!t)} aria-expanded={teacher}>給老師</button>
     </div>
     <a className="la-cbtn" href="/?view=challenge">← 回挑戰系統</a>
    </div>
    {teacher&&<div className="la-teacher" role="note">
     <p><b>玩法：</b>每張地圖 10 站，一站一個成語。學生先讀生活對話，判斷哪個四字成語適合放進句子，再射回正確的成語；答錯會看到該成語的意思作提示。射中後可穿越到古代看典故。</p>
     <p><b>學習單：</b>地圖旁的學習單會逐句完成；完成後可到「生活成語小教室」做 10 題總測驗。</p>
    </div>}
   </div>
  </main>}

  {phase!=='cover'&&<main className="la-wrap">
   <header className="la-top">
    <button className="la-back" onClick={()=>{try{speechSynthesis.cancel()}catch{};setPhase(phase==='map'||phase==='intro'||phase==='done'?'cover':'map')}}>{phase==='map'||phase==='intro'||phase==='done'?'← 封面':'← 地圖'}</button>
    <h1>🗺️ {unit.title}</h1>
    <button className="la-back" onClick={toggleVoice} aria-pressed={voice}>{voice?'🔊 開':'🔇 關'}</button>
   </header>

   {phase==='map'&&<div className="la-mapview">
    <div className="la-map">
     <img src={IMG(unit.map)} alt="單元一冒險地圖" className="la-mapimg"/>
     <img src={IMG('moying-float')} alt="墨影躲在這裏" className="la-hideout" style={{left:unit.hideout[0]+'%',top:unit.hideout[1]+'%'}}/>
     {unit.stops.map(([x,y],i)=>{const st=i in done?'done':i===nextStop?'now':'lock'
      return <button key={i} className={`la-stop ${st}`} style={{left:x+'%',top:y+'%'}} onClick={()=>st!=='lock'&&openStop(i)} disabled={st==='lock'} aria-label={`第 ${i+1} 站${st==='done'?`：${chapters[i].idiom}（已完成，可重玩）`:st==='now'?'：按一下出發':'：未開放'}`}>{st==='done'?'✓':i+1}</button>})}
     <div className="la-party" style={{left:unit.stops[heroAt][0]+'%',top:unit.stops[heroAt][1]+'%'}}>
      <img src={IMG(walkFrom!==null?'xiaoyue-walk':'xiaoyue-bounce')} alt="小越" className="la-hero"/>     </div>
    </div>
    <div className="la-side">
     <p className="la-tip">{nextStop>=0?<>★ 按地圖上發光的第 <b>{nextStop+1}</b> 站出發。先讀大家的對話，想想哪個成語適合，再把它射回句子裏。</>:'★ 十站都完成了！'}</p>
     {worksheet}
     {Object.keys(done).length>0&&<button className="la-link" onClick={restart}>重新開始這張地圖</button>}
    </div>
   </div>}

   {(phase==='intro'||phase==='story'||phase==='ancient')&&cur&&<div className="la-play">
    <div className={`la-stage scene${cur.portal?' portal':''}`} style={cur.portal?{backgroundImage:`url(${IMG('bg-time-portal')})`}:undefined} onClick={next}>
     {cur.portal?<p className="la-portal-text"><GameText text={cur.portal}/></p>:<>
      <div className="la-bg" style={{backgroundImage:`url(${IMG(cur.bg)})`}}/>
      {/* RPG 式：只顯示說話的人的半身立繪，小越在左下角、其他角色在右下角，站在對話框前面（busts.mjs 統一頭部大小） */}
      {cur.line[0]!=='moying'&&<img key={step} src={IMG('bust-'+(cur.line[0]==='xiaoyue'?XIAOYUE[cur.line[2]]||XIAOYUE.wave:cur.line[0]==='dingding'?'dingding-talk':CAST[cur.line[0]].talk||CAST[cur.line[0]].img))} alt={CAST[cur.line[0]].name} className={`la-actor ${cur.line[0]==='xiaoyue'?'left':'right'}`}/>}
      {(phase==='intro'||cur.key||cur.line[0]==='moying')&&<img src={IMG(cur.key||cur.line[0]==='moying'?'moying-suck-float':'moying-float')} alt="墨影" className="la-moying"/>}
      {/* 情境對話（RPG 式）：小越在左、其他角色在右，說話的人亮起；底部一個大對話框 */}
      <div className={`la-vn ${cur.line[0]==='moying'?'mid':cur.line[0]==='xiaoyue'?'pl':'pr'}${cur.key?' key':''}${cur.line[0]==='moying'?' ink':''}`} aria-live="polite">
       <b>【{CAST[cur.line[0]].name}】</b>
       <p>{cur.key?(typed<cur.line[1].length?cur.line[1].slice(0,typed).replace(BLANK,'⋯⋯'):<Said text={cur.line[1]} idiom={ch.idiom} hit={false}/>):cur.line[1].slice(0,typed)}</p>
       {typed>=cur.line[1].length&&<span className="la-vn-more" aria-hidden="true">▼</span>}
      </div>
     </>}
    </div>
    {!cur.portal&&<div className="la-chat-btns">
     <button onClick={()=>speak(cur.line[1],true)} aria-label="再聽一次">🔊 再聽</button>
     <button className="la-next" onClick={next}>{step+1<seq.length?'下一句 ▶':phase==='intro'?'出發 ▶':phase==='story'?'射回成語 ▶':'回到地圖 ▶'}</button>
    </div>}
   </div>}

   {phase==='shoot'&&<div className="la-play">
    <div className={`la-msg big ${LEFT.has(sayer)?'left':'right'} key`}>
     <img src={faceOf(sayer,'think',false)} alt="" className="la-face"/>
     <div className="la-bub"><b>{CAST[sayer].name}</b><p><Said text={sentence} idiom={ch.idiom} hit={hit}/></p></div>
     <button className="la-say" onClick={()=>speak(hit?sentence.replace(BLANK,ch.idiom):sentence,true)} aria-label="朗讀句子">🔊</button>
    </div>
    <div ref={stageRef} className="la-stage shoot" style={{backgroundImage:`url(${IMG(ch.modern.bg)})`}}>
     <img src={IMG(hit?'moying-sad-float':'moying-float')} alt="墨影" className="la-moying fly"/>
     {targets.map((t,n)=><button key={t} className={`la-target t${n}${gone.includes(t)?' gone':''}${hit&&t===ch.idiom?' win':''}${hit&&t!==ch.idiom?' fade':''}`} onClick={e=>shoot(t,e)} disabled={hit||gone.includes(t)} aria-label={`射向「${t}」`}><GameText text={t}/></button>)}
     {beam&&<span key={beam.k} className="la-beam" style={{left:beam.x,top:beam.y,width:beam.len,transform:`rotate(${beam.deg}deg)`}}/>}
     <span className={`la-bulb${hit?' win':''}`} aria-hidden="true">💡</span>
    </div>
    {!hit&&<p className={`la-hint${hint?' on':''}`}>{hint||'★ 讀一讀上面那句話，想想墨跡那裏應該是哪個四字成語，再按它，用燈泡的光射回去。'}</p>}
    {hit&&<div className="la-win" role="status">
     {costume&&<img src={costume} alt={`鼎鼎穿上「${ch.idiom}」造型`}/>}
     <div>
      <h3><GameText text="命中！"/></h3>
      <p>{done[stop]?'第一次就射中，真厲害！':'找回來了！下次先想清楚意思再射。'}</p>
      <p>「{ch.idiom}」：{meaning(ch.idiom)}</p>
      <p className="la-gift">🎁 成語送回圖書館了！鼎鼎得到「{ch.idiom}」紀念衣服，可到<a href="/pet">寵物的家</a>換上。</p>
      <div className="la-win-btns"><button className="btn btn-go" onClick={toAncient}>穿越去看典故 →</button><button className="btn btn-ghost" onClick={backToMap}>回到地圖</button></div>
     </div>
    </div>}
   </div>}

   {phase==='done'&&<div className="la-done">
    <h2><GameText text="十卷卷軸全部亮起了！"/></h2>
    <p>墨影躲回宮殿去了……它好像還有話想說。下一張地圖見！</p>
    {reward&&!reward.already&&<CompletionReward reward={reward}/>}
    {worksheet}
    <div className="la-actions">
     <a className="btn btn-go" href="/life-class">去學習單總測驗 →</a>
     <button className="btn btn-ghost" onClick={()=>setPhase('map')}>看地圖</button>
     <button className="btn btn-ghost" onClick={restart}>重新開始</button>
    </div>
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
   .la-tag{display:inline-block;margin:10px 0 18px;background:rgba(91,42,94,.72);color:#fff;border-radius:999px;padding:6px 16px;font-weight:700}
   .la-cover-btns{display:flex;flex-direction:column;gap:10px;align-items:center}
   .la-cbtn-row{display:flex;gap:10px}
   .la-cbtn{min-width:150px;border:2px solid rgba(255,255,255,.8);background:rgba(255,250,240,.88);color:#5b2a5e;font-weight:800;font-size:1.05rem;border-radius:16px;padding:12px 18px;cursor:pointer;text-decoration:none;box-shadow:0 4px 0 rgba(91,42,94,.25)}
   .la-cbtn.gold{min-width:320px;background:linear-gradient(180deg,#ffe58a,#ffc94d);border-color:#fff3c4;font-size:1.25rem;padding:14px 20px;box-shadow:0 5px 0 #d39a22}
   .la-teacher{margin:14px auto 0;max-width:520px;background:rgba(255,250,240,.94);border-radius:16px;padding:12px 16px;text-align:left;line-height:1.7}
   .la-teacher p{margin:4px 0}
   .la-gtext{position:relative;display:inline-block;font-weight:900;font-family:'Noto Sans TC',sans-serif;letter-spacing:.03em}
   .la-gtext::before{content:attr(data-t);position:absolute;left:0;top:0;z-index:0;-webkit-text-stroke:.28em #3b0f45;color:#3b0f45;text-shadow:0 .12em 0 #ff4f9a,0 0 .4em rgba(255,79,154,.6)}
   .la-gtext>span{position:relative;z-index:1;background:linear-gradient(180deg,#fff68a 0%,#ffd23f 45%,#ff8db0 72%,#ff3d8b 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
   .la-wrap{max-width:1180px;margin:0 auto;padding:14px 16px 60px}
   .la-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
   .la-top h1{flex:1;margin:0;font-size:1.5rem;font-weight:800;color:var(--choc);text-shadow:2px 2px 0 #ffd98a}
   .la-back{background:#fff;border:2px solid #e8d8bd;border-radius:999px;padding:8px 14px;font-weight:700;color:var(--choc);cursor:pointer;font-size:.95rem;white-space:nowrap}
   .la-mapview{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:16px;align-items:start}
   .la-map{position:relative;border-radius:18px;overflow:hidden;box-shadow:0 10px 26px rgba(90,61,43,.25)}
   .la-mapimg{display:block;width:100%;height:auto}
   .la-stop{position:absolute;transform:translate(-50%,-50%);width:6.4%;aspect-ratio:1;min-width:34px;border-radius:50%;border:3px solid #fff;font-weight:800;font-size:clamp(.8rem,1.6vw,1.15rem);display:flex;align-items:center;justify-content:center;padding:0}
   .la-stop.lock{background:radial-gradient(circle,#3b3561 55%,#25213f);color:#9c95c9;cursor:not-allowed;opacity:.92}
   .la-stop.now{background:var(--sun);color:var(--choc);cursor:pointer;animation:la-pulse 1.2s infinite;box-shadow:0 0 0 6px rgba(255,201,77,.45)}
   .la-stop.done{background:var(--gold);color:#fff;cursor:pointer}
   .la-hideout{position:absolute;width:11%;transform:translate(-50%,-55%);pointer-events:none}
   .la-party{position:absolute;width:8%;transform:translate(-50%,-96%);transition:left 1.5s ease-in-out,top 1.5s ease-in-out;pointer-events:none}
   .la-hero{width:100%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}
   .la-side{display:flex;flex-direction:column;gap:12px}
   .la-tip{margin:0;background:#fffaf0;border:3px dashed var(--sun);border-radius:16px;padding:10px 14px;line-height:1.7;font-weight:500}
   .la-sheet{background:#fff;border:3px solid #e8d8bd;border-radius:18px;padding:12px 16px 12px 12px}
   .la-sheet h3{margin:0 0 6px;font-size:1.1rem}
   .la-sheet ol{margin:0;padding-left:1.8em;line-height:1.9;font-size:.95rem}
   .la-sheet li{padding:2px 0;border-bottom:1px dashed #efe3cf;color:#8b7461}
   .la-sheet li.ok,.la-sheet li.retry{color:var(--choc)}
   .la-sheet li.retry .la-found{color:var(--sun-dark)}
   .la-score{margin:8px 0 0;font-weight:700}
   .la-link{background:none;border:none;color:var(--choc-soft);text-decoration:underline;cursor:pointer;align-self:flex-start}
   .la-ink{display:inline-block;position:relative;width:4.4em;height:1.05em;vertical-align:-.15em;margin:0 .15em;background:#2e2852;border-radius:48% 52% 44% 56%/60% 42% 58% 40%;box-shadow:inset 0 -.12em .2em rgba(0,0,0,.35)}
   .la-ink i{position:absolute;background:#2e2852;border-radius:50%}
   .la-ink i:nth-child(1){width:.38em;height:.38em;left:-.22em;top:.1em}
   .la-ink i:nth-child(2){width:.26em;height:.42em;left:40%;bottom:-.3em;border-radius:40% 40% 50% 50%}
   .la-ink i:nth-child(3){width:.3em;height:.3em;right:-.25em;top:-.12em}
   .la-found{color:var(--grass-dark);background:#eafbe9;border-radius:6px;padding:0 .2em;margin:0 .1em;animation:la-pop .5s}
   .la-play{max-width:1000px;margin:0 auto}
   .la-stage{position:relative;aspect-ratio:16/9;max-height:60vh;width:100%;background-size:cover;background-position:center;border-radius:18px;overflow:hidden;box-shadow:0 10px 26px rgba(90,61,43,.25);cursor:pointer;user-select:none}
   .la-stage.portal{animation:la-zoom 1.6s ease-in}
   .la-portal-text{position:absolute;inset:auto 0 12%;text-align:center;font-size:clamp(1.6rem,4vw,2.6rem);margin:0}
   .la-bg{position:absolute;inset:-12px;background-size:cover;background-position:center;filter:blur(1.5px) brightness(.95)}
   .la-actor{position:absolute;bottom:0;height:56%;width:auto;max-width:30%;object-fit:cover;object-position:top center;z-index:4;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));animation:la-in .3s ease-out}
   .la-actor.left{left:1%}
   .la-actor.right{right:1%}
   @keyframes la-in{from{opacity:0;transform:translateY(6%)}}
   .la-vn{position:absolute;left:2%;right:2%;bottom:3%;z-index:3;min-height:27%;background:rgba(24,22,58,.86);border:3px solid #e8c873;border-radius:14px;padding:10px 18px 14px;color:#fff;box-shadow:0 0 0 3px rgba(24,22,58,.5),0 8px 20px rgba(0,0,0,.35);cursor:pointer}
   .la-vn.pl{padding-left:29%}.la-vn.pr{padding-right:29%}.la-vn.mid{padding-left:6%;padding-right:6%}
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
   .la-bulb{position:absolute;bottom:3%;left:50%;transform:translateX(-50%);font-size:clamp(2.4rem,6vw,3.6rem);filter:drop-shadow(0 0 14px #ffe27a) drop-shadow(0 0 6px #fff3b0);pointer-events:none;animation:la-float 2s ease-in-out infinite}
   .la-bulb.win{filter:drop-shadow(0 0 26px #fff27a) drop-shadow(0 0 10px #fff)}
   .la-hint{margin:12px 0 0;background:#fffaf0;border:3px dashed #e8d8bd;border-radius:16px;padding:10px 14px;line-height:1.7;font-weight:500}
   .la-hint.on{border-color:var(--berry);background:#fff0f4}
   .la-win{display:flex;align-items:center;gap:16px;margin-top:12px;background:#fff;border:4px solid var(--grass);border-radius:20px;padding:14px 18px}
   .la-win>img{width:130px;height:130px;object-fit:contain;flex:0 0 auto}
   .la-win h3{margin:0 0 4px;font-size:2rem}.la-win p{margin:4px 0;line-height:1.6}
   .la-gift{color:var(--choc-soft)}
   .la-win-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
   .la-win-btns .btn{padding:12px 22px;font-size:1.05rem}
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
   @media(max-width:640px){
    .la-wrap{padding:10px 10px 40px}
    .la-top h1{font-size:1.05rem}
    .la-back{padding:6px 10px;font-size:.85rem}
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
    .la-actor{max-width:40%;height:46%}
    .la-vn{min-height:32%;padding:8px 12px 12px}
    .la-vn.pl{padding-left:38%}.la-vn.pr{padding-right:38%}
    .la-win{flex-direction:column;text-align:center}.la-win-btns{justify-content:center}
   }
  `}</style>
 </>
}
