import {useEffect,useState} from 'react'
import {readPet} from './petMemory'
export default function usePet(){
 const [store,setStore]=useState(null)
 useEffect(()=>{const update=()=>setStore(readPet());update();window.addEventListener('dingding-memory',update);window.addEventListener('storage',update);return()=>{window.removeEventListener('dingding-memory',update);window.removeEventListener('storage',update)}},[])
 return store
}
