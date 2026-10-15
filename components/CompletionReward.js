export default function CompletionReward({reward}){
 return reward?<section role="status" className="completion-reward"><strong>🎉 全部完成！獎勵已送給鼎鼎</strong><ul><li>學習經驗：+{reward.baseXp??reward.xp}</li><li>總經驗：+{reward.xp}</li><li>典故點心：+{reward.food}</li></ul></section>:null
}
