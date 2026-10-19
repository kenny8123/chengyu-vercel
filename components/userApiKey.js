import {useEffect,useState} from 'react'
// 用家自己的 Claude API 金鑰：只存在這部裝置的瀏覽器，每次對話經本站伺服器轉送給 Anthropic，伺服器不會儲存。
const KEY='dingding-user-api-key',EVENT='dingding-api-key'
export const validKey=k=>typeof k==='string'&&/^sk-ant-[A-Za-z0-9_-]{20,300}$/.test(k.trim())
function storage(kind){try{return window[kind]}catch{return null}}
export function readKey(){for(const kind of ['sessionStorage','localStorage']){try{const k=storage(kind)?.getItem(KEY);if(k)return {key:k,remember:kind==='localStorage'}}catch{}}return null}
export function saveKey(key,remember){clearKey(false);try{storage(remember?'localStorage':'sessionStorage').setItem(KEY,key.trim())}catch{return false}window.dispatchEvent(new Event(EVENT));return true}
export function clearKey(notify=true){for(const kind of ['sessionStorage','localStorage']){try{storage(kind)?.removeItem(KEY)}catch{}}if(notify)window.dispatchEvent(new Event(EVENT))}
export function keyHeaders(){const k=readKey()?.key;return {'Content-Type':'application/json',...(k?{'x-user-api-key':k}:{})}}
export function useApiKey(){
 const [state,setState]=useState(null)
 useEffect(()=>{const update=()=>setState(readKey());update();window.addEventListener(EVENT,update);window.addEventListener('storage',update);return()=>{window.removeEventListener(EVENT,update);window.removeEventListener('storage',update)}},[])
 return state
}
