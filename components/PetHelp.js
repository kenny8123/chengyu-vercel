import {useEffect,useRef} from 'react'
import CATALOG from './petCatalog.json'
export const growthTitle=xp=>xp>=1500?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
function Table({title,heads,rows,className=""}){return <div className="dd-help-table"><table className={className}><caption>{title}</caption><thead><tr>{heads.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((v,j)=>j===0?<th scope="row" key={j}>{v}</th>:<td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
export default function PetHelp({open,onClose,profile}){
 const ref=useRef(null),xp=profile?.xp||0,bond=profile?.bond||0,level=Math.floor(xp/100)+1
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>養成說明</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <p className="dd-help-current"><strong>目前：Lv. {level} · 累積 {xp} 經驗值</strong><br/>再得 <strong>{100-xp%100} 經驗值</strong>，就升到 Lv. {level+1}。<br/>親密度：{bond}／800（40 套造型門檻）</p>
 <section><h3>📚 做題目</h3><ul>
  <li>練習：通過全部 4 階段 → <strong>40 經驗、8 點心</strong>。</li>
  <li>其他模式：答對 10 經驗、2 點心；答錯 2 經驗、1 點心。</li>
  <li>做完整輪才有獎勵。</li></ul></section>
 <section><h3>💗 親密度</h3><ul>
  <li>做題目<strong>不會</strong>加親密度。</li>
  <li>餵 1 顆點心 → <strong>+5 親密度</strong>（8 顆全部餵完 = +40）。</li>
  <li>摸摸、休息：每次 +2，<strong>各自每日最多 3 次</strong>。</li>
  <li>聊天：答中一點重點，鼎鼎判定答對 → +3 親密度、+1 點心。</li></ul></section>
 <section><h3>⭐ 升級</h3><ul>
  <li>每 100 經驗升 1 級。</li>
  <li>稱號：初遇夥伴 → 故事學徒（100）→ 典故探險家（500）→ 成語知己（1500 起，Lv. 17 之後維持）。</li></ul></section>
 <section><h3>👘 40 套造型</h3><ul>
  <li>親密度<strong>每 20 點</strong>解鎖下一套，<strong>800 點</strong>集齊。</li>
  <li>按「造型」就可以換上，不扣親密度。</li></ul>
 <Table title="造型解鎖表" heads={['編號','造型','親密度']} rows={CATALOG.map((c,i)=>[i+1,c.idiom,(i+1)*20])}/></section>
 </dialog>
}
