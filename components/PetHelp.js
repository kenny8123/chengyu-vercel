import {useEffect,useRef} from 'react'
import CATALOG from './petCatalog.json'
export const growthTitle=xp=>xp>=1500?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
function Table({title,heads,rows}){return <div className="dd-help-table"><table><caption>{title}</caption><thead><tr>{heads.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((v,j)=>j===0?<th scope="row" key={j}>{v}</th>:<td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
export default function PetHelp({open,onClose,profile}){
 const ref=useRef(null),xp=profile?.xp||0,bond=profile?.bond||0,level=Math.floor(xp/100)+1
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>養成說明</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <p className="dd-help-current"><strong>目前：Lv. {level} · 累積 {xp} 經驗值</strong><br/>再得 <strong>{100-xp%100} 經驗值</strong>，就升到 Lv. {level+1}。<br/>親密度：{bond}／800（40 套造型門檻）</p>
 <section><h3>每 100 經驗值，自動升 1 級</h3><p>以下都是「累積總經驗值」。升級不扣經驗值，不用另外領取。</p>
 <Table title="等級、經驗值與稱號對照" heads={['等級','累積經驗值','再升一級的門檻','稱號']} rows={Array.from({length:16},(_,i)=>['Lv. '+(i+1),i*100+'–'+(i*100+99),(i+1)*100+' 經驗值',growthTitle(i*100)])}/>
 <p>Lv. 17 起仍每 100 經驗升一級，稱號維持「成語知己」。例如：230 經驗是 Lv. 3，再得 70 經驗就升 Lv. 4。</p></section>
 <section><h3>完成整輪，才領經驗值與點心</h3>
 <Table title="各模式的完成條件" heads={['模式','何時發獎勵']} rows={[["練習","完成同一成語的 4 個階段"],["隨機選題","完成一輪 10 題"],["錯題複習","完成一輪 10 題；不足 10 個成語時重複練習"],["影片答題","完成一輪 10 題"],["AI 對決","完成一輪 40 題"]]}/>
 <Table title="整輪結束後，按每題結果加總" heads={['每題結果','經驗值','點心']} rows={[["答對／搶答成功","+10","+2"],["答錯／未搶答成功","+2","+1"]]}/>
 <p>10 題中答對 6 題、答錯 4 題：共 68 經驗、16 點心。只看教材或中途離開不發獎勵；同一完成紀錄不重複領取。</p></section>
 <section><h3>錯題複習怎樣進行？</h3><Table title="錯題複習規則" heads={["項目","規則"]} rows={[["收錄","練習或挑戰答錯的成語，自動加入錯題本"],["出題","優先複習最久沒練的錯題，第二階段逐步升至第四階段"],["移除","在錯題複習中連續答對同一成語 2 次；之後再答錯會重新加入"],["獎勵","完成整輪 10 題才發獎勵，與隨機選題相同"]]}/></section><section><h3>親密度：照顧與聊天，解鎖造型</h3>
 <Table title="經驗值與親密度分開累積" heads={['項目','作用']} rows={[["經驗值","提升等級，獲得稱號"],["親密度","每累積 20 點，依序解鎖 1 套造型"]]}/>
 <Table title="如何獲得親密度" heads={['互動','每次獎勵／花費','每日限制']} rows={[["典故點心","親密度 +5；點心 −1","有點心就能餵"],["相知相惜（摸摸）","親密度 +2","前 3 次；最多 +6"],["養精蓄銳（休息）","親密度 +2","前 3 次；最多 +6"],["聊天答中典故重點","親密度 +3；點心 +1","同一成語每天領 1 次"]]}/>
 <p>摸摸與休息次數分開計算，隔天重置；超過次數仍能互動，但不再加親密度。聊天不用完整背誦，答中一點重點並獲鼎鼎判定答對即可；聊天與照顧不加經驗值。</p>
 <Table title="親密關係標籤" heads={['累積親密度','關係']} rows={[["0–29","新朋友"],["30–99","熟悉夥伴"],["100 以上","默契知己"]]}/></section>
 <section><h3>40 套造型解鎖表</h3><p>親密度每 20 點解鎖下一套，800 點集齊。按「造型」選已解鎖款式即可換上，不扣親密度，也可換回原本鼎鼎；舊版已解鎖造型保留。</p>
 <Table title="每套造型所需的累積親密度" heads={['造型編號','典故造型','所需親密度']} rows={CATALOG.map((c,i)=>[i+1,c.idiom,(i+1)*20])}/></section>
 </dialog>
}
