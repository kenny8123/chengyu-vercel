// 研究數據記錄（P11）：地圖冒險每射一次就記一行——學生編號、揀咗邊個選項、啱唔啱、第幾次射
// 只存喺呢部機的瀏覽器（localStorage），唔會上傳；老師喺 /teacher 頁匯出 CSV
// 學生只用編號（例如 S01），唔好用真名
const LOG_KEY='chengyu-research-log-v1'
const SID_KEY='chengyu-student-id'

export function readStudentId(){try{return localStorage.getItem(SID_KEY)||''}catch{return ''}}
export function setStudentId(id){try{localStorage.setItem(SID_KEY,id)}catch{}}
export function readLog(){try{return JSON.parse(localStorage.getItem(LOG_KEY))||[]}catch{return []}}
export function clearLog(){try{localStorage.removeItem(LOG_KEY)}catch{}}

// row：{mode,unit,station,idiom,chosen,correct,attempt,replay}
export function logShot(row){
 try{const list=readLog();list.push({sid:readStudentId(),time:new Date().toISOString(),...row});localStorage.setItem(LOG_KEY,JSON.stringify(list))}catch{}
}

const COLS=[['sid','學生編號'],['time','時間'],['mode','模式'],['unit','單元'],['station','站號／題號'],['idiom','正確成語'],['chosen','學生揀的選項'],['correct','答啱(1/0)'],['attempt','第幾次射'],['replay','重玩(1/0)']]
const cell=v=>{const s=v===true?'1':v===false?'0':v==null?'':String(v);return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
export function logCsv(list=readLog()){
 // 開頭加 BOM，Excel 打開先唔會變亂碼
 return '﻿'+[COLS.map(c=>c[1]).join(','),...list.map(r=>COLS.map(([k])=>cell(r[k])).join(','))].join('\r\n')
}
