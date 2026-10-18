import {useEffect,useRef} from 'react'
import CATALOG from './petCatalog.json'
export const growthTitle=xp=>xp>=1500?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
function Table({title,heads,rows,className=""}){return <div className="dd-help-table"><table className={className}><caption>{title}</caption><thead><tr>{heads.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((v,j)=>j===0?<th scope="row" key={j}>{v}</th>:<td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
export default function PetHelp({open,onClose,profile}){
 const ref=useRef(null),xp=profile?.xp||0,bond=profile?.bond||0,level=Math.floor(xp/100)+1
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>養成說明</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <p className="dd-help-current"><strong>目前：Lv. {level} · 累積 {xp} 經驗值</strong><br/>再得 <strong>{100-xp%100} 經驗值</strong>，就升到 Lv. {level+1}。<br/>親密度：{bond}／800（40 套造型門檻）</p>
 <section><h3>完成後可以得到多少？</h3>
 <Table className="dd-completion-table" title="完成一輪的獎勵總表" heads={['模式／完成條件','經驗值','親密度','典故點心']} rows={[[<><strong className="dd-mode-name">練習</strong><span className="dd-mode-condition">同一成語<br/><span>完成 4 階段</span></span></>,"+40","+0","+8"],[<><strong className="dd-mode-name">隨機選題</strong><span className="dd-mode-condition">完成 10 題</span></>,"+20～100","+0","+10～20"],[<><strong className="dd-mode-name">影片答題</strong><span className="dd-mode-condition">完成 10 題</span></>,"+20～100","+0","+10～20"],[<><strong className="dd-mode-name">AI 對決</strong><span className="dd-mode-condition">完成 40 題</span></>,"+80～400","+0","+40～80"]]}/>
 <ul><li>完成整輪才一次發放；中途離開、只看教材不發獎勵，同一完成紀錄不重複領取。</li><li>練習須通過全部 4 階段，完成後固定得到 40 經驗值、8 點心。</li><li>其他模式依每題結果加總：答對／搶答成功得 10 經驗值、2 點心；答錯／未搶答成功得 2 經驗值、1 點心。</li><li>例如 10 題答對 6 題：得到 68 經驗值、16 點心、0 親密度。</li><li>完成題目不直接增加親密度；把得到的點心餵給鼎鼎，每顆可增加 5 親密度。例如完成練習所得的 8 點心，全部餵完可再得 40 親密度。</li></ul>
 <Table title="互動與聊天的每次獎勵" heads={['完成的互動','經驗值','親密度','點心／領取限制']} rows={[["典故點心（餵食）","+0","+5","消耗 1 點心；有點心即可餵"],["相知相惜（摸摸）","+0","+2","不消耗點心；每日前 3 次"],["養精蓄銳（休息）","+0","+2","不消耗點心；每日前 3 次"],["聊天答中典故重點","+0","+3","點心 +1；同一成語每日 1 次"]]}/>
 <p>摸摸與休息各自每日最多增加 6 親密度。超過領取次數仍能互動，但獎勵為 0；一般聊天未答中典故重點不發獎勵。</p></section>
 <section><h3>每 100 經驗值，自動升 1 級</h3><p>以下都是「累積總經驗值」。升級不扣經驗值，不用另外領取。</p>
 <Table title="等級、經驗值與稱號對照" heads={['等級','累積經驗值','再升一級的門檻','稱號']} rows={Array.from({length:16},(_,i)=>['Lv. '+(i+1),i*100+'–'+(i*100+99),(i+1)*100+' 經驗值',growthTitle(i*100)])}/>
 <p>Lv. 17 起仍每 100 經驗升一級，稱號維持「成語知己」。例如：230 經驗是 Lv. 3，再得 70 經驗就升 Lv. 4。</p></section>
 <section><h3>親密度：照顧與聊天，解鎖造型</h3>
 <Table title="經驗值與親密度分開累積" heads={['項目','作用']} rows={[["經驗值","提升等級，獲得稱號"],["親密度","每累積 20 點，依序解鎖 1 套造型"]]}/>
 <p>聊天不用完整背誦，答中一點重點並獲鼎鼎判定答對即可；聊天與照顧的獎勵見上方表格。</p>
 <Table title="親密關係標籤" heads={['累積親密度','關係']} rows={[["0–29","新朋友"],["30–99","熟悉夥伴"],["100 以上","默契知己"]]}/></section>
 <section><h3>40 套造型解鎖表</h3><p>親密度每 20 點解鎖下一套，800 點集齊。按「造型」選已解鎖款式即可換上，不扣親密度，也可換回原本鼎鼎；舊版已解鎖造型保留。</p>
 <Table title="每套造型所需的累積親密度" heads={['造型編號','典故造型','所需親密度']} rows={CATALOG.map((c,i)=>[i+1,c.idiom,(i+1)*20])}/></section>
 </dialog>
}
