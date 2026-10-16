import {useEffect,useRef} from 'react'
import CATALOG from './petCatalog.json'
export const growthTitle=xp=>xp>=1500?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
export default function PetHelp({open,onClose}){
 const ref=useRef(null)
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>養成說明</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <section><h3>★ 經驗值是甚麼？</h3><ul><li>經驗值記錄你完成練習與挑戰的成果，用來提升等級、取得稱號。</li><li>經驗值與親密度分開累積：經驗值管等級與稱號；親密度管造型。</li></ul></section>
 <section><h3>如何獲得經驗值與點心？</h3><ul><li>練習：完成同一成語的 4 個階段後，才一起發獎勵。</li><li>隨機選題：完成一輪 10 題後發獎勵。</li><li>影片答題：完成一輪 10 題後發獎勵。</li><li>AI 對決：完成一輪 40 題後發獎勵。</li><li>每題答對：10 經驗值、2 點心。每題答錯：2 經驗值、1 點心。</li><li>AI 對決以你搶答成功為答對；沒有搶答成功的題目，仍有 2 經驗值、1 點心。</li><li>例如：10 題答對 6 題、答錯 4 題，完成整輪可得 68 經驗值、16 點心。</li><li>中途離開、只看教材或尚未做完整輪，不會先發經驗值與點心；同一輪完成紀錄不會重複領取。</li></ul></section>
 <section><h3>如何升級？有甚麼稱號？</h3><ul><li>初始為 Lv. 1；每累積 100 經驗值，自動升 1 級，不需要按領取。</li><li>0–99 經驗值：Lv. 1，稱號「初遇夥伴」。</li><li>100–499 經驗值：Lv. 2–5，稱號「故事學徒」。</li><li>500–1499 經驗值：Lv. 6–15，稱號「典故探險家」。</li><li>1500 經驗值以上：Lv. 16 起，稱號「成語知己」。</li><li>1500 之後仍然每 100 經驗升 1 級，目前最高稱號維持「成語知己」。</li><li>例如：累積 230 經驗值是 Lv. 3，再得 70 經驗值就升 Lv. 4。</li><li>升級不扣掉累積經驗值；頁面會顯示距離下一級還差多少。</li></ul></section>
 <section><h3>♥ 親密度是甚麼？如何獲得？</h3><ul><li>親密度代表你和鼎鼎的默契，用來解鎖典故造型，不會轉換成經驗值。</li><li>典故點心：每次花 1 點心，親密度 +5；有點心就能餵。</li><li>相知相惜（摸摸）：每次親密度 +2，每天前 3 次有獎勵，最多 +6。</li><li>養精蓄銳（休息）：每次親密度 +2，每天前 3 次有獎勵，最多 +6。</li><li>摸摸與休息的次數分開計算；超過次數仍可互動，但不再增加親密度，隔天重新計算。</li><li>聊天回答典故：只要答中一點重點並獲鼎鼎判定答對，就可得親密度 +3、點心 +1，不增加經驗值。</li><li>同一成語的聊天獎勵，每天限領一次；當天改答其他成語仍可獲獎勵。</li><li>例如：餵 1 次點心、摸摸 1 次、休息 1 次，再答對 1 個未領獎的成語，共增加 12 親密度。</li><li>0–29 親密度顯示「新朋友」；30–99 顯示「熟悉夥伴」；100 以上顯示「默契知己」。這是關係標籤，造型仍按每 20 親密度解鎖。</li></ul></section>
 <section><h3>如何解鎖與切換造型？</h3><ul><li>初始鼎鼎一開始就能使用，不需要親密度。</li><li>每累積 20 親密度，按成語順序解鎖 1 套：20 解鎖第 1 套、40 解鎖第 2 套、60 解鎖第 3 套。</li><li>200 親密度共有 10 套；400 有 20 套；600 有 30 套；800 集齊 40 套。</li><li>按「造型」→ 選擇已解鎖造型 → 即可換上；未解鎖的項目會顯示還差多少親密度。</li><li>換造型不扣親密度，可隨時換回「原本的鼎鼎」；舊版本已解鎖的造型也會保留。</li></ul>
 <details><summary>查看全部 40 套造型的親密度門檻</summary><ul>{CATALOG.map((c,i)=><li key={c.id}>{(i+1)*20} 親密度：第 {i+1} 套「{c.idiom}」。</li>)}</ul></details></section>
 </dialog>
}
