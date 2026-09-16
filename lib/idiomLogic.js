/* 純邏輯函式（不含 JSX / React），供 pages/index.js 與測試共用。
   抽題函式（buildFreeQuizQueue / buildFullRandomQueue / diagnoseQuiz）
   把成語資料表（units）當參數傳入，而不是直接讀取全域變數，方便測試時
   帶入小型假資料，不必載入整份成語內容。 */

export function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

export function drillBlanks(q,round){
  if(round===1)return [...q.blanks].slice(0,1)
  if(round===2){
    if(q.blanks.length>=2)return q.blanks.slice(0,2)
    const extra=q.blanks[0]===3?2:q.blanks[0]+1
    return shuffle([q.blanks[0],extra]).sort((a,b)=>a-b)
  }
  return [0,1,2,3]
}

export function drillTiles(q,round){
  const blanks=drillBlanks(q,round)
  const chars=q.idiom.split('')
  const answers=blanks.map(i=>chars[i])
  let opts=[...answers]

  if(round===1){
    const pool=shuffle([...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+2)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }else if(round===2){
    const pool=shuffle([...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+3)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }else if(round===3){
    opts=[...answers]
  }else{
    const pool=shuffle([...(q.hardDistract||[]),...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+4)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }
  return shuffle(opts).map((ch,k)=>({ch,tid:`d${k}`,used:false}))
}

const ROUND_WEIGHT={1:5,2:8,3:10,4:12}

/* ═══════════════════════════════════════════
   評鑒系統：抽題邏輯
   模式A「自由選題」：單一單元，10題，每題隨機分配1個階段(1~4)
   模式B「隨機40題」：橫跨全部單元，40題，每題隨機單元+隨機階段
   佇列項目格式：{unitKey, idiomIdx, round}
   ═══════════════════════════════════════════ */
export function buildFreeQuizQueue(units,unitKey){
  const idioms = units[unitKey].idioms
  return idioms.map((_,idx)=>({
    unitKey,
    idiomIdx: idx,
    round: 1+Math.floor(Math.random()*4)
  }))
}

export function buildFullRandomQueue(units){
  const pool=[]
  Object.keys(units).forEach(unitKey=>{
    units[unitKey].idioms.forEach((_,idx)=>{
      pool.push({unitKey, idiomIdx:idx})
    })
  })
  const shuffled=shuffle(pool).slice(0,40)
  return shuffled.map(item=>({...item, round:1+Math.floor(Math.random()*4)}))
}

/* 練習模式結算：依總錯誤次數給評語，並找出錯最多的階段 */
export function summarisePractice(mistakes){
  const total=[1,2,3,4].reduce((s,r)=>s+(mistakes[r]||0),0)
  // 錯最多的階段（同分時取較後面的階段，因為難度較高）
  let weakest=null,worst=0
  ;[1,2,3,4].forEach(r=>{ if((mistakes[r]||0)>=worst&&(mistakes[r]||0)>0){worst=mistakes[r];weakest=r} })
  let emoji,title,comment
  if(total===0){
    emoji='🏆';title='完美通關！'
    comment='四個階段都一次就答對，這個成語你已經記得很牢了。'
  }else if(total<=2){
    emoji='🌟';title='表現很好！'
    comment='只有少數地方卡住，再複習一下就完全掌握了。'
  }else if(total<=5){
    emoji='💪';title='繼續加油！'
    comment='有幾個字的位置還不太熟，建議回看典故，理解每個字的意思會更好記。'
  }else{
    emoji='📖';title='再練一次會更好！'
    comment='這個成語對你來說有點難度，建議先回去把典故故事讀一遍，再重新練習。'
  }
  return {total,weakest,worst,emoji,title,comment}
}

/* 通用診斷函式：answers = [{unitKey, idiomIdx, round, correct}]，題數不固定 */
export function diagnoseQuiz(units,answers){
  const total = answers.length
  let rawScore=0, maxScore=0
  const roundStats={1:{correct:0,total:0},2:{correct:0,total:0},3:{correct:0,total:0},4:{correct:0,total:0}}
  const wrongMap={} // key: `${unitKey}_${idiomIdx}` -> {count, unitKey, idiomIdx}
  answers.forEach(a=>{
    roundStats[a.round].total++
    maxScore+=ROUND_WEIGHT[a.round]
    if(a.correct){
      roundStats[a.round].correct++
      rawScore+=ROUND_WEIGHT[a.round]
    }else{
      const key=`${a.unitKey}_${a.idiomIdx}`
      if(!wrongMap[key])wrongMap[key]={count:0,rounds:[],unitKey:a.unitKey,idiomIdx:a.idiomIdx}
      wrongMap[key].count++
      wrongMap[key].rounds.push(a.round)
    }
  })
  const totalScore = maxScore?Math.round((rawScore/maxScore)*100):0
  const totalCorrect = answers.filter(a=>a.correct).length

  const topWrong = Object.values(wrongMap)
    .sort((a,b)=>b.count-a.count)
    .slice(0,5)
    .map(w=>({
      count:w.count,
      rounds:w.rounds,
      unitKey:w.unitKey,
      idiomIdx:w.idiomIdx,
      idiom:units[w.unitKey].idioms[w.idiomIdx]
    }))

  // 最弱階段：正確率最低的那個階段（有作答過、且不是全對才回報）
  let weakestRound=null, worstRate=101
  ;[1,2,3,4].forEach(r=>{
    const st=roundStats[r]
    if(!st.total)return
    const rate=(st.correct/st.total)*100
    if(rate<worstRate&&rate<100){worstRate=rate;weakestRound=r}
  })

  return {totalScore, totalCorrect, totalQuestions:total, roundStats, topWrong, weakestRound}
}
