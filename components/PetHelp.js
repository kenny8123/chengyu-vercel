import {useEffect,useRef} from 'react'
export const growthTitle=xp=>xp>=1500?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
export default function PetHelp({open,onClose,profile}){
 const ref=useRef(null)
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>鼎鼎怎樣長大？</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <section><h3>照顧鼎鼎</h3><dl><dt>◈ 典故點心（餵食）</dt><dd>花 1 個點心，親密度 +5，播放吃點心動畫。</dd><dt>♡ 相知相惜（摸摸）</dt><dd>親密度 +2，鼎鼎會害羞；每天前 3 次有獎勵。</dd><dt>☾ 養精蓄銳（休息）</dt><dd>親密度 +2，鼎鼎開心充電；每天前 3 次有獎勵。</dd></dl><p>親密度到 30：熟悉的夥伴；到 100：默契知己。陪伴不增加學習經驗，也不影響測驗分數。</p></section>
 <section><h3>升級條件與作用</h3><p>每累積 100 經驗值升 1 級。你目前 {profile?.xp||0} 經驗，還差 {100-(profile?.xp||0)%100} 就升級。</p><p>升級記錄你的學習成長，並改變鼎鼎稱號：Lv.1 初遇夥伴 → Lv.2 故事學徒 → Lv.6 典故探險家 → Lv.16 成語知己。Lv.2 需累積 100 經驗，Lv.6 需 500，Lv.16 需 1500；之後每 100 經驗仍會升級。等級代表學習成長與稱號，不增加答題分數；造型另依學習進度解鎖。</p><p>所有模式必須完成整輪，才一次發放經驗和點心；中途退出或重新整理不領獎。</p><dl><dt>學習與練習</dt><dd>完成同一成語四個階段：+40 經驗、+8 點心。閱讀只保存學習紀錄。</dd><dt>自由選題／影片答題</dt><dd>完成全部 10 題：每題答對 +10 經驗、+2 點心；答錯 +2 經驗、+1 點心，最後一次結算。</dd><dt>AI 對決</dt><dd>完成全部 40 題：搶答成功每題 +10 經驗、+2 點心；其他題每題 +2 經驗、+1 點心作為完成獎勵，不會把 AI 搶答當成你的錯題。</dd></dl><p>每輪只發放一次；重新完成新一輪仍可領獎。摸摸、餵食及休息增加的是親密度。</p></section>
 <section><h3>對話學典故</h3><p>進入家中，鼎鼎會先問一個成語。直接在對話框說說想法，講中一點意思、關鍵詞或相關例子就可以，不必完整背誦；獲得肯定後親密度 +3、典故點心 +1，鼎鼎也會開心慶祝。同一成語每天只領一次。問問題不當成答錯；想暫停可說「先聊天」，說「再問我」繼續，說「換題」換個成語。</p></section><section><h3>解鎖與換造型</h3><p>先讀過該成語典故，再完成它的四個練習階段，或在挑戰中答對它兩次，就解鎖對應造型。</p><p>按「造型」→ 選已解鎖的成語 → 立即換上。灰色造型會列出還差的進度；也能選「原本的鼎鼎」。</p></section>
 </dialog>
}
