export default function CompletionReward({reward}){
 return reward?<p role="status" style={{padding:'12px 18px',margin:'16px 0',borderRadius:14,background:'#e4f4dc',color:'#365e3a',fontWeight:700}}>🎉 全部完成！經驗 +{reward.xp} · 點心 +{reward.food}，已送給鼎鼎。</p>:null
}
