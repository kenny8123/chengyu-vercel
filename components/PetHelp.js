import {useEffect,useRef} from 'react'
export const growthTitle=xp=>xp>=1500?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
function Grid({heads,rows}){return <div className="dd-help-table"><table><thead><tr>{heads.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
export default function PetHelp({open,onClose,profile}){
 const ref=useRef(null)
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>鼎鼎成長小手冊</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <section><h3>照顧與親密度</h3><Grid heads={['做甚麼','得到甚麼','條件']} rows={[
 ['典故點心（餵食）','親密度 +5','花 1 個點心'],['相知相惜（摸摸）','親密度 +2','每天前 3 次'],['養精蓄銳（休息）','親密度 +2','每天前 3 次'],['對話答中一點意思','親密度 +3、點心 +1','同一成語每天一次']
 ]}/><ul><li>親密度 30：熟悉夥伴；100：默契知己。</li><li>照顧不加經驗，也不影響測驗分數。</li></ul></section>
 <section><h3>怎樣升級？</h3><ul><li>每 100 經驗升 1 級。</li><li>目前 {profile?.xp||0} 經驗；再得 {100-(profile?.xp||0)%100} 經驗就升級。</li><li>升級會換稱號；不增加答題分數。</li></ul><Grid heads={['等級','累積經驗','稱號']} rows={[[1,0,'初遇夥伴'],[2,100,'故事學徒'],[6,500,'典故探險家'],[16,1500,'成語知己']]}/></section>
 <section><h3>完成一輪，才領獎勵</h3><Grid heads={['模式','完成條件','經驗／點心']} rows={[
 ['學習與練習','同一成語四階段','+40／+8'],['隨機選題、影片答題','全部 10 題','每題答對 +10／+2；答錯 +2／+1'],['AI 對決','全部 40 題','每題搶答成功 +10／+2；其餘 +2／+1']
 ]}/><ul><li>中途離開或重新整理：不領獎。</li><li>每輪只領一次；完成新一輪可以再領。</li><li>閱讀只記錄進度；AI 搶答不算你的錯題。</li></ul></section>
 <section><h3>聊天也能學典故</h3><ul><li>說中一個重點、關鍵詞或生活例子就可以！</li><li>問問題不算答錯。</li><li>說「先聊天」暫停；「再問我」繼續；「換題」換成語。</li></ul></section>
 <section><h3>解鎖與換造型</h3><ol><li>先讀過該成語典故。</li><li>完成它的四階段練習，或在挑戰答對它兩次。</li><li>按「造型」→ 選已解鎖造型 → 換上！</li></ol><ul><li>灰色造型會顯示還差多少進度。</li><li>選「原本的鼎鼎」可以恢復初始造型。</li></ul></section></dialog>
}
