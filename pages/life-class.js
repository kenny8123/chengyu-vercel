import CompletionReward from '../components/CompletionReward'
import {recordLearning,startRewardRun,completeRewardRun} from '../components/petMemory'
import Head from 'next/head'
import {useEffect,useRef,useState} from 'react'
import {TextScaleControl} from '../components/GameControls'
import {outfitAsset} from '../components/outfitAssets'
import CATALOG from '../components/petCatalog.json'
import LIFE from '../components/lifeSentences.json'

// 生活成語小教室（設計構思：遊戲作者）
// 每單元 10 個成語：先看「例句學習」，再做「填空練習」——看圖和句子，從「成語銀行」選出適當的成語填入（　）。
const BLANK='＿＿＿＿'
const UNITS=['單元一','單元二','單元三','單元四']
const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const info=idiom=>CATALOG.find(c=>c.idiom===idiom)
const pic=idiom=>outfitAsset(idiom,'idle','large')?.still

function Sentence({text,fill,bold}){
 const [a,b]=text.split(BLANK)
 return <>{a}{bold?<strong className="lc-hl">{fill}</strong>:fill}{b}</>
}

export default function LifeClass(){
 const [unit,setUnit]=useState(0),[tab,setTab]=useState('learn'),[textScale,setTextScale]=useState('md')
 const [rows,setRows]=useState([]),[bank,setBank]=useState([]),[filled,setFilled]=useState({}),[picked,setPicked]=useState(null)
 const [checked,setChecked]=useState(false),[firstResult,setFirstResult]=useState(null),[reward,setReward]=useState(null)
 const run=useRef(null)
 const items=LIFE.slice(unit*10,unit*10+10)

 function newSheet(){
  const list=shuffle(items).map(x=>({idiom:x.idiom,text:x.sentences[1+Math.floor(Math.random()*2)],why:x.why}))
  setRows(list);setBank(shuffle(items.map(x=>x.idiom)));setFilled({});setPicked(null);setChecked(false);setFirstResult(null);setReward(null)
  run.current=startRewardRun('life')
 }
 useEffect(()=>{newSheet()},[unit])
 useEffect(()=>{if(tab==='learn')items.forEach(x=>recordLearning({idiom:x.idiom,kind:'read'}))},[tab,unit])

 const used=new Set(Object.values(filled))
 function tapBank(idiom){if(checked&&firstResult)return;if(used.has(idiom))return;setPicked(p=>p===idiom?null:idiom)}
 function tapBlank(i){
  if(checked&&rows[i].idiom===filled[i])return
  if(filled[i]){const next={...filled};delete next[i];setFilled(next);setChecked(false);return}
  if(!picked)return
  setFilled({...filled,[i]:picked});setPicked(null);setChecked(false)
 }
 const allFilled=rows.length&&rows.every((_,i)=>filled[i])
 function check(){
  setChecked(true)
  if(firstResult)return
  const answers=rows.map((r,i)=>({correct:filled[i]===r.idiom}))
  rows.forEach((r,i)=>recordLearning({idiom:r.idiom,kind:'answer',correct:filled[i]===r.idiom}))
  setFirstResult(answers);setReward(completeRewardRun(run.current,answers))
 }
 function retryWrong(){const next={};rows.forEach((r,i)=>{if(filled[i]===r.idiom)next[i]=filled[i]});setFilled(next);setChecked(false);setPicked(null)}
 const correctCount=rows.filter((r,i)=>filled[i]===r.idiom).length,firstScore=firstResult?firstResult.filter(a=>a.correct).length:0

 return <>
  <Head><title>生活成語小教室｜成語穿越者</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>
  <aside className="sidebar">
   <div className="sidebar-header">🗺️ 關卡選單</div>
   <a className="sidebar-item" href="/">📖 學習與練習</a>
   <a className="sidebar-item active" href="/?view=challenge">📝 挑戰系統</a>
  </aside>
  <div className="cloud c1"/><div className="cloud c2"/><div className="cloud c3"/>
  <TextScaleControl scale={textScale} onChange={setTextScale}/>
  <main className={`wrap lc-wrap text-scale-${textScale}`}>
   <section className="screen show">
    <div className="topbar"><a className="back-btn" href="/?view=challenge">← 選模式</a></div>
    <div className="menu-head"><h2>🏫 生活成語小教室</h2><p>先讀例句，學會成語在生活中怎樣用；再看圖和句子，從成語銀行選出適當的成語。</p></div>
    <div className="lc-units" role="tablist" aria-label="選擇單元">{UNITS.map((u,i)=><button key={u} role="tab" aria-selected={unit===i} className={`lc-unit${unit===i?' on':''}`} onClick={()=>{setUnit(i);setTab('learn')}}>{u}<small>{LIFE.slice(i*10,i*10+10).map(x=>x.idiom).slice(0,2).join('、')}…</small></button>)}</div>
    <div className="lc-tabs" role="tablist" aria-label="學習步驟">
     <button role="tab" aria-selected={tab==='learn'} className={tab==='learn'?'on':''} onClick={()=>setTab('learn')}>① 📖 例句學習</button>
     <button role="tab" aria-selected={tab==='practice'} className={tab==='practice'?'on':''} onClick={()=>setTab('practice')}>② ✏️ 填空練習</button>
    </div>

    {tab==='learn'&&<>
     <p className="lc-tip">★ 小朋友，先讀一讀每個成語的意思和生活例句，留意成語放在句子的哪個位置。讀完再到「填空練習」挑戰！</p>
     <div className="lc-learn">{items.map((x,n)=>{const c=info(x.idiom);return <article key={x.idiom} className="lc-card">
      <div className="lc-pic">{pic(x.idiom)&&<img src={pic(x.idiom)} alt={`鼎鼎・${x.idiom}`} loading="lazy"/>}</div>
      <div><h3><span className="lc-no">{unit*10+n+1}</span>{x.idiom}</h3>
       <p className="lc-mean"><b>意思：</b>{c?.meaning}</p>
       <p className="lc-ex"><b>生活例句：</b><Sentence text={x.sentences[0]} fill={x.idiom} bold/></p>
       {c?.tip&&<p className="lc-note"><b>鼎鼎提醒：</b>{c.tip}</p>}
      </div>
     </article>})}</div>
     <div className="actions"><button className="btn btn-go" onClick={()=>{setTab('practice');window.scrollTo({top:0,behavior:'smooth'})}}>讀完了，去填空練習 →</button></div>
    </>}

    {tab==='practice'&&<>
     <p className="lc-tip">★ 小朋友，請先看圖和句子，再從「成語銀行」選出適當的成語，填入（　）中。<br/><small>做法：先按成語銀行裡的成語，再按句子裡的（　）；按已填的成語可以拿走重填。</small></p>
     <div className="lc-sheet-wrap"><div className="lc-sheet">{rows.map((r,i)=>{const ok=checked&&filled[i]===r.idiom,bad=checked&&filled[i]&&filled[i]!==r.idiom;return <div key={r.idiom+i} className={`lc-row${ok?' ok':''}${bad?' bad':''}`}>
      <span className="lc-no">{i+1}</span>
      <div className="lc-pic sm">{pic(r.idiom)&&<img src={pic(r.idiom)} alt="" loading="lazy"/>}</div>
      <p className="lc-q"><Sentence text={r.text} fill={<button type="button" className={`lc-blank${filled[i]?' full':''}${picked&&!filled[i]?' ready':''}`} onClick={()=>tapBlank(i)} aria-label={filled[i]?`已填入${filled[i]}，按一下拿走`:'空格，按一下填入選好的成語'}>（{filled[i]||'　　　　'}）</button>}/>
       {ok&&<span className="lc-mark">✅</span>}{bad&&<span className="lc-mark">💡</span>}</p>
      {bad&&<p className="lc-why">再想想：{r.why}</p>}
     </div>})}</div>
     <div className="lc-bank"><div className="lc-bank-title">成語銀行</div>
      <div className="lc-bank-list">{bank.map((idiom,n)=><button key={idiom} type="button" className={`lc-chip${picked===idiom?' picked':''}${used.has(idiom)?' used':''}`} onClick={()=>tapBank(idiom)} disabled={used.has(idiom)} aria-pressed={picked===idiom}><b>{n+1}.</b>{idiom}</button>)}</div>
     </div></div>
     <div className="actions">
      <button className="btn btn-go" onClick={check} disabled={!allFilled}>{firstResult?'再對一次答案':'對答案 ✓'}</button>
      {checked&&correctCount<rows.length&&<button className="btn btn-ghost" onClick={retryWrong}>拿走錯的，再試一次</button>}
      <button className="btn btn-ghost" onClick={newSheet}>換一張學習單</button>
     </div>
     {firstResult&&<div className="card lc-result" role="status">
      <h3>{correctCount===rows.length?'🎉 全部填對了！':`答對 ${correctCount} / 10 題`}</h3>
      <p>第一次對答案：答對 {firstScore} 題。{correctCount<rows.length?'按「拿走錯的，再試一次」，看看提示再填。':'試試用今天學到的成語，說一件自己生活裡的事。'}</p>
     </div>}
     <CompletionReward reward={reward}/>
    </>}
   </section>
  </main>
  <style jsx>{`
   a{text-decoration:none}.sidebar-item{display:block}.lc-wrap{padding-top:76px;padding-bottom:60px}
   .menu-head p{max-width:720px;margin:8px auto 0;line-height:1.8}
   .lc-units{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:22px 0 14px}
   .lc-unit{background:#fff;border:3px solid #e0d2bc;border-radius:18px;padding:10px 8px;font:700 1.05em 'Noto Sans TC',sans-serif;color:var(--choc);cursor:pointer;display:flex;flex-direction:column;gap:4px;box-shadow:0 4px 0 #e0d2bc}
   .lc-unit small{font-weight:400;font-size:.75em;color:var(--choc-soft)}.lc-unit.on{border-color:var(--grass);background:#eef8ea;box-shadow:0 4px 0 var(--grass)}
   .lc-tabs{display:flex;gap:10px;justify-content:center;margin:10px 0 18px;flex-wrap:wrap}
   .lc-tabs button{border:3px solid #e0d2bc;background:#fffaf0;border-radius:999px;padding:10px 22px;font:700 1.05em 'Noto Sans TC',sans-serif;color:var(--choc);cursor:pointer}
   .lc-tabs button.on{background:var(--berry);border-color:var(--berry-dark);color:#fff}
   .lc-tip{background:#fff3cd;border:2px dashed var(--sun);border-radius:16px;padding:14px 18px;line-height:1.8;margin-bottom:18px}.lc-tip small{color:var(--choc-soft)}
   .lc-learn{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
   .lc-card{display:grid;grid-template-columns:110px 1fr;gap:14px;background:#fff;border:3px solid #ead9bd;border-radius:22px;padding:14px 16px;align-items:start}
   .lc-card h3{font-size:1.45em;margin:2px 0 8px;display:flex;align-items:center;gap:10px}
   .lc-card p{line-height:1.8;margin:6px 0}.lc-ex{background:#f3f9ef;border-radius:12px;padding:8px 12px}.lc-note{color:var(--choc-soft);font-size:.95em}
   :global(.lc-hl){color:var(--berry-dark);background:#ffe6ee;border-radius:6px;padding:0 4px}
   .lc-pic{width:110px;height:110px;border-radius:16px;background:#fff7e6;display:grid;place-items:center;overflow:hidden}.lc-pic img{width:100%;height:100%;object-fit:contain}.lc-pic.sm{width:84px;height:84px}
   .lc-no{display:inline-grid;place-items:center;min-width:30px;height:30px;border-radius:8px;background:var(--choc);color:#fff;font-size:.8em;font-weight:700}
   .lc-sheet{background:#fff;border:3px solid #ead9bd;border-radius:22px;overflow:hidden}
   .lc-row{display:grid;grid-template-columns:34px 84px 1fr;gap:14px;align-items:center;padding:12px 16px;border-bottom:2px solid #f0e4cf}.lc-row:last-child{border-bottom:0}
   .lc-row.ok{background:#eef8ea}.lc-row.bad{background:#fff4e2}
   .lc-q{line-height:2.1;font-size:1.08em;margin:0}.lc-mark{margin-left:6px}
   .lc-why{grid-column:2/-1;margin:0;color:var(--choc-soft);font-size:.95em;line-height:1.7}
   .lc-blank{font:inherit;font-weight:700;border:0;border-bottom:3px solid var(--choc-soft);background:transparent;color:var(--berry-dark);padding:0 4px;cursor:pointer;border-radius:6px 6px 0 0}
   .lc-blank.ready{background:#fff0f4;animation:lc-pulse 1.2s ease-in-out infinite}.lc-blank.full{background:#ffe6ee}
   @keyframes lc-pulse{50%{background:#ffd3e0}}
   .lc-bank{margin-top:20px;background:#fffaf0;border:3px dashed var(--choc-soft);border-radius:22px;padding:14px 16px}
   .lc-bank-title{text-align:center;font-weight:700;font-size:1.15em;margin-bottom:10px}
   .lc-bank-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
   .lc-chip{display:flex;gap:6px;align-items:center;justify-content:center;background:#fff;border:3px solid #e0d2bc;border-radius:14px;padding:10px 6px;font:700 1.05em 'Noto Sans TC',sans-serif;color:var(--choc);cursor:pointer;box-shadow:0 4px 0 #e0d2bc}
   .lc-chip b{color:var(--choc-soft);font-size:.85em}.lc-chip.picked{background:var(--berry);border-color:var(--berry-dark);color:#fff;box-shadow:0 4px 0 var(--berry-dark)}.lc-chip.picked b{color:#fff}
   .lc-chip.used{opacity:.35;cursor:default;text-decoration:line-through}
   .actions{display:flex;justify-content:center;flex-wrap:wrap;gap:14px;margin-top:22px}.lc-result{text-align:center;margin-top:20px}.lc-result p{line-height:1.8}
   button:focus-visible,a:focus-visible{outline:3px solid var(--grape);outline-offset:3px}
   @media(prefers-reduced-motion:reduce){.lc-blank.ready{animation:none}}
   @media(max-width:900px){.lc-learn{grid-template-columns:1fr}.lc-bank-list{grid-template-columns:repeat(3,minmax(0,1fr))}}
   @media(max-width:600px){.lc-wrap{padding-top:12px;padding-bottom:100px}.lc-units{grid-template-columns:repeat(2,minmax(0,1fr))}.lc-card{grid-template-columns:80px 1fr}.lc-pic{width:80px;height:80px}
    .lc-row{grid-template-columns:28px 64px 1fr;gap:10px;padding:10px 12px}.lc-pic.sm{width:64px;height:64px}.lc-bank{position:sticky;bottom:8px;z-index:5;margin-top:14px;padding:8px 10px;box-shadow:0 6px 18px rgba(80,50,20,.25)}.lc-bank-title{font-size:1em;margin-bottom:6px}.lc-bank-list{display:flex;overflow-x:auto;gap:8px;padding-bottom:4px;scroll-snap-type:x proximity}.lc-chip{flex:0 0 auto;scroll-snap-align:start}.actions .btn{width:100%;text-align:center}}
  `}</style>
 </>
}
