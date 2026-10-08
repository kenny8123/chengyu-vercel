// Local learning memory; no remote AI service or student data transmission.
const KEY='dingding-students-v1'
const fresh=()=>({xp:0,food:0,bond:0,care:{},lessons:{},history:[],rewards:{},outfit:null,bag:[],reviewBag:[],turn:0})
export function readPet(){
 if(typeof window==='undefined')return {active:'default',profiles:{default:{name:'我的學習檔案',...fresh()}}}
 try{const x=JSON.parse(localStorage.getItem(KEY));if(x?.profiles?.[x.active]?.lessons)return x}catch{}
 return {active:'default',profiles:{default:{name:'我的學習檔案',...fresh()}}}
}
export function savePet(x){
 try{localStorage.setItem(KEY,JSON.stringify(x));window.dispatchEvent(new Event('dingding-memory'));return true}catch{return false}
}
export const unlocked=p=>!!p?.read&&(Object.keys(p.stages||{}).length===4||(p.challengeCorrect||0)>=2)
export function applyLearning(profile,event,now=Date.now()){
 const p=JSON.parse(JSON.stringify(profile)),{idiom,kind,correct,stage}=event
 if(!idiom)return p
 const l=p.lessons[idiom]||(p.lessons[idiom]={stages:{},correct:0,wrong:0,challengeCorrect:0})
 l.lastAt=now;l.lastKind=kind
 if(kind==='read')l.read=true
 if(kind==='answer'){
  l.lastCorrect=correct;l[correct?'correct':'wrong']++
  if(correct&&stage)l.stages[stage]=true
  if(correct&&!stage)l.challengeCorrect++
 }
 const day=new Date(now).toLocaleDateString('en-CA'),key=`${day}:${idiom}:${kind}:${stage||0}:${correct===true}`
 if(!p.rewards[key]){p.xp+=kind==='read'?5:correct?10:2;p.food=(p.food||0)+(correct?2:1);p.rewards[key]=true}
 p.history=[{...event,at:now},...p.history].slice(0,200)
 p.rewards=Object.fromEntries(Object.entries(p.rewards).filter(([k])=>k.startsWith(day+':')))
 if(!p.outfit&&unlocked(l))p.outfit=idiom
 return p
}
export function recordLearning(event){const x=readPet();x.profiles[x.active]=applyLearning(x.profiles[x.active],event);return savePet(x)}
export function makeProfile(name){const x=readPet(),id=`student-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;x.profiles[id]={name:name.trim().slice(0,24),...fresh()};x.active=id;return savePet(x)}
export function switchProfile(id){const x=readPet();if(x.profiles[id]){x.active=id;return savePet(x)}}
export function wearOutfit(id){const x=readPet(),p=x.profiles[x.active];if(id===null||unlocked(p.lessons[id])){p.outfit=id;return savePet(x)}return false}
export function careForPet(action){
 const x=readPet(),p=x.profiles[x.active],day=new Date().toLocaleDateString('en-CA')
 if(!['feed','pat','rest'].includes(action))return '請選擇一個陪伴方式。'
 if(action==='feed'){
  if(!(p.food>0))return '點心吃完了，我們一起學個典故，再帶點心回家吧。'
  p.food--;p.bond=(p.bond||0)+5
 }else{
  if(p.care?.day!==day)p.care={day,pat:0,rest:0}
  if((p.care[action]||0)>=3)return '今天的陪伴獎勵已經收好了，我還是很開心你在這裡。'
  p.care[action]=(p.care[action]||0)+1;p.bond=(p.bond||0)+2
 }
 if(!savePet(x))return '這次未能儲存，請確認瀏覽器允許儲存資料。'
 return action==='feed'?'好好吃！你的學習變成我的養分了。親密度 +5。':action==='pat'?'收到你的摸摸了！一起學習很開心。親密度 +2。':'一起歇一會兒吧，休息後再出發。親密度 +2。'
}
const shuffled=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
export function nextReminder(profile,catalog,focusRecent=false){
 const p=JSON.parse(JSON.stringify(profile));p.turn=(p.turn||0)+1
 const recent=p.history.find(e=>e.kind==='answer'),weak=catalog.filter(c=>p.lessons[c.idiom]?.lastCorrect===false)
 const personal=p.turn%3!==0&&weak.length
 const key=personal?'reviewBag':'bag',pool=personal?weak:catalog
 p[key]=(p[key]||[]).filter(id=>pool.some(c=>c.idiom===id))
 if(!p[key].length)p[key]=shuffled(pool.map(c=>c.idiom))
 const selected=focusRecent&&p.history.length?p.history[0].idiom:p[key].pop(),c=catalog.find(c=>c.idiom===selected)
 if(!c)return {profile:p,text:'我們一起從一個故事開始吧。'}
 const known=p.lessons[c.idiom]
 const intro=known?.lastCorrect===false?`上次「${c.idiom}」還有點不熟，我們換個角度想想。`:known?`還記得我們學過的「${c.idiom}」嗎？`:`今天帶你認識「${c.idiom}」。`
 const details=p.turn%2?`${c.kidStory} 所以說，${c.meaning}`:`${c.meaning} 像是：${c.example} ${c.tip}`
 const ending=personal?'下次遇到題目，先想意思，再比較情境。':recent?.correct?'你最近已經有答對的紀錄，試試自己說一個例子吧。':'不用急著背人名，能在生活中用出來才是重點。'
 return {profile:p,text:`${intro}${details} ${ending}`}
}
