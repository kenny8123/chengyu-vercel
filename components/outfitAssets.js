import CATALOG from './petCatalog.json'

// Only publish costumes whose full set of actions passed visual and file QA.
export const READY_OUTFITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
export const OUTFIT_STATES = ['idle','thinking','happy','sad','celebrate','eat','shy','sleep']
export function outfitAsset(outfit, action='idle', size='small') {
 const item=CATALOG.find(c=>c.idiom===outfit)
 if(!item || !READY_OUTFITS.includes(item.id)) return null
 const state=action==='study'?'idle':OUTFIT_STATES.includes(action)?action:'idle'
 const id=String(item.id).padStart(2,'0')
 const root=`/images/dingding-outfits/${size==='large'?'large':'small'}/${id}/${state}`
 return {id,state,gif:`${root}.gif`,still:`${root}-static.png`}
}
