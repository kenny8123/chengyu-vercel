import {useEffect,useRef,useState} from 'react'
import CATALOG from './petCatalog.json'
import LIFE from './lifeSentences.json'

// ???瑁遘擗刻?嚗身閮????雿?
// ??蝛輯???啣??瘥???蝡?撠望??府???頠賂???敺銝撘菜?隤?靽∠?嚗隞?偌敶拇?銵絲?梢◢嚗?// ?縑??嚗ublic/images/scroll-postcards/NN.webp嚗N嚗?隤楊??嚗?怠末?＊蝷箝鼓鋆賭葉??const READY=new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
const VERSION='20261023c'
const BLANK='嚗選撚嚗選撚'
const card=c=>`/images/scroll-postcards/${String(c.id).padStart(2,'0')}.webp?v=${VERSION}`
export default function ScrollCollection({open,onClose,profile}){
 const ref=useRef(null),[view,setView]=useState(null)
 useEffect(()=>{if(open)ref.current?.showModal();else{ref.current?.close();setView(null)}},[open])
 const owned=new Set(profile?.scrolls||[]),c=view&&CATALOG.find(x=>x.idiom===view)
 const sentence=c&&(LIFE.find(x=>x.idiom===c.idiom)?.sentences[0]||'')
 return <dialog ref={ref} className="dd-closet sc-dialog" onCancel={onClose} onClose={onClose}>
  <header><h2>?? ???瑁遘擗刻?</h2><button className="dd-key" onClick={onClose} aria-label="???瑁遘擗刻?">??/button></header>
  {!c&&<>
   <p>?具?隤忽頞?啣?????曉?銝??隤???撠望???銝?瑕頠詻歇?嗉? <b>{owned.size}</b> / 40 ?瑯?/p>
   <div className="sc-grid">{CATALOG.map((x,i)=>{const got=owned.has(x.idiom)
    return <button key={x.id} className={`sc-scroll${got?' got':''}`} onClick={()=>got&&setView(x.idiom)} disabled={!got} aria-label={got?`????{x.idiom}?頠節:`蝚?${i+1} 蝡??瑁遘嚗??芣?}>
     <span className="sc-roll" aria-hidden="true"><i/><em>{got?x.idiom:'嚗?嚗?'}</em><i/></span>
     <small>{got?'???瑁遘':`?啣??蝚?${i+1} 蝡}</small>
    </button>})}</div>
  </>}
  {c&&<div className="sc-open">
   <button className="dd-key sc-back" onClick={()=>setView(null)}>??餈?擗刻?</button>
   <figure className="sc-card">
    <div className="sc-photo">
     {READY.has(c.id)?<img src={card(c)} alt={`??{c.idiom}??隤?靽∠?嚗隞?偌敶拇?銵絲?望??冑}/>:<div className="sc-wait">?縑?鼓鋆賭葉?色?/div>}     <span className="sc-postmark" aria-hidden="true">???征?擗?br/>蝚?{c.id} ??/span>
    </div>
    <figcaption>
     <h3>{c.idiom}</h3>
     <p className="sc-mean">{c.meaning}</p>
     {sentence&&<p className="sc-say">?sentence.split(BLANK)[0]}<b>{c.idiom}</b>{sentence.split(BLANK)[1]}??/p>}
    </figcaption>
   </figure>
  </div>}
  <style jsx global>{`
   .sc-dialog{max-width:min(960px,94vw)}
   .sc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:12px;margin-top:10px}
   .sc-scroll{border:none;background:none;padding:4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;color:#7a5a44}
   .sc-scroll:disabled{cursor:not-allowed}
   .sc-roll{display:flex;align-items:stretch;width:100%;height:64px;filter:grayscale(1) opacity(.45);transition:transform .2s}
   .sc-scroll.got .sc-roll{filter:none}
   .sc-scroll.got:hover .sc-roll{transform:translateY(-3px) rotate(-1deg)}
   .sc-roll i{width:12px;border-radius:6px;background:linear-gradient(90deg,#7b4a22,#c08a52 50%,#7b4a22)}
   .sc-roll em{flex:1;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:1.05rem;letter-spacing:.06em;color:#4a2f1a;background:linear-gradient(180deg,#fff6df,#f3e2bb);border-top:2px solid #d9bd86;border-bottom:2px solid #d9bd86;margin:6px -2px;writing-mode:horizontal-tb}
   .sc-scroll small{font-size:.78rem;font-weight:700}
   .sc-open{display:flex;flex-direction:column;align-items:center;gap:12px}
   .sc-back{align-self:flex-start}
   .sc-card{margin:0;width:100%;max-width:820px;background:#fffdf7;padding:14px 14px 18px;border-radius:6px;box-shadow:0 14px 34px rgba(60,40,20,.3);transform-origin:left center;animation:sc-unroll .7s ease-out}
   .sc-photo{position:relative;border-radius:3px;overflow:hidden;background:#f6efe2;aspect-ratio:3/2}
   .sc-photo img{display:block;width:100%;height:100%;object-fit:cover}
   .sc-wait{display:flex;align-items:center;justify-content:center;height:100%;color:#9c8466;font-weight:700}
   .sc-postmark{position:absolute;top:14px;right:14px;width:84px;height:84px;border:2px solid rgba(150,60,50,.55);border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:.66rem;font-weight:800;line-height:1.4;color:rgba(150,60,50,.7);transform:rotate(-12deg)}
   .sc-card figcaption{padding:12px 6px 0}
   .sc-card h3{margin:0;font-size:clamp(1.8rem,5vw,2.6rem);font-weight:900;letter-spacing:.12em;color:#3d2a18}
   .sc-mean{margin:6px 0 0;color:#6b5440;font-weight:600;line-height:1.7}
   .sc-say{margin:8px 0 0;color:#4f3b28;line-height:1.8;border-top:1px dashed #d8c7a8;padding-top:8px}
   .sc-say b{color:#b3471e}
   @keyframes sc-unroll{from{clip-path:inset(0 100% 0 0);opacity:.4}to{clip-path:inset(0 0 0 0);opacity:1}}
   @media(prefers-reduced-motion:reduce){.sc-card{animation:none}}
   @media(max-width:600px){.sc-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.sc-roll{height:56px}.sc-roll em{font-size:.9rem}.sc-postmark{width:64px;height:64px;font-size:.55rem}}
  `}</style>
 </dialog>
}
