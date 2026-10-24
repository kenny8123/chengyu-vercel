import Head from 'next/head'
import {useEffect,useState} from 'react'
import {readStudentId,setStudentId,readLog,clearLog,logCsv} from '../components/researchLog'

// 老師數據頁（P11）：設定呢部機的學生編號、睇記錄數量、匯出 CSV
// 數據只喺呢部機的瀏覽器；每部機要分開匯出
export default function Teacher(){
 const [sid,setSid]=useState(''),[saved,setSaved]=useState(''),[rows,setRows]=useState([])
 useEffect(()=>{const s=readStudentId();setSid(s);setSaved(s);setRows(readLog())},[])
 function saveSid(){const s=sid.trim();setStudentId(s);setSaved(s)}
 function download(){
  const blob=new Blob([logCsv(rows)],{type:'text/csv;charset=utf-8'}),a=document.createElement('a')
  a.href=URL.createObjectURL(blob);a.download=`成語穿越者數據_${saved||'未設編號'}_${new Date().toISOString().slice(0,10)}.csv`;a.click()
  setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 function wipe(){if(!window.confirm('清除呢部機所有記錄？請先匯出 CSV，清除後無法復原。'))return;clearLog();setRows([])}
 const students=[...new Set(rows.map(r=>r.sid||'（未設編號）'))]
 const firstTry=rows.filter(r=>r.attempt===1&&!r.replay)

 return <main className="tc-wrap">
  <Head><title>成語穿越者・老師數據</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>
  <h1>📋 老師數據頁</h1>
  <p className="tc-note">地圖冒險每射一次都會記錄（揀咗邊個選項、啱唔啱、第幾次射）。數據只存喺<b>呢部機</b>，唔會上傳；每部機要分開匯出。</p>

  <section className="tc-box">
   <h2>1. 學生編號</h2>
   <p>請用編號（例如 S01），<b>唔好用真名</b>。換學生用呢部機時，先改編號再開始。</p>
   <div className="tc-row">
    <input value={sid} onChange={e=>setSid(e.target.value)} placeholder="例如 S01" maxLength={20} aria-label="學生編號"/>
    <button onClick={saveSid}>儲存</button>
   </div>
   <p>而家嘅編號：<b>{saved||'（未設定）'}</b></p>
  </section>

  <section className="tc-box">
   <h2>2. 記錄</h2>
   <p>共 <b>{rows.length}</b> 行記錄；學生：{students.length?students.join('、'):'（未有）'}</p>
   <p>第一次射（唔計重玩）：{firstTry.length} 題，答啱 {firstTry.filter(r=>r.correct).length} 題</p>
   <div className="tc-row">
    <button onClick={download} disabled={!rows.length}>⬇️ 匯出 CSV</button>
    <button className="ghost" onClick={wipe} disabled={!rows.length}>清除記錄</button>
   </div>
  </section>

  <p><a href="/life-adventure">← 去地圖冒險</a></p>

  <style jsx>{`
   .tc-wrap{max-width:720px;margin:0 auto;padding:20px 16px 60px;line-height:1.7}
   h1{margin:0 0 8px}
   h2{margin:0 0 6px;font-size:1.15rem}
   .tc-note{background:#fffaf0;border:2px dashed #f0b93a;border-radius:12px;padding:10px 14px}
   .tc-box{background:#fff;border:2px solid #e8d8bd;border-radius:14px;padding:12px 16px;margin:14px 0}
   .tc-row{display:flex;gap:10px;flex-wrap:wrap}
   input{flex:1;min-width:140px;font-size:1rem;padding:8px 12px;border:2px solid #e8d8bd;border-radius:10px}
   button{font-size:1rem;font-weight:700;padding:8px 16px;border-radius:10px;border:2px solid #d39a22;background:#ffd76a;cursor:pointer}
   button.ghost{background:#fff;border-color:#e8d8bd}
   button:disabled{opacity:.5;cursor:not-allowed}
  `}</style>
 </main>
}
