import CATALOG from './petCatalog.json'

// Only publish costumes whose full set of actions passed visual and file QA.
export const READY_OUTFITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
// 造型圖更新後改呢個數字，瀏覽器就會重新下載，唔會顯示舊圖
const ASSET_VERSION = '20261021'
export const OUTFIT_STATES = ['idle','thinking','happy','sad','celebrate','eat','shy','sleep']
export function outfitAsset(outfit, action='idle', size='small') {
 const item=CATALOG.find(c=>c.idiom===outfit)
 if(!item || !READY_OUTFITS.includes(item.id)) return null
 const state=action==='study'?'idle':OUTFIT_STATES.includes(action)?action:'idle'
 const id=String(item.id).padStart(2,'0')
 const root=`/images/dingding-outfits/${size==='large'?'large':'small'}/${id}/${state}`
 return {id,state,gif:`${root}.gif?v=${ASSET_VERSION}`,still:`${root}-static.png?v=${ASSET_VERSION}`}
}
