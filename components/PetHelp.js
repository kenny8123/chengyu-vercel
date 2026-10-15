import {BOND_DECORATIONS} from './petMemory'
import {useEffect,useRef} from 'react'
export const growthTitle=xp=>xp>=1500?'成語知己':xp>=500?'典故探險家':xp>=100?'故事學徒':'初遇夥伴'
function Grid({heads,rows}){return <div className="dd-help-table"><table><thead><tr>{heads.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
export default function PetHelp({open,onClose,profile}){
 const ref=useRef(null)
 useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open])
 return <dialog ref={ref} className="dd-closet dd-help" onCancel={onClose} onClose={onClose}><header><h2>鼎鼎成長小手冊</h2><button className="dd-key" onClick={onClose} aria-label="關閉養成說明">✕</button></header>
 <PetStatMeaning/><section><h3>照顧與親密度</h3><Grid heads={['做甚麼','得到甚麼','條件']} rows={[
 ['典故點心（餵食）','親密度 +5','花 1 個點心'],['相知相惜（摸摸）','親密度 +2','每天前 3 次'],['養精蓄銳（休息）','親密度 +2','每天前 3 次'],['對話答中一點意思','親密度 +3、點心 +1','同一成語每天一次']
 ]}/><ul><li>親密度 30：熟悉夥伴；100：默契知己。</li><li>照顧增加親密度，解鎖裝飾；完成學習增加經驗，提升等級。</li><li>親密度與等級都不影響測驗分數。</li></ul></section>
 <section><h3>怎樣升級？</h3><ul><li>每 100 經驗升 1 級。</li><li>目前 {profile?.xp||0} 經驗；再得 {100-(profile?.xp||0)%100} 經驗就升級。</li><li>升級會換稱號；不增加答題分數。</li></ul><Grid heads={['等級','累積經驗','稱號']} rows={[[1,0,'初遇夥伴'],[2,100,'故事學徒'],[6,500,'典故探險家'],[16,1500,'成語知己']]}/></section>
 <section><h3>完成一輪，才領獎勵</h3><Grid heads={['模式','完成條件','經驗／點心']} rows={[
 ['學習與練習','同一成語四階段','+40／+8'],['隨機選題、影片答題','全部 10 題','每題答對 +10／+2；答錯 +2／+1'],['AI 對決','全部 40 題','每題搶答成功 +10／+2；其餘 +2／+1']
 ]}/><ul><li>中途離開或重新整理：不領獎。</li><li>每輪只領一次；完成新一輪可以再領。</li><li>閱讀只記錄進度；AI 搶答不算你的錯題。</li></ul></section>
 <PetRewardRules/></dialog>
}

function PetRewardRules(){return <>
<section><h3>聊天獎勵一覽</h3><Grid heads={['聊天內容','親密度','點心','領取條件']} rows={[
 ['答中一點意思、關鍵詞或合適例子','+3','+1','同一成語每天一次'],['同一天再答同一成語','+0','+0','仍會鼓勵你'],['一般聊天、提問、還未答中','+0','+0','繼續聊，不扣分']
 ]}/><ul><li>聊天答中重點可得親密度與點心；經驗要完成學習或挑戰取得。</li><li>「先聊天」暫停提問；「再問我」繼續；「換題」換成語。</li></ul></section>
<section><h3>親密度專屬獎勵</h3><Grid heads={['親密度','解鎖獎勵','用途']} rows={BOND_DECORATIONS.map(d=>[d.bond,d.name,'可自由套用到家中'])}/><ul><li>解鎖後可隨時切換裝飾，不消耗親密度。</li><li>親密度不換成經驗；兩條成長進度各有獎勵。</li><li>隨機睡覺、休息與開心動作不會自動領獎。</li></ul></section><section><h3>如何解鎖造型？</h3><ol><li>先閱讀想解鎖的成語典故。</li><li>二選一：完成該成語四階段練習；或挑戰答對該成語兩次。</li><li>符合條件，就會解鎖對應造型。</li></ol></section>
<section><h3>如何換造型？</h3><ol><li>按「造型」開啟造型櫃。</li><li>點選已解鎖的造型，就會立即套用。</li><li>想換回初始模樣，選「原本的鼎鼎」。</li></ol><ul><li>灰色代表未解鎖；下方列出閱讀、練習、挑戰進度。</li><li>造型依學習進度解鎖；不是只靠等級或親密度。</li></ul></section>
</>}
function PetStatMeaning(){return <section><h3>親密度與經驗，有甚麼不同？</h3><Grid heads={['項目','代表甚麼','怎樣獲得','有甚麼作用']} rows={[
 ['♥ 親密度','你和鼎鼎的熟悉程度','餵點心、摸摸、休息；聊天答中重點','達 30／100／200 分別解鎖愛心掛飾、星光燈串、花朵盆栽'],
 ['★ 經驗值','完成學習的成長紀錄','完成整輪學習練習或挑戰','每 100 經驗升 1 級，提升等級和成長稱號']
 ]}/><ul><li>親密度越高：解鎖更多陪伴裝飾，可自行選擇套用。</li><li>經驗累積越多：鼎鼎等級越高，代表你們一起完成更多學習。</li><li>兩者都不會增加測驗分數；造型要按成語學習進度解鎖。</li></ul></section>}
export function PetQuickGuide({profile,onDecoration}){return <section className="dd-quick-guide dd-help"><PetStatMeaning/><section><h3>我的親密度獎勵</h3><p>目前親密度：{profile?.bond||0}。解鎖後點選即可套用，不消耗點數。</p><div className="dd-decoration-options">{BOND_DECORATIONS.map(d=>{const ready=(profile?.bond||0)>=d.bond;return <button key={d.id} className="dd-key" disabled={!ready} aria-pressed={profile?.decoration===d.id} onClick={()=>onDecoration(d.id)}><span aria-hidden="true">{d.icon}</span><strong>{d.name}</strong><small>{!ready?`還差 ${d.bond-(profile?.bond||0)} 親密度`:profile?.decoration===d.id?'使用中':'套用裝飾'}</small></button>})}<button className="dd-key" onClick={()=>onDecoration(null)} disabled={!profile?.decoration}>收起裝飾</button></div></section><details><summary>📋 展開聊天獎勵、裝飾與換造型步驟</summary><PetRewardRules/></details></section>}
