import {useEffect,useRef} from 'react'
import CATALOG from './petCatalog.json'
export const growthTitle=xp=>xp>=1600?'成語達人':xp>=1300?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
function Table({title,heads,rows,className=""}){return <div className="dd-help-table"><table className={className}><caption>{title}</caption><thead><tr>{heads.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((v,j)=>j===0?<th scope="row" key={j}>{v}</th>:<td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
export default function PetHelp({open,onClose,profile}){
 const ref=useRef(null),xp=profile?.xp||0,bond=profile?.bond||0,level=Math.floor(xp/100)+1
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>養成說明</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <p className="dd-help-lead"><strong>⭐ 經驗值解鎖稱號　💗 親密度解鎖造型</strong></p>
 <p className="dd-help-current"><strong>目前：Lv. {level} · 累積 {xp} 經驗值</strong><br/>再得 <strong>{100-xp%100} 經驗值</strong>，就升到 Lv. {level+1}。<br/>親密度：{bond}／800（40 套造型門檻）</p>
 <section><h3>📚 做題目</h3>
 <Table title="完成就有獎勵（中途離開沒有）" heads={['模式','完成方式','經驗','點心']} rows={[['練習','通過 4 階段','40','8'],['隨機選題','完成 10 題','20～100','10～20'],['影片答題','完成 10 題','20～100','10～20'],['地圖冒險','走完 10 站（第一次就射中才算答對；每站送 1 套造型）','20～100','10～20'],['AI 對決','完成 40 題','80～400','40～80']]}/>
 <p>答對越多，得到越多（每題答對 10 經驗、2 點心；答錯 2 經驗、1 點心）。</p></section>
 <section><h3>💗 親密度</h3>
 <Table title="怎樣增加親密度（做題目不會加）" heads={['做甚麼','親密度','限制']} rows={[['餵點心','每顆 +5','用 1 顆點心'],['摸摸','+2','每日 3 次'],['休息','+2','每日 3 次'],['聊天答對','+3（再送 1 點心）','同一成語每日 1 次']]}/></section>
 <section><h3>⭐ 升級</h3>
 <Table title="每 100 經驗升 1 級" heads={['累積經驗','等級','稱號']} rows={[['0','Lv. 1','初遇夥伴'],['100','Lv. 2','故事學徒'],['500','Lv. 6','典故探險家'],['1300','Lv. 14','成語知己'],['1600 以上','Lv. 17 起','成語達人']]}/></section>
 <section><h3>👘 40 套造型</h3>
 <Table title="造型解鎖表（每 20 親密度解鎖 1 套，按「造型」換上，不扣親密度）" heads={['編號','造型','親密度']} rows={CATALOG.map((c,i)=>[i+1,c.idiom,(i+1)*20])}/></section>
 </dialog>
}
