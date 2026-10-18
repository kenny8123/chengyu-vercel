import {useEffect,useState} from 'react'
import {outfitAsset,OUTFIT_STATES} from './outfitAssets'
import patAlignment from './patAlignment.json'

export default function OutfitSprite({outfit,action='idle',size='small',label='鼎鼎',fallback}) {
 const requested=outfitAsset(outfit,action,size)
 const [shown,setShown]=useState(null)
 useEffect(()=>{
  if(!requested){setShown(null);return}
  let cancelled=false
  const img=new Image()
  img.onload=()=>{if(!cancelled)setShown(requested)}
  img.src=window.matchMedia('(prefers-reduced-motion: reduce)').matches?requested.still:requested.gif
  return ()=>{cancelled=true;img.onload=null}
 },[requested?.gif])
 useEffect(()=>{
  if(!requested)return
  const images=OUTFIT_STATES.map(state=>{const asset=outfitAsset(outfit,state,size),img=new Image();img.src=window.matchMedia('(prefers-reduced-motion: reduce)').matches?asset.still:asset.gif;return img})
  return ()=>{images.forEach(img=>{img.onload=null})}
 },[outfit,size])
 // Keep the last decoded action visible until the next request is ready.
 if(!requested||!shown)return fallback
 const alignment=shown.state==='shy'?patAlignment[shown.id]:null
 const poseStyle=alignment?{transformOrigin:'0 0',transform:'translate('+alignment.x+'%, '+alignment.y+'%) scale('+alignment.scale+')'}:{}
 return <picture data-outfit-id={shown.id} data-action={shown.state} style={{display:'block',width:'100%',height:'100%'}}><source media="(prefers-reduced-motion: reduce)" srcSet={shown.still}/><img src={shown.gif} alt={label} style={{display:'block',width:'100%',height:'100%',objectFit:'contain',...poseStyle}}/></picture>
}
