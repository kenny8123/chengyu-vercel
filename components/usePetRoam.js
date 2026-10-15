import {useEffect,useState} from 'react'
export default function usePetRoam(quiet,paused){
 const [position,setPosition]=useState(null)
 useEffect(()=>{
  let timer,scrollTimer
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
  const overlaps=(a,b)=>a.x<b.right+5&&a.x+64>b.left-5&&a.y<b.bottom+5&&a.y+64>b.top-5
  function place(random){
   const obstacles=[]
   document.querySelectorAll('button,input,textarea,select,img,video,a').forEach(el=>{
    if(el.closest('.pet-roaming'))return
    const r=el.getBoundingClientRect();if(r.width&&r.height&&r.bottom>0&&r.top<innerHeight)obstacles.push(r)
   })
   const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT)
   let node
   while((node=walker.nextNode())){
    if(!node.textContent.trim()||node.parentElement?.closest('.pet-roaming,script,style'))continue
    const range=document.createRange();range.selectNodeContents(node)
    for(const r of range.getClientRects())if(r.width&&r.height&&r.bottom>0&&r.top<innerHeight)obstacles.push(r)
   }
   const candidates=[]
   for(let y=8;y<=innerHeight-72;y+=12)for(let x=8;x<=innerWidth-72;x+=12){
    const candidate={x,y};if(!obstacles.some(r=>overlaps(candidate,r)))candidates.push(candidate)
   }
   setPosition(prev=>{
    const safe=prev&&!prev.hidden&&!obstacles.some(r=>overlaps(prev,r))&&prev.x+64<=innerWidth&&prev.y+64<=innerHeight
    if(safe&&(!random||quiet||paused||reduced.matches))return prev
    // Only walk when the whole bounding path is clear; never cross text.
    const reachable=safe?candidates.filter(c=>{
     const path={left:Math.min(c.x,prev.x),right:Math.max(c.x,prev.x)+64,top:Math.min(c.y,prev.y),bottom:Math.max(c.y,prev.y)+64}
     return !obstacles.some(r=>path.left<r.right+5&&path.right>r.left-5&&path.top<r.bottom+5&&path.bottom>r.top-5)
    }):candidates
    // If another area has room, relocate instead of disappearing when the path is blocked.
    const available=reachable.length?reachable:candidates
    if(!available.length)return safe?prev:{x:Math.max(8,innerWidth-72),y:Math.max(8,innerHeight-72),jump:true}
    const edges=available.filter(c=>c.x<84||c.x>innerWidth-148)
    const pool=edges.length?edges:available
    return {...pool[random?Math.floor(Math.random()*pool.length):pool.length-1],jump:!safe||!reachable.length}
   })
  }
  function next(){if(!document.hidden)place(true);timer=setTimeout(next,26000+Math.random()*12000)}
  function layout(){clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>place(false),120)}
  place(false);timer=setTimeout(next,26000+Math.random()*12000)
  window.addEventListener('resize',layout);window.addEventListener('scroll',layout,true);window.addEventListener('load',layout,true)
  const observer=new MutationObserver(records=>{if(records.some(r=>!r.target.parentElement?.closest('.pet-roaming')&&!r.target.closest?.('.pet-roaming')))layout()});observer.observe(document.querySelector('.wrap')||document.body,{childList:true,subtree:true})
  return()=>{clearTimeout(timer);clearTimeout(scrollTimer);observer.disconnect();window.removeEventListener('resize',layout);window.removeEventListener('scroll',layout,true);window.removeEventListener('load',layout,true)}
 },[quiet,paused])
 return position
}
