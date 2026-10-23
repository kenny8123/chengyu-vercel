// 地圖冒險的音效：用瀏覽器即時合成（Web Audio），不用另外載入聲音檔
let ctx=null
function audio(){
 if(typeof window==='undefined')return null
 try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}
}
// 一個音：頻率由 f1 滑到 f2，長度 len 秒
function tone(c,{type='sine',f1,f2=f1,len=.15,at=0,vol=.18}){
 const t=c.currentTime+at,o=c.createOscillator(),g=c.createGain()
 o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+len)
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len)
 o.connect(g).connect(c.destination);o.start(t);o.stop(t+len+.02)
}
const SOUNDS={
 zap:c=>tone(c,{type:'square',f1:1400,f2:320,len:.14,vol:.07}),
 hit:c=>[523,659,784,1047].forEach((f,i)=>tone(c,{type:'triangle',f1:f,len:.22,at:i*.07,vol:.16})),
 miss:c=>{tone(c,{type:'sawtooth',f1:220,f2:110,len:.28,vol:.08});tone(c,{type:'sine',f1:160,f2:90,len:.3,vol:.12})},
 bossHurt:c=>{tone(c,{type:'sine',f1:180,f2:60,len:.3,vol:.25});tone(c,{type:'triangle',f1:880,f2:1320,len:.18,at:.05,vol:.1})},
 combo:c=>[784,988,1175,1568].forEach((f,i)=>tone(c,{type:'sine',f1:f,len:.16,at:i*.05,vol:.12})),
 tap:c=>tone(c,{type:'sine',f1:660,f2:880,len:.06,vol:.06}),
}
// iPhone：要在玩家按下的一刻喚醒音效引擎，並播一下無聲的聲音，之後的音效才會出聲
export function unlockSfx(){const c=audio();if(!c)return;try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch{}}
export function sfx(name,on){if(!on)return;const c=audio();if(c)try{SOUNDS[name]?.(c)}catch{}}
