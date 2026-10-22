import Head from 'next/head'
import {useEffect,useRef,useState} from 'react'
import CompletionReward from '../components/CompletionReward'
import {recordLearning,startRewardRun,completeRewardRun,readPet,giftOutfit} from '../components/petMemory'
import {outfitAsset} from '../components/outfitAssets'
import CATALOG from '../components/petCatalog.json'
import LIFE from '../components/lifeSentences.json'
import {CAST,XIAOYUE,UNITS} from '../components/lifeAdventure'

// 成語穿越者：生活成語地圖冒險（設計構思：遊戲作者）
// 學習單地圖 × 射擊：每站先穿越到古代看典故，再回到今天；墨影吸走句子裏的成語，用鼎鼎的燈泡光射回正確的成語。
const BLANK='＿＿＿＿'
const KEY='life-adventure-v1'
const IMG=n=>`/images/life-adventure/${n}.webp`
const DD='/images/dingding-home/happy.png'
const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const meaning=idiom=>CATALOG.find(c=>c.idiom===idiom)?.meaning||''
const lifeOf=idiom=>LIFE.find(x=>x.idiom===idiom)
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}}
const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}}

function speak(text,on){
 if(!on||typeof window==='undefined'||!window.speechSynthesis)return
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/＿＿＿＿/g,'空格'));u.lang='zh-HK';u.rate=.9;speechSynthesis.speak(u)}catch{}
}

// 一站的對白次序：穿越 → 古代 → 回到今天 → 今天 → 墨影
function stepsOf(ch){
 const s=[{portal:'穿越到古代……'}]
 for(const l of ch.ancient.lines)s.push({bg:ch.ancient.bg,cast:ch.ancient.cast,line:l})
 s.push({portal:'回到今天……'})
 for(const l of ch.modern.lines)s.push({bg:ch.modern.bg,cast:ch.modern.cast,line:l})
 s.push({bg:ch.modern.bg,cast:ch.modern.cast,line:['moying','嘻嘻！句子裏的成語被我吸走了，看你能不能射回去！']})
 return s
}

export default function LifeAdventure(){
 const unit=UNITS[0],chapters=unit.chapters
 const [phase,setPhase]=useState('map'),[stop,setStop]=useState(0),[step,setStep]=useState(0)
 const [done,setDone]=useState({}),[typed,setTyped]=useState(0),[voice,setVoice]=useState(true)
 const [targets,setTargets]=useState([]),[gone,setGone]=useState([]),[wrong,setWrong]=useState(0),[hint,setHint]=useState(''),[hit,setHit]=useState(false),[beam,setBeam]=useState(null)
 const [reward,setReward]=useState(null),[introSeen,setIntroSeen]=useState(true)
 const run=useRef(null),stageRef=useRef(null)
 const ch=chapters[stop],steps=phase==='intro'?unit.intro.map(l=>({bg:'bg-time-library',cast:[],line:l})):phase==='scene'?stepsOf(ch):[]
 const cur=steps[step],life=lifeOf(ch.idiom),sentence=life.sentences[0]

 // 讀取上次的進度（同一個學習檔案才接續）
 useEffect(()=>{
  const x=load(),pid=readPet().active
  if(x&&x.run?.profileId===pid&&x.unit===0){setDone(x.done||{});run.current=x.run;setIntroSeen(!!x.introSeen);setVoice(x.voice!==false)}
  else{run.current=startRewardRun('adventure');setIntroSeen(false)}
  if(!(x&&x.run?.profileId===pid&&x.introSeen)){setPhase('intro');setStep(0)}
 },[])
 const persist=(d,extra={})=>save({unit:0,done:d,run:run.current,introSeen:true,voice,...extra})
 function toggleVoice(){const v=!voice;setVoice(v);persist(done,{voice:v});try{speechSynthesis.cancel()}catch{}}

 // 逐字出現 + 朗讀
 useEffect(()=>{
  if(!cur)return
  if(cur.portal){const t=setTimeout(next,1500);return()=>clearTimeout(t)}
  setTyped(0);speak(cur.line[1],voice)
  const text=cur.line[1];let n=0
  const t=setInterval(()=>{n+=1;setTyped(n);if(n>=text.length)clearInterval(t)},45)
  return()=>clearInterval(t)
 },[phase,stop,step])

 function next(){
  if(cur&&!cur.portal&&typed<cur.line[1].length){setTyped(cur.line[1].length);return}
  if(step+1<steps.length){setStep(step+1);return}
  if(phase==='intro'){setIntroSeen(true);persist(done);setPhase('map');return}
  recordLearning({idiom:ch.idiom,kind:'read'})
  startShoot()
 }
 function openStop(i){setStop(i);setStep(0);setPhase('scene');setHit(false);setHint('');setWrong(0);setGone([])}
 function startShoot(){
  const others=chapters.map(c=>c.idiom).filter(x=>![ch.idiom,life.near,life.far].includes(x))
  setTargets(shuffle([ch.idiom,life.near,life.far,shuffle(others)[0]]))
  setGone([]);setWrong(0);setHint('');setHit(false);setPhase('shoot')
  speak(sentence,voice)
 }
 function shoot(idiom,e){
  if(hit||gone.includes(idiom))return
  // 光束：由鼎鼎（舞台底部中間）射向被按的卷軸
  const st=stageRef.current?.getBoundingClientRect(),r=e.currentTarget.getBoundingClientRect()
  if(st){const x1=st.width/2,y1=st.height-10,x2=r.left+r.width/2-st.left,y2=r.top+r.height/2-st.top;setBeam({x:x1,y:y1,len:Math.hypot(x2-x1,y2-y1),deg:Math.atan2(y2-y1,x2-x1)*180/Math.PI,k:Date.now()})}
  const first=!(stop in done)&&wrong===0
  if(idiom===ch.idiom){
   setHit(true);setHint('')
   if(!(stop in done)){
    recordLearning({idiom:ch.idiom,kind:'answer',correct:first})
    giftOutfit(ch.idiom)
    const d={...done,[stop]:first};setDone(d);persist(d)
   }
   speak(sentence.replace(BLANK,ch.idiom),voice)
   return
  }
  if(wrong===0&&!(stop in done))recordLearning({idiom:ch.idiom,kind:'answer',correct:false})
  const w=wrong+1;setWrong(w);setGone([...gone,idiom])
  const h=w===1?`「${idiom}」的意思是：${meaning(idiom)}和句子說的事不一樣，再讀一次句子吧。`:`鼎鼎提示：要找的成語，意思是「${meaning(ch.idiom)}」`
  setHint(h);speak(h,voice)
 }
 function backToMap(){
  setPhase('map');setHit(false)
  if(Object.keys(done).length===chapters.length&&!reward){
   const answers=chapters.map((_,i)=>({correct:done[i]===true}))
   setReward(completeRewardRun(run.current,answers)||{already:true});setPhase('done')
  }
 }
 function restart(){if(!window.confirm('重新開始會清除這張地圖的進度，確定嗎？'))return;run.current=startRewardRun('adventure');setDone({});setReward(null);persist({});setPhase('map')}

 const nextStop=chapters.findIndex((_,i)=>!(i in done)),firstCount=Object.values(done).filter(v=>v===true).length
 const speaker=cur?.line?CAST[cur.line[0]]:null
 const portrait=cur?.line?(cur.line[0]==='dingding'?DD:cur.line[0]==='xiaoyue'?IMG(XIAOYUE[cur.line[2]]||XIAOYUE.wave):IMG(speaker.img)):null
 const xyMood=cur?.line?.[0]==='xiaoyue'&&cur.line[2]?XIAOYUE[cur.line[2]]:XIAOYUE.wave
 const costume=outfitAsset(ch.idiom,'celebrate','large')?.gif

 const worksheet=<aside className="la-sheet" aria-label="學習單">
  <h3>📜 學習單・{unit.title.split('・')[0]}</h3>
  <ol>{chapters.map((c,i)=>{const s=lifeOf(c.idiom).sentences[0],[a,b]=s.split(BLANK),ok=i in done
   return <li key={c.idiom} className={ok?(done[i]?'ok':'retry'):''}>{a}<span className="la-fill">（{ok?c.idiom:'　　　　'}）</span>{b}</li>})}</ol>
  <p className="la-score">第一次就射中：<b>{firstCount}</b> / 10</p>
 </aside>

 return <>
  <Head><title>生活成語地圖冒險｜成語穿越者</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>
  <main className="la-wrap">
   <header className="la-top">
    <a className="la-back" href="/?view=challenge">← 選模式</a>
    <h1>🗺️ {unit.title}</h1>
    <button className="la-voice" onClick={toggleVoice} aria-pressed={voice}>{voice?'🔊 朗讀：開':'🔇 朗讀：關'}</button>
   </header>

   {phase==='map'&&<div className="la-mapview">
    <div className="la-map">
     <img src={IMG(unit.map)} alt="單元一冒險地圖" className="la-mapimg"/>
     <img src={IMG('moying-giggle')} alt="墨影躲在這裏" className="la-hideout" style={{left:unit.hideout[0]+'%',top:unit.hideout[1]+'%'}}/>
     {unit.stops.map(([x,y],i)=>{const st=i in done?'done':i===nextStop?'now':'lock'
      return <button key={i} className={`la-stop ${st}`} style={{left:x+'%',top:y+'%'}} onClick={()=>st!=='lock'&&openStop(i)} disabled={st==='lock'} aria-label={`第 ${i+1} 站${st==='done'?`：${chapters[i].idiom}（已完成，可重玩）`:st==='now'?'：按一下出發':'：未開放'}`}>{st==='done'?'✓':i+1}</button>})}
     {nextStop>=0&&<img src={IMG(XIAOYUE.wave)} alt="" className="la-hero" style={{left:unit.stops[nextStop][0]+'%',top:unit.stops[nextStop][1]+'%'}}/>}
    </div>
    <div className="la-side">
     <p className="la-tip">{nextStop>=0?<>★ 按地圖上發光的第 <b>{nextStop+1}</b> 站出發。每站先穿越到古代聽典故，再回到今天，把成語射回句子裏。</>:'★ 十站都完成了！'}</p>
     {worksheet}
     {Object.keys(done).length>0&&<button className="la-link" onClick={restart}>重新開始這張地圖</button>}
    </div>
   </div>}

   {(phase==='intro'||phase==='scene')&&cur&&<div className="la-play">
    <div ref={stageRef} className={`la-stage${cur.portal?' portal':''}`} style={{backgroundImage:`url(${IMG(cur.portal?'bg-time-portal':cur.bg)})`}} onClick={next}>
     {cur.portal?<p className="la-portal-text">{cur.portal}</p>:<>
      <img src={IMG(xyMood)} alt="小越" className={`la-actor left${cur.line[0]==='xiaoyue'?' talk':''}`}/>
      <img src={DD} alt="鼎鼎" className={`la-dd${cur.line[0]==='dingding'?' talk':''}`}/>
      {cur.cast.map((k,n)=><img key={k} src={IMG(CAST[k].img)} alt={CAST[k].name} className={`la-actor right r${n}${cur.line[0]===k?' talk':''}`}/>)}
      {cur.line[0]==='moying'&&<img src={IMG('moying-suck')} alt="墨影" className="la-moying"/>}
     </>}
    </div>
    {!cur.portal&&<div className="la-dialog" role="dialog" aria-live="polite">
     <img src={portrait} alt="" className="la-face"/>
     <div className="la-talk"><b>{speaker.name}</b><p>{cur.line[1].slice(0,typed)}</p></div>
     <div className="la-dbtns">
      <button onClick={()=>speak(cur.line[1],true)} aria-label="再聽一次">🔊</button>
      <button className="la-next" onClick={next}>{step+1<steps.length?'下一句 ▶':phase==='intro'?'出發 ▶':'去射擊 ▶'}</button>
     </div>
    </div>}
   </div>}

   {phase==='shoot'&&<div className="la-play">
    <div className="la-q" aria-live="polite">
     <span className="la-qno">第 {stop+1} 站</span>
     <p>{ch.modern.who?`${ch.modern.who}：「`:''}{sentence.split(BLANK)[0]}<span className={`la-blank${hit?' hit':''}`}>（{hit?ch.idiom:'　　　　'}）</span>{sentence.split(BLANK)[1]}{ch.modern.who?'」':''}</p>
     <button onClick={()=>speak(hit?sentence.replace(BLANK,ch.idiom):sentence,true)} aria-label="朗讀句子">🔊</button>
    </div>
    <div ref={stageRef} className="la-stage shoot" style={{backgroundImage:`url(${IMG(ch.modern.bg)})`}}>
     <img src={IMG(hit?'moying-sad':'moying-giggle')} alt="墨影" className="la-moying fly"/>
     {targets.map((t,n)=><button key={t} className={`la-target t${n}${gone.includes(t)?' gone':''}${hit&&t===ch.idiom?' win':''}${hit&&t!==ch.idiom?' fade':''}`} onClick={e=>shoot(t,e)} disabled={hit||gone.includes(t)}>📜 {t}</button>)}
     {beam&&<span key={beam.k} className="la-beam" style={{left:beam.x,top:beam.y,width:beam.len,transform:`rotate(${beam.deg}deg)`}}/>}
     <img src={DD} alt="鼎鼎" className="la-gun"/>
    </div>
    {!hit&&<p className={`la-hint${hint?' on':''}`}>{hint||'★ 先讀句子，想想意思，再按正確的成語卷軸，用鼎鼎的燈泡光射回（　）。'}</p>}
    {hit&&<div className="la-win" role="status">
     {costume&&<img src={costume} alt={`鼎鼎穿上「${ch.idiom}」造型`}/>}
     <div><h3>🎯 命中！卷軸重新發光了</h3>
      <p>{done[stop]?'第一次就射中，真厲害！':'找回來了！下次先想清楚意思再射。'}</p>
      <p>鼎鼎得到「{ch.idiom}」的紀念衣服，可以到<a href="/pet">寵物的家</a>換上。</p>
      <button className="btn btn-go" onClick={backToMap}>回到地圖 →</button></div>
    </div>}
   </div>}

   {phase==='done'&&<div className="la-done">
    <h2>🎉 單元一的十卷卷軸全部亮起了！</h2>
    <p>墨影躲回宮殿去了……它好像還有話想說。下一張地圖見！</p>
    {reward&&!reward.already&&<CompletionReward reward={reward}/>}
    {worksheet}
    <div className="la-actions">
     <a className="btn btn-go" href="/life-class">去學習單總測驗 →</a>
     <button className="btn btn-ghost" onClick={restart}>重新開始這張地圖</button>
    </div>
   </div>}
  </main>

  <style jsx>{`
   .la-wrap{max-width:1180px;margin:0 auto;padding:14px 16px 60px}
   .la-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
   .la-top h1{flex:1;margin:0;font-size:1.5rem;font-weight:800;color:var(--choc);text-shadow:2px 2px 0 #ffd98a}
   .la-back,.la-voice{background:#fff;border:2px solid #e8d8bd;border-radius:999px;padding:8px 14px;font-weight:700;color:var(--choc);text-decoration:none;cursor:pointer;font-size:.95rem;white-space:nowrap}
   .la-mapview{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:16px;align-items:start}
   .la-map{position:relative;border-radius:18px;overflow:hidden;box-shadow:0 10px 26px rgba(90,61,43,.25)}
   .la-mapimg{display:block;width:100%;height:auto}
   .la-stop{position:absolute;transform:translate(-50%,-50%);width:6.4%;aspect-ratio:1;min-width:34px;border-radius:50%;border:3px solid #fff;font-weight:800;font-size:clamp(.8rem,1.6vw,1.15rem);display:flex;align-items:center;justify-content:center;padding:0}
   .la-stop.lock{background:radial-gradient(circle,#3b3561 55%,#25213f);color:#9c95c9;cursor:not-allowed;opacity:.92}
   .la-stop.now{background:var(--sun);color:var(--choc);cursor:pointer;animation:la-pulse 1.2s infinite;box-shadow:0 0 0 6px rgba(255,201,77,.45)}
   .la-stop.done{background:var(--gold);color:#fff;cursor:pointer}
   .la-hideout{position:absolute;width:9%;transform:translate(-50%,-50%);animation:la-bob 2.4s ease-in-out infinite;pointer-events:none}
   .la-hero{position:absolute;width:7%;transform:translate(-50%,-112%);pointer-events:none;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}
   .la-side{display:flex;flex-direction:column;gap:12px}
   .la-tip{margin:0;background:#fffaf0;border:3px dashed var(--sun);border-radius:16px;padding:10px 14px;line-height:1.7;font-weight:500}
   :global(.la-sheet){background:#fff;border:3px solid #e8d8bd;border-radius:18px;padding:12px 16px 12px 12px}
   :global(.la-sheet h3){margin:0 0 6px;font-size:1.1rem}
   :global(.la-sheet ol){margin:0;padding-left:1.8em;line-height:1.8;font-size:.95rem}
   :global(.la-sheet li){padding:2px 0;border-bottom:1px dashed #efe3cf;color:#8b7461}
   :global(.la-sheet li.ok),:global(.la-sheet li.retry){color:var(--choc)}
   :global(.la-sheet li.ok .la-fill){color:var(--grass-dark);font-weight:800}
   :global(.la-sheet li.retry .la-fill){color:var(--sun-dark);font-weight:800}
   :global(.la-score){margin:8px 0 0;font-weight:700}
   .la-link{background:none;border:none;color:var(--choc-soft);text-decoration:underline;cursor:pointer;align-self:flex-start}
   .la-play{max-width:1000px;margin:0 auto}
   .la-stage{position:relative;aspect-ratio:16/9;background-size:cover;background-position:center;border-radius:18px;overflow:hidden;box-shadow:0 10px 26px rgba(90,61,43,.25);cursor:pointer;user-select:none}
   .la-stage.portal{animation:la-zoom 1.5s ease-in}
   .la-portal-text{position:absolute;inset:auto 0 12%;text-align:center;font-size:clamp(1.2rem,3vw,2rem);font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(120,60,0,.6)}
   .la-actor{position:absolute;bottom:3%;height:62%;filter:brightness(.88) drop-shadow(0 6px 6px rgba(0,0,0,.25));transition:filter .2s,transform .2s}
   .la-actor.left{left:6%}
   .la-actor.right.r0{right:6%}.la-actor.right.r1{right:26%}
   .la-actor.talk{filter:brightness(1.05) drop-shadow(0 6px 8px rgba(0,0,0,.3));transform:translateY(-3%)}
   .la-dd{position:absolute;bottom:4%;left:24%;height:30%;filter:brightness(.9);transition:transform .2s}
   .la-dd.talk{filter:none;transform:translateY(-6%)}
   .la-moying{position:absolute;top:8%;right:8%;width:22%;animation:la-float 2s ease-in-out infinite}
   .la-moying.fly{width:15%;top:4%;right:4%}
   .la-dialog{display:flex;align-items:center;gap:12px;background:#fffaf0;border:4px solid var(--choc-soft);border-radius:20px;padding:12px 14px;margin-top:-56px;position:relative;z-index:2;box-shadow:0 8px 20px rgba(90,61,43,.25);width:calc(100% - 32px);margin-left:16px}
   .la-face{width:72px;height:72px;object-fit:contain;background:#fff;border-radius:50%;border:3px solid var(--sun);flex:0 0 auto}
   .la-talk{flex:1;min-width:0}
   .la-talk b{color:var(--berry-dark);font-size:1.05rem}
   .la-talk p{margin:4px 0 0;font-size:1.2rem;line-height:1.7;min-height:2.2em}
   .la-dbtns{display:flex;flex-direction:column;gap:6px;flex:0 0 auto}
   .la-dbtns button{border:none;border-radius:999px;padding:8px 14px;font-weight:800;cursor:pointer;background:#fff;box-shadow:0 3px 0 #e0d2bc;font-size:1rem}
   .la-dbtns .la-next{background:var(--berry);color:#fff;box-shadow:0 3px 0 var(--berry-dark)}
   .la-q{display:flex;align-items:center;gap:12px;background:#fff;border:4px solid var(--sun);border-radius:20px;padding:12px 16px;margin-bottom:12px}
   .la-q p{flex:1;margin:0;font-size:1.45rem;line-height:1.8;font-weight:600}
   .la-q button{border:none;background:#fffaf0;border-radius:50%;width:44px;height:44px;font-size:1.2rem;cursor:pointer;flex:0 0 auto}
   .la-qno{background:var(--choc);color:#fff;border-radius:10px;padding:4px 10px;font-weight:800;white-space:nowrap}
   .la-blank{color:var(--berry-dark);border-bottom:3px solid var(--berry);padding:0 4px;white-space:nowrap}
   .la-blank.hit{color:var(--grass-dark);border-color:var(--grass);background:#eafbe9;border-radius:6px;animation:la-pop .5s}
   .la-stage.shoot{cursor:crosshair;max-height:68vh}
   .la-target{position:absolute;padding:10px 16px;border-radius:14px;border:3px solid #c8a84b;background:#fff8e6;color:var(--choc);font-size:clamp(1rem,2.2vw,1.35rem);font-weight:800;cursor:crosshair;box-shadow:0 6px 12px rgba(90,61,43,.3);transition:opacity .4s,transform .4s}
   .la-target.t0{left:8%;top:22%;animation:la-drift0 6s ease-in-out infinite}
   .la-target.t1{left:58%;top:30%;animation:la-drift1 7s ease-in-out infinite}
   .la-target.t2{left:20%;top:56%;animation:la-drift2 6.5s ease-in-out infinite}
   .la-target.t3{left:60%;top:62%;animation:la-drift0 7.5s ease-in-out infinite reverse}
   .la-target:hover:not(:disabled){background:#fff;border-color:var(--berry)}
   .la-target.gone{opacity:0;animation:none;transform:scale(.3) rotate(-20deg);pointer-events:none}
   .la-target.fade{opacity:.25}
   .la-target.win{background:#eafbe9;border-color:var(--grass-dark);animation:la-glow 1s infinite;opacity:1}
   .la-beam{position:absolute;height:6px;transform-origin:0 50%;background:linear-gradient(90deg,#fff6a8,#ffd84d);border-radius:6px;box-shadow:0 0 14px #ffe27a;animation:la-beam .45s ease-out forwards;pointer-events:none}
   .la-gun{position:absolute;bottom:1%;left:50%;height:24%;transform:translateX(-50%);pointer-events:none}
   .la-hint{margin:12px 0 0;background:#fffaf0;border:3px dashed #e8d8bd;border-radius:16px;padding:10px 14px;line-height:1.7;font-weight:500}
   .la-hint.on{border-color:var(--berry);background:#fff0f4}
   .la-win{display:flex;align-items:center;gap:16px;margin-top:12px;background:#fff;border:4px solid var(--grass);border-radius:20px;padding:14px 18px}
   .la-win img{width:120px;height:120px;object-fit:contain;flex:0 0 auto}
   .la-win h3{margin:0 0 4px}.la-win p{margin:4px 0;line-height:1.6}
   .la-win .btn{margin-top:8px;padding:12px 26px;font-size:1.05rem}
   .la-done{max-width:760px;margin:0 auto;text-align:center}
   .la-done h2{color:var(--choc)}
   .la-done :global(.la-sheet){text-align:left;margin:16px 0}
   .la-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
   .la-actions .btn{padding:14px 28px;font-size:1.05rem;text-decoration:none}
   @keyframes la-pulse{50%{transform:translate(-50%,-50%) scale(1.15)}}
   @keyframes la-bob{50%{transform:translate(-50%,-50%) translateY(-8%)}}
   @keyframes la-zoom{from{background-size:100%}to{background-size:130%}}
   @keyframes la-drift0{50%{transform:translate(18%,-30%) rotate(2deg)}}
   @keyframes la-drift1{50%{transform:translate(-16%,26%) rotate(-2deg)}}
   @keyframes la-drift2{50%{transform:translate(22%,18%) rotate(1deg)}}
   @keyframes la-beam{0%{opacity:1;clip-path:inset(0 100% 0 0)}60%{opacity:1;clip-path:inset(0 0 0 0)}100%{opacity:0;clip-path:inset(0 0 0 0)}}
   @keyframes la-glow{50%{box-shadow:0 0 22px #9be59b}}
   @keyframes la-pop{40%{transform:scale(1.15)}}
   @keyframes la-float{50%{transform:translateY(-10%)}}
   @media(prefers-reduced-motion:reduce){.la-target,.la-stop.now,.la-hideout,.la-moying,.la-stage.portal{animation:none!important}}
   @media(max-width:900px){.la-mapview{grid-template-columns:1fr}}
   @media(max-width:640px){
    .la-wrap{padding:10px 10px 40px}
    .la-top h1{font-size:1.1rem}
    .la-back,.la-voice{padding:6px 10px;font-size:.85rem}
    .la-dialog{margin:10px 0 0;width:100%;align-items:flex-start;flex-wrap:wrap}
    .la-face{width:52px;height:52px}
    .la-talk p{font-size:1.08rem}
    .la-dbtns{flex-direction:row;width:100%;justify-content:flex-end}
    .la-q{flex-wrap:wrap;padding:10px 12px}.la-q p{font-size:1.15rem;flex-basis:100%;order:2}
    .la-stage.shoot{aspect-ratio:3/4;max-height:62vh;min-height:320px}
    .la-target{padding:8px 10px}
    .la-target.t0{left:4%;top:24%}.la-target.t1{left:52%;top:34%}.la-target.t2{left:6%;top:50%}.la-target.t3{left:50%;top:62%}
    .la-gun{height:16%}
    .la-win{flex-direction:column;text-align:center}
   }
  `}</style>
 </>
}
