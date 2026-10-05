import Head from 'next/head'
import {useEffect,useRef,useState} from 'react'
import {Guide,TextScaleControl} from '../components/GameControls'
import COMPARISONS from '../components/videoComparisons.json'

const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

export default function VideoChallenge(){
 const [lessons,setLessons]=useState([]),[error,setError]=useState('')
 const [round,setRound]=useState(null),[index,setIndex]=useState(0),[answers,setAnswers]=useState([])
 const [choice,setChoice]=useState(null),[watched,setWatched]=useState(false),[finished,setFinished]=useState(false)
 const [videoError,setVideoError]=useState(false),[guideOpen,setGuideOpen]=useState(false),[textScale,setTextScale]=useState('md')
 const video=useRef(null),furthest=useRef(0)
 useEffect(()=>{fetch('/video-lessons.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(setLessons).catch(()=>setError('教材載入失敗，請重新整理頁面。'))},[])
 useEffect(()=>{if(lessons.length===40)start()},[lessons])
 const current=round?.[index],playing=!!round&&!finished
 const score=answers.filter(x=>x.choice===x.item.id).length
 const guideTip=finished?'比較每個選項的意思，找出適合的情境，再試著用成語造句。':playing?'先看完影片，再比較四個選項。留意成語的意思與用法，不用背人名或年代！':'從 40 個成語隨機抽出 10 題。看故事、找線索，再挑戰你的成語判斷力！'
 function start(){
  if(lessons.length!==40)return
  setRound(shuffle(lessons).slice(0,10).map(item=>({item,options:shuffle([item,...COMPARISONS[item.id-1].map(id=>lessons.find(x=>x.id===id))])})))
  setIndex(0);setAnswers([]);setChoice(null);setWatched(false);setFinished(false);setVideoError(false);setGuideOpen(false);furthest.current=0
 }
 function submit(){
  if(!watched||choice===null)return
  setAnswers([...answers,{...current,choice}])
  if(index===9)setFinished(true)
  else{setIndex(index+1);setChoice(null);setWatched(false);setVideoError(false);furthest.current=0}
 }
 return <>
  <Head><title>影片答題｜成語穿越者</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>
  <aside className="sidebar">
   <div className="sidebar-header">🗺️ 關卡選單</div>
   {playing?<p className="sidebar-notice">🎬 影片答題進行中<br/>完成測驗後可切換其他模式</p>:<>
    <a className="sidebar-item" href="/">📖 學習與練習</a>
    <a className="sidebar-item active" href="/?view=challenge">📝 挑戰系統</a>
   </>}
  </aside>
  <div className="cloud c1"/><div className="cloud c2"/><div className="cloud c3"/>
  <TextScaleControl scale={textScale} onChange={setTextScale}/>
  <Guide mood={finished?(score>=6?'celebrate':'sad'):playing?'thinking':'idle'} tip={guideTip} open={guideOpen} onToggle={()=>setGuideOpen(v=>!v)}/>
  <main className={`wrap video-wrap text-scale-${textScale}`}>
   <section className="screen show">
    {!playing&&<div className="topbar"><a className="back-btn" href="/?view=challenge">← 選模式</a></div>}
    {!round&&<div className="card" role={error?'alert':'status'}><p>{error||'正在抽出 10 題並載入影片…'}</p></div>}
    {playing&&<>
     <div className="topbar quiz-topbar">
      <div className="score-pill">🎬 影片答題</div>
      <div className="progressbar" role="progressbar" aria-label="已完成題數" aria-valuemin={0} aria-valuemax={10} aria-valuenow={index}>
       {round.map((q,i)=><span key={q.item.id} className={`pb-step${i<index?' done':i===index?' active':''}`}>{i+1}</span>)}
      </div>
     </div>
     <div className="card">
      <div className="level-banner">第 {index+1} 題・{watched?'比較成語，選出答案':'觀看故事，找出線索'}</div>
      <video key={current.item.id} ref={video} controls playsInline preload="metadata" poster={current.item.video.replace('.mp4','.jpg')} src={current.item.video}
       onError={()=>setVideoError(true)}
       onRateChange={e=>{if(e.currentTarget.playbackRate!==1)e.currentTarget.playbackRate=1}}
       onSeeking={e=>{if(!watched&&e.currentTarget.currentTime>furthest.current+1)e.currentTarget.currentTime=furthest.current}}
       onTimeUpdate={e=>{const v=e.currentTarget;if(!v.seeking&&v.played.length)furthest.current=Math.max(furthest.current,v.played.end(v.played.length-1))}}
       onEnded={e=>{const v=e.currentTarget;let viewed=0;for(let i=0;i<v.played.length;i++)viewed+=v.played.end(i)-v.played.start(i);if(viewed>=v.duration-.6)setWatched(true)}}/>
      {videoError&&<p role="alert">影片載入失敗。<button className="back-btn" onClick={()=>{setVideoError(false);video.current?.load()}}>重新載入影片</button></p>}
      {!watched&&<p className="watch-note">▶ 按下播放，看完影片後就能回答。可以暫停閱讀字幕。</p>}
      {watched&&<fieldset>
       <legend>比較四個成語，哪一個最符合影片線索與下面的情境？</legend>
       <p className="scenario">{current.item.challengeExample||current.item.example}</p>
       <div className="options">{current.options.map((x,i)=><button key={x.id} className={`option${choice===x.id?' selected':''}`} aria-pressed={choice===x.id} onClick={()=>setChoice(x.id)}><b>{'ABCD'[i]}</b>{x.idiom}</button>)}</div>
       <div className="actions"><button className="btn btn-go" onClick={submit} disabled={choice===null}>{index===9?'查看學習回饋 →':'下一題 →'}</button></div>
      </fieldset>}
     </div>
    </>}
    {finished&&<>
     <div className="menu-head"><h2>🎉 挑戰完成！</h2><p>看看哪些成語學會了，哪些還可以再練習</p></div>
     <div className="card results-card"><div className="level-banner">影片答題・學習回饋</div><h3 className="result-score">{score*10}<span> 分</span></h3><p>答對 {score} / 10 題</p><p>{score===10?'全部答對！試著選一個成語造句，活用在生活裡。':`有 ${10-score} 個成語值得再練習。比較選項的意思，找出判斷關鍵。`}</p><div className="actions"><button className="btn btn-go" onClick={start}>再隨機挑戰 10 題</button><a className="btn btn-ghost" href="/?view=challenge">返回挑戰系統</a></div></div>
     {answers.map((a,n)=>{const correct=a.choice===a.item.id,selected=lessons.find(x=>x.id===a.choice);return <article key={a.item.id} className={`card review ${correct?'correct':'incorrect'}`}>
      <div className="review-status">{correct?'✅ 答對':'💡 再學一次'}・第 {n+1} 題</div><h3>{a.item.idiom}</h3>
      <p className="scenario">{a.item.challengeExample||a.item.example}</p><p>你的答案：{selected.idiom}</p>{!correct&&<p><strong>正確答案：{a.item.idiom}</strong></p>}
      <p><strong>成語知識：</strong>{a.item.meaning}</p><p><strong>{correct?'用法提醒':'錯誤釐清'}：</strong>{a.item.tip}</p>
      {!correct&&<p>你選擇的「{selected.idiom}」是指：{selected.meaning}請比較兩者適用的情境。</p>}
      <p><strong>生活運用：</strong>{a.item.example}</p>
      <details open={!correct}><summary>四個選項差在哪裡？</summary><ul>{a.options.map(option=><li key={option.id}><strong>{option.idiom}{option.id===a.item.id?'（本題答案）':''}</strong>：{option.meaning}</li>)}</ul></details>
      <details><summary>重看典故與影片</summary><p>{a.item.kidStory}</p><video controls playsInline preload="none" src={a.item.video}/><div className="download-row"><a className="back-btn" href={a.item.video} download={`故事-${String(a.item.id).padStart(2,'0')}.mp4`}>↓ 下載影片</a><a className="back-btn" href={a.item.video.replace('.mp4','.srt')} download={`故事-${String(a.item.id).padStart(2,'0')}.srt`}>↓ 下載字幕</a></div></details>
     </article>})}
    </>}
   </section>
  </main>
  <style jsx>{`
   a{text-decoration:none}.sidebar-item{display:block}.sidebar-notice{margin:16px 12px;font-size:.8rem;color:var(--gold-dim);text-align:center;line-height:1.6}
   .video-wrap{padding-top:76px}.random-card{font-family:inherit;width:100%}.random-card:disabled{opacity:.55;cursor:wait}.random-card:disabled:hover{transform:none}
   .intro-note{margin-top:34px;max-width:760px}.intro-note h3{margin-bottom:12px}p{line-height:1.8}p+p{margin-top:12px}.load-error{text-align:center;margin-top:16px;color:var(--berry-dark)}
   video{display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:#2a2217;border:4px solid #fff;border-radius:22px;box-shadow:0 8px 20px rgba(90,61,43,.15)}
   .watch-note{margin-top:18px;padding:16px 20px;background:#fff3cd;border:2px dashed var(--sun);border-radius:18px;color:var(--choc-soft)}
   fieldset{border:0;padding:24px 0 0;min-width:0}legend{font-size:1.15em;font-weight:700;line-height:1.8;float:left;width:100%;margin-bottom:14px}fieldset::after{content:'';display:block;clear:both}
   .scenario{clear:both;background:#fff;border:3px solid var(--sun);border-radius:20px;padding:20px 24px;line-height:1.9;font-size:1.1em;margin:14px 0 20px}
   .options{display:grid;grid-template-columns:1fr 1fr;gap:16px}.option{display:flex;align-items:center;gap:14px;background:#fff;border:3px solid #e0d2bc;border-radius:18px;padding:16px 20px;font:700 1.1em 'Noto Sans TC',sans-serif;color:var(--choc);cursor:pointer;box-shadow:0 5px 0 #e0d2bc;transition:transform .15s,border-color .15s}
   .option:hover{transform:translateY(-3px);border-color:var(--grass)}.option b{display:grid;place-items:center;flex-shrink:0;background:var(--cream);border-radius:10px;width:34px;height:34px;color:var(--choc-soft)}.option.selected{background:#fff0f4;border-color:var(--berry);box-shadow:0 5px 0 var(--berry-dark)}.option.selected b{background:var(--berry);color:#fff}
   .actions{display:flex;justify-content:center;flex-wrap:wrap;gap:18px;margin-top:28px}.results-card{text-align:center;margin-top:24px}.result-score{font-family:'Baloo 2','Noto Sans TC',cursive;font-size:4rem;color:var(--berry-dark)}.result-score span{font-size:1.3rem}
   .review{margin-top:30px;border-top:5px solid var(--grass)}.review.incorrect{border-top-color:var(--sun)}.review h3{font-size:1.65em;margin:12px 0}.review-status{font-weight:700;color:var(--choc-soft)}.review p{margin:12px 0}.review .scenario{font-size:1em}details{margin-top:18px;background:#fff;border-radius:16px;padding:14px 18px}summary{font-weight:700;cursor:pointer;color:var(--choc)}ul{padding-left:24px}li{margin-top:12px;line-height:1.8}.download-row{display:flex;flex-wrap:wrap;gap:12px;margin:20px 0 6px}
   button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid var(--grape);outline-offset:4px}.quiz-topbar{align-items:stretch}.progressbar{min-width:0}
   @media(max-width:600px){.video-wrap{padding-top:12px;padding-bottom:100px}.quiz-topbar{flex-wrap:wrap}.progressbar{flex-basis:100%}.options{grid-template-columns:1fr}.option{padding:13px 16px}.scenario{padding:16px}.actions .btn{font-size:1rem;padding:15px 22px;width:100%;text-align:center}.card{padding:18px 16px 24px}legend{font-size:1.05em}.intro-note{margin-top:28px}}
  `}</style>
 </>
}
