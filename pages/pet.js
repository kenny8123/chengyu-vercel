import Head from 'next/head'
import PetChat from '../components/PetChat'
import {useState} from 'react'
import {PetLook} from '../components/GameControls'
import usePet from '../components/usePet'
import CATALOG from '../components/petCatalog.json'
import {makeProfile,switchProfile,wearOutfit,unlocked,nextReminder,savePet,readPet,careForPet} from '../components/petMemory'

export default function PetHome(){
 const store=usePet(),[name,setName]=useState(''),[message,setMessage]=useState(''),[filter,setFilter]=useState('all'),[error,setError]=useState(''),[mood,setMood]=useState('happy')
 const p=store?.profiles[store.active],owned=CATALOG.filter(c=>unlocked(p?.lessons[c.idiom]))
 function remind(){const x=readPet(),r=nextReminder(x.profiles[x.active],CATALOG);x.profiles[x.active]=r.profile;savePet(x);setMessage(r.text)}
 function equip(id){setError(wearOutfit(id)?'':'無法儲存造型，請確認瀏覽器允許儲存資料。')}
 return <><Head><title>鼎鼎的家｜成語穿越者</title></Head><main className="pet-home">
 <nav><a className="back-btn" href="/?view=challenge">← 挑戰系統</a><a className="back-btn" href="/">去學習典故</a></nav>
 <header><p>一起學習，一起長大</p><h1>鼎鼎的家</h1><p>你學會的每個故事，都會成為我的新模樣。</p></header>
 {!p?<p role="status">正在整理學習記憶…</p>:<>
 <section className="pet-nest">
 <div className="pet-stage"><PetLook size={180} mood={mood} outfit={p.outfit}/><strong>Lv. {Math.floor(p.xp/100)+1} · {p.xp<100?'初遇夥伴':p.xp<500?'故事學徒':p.xp<1500?'典故探險家':'成語知己'}</strong><span>{p.outfit?`${p.outfit}造型`:'最初的鼎鼎'}</span></div>
 <div className="pet-growth"><h2>{p.name}的旅程</h2><p>已累積 {p.xp} 經驗值，收集 {owned.length} / 40 套典故造型。</p><progress aria-label="升級進度" max="100" value={p.xp%100}/><p>再獲得 {100-p.xp%100} 經驗值就升級。</p><p>讀典故 20 秒 +5；答對 +10；答錯也有努力獎勵 +2。同一天、同成語、同階段與結果只獎勵一次。</p><p>學習能獲得知識點心，親手餵鼎鼎能增加親密度。休息不會讓進度倒退。</p><button className="btn btn-go" onClick={remind}>鼎鼎，聊聊上次的學習</button><button className="btn btn-ghost" onClick={()=>equip(null)}>換回原本造型</button></div>
 </section>
 <section className="pet-letter"><h2>照顧你的鼎鼎</h2><p>🍪 知識點心 {p.food||0} 個　♥ 親密度 {p.bond||0} · {(p.bond||0)<30?'剛認識的朋友':(p.bond||0)<100?'熟悉的夥伴':'默契十足的知己'}</p><div className="pet-care-actions"><button className="btn btn-go" disabled={!p.food} onClick={()=>{setMessage(careForPet('feed'));setMood('celebrate')}}>餵一個知識點心</button><button className="back-btn" onClick={()=>{setMessage(careForPet('pat'));setMood('happy')}}>摸摸鼎鼎</button><button className="back-btn" onClick={()=>{setMessage(careForPet('rest'));setMood('idle')}}>陪他休息</button></div><p>每次獲得學習獎勵，也會得到點心：讀典故或努力作答 1 個，答對 2 個。摸摸和休息每天各有 3 次親密度獎勵；休息不扣進度。</p></section>
 {message&&<section className="pet-letter" aria-live="polite"><h2>鼎鼎想和你說</h2><p>{message}</p></section>}
 <section className="pet-profile"><h2>這次是誰來學習？</h2><label>學生檔案 <select value={store.active} onChange={e=>{switchProfile(e.target.value);setMessage('')}}>{Object.entries(store.profiles).map(([id,v])=><option key={id} value={id}>{v.name}</option>)}</select></label><form onSubmit={e=>{e.preventDefault();if(name.trim()){if(makeProfile(name)){setName('');setMessage('')}else setError('無法儲存學生檔案。')}}}><label>新同學的暱稱 <input maxLength={24} required value={name} onChange={e=>setName(e.target.value)} placeholder="例如：小晴"/></label><button className="back-btn">新增學習檔案</button></form><p>記憶保存在這台裝置的此瀏覽器。共用電腦時先切換檔案；目前不會跨裝置同步。</p></section>
 <PetChat/>
 {error&&<p role="alert">{error}</p>}
 <section><div className="pet-collection-head"><div><h2>40 個故事，40 套典故造型</h2><p>像素鼎鼎搭配每個故事的主題徽章、帽飾與披風配色。</p><p>解鎖：讀過典故，並完成四階段練習，或在挑戰中答對這個成語兩次。</p></div><label>顯示 <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">全部造型</option><option value="owned">已解鎖</option><option value="learning">學習中</option></select></label></div>
 <div className="pet-collection">{CATALOG.filter(c=>filter==='all'||(filter==='owned'?unlocked(p.lessons[c.idiom]):p.lessons[c.idiom]&&!unlocked(p.lessons[c.idiom]))).map(c=>{const l=p.lessons[c.idiom],ready=unlocked(l);return <article key={c.id} className={`pet-costume ${ready?'owned':''}`}><PetLook size={100} outfit={c.idiom} mood={ready?'happy':'idle'}/><h3>{c.idiom}</h3><p>{c.meaning}</p><small>{l?.read?'✓ 已讀典故':'○ 讀典故 20 秒'}<br/>練習 {Object.keys(l?.stages||{}).length}/4 階段 · 挑戰答對 {Math.min(2,l?.challengeCorrect||0)}/2 次</small><button className="back-btn" disabled={!ready} onClick={()=>equip(c.idiom)}>{p.outfit===c.idiom?'正在陪伴你':ready?'換上這套':'尚未解鎖'}</button></article>})}</div>
 {filter==='owned'&&!owned.length&&<p>先選一個喜歡的典故，和鼎鼎開始第一段旅程吧。</p>}</section>
 <section className="pet-letter"><h2>最近的學習足跡</h2>{p.history.length?<ul>{p.history.slice(0,8).map((e,i)=><li key={i}>{e.idiom} · {e.kind==='read'?'讀過典故':e.correct?'答對了':'值得再練習'} · {new Date(e.at).toLocaleDateString('zh-TW')}</li>)}</ul>:<p>還沒有紀錄。開始學習後，鼎鼎會記住你走過的每一步。</p>}</section>
 </>}
 </main></>
}
