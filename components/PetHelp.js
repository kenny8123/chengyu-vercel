import {useEffect,useRef} from 'react'
export const growthTitle=xp=>xp>=1500?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
export default function PetHelp({open,onClose,profile}){
 const ref=useRef(null)
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>鼎鼎怎樣長大？</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <section><h3>照顧鼎鼎</h3><dl><dt>◈ 餵點心</dt><dd>花 1 個點心，親密度 +5，播放吃點心動畫。</dd><dt>♡ 摸摸</dt><dd>親密度 +2，鼎鼎會害羞；每天前 3 次有獎勵。</dd><dt>☾ 休息</dt><dd>親密度 +2，鼎鼎開心充電；每天前 3 次有獎勵。</dd></dl><p>親密度到 30：熟悉的夥伴；到 100：默契知己。陪伴不增加學習經驗，也不影響測驗分數。</p></section>
 <section><h3>升級條件與作用</h3><p>每累積 100 經驗值升 1 級。你目前 {profile?.xp||0} 經驗，還差 {100-(profile?.xp||0)%100} 就升級。</p><p>升級記錄你的學習成長，並改變鼎鼎稱號：Lv.1 初遇夥伴 → Lv.2 故事學徒 → Lv.6 典故探險家 → Lv.16 成語知己。等級不代替成語造型的解鎖條件。</p><dl><dt>讀典故 20 秒</dt><dd>+5 經驗、+1 點心。</dd><dt>答對一次</dt><dd>+10 經驗、+2 點心。</dd><dt>答錯也努力</dt><dd>+2 經驗、+1 點心。</dd></dl><p>同一天、同成語、同階段與同結果，只領一次獎勵。看完影片並作答也會記入學習；AI 搶答不算你答錯。</p></section>
 <section><h3>解鎖與換造型</h3><p>先讀過該成語典故，再完成它的四個練習階段，或在挑戰中答對它兩次，就解鎖對應造型。</p><p>按「造型」→ 選已解鎖的成語 → 立即換上。灰色造型會列出還差的進度；也能選「原本的鼎鼎」。</p></section>
 </dialog>
}
