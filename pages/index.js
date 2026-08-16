import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════
   圖片設定
   /public/images/
   • 1.png        = 序章圖
   • s1~s5.png    = 五個典故的「學習漫畫」（有文字）
   • q1~q5.png    = 五題的「關卡圖」（無文字）
   ═══════════════════════════════════════════ */
const USE_IMAGES = true
const IMG_BASE   = '/images/'
const introImg   = IMG_BASE + '1.png'
const storyImg   = (i) => `${IMG_BASE}s${i + 1}.png`   // 學習漫畫
const quizImg    = (i) => `${IMG_BASE}q${i + 1}.png`   // 關卡無字圖

/* ═══════════════════════════════════════════
   題庫：五個成語（老師提供典故）
   ═══════════════════════════════════════════ */
const IDIOMS = [
  {
    idiom: '一言九鼎',
    blanks: [3],
    meaning: '形容說話很有分量，或說話很有信用。',
    kidStory: '戰國時，趙國被秦國圍攻，平原君帶毛遂去楚國求救。毛遂勇敢地向楚王分析情勢，說服楚王結盟。平原君稱讚他：「毛先生一句話，比九鼎還有份量！」',
    fullStory: '戰國時，秦國攻打趙國，首都邯鄲被圍，情況相當危急。趙王派平原君到楚國求援，想聯合楚國來抵抗秦國。平原君要從門下食客選二十個人一起去楚國，但挑來挑去只挑到十九人，有個叫毛遂的人便自我推薦，平原君就接納他。到了楚國，平原君一直不能說服楚王援助趙國。毛遂仗劍向前，向楚王分析情勢，義正詞嚴，氣勢凌人，楚王便答應與趙國訂立盟約。平原君完成任務回到趙國後，讚賞毛遂說：「毛先生一到楚國，就使我們趙國的地位大大提升，比九鼎大呂還要有份量。毛先生的口才，真是比百萬軍力還要強大。」自此便一直將毛遂奉為上賓。後來「一言九鼎」這句成語就從這裡演變而出，用來形容說話很有分量，後亦用於形容說話很有信用。',
    emoji: '🏺', bg: 'linear-gradient(160deg,#ffe3c4,#ffc98f)', tag: '歷史故事', mildDistract:['鐘','劍','印'], hardDistract:['鍋','爐','缸']
  },
  {
    idiom: '寸草春暉',
    blanks: [3],
    meaning: '比喻父母恩情深重，子女難以報答。',
    kidStory: '唐代詩人孟郊寫了〈遊子吟〉：慈母為將要遠行的孩子縫衣服，希望他不受寒。詩中用「寸草」比喻子女，用「春暉」（春天的陽光）比喻母愛的溫暖。',
    fullStory: '唐代詩人孟郊出身寒苦，四十六歲才考上進士，作了官後，又因性情耿直而受到排擠，最後只能當個小官，直到去世。孟郊由於一生貧寒，他的詩作也多描寫自己淒涼的境遇及心聲，同時也反映一般人民的生活疾苦。在〈遊子吟〉這首詩中，描寫慈母為即將要遠行的孩子縫製衣物，以免他們在路上受寒。這樣的恩情，子女無論做什麼都無法報答。詩中用「寸草」比喻子女，而用「三春暉」比喻母愛。「春暉」即是指春天的陽光，形容母愛有如春陽一樣的溫暖。後來「寸草春暉」就從這裡演變而出，比喻父母恩情深重，子女難以報答。',
    emoji: '🌱', bg: 'linear-gradient(160deg,#c8f0d0,#9be0ad)', tag: '詩詞典故', mildDistract:['風','雪','霜'], hardDistract:['輝','暈','暖']
  },
  {
    idiom: '人山人海',
    blanks: [1, 3],
    meaning: '形容人聚集得非常多。',
    kidStory: '宋代的杭州非常熱鬧，有許多娛樂場所叫「瓦市」。書上記載：賣衣服的地方「衣山衣海」，算命的地方「卦山卦海」，最熱鬧的地方就是「人山人海」——用山和海形容人多得數不完！',
    fullStory: '「人山人海」，形容許許多多的人聚集在一起，用「山」和「海」來形容數量之多。在宋代西湖老人所撰《西湖老人繁勝錄》中有一條記載，描述當時杭州市容的繁盛。說到當時南瓦是衣山衣海，中瓦是卦山卦海，上瓦是南山南海，下瓦是人山人海。此處所說的「瓦」，是宋元大都市中娛樂場所的總稱。「南瓦」是衣市集中地，所以「衣山衣海」；「中瓦」為算命卜卦等行業的集中地，所以「卦山卦海」；下瓦必然十分熱鬧，所以「人山人海」。這句成語後代常見，例如《水滸傳》第五一回、《初刻拍案驚奇》卷六都用過。後來「人山人海」就被用來形容人聚集得非常多。',
    emoji: '🏮', bg: 'linear-gradient(160deg,#ffe0ec,#ffc0d6)', tag: '生活景象', mildDistract:['天','地','雲'], hardDistract:['川','河','江']
  },
  {
    idiom: '水落石出',
    blanks: [3],
    meaning: '比喻事情經過澄清而後真相大白。',
    kidStory: '宋代文學家歐陽修寫〈醉翁亭記〉，描寫山林四季的景色：冬天溪水變少了，原本藏在水底的石頭全部露出來。就像被遮住的真相，最後終於清楚地呈現出來。',
    fullStory: '醉翁亭位於滁州城西南瑯琊山兩峰之間，為山僧智仙所築。〈醉翁亭記〉就是歐陽修遊賞醉翁亭後所寫下的一篇文章，文中描寫出山林四季變化的景色：春季有野花幽香，夏季有綠樹繁茂而成一片濃蔭，秋季風聲蕭瑟而霜色瑩潔，冬季水枯而石頭盡露。朝暮之間的景色變化，加以四季的不同景色，使得遊賞於醉翁亭中的快樂顯得無窮無盡。「水落石出」或許就是從本文摘出的一個成語。因為水位低，本來沉於水底的石頭逐一浮露出來，石頭猶如原被遮掩的真相，所以這句成語就被用於比喻事情經過澄清而後真相大白。',
    emoji: '🪨', bg: 'linear-gradient(160deg,#c4ecff,#8fd4f0)', tag: '自然景象', mildDistract:['落','沉','藏'], hardDistract:['露','現','來']
  },
  {
    idiom: '青出於藍',
    blanks: [3],
    meaning: '比喻學生表現較老師出色，晚輩成就超過前輩。',
    kidStory: '戰國時代的大哲學家荀子寫〈勸學〉鼓勵大家學習。他說：靛青這種顏料是從蓼藍提煉出來的，但顏色比蓼藍更青；冰是水凍成的，但比水更冷。學習就有這種神奇的效果，能讓你超越原本的自己！',
    fullStory: '戰國時代大哲學家荀子寫了一篇〈勸學〉的文章來鼓勵大家多學習。學習有什麼好處呢？就像靛青是從蓼藍提煉出來，但是顏色比蓼藍還要青；冰是水結凍而成，但是溫度比水還要低。學習就像這種提煉和結凍的效果一樣。我們把一根直挺挺的木條用輮的工夫，慢慢使它彎曲，製成車輪，等它彎曲合乎規矩後，就是經過日晒乾枯也不會再恢復原狀了，這種輮的工夫也是學習。所以木頭要劃得直，得靠繩墨；金屬要磨銳，得靠礪石。君子就是要接受繩墨般的約束，礪石般的磨鍊，假如能廣泛地去學習，而且能時時反省自己，那就不會有什麼過錯了。後來就從荀子這段話中演變成「青出於藍」這句成語，原來是用來比喻學習的效果，後多用來比喻學生表現較老師出色，晚輩成就超過前輩。',
    emoji: '💙', bg: 'linear-gradient(160deg,#d4e0ff,#aec4f0)', tag: '勵志學習', mildDistract:['紅','白','黑'], hardDistract:['監','籃','蘭']
  },
  {
    idiom: '滄海桑田',
    blanks: [0, 2],
    meaning: '比喻環境變化很大，或世事無常、變化很快。',
    kidStory: '傳說仙女麻姑對仙人王方平說：「自從上次見到你，東海已經三次變成農田了！剛才去蓬萊仙山，海水又淺了一半。」大海變農田，形容世界變化非常大。',
    fullStory: '葛洪，晉句容人，字稚川，自號抱朴子。好神仙導養之法，著《抱朴子》一書，述煉丹之法，建立長生理論。而成書時間較晚的《神仙傳》，收錄數十位道教神仙的傳記，書裡記載這麼一段故事：傳說中的仙女麻姑，在和仙人王方平談天敘舊時說道：「自從上次接待你之後，東海已經三次變成農田了，時間過得真快。剛才到蓬萊仙山去巡視時，看見周圍的海水，比我上次去時又淺了一半，難道又將再度乾涸變成陸地？」王方平於是感嘆地說：「一旦變成陸地後，行經東海，又要滿是飛揚的塵土了。」後來這個故事演變成「滄海桑田」這句成語，「桑田」就是種農作物的田，也就是陸地。「滄海桑田」原用來比喻環境變化很大，後亦可用來比喻世事無常，變化很快。',
    emoji: '🌊', bg: 'linear-gradient(160deg,#c4ecff,#8fd4f0)', tag: '神話傳說', mildDistract:['河','江','湖'], hardDistract:['倉','喪','桒']
  },
  {
    idiom: '守口如瓶',
    blanks: [3],
    meaning: '比喻嚴守祕密。',
    kidStory: '古書《法苑珠林》說：「防意如城，守口如瓶。」意思是防止壞念頭要像守城一樣嚴密，管住嘴巴要像瓶口一樣封緊——說話謹慎，祕密絕不外洩！',
    fullStory: '守口如瓶就是把嘴像瓶口一樣封得嚴緊，比喻嚴守祕密。這句成語較早出現在《法苑珠林．卷四七．懲過篇．引證部》：「防意如城，守口如瓶」兩句。「防意如城」的意思就是指防止私欲的心有如防止敵人攻城。〈懲過篇〉的大意講到如要修練身心，都得接受挫折和磨練，才能潔心淨意。就好像滿是金子的山洞過於顯眼，狐兔不敢停留；也好像澄澈的水塘，蛙龜不敢藏身。心意一潔淨，邪念惡意就如同狐兔和蛙龜一般，不能窩藏。人如能潔心淨意，則輪迴之報可止，心中時常充滿和樂。並且能防意如城，不讓邪念產生；守口如瓶，謹言慎行。後來「守口如瓶」則被用來比喻嚴守祕密，如《隋唐演義》第三五回：「今願陛下守口如瓶，不可提起，萬一洩漏風聲，娘娘與夫人們只道妾等巧詐，以博聖恩眷寵。」',
    emoji: '🤐', bg: 'linear-gradient(160deg,#d4f0c4,#a8e08f)', tag: '生活智慧', mildDistract:['碗','盆','桶'], hardDistract:['甁','瓷','缾']
  },
  {
    idiom: '分道揚鑣',
    blanks: [3],
    meaning: '比喻人依其志向，各奔前程。',
    kidStory: '北魏的元志和李彪在路上相遇，兩人都不肯讓路，吵到皇帝面前。皇帝笑著說：「把路分成兩半，你們各走各的！」兩人就拿尺量路，一人走一半。',
    fullStory: '「分道揚鑣」原作「分路揚鑣」。北魏時，有個名叫元志的人，不但是皇親國戚，還是當時首都洛陽的行政長官。他個性強悍，任何事都不輕易退讓。有一天，他乘座車走在路上，御史中尉李彪的座車也迎面而來。由於兩方都人馬眾多，一定要有一方退讓才能通過。照理說，官小的人要讓官大的人先走。而以官職來論，李彪是中央官員，元志只是地方首長，應該要禮讓。但元志個性強硬，加上是皇親國戚，硬是不肯讓步。雙方因此鬧得不可開交，決定去找皇上評理。李彪見了孝文帝說：「我是御史中尉，官比他大，區區一個洛陽市長怎麼可以這樣和我對抗呢？」元志反駁說：「我是國都所在的洛陽市長，洛陽城裡每個人都歸我管，哪有比照其他地方官，讓中央官員先走的道理？」孝文帝聽了很無奈，也不去評斷誰是誰非，就笑著說：「好啦！好啦！你們別吵！洛陽是我的地方，我說了就算，把路分成兩半，你們兩人以後各走各的就好啦！」元志和李彪兩人聽到皇上這麼說後，就拿著尺到外面，量了道路的寬度，然後分成兩半，各走自己的那一半。後來「分道揚鑣」這句成語就從這裡演變而出，比喻人依其志向，各奔前程。',
    emoji: '🐎', bg: 'linear-gradient(160deg,#ffe3c4,#ffc98f)', tag: '歷史故事', mildDistract:['劍','旗','鼓'], hardDistract:['鏢','鑫','標']
  },
  {
    idiom: '手足無措',
    blanks: [1, 3],
    meaning: '形容人惶恐不安，不知如何是好。',
    kidStory: '孔子說：名分不正，說話就不合道理，事情做不成，禮樂刑罰都會失當，人民就會惶恐終日，連手和腳都不知道該放哪裡。形容慌張得不知道怎麼辦才好。',
    fullStory: '《史記．卷四七．孔子世家》有一段記載：衛靈公死後，衛人立蒯聵之子輒，是為出公。這一年六月，趙鞅將蒯聵納於衛國的戚地，與輒對立。直到出公五年，衛君輒始終違抗父親蒯聵，諸侯們屢次以這件事責備衛國。這時孔子門人子路等多在衛國任職，衛君輒想要請孔子主政。此刻蒯聵已在晉人的協助下回國，佔領了戚邑，父子相峙不下，盡失其應有的風度。在這種情形下，孔子自然不願為一個名不正、言不順的君主效力。他向子路陳述「正名」的道理，說：「名分不正，所說的話就不合道理；說的話不合道理，事情就做不成；事情都做不成，當然安上治民的禮、移風易俗的樂就無法產生；禮樂不能產生，刑罰就因失去依據而不能輕重適中；刑罰失當，人民舉手投足都容易犯錯，就會惶恐終日，不知如何安放手腳。」孔子所講的此一席話，見於《論語．子路》。後來「手足無措」這句成語，就從孔子所說的「民無所錯其手足」演變而出，用來形容人惶恐不安，不知如何是好。',
    emoji: '😰', bg: 'linear-gradient(160deg,#e6d4ff,#c9aef0)', tag: '聖賢故事', mildDistract:['頭','身','心'], hardDistract:['促','錯','挫']
  },
  {
    idiom: '刮目相看',
    blanks: [0, 2],
    meaning: '形容用新的眼光來看待人。',
    kidStory: '三國時吳國的呂蒙小時候沒讀什麼書，被人看輕。孫權勸他多讀書，他發奮學習。後來魯肅發現他學識大增，驚訝不已。呂蒙說：「士別三日，就要刮目相待！」',
    fullStory: '「刮目相看」原作「刮目相待」，指將眼前舊有的認識刮除，重新看待。三國時吳將呂蒙，小時候因為生活困苦，沒有讀過什麼書，以致有些官員認為他沒有學識而看輕他。有一天，吳國君主孫權勸呂蒙和蔣欽，要他們趁著年輕多看史書和兵書充實學識，呂蒙起先推說軍務煩忙沒有時間，孫權就舉自己、漢光武帝及曹操的例子來勉勵他。於是他開始發奮學習，到後來看過的書籍，甚至比一般儒生還多。吳國另一位將軍魯肅在代理周瑜的職務期間，有次巡視呂蒙駐守的營區，本來魯肅也有一點輕視呂蒙，但卻在議論事情時說不過他，於是拍著呂蒙的背說：「我一直以為你只會帶兵，沒想到你學識這麼淵博，已經不是當年那個學識淺陋的呂蒙了。」呂蒙回答：「士三天不見，就應該讓人刮目相待。」後來「刮目相看」即從這裡演變而來，形容用新的眼光來看待人，含有重新評定、認識的意義。',
    emoji: '📚', bg: 'linear-gradient(160deg,#c8f0e0,#9be0c9)', tag: '三國故事', mildDistract:['睜','閉','盯'], hardDistract:['括','想','箱']
  },
]

/* C 級提示 */
const POS_NAME  = ['第一字','第二字','第三字','第四字']
const DISTRACT  = ['風','雨','雲','木','心','手','火','三','百','千','頭','東','西','上','下','大','小','天','日','月']

function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function makeTiles(q){
  const chars=q.idiom.split('')
  const answers=q.blanks.map(i=>chars[i])
  let opts=[...answers]
  const pool=shuffle([...DISTRACT])
  const target=q.blanks.length+3
  for(const d of pool){if(opts.length>=target)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  return shuffle(opts).map((ch,k)=>({ch,tid:`t${k}`,used:false}))
}

/* ═══════════════════════════════════════════
   四輪漸進回想訓練
   輪1：挖原本設計的1字，無干擾
   輪2：挖原本設計的2字（若原本只有1字，額外挖1字），無干擾
   輪3：四字全挖，無干擾（只有4個正確字，順序打亂）
   輪1：挖1字，加輕度干擾字
   輪2：挖2字，加更多輕度干擾字
   輪3：四字全挖，無干擾（完整重建）
   輪4：四字全挖，加入形近/音近高辨識度干擾字
   ═══════════════════════════════════════════ */
const DRILL_ROUNDS=[
  {id:1,label:'第 1 輪・單字回想',desc:'挖 1 個字，加入一些干擾字，先熟悉位置'},
  {id:2,label:'第 2 輪・雙字回想',desc:'挖 2 個字，干擾字變多，開始需要判斷'},
  {id:3,label:'第 3 輪・全字回想',desc:'四個字全部挖空，沒有干擾字，考驗完整記憶'},
  {id:4,label:'第 4 輪・全字挑戰',desc:'四個字全部挖空，加入相似字干擾，真正考驗實力'},
]

function drillBlanks(q,round){
  if(round===1)return [...q.blanks].slice(0,1)
  if(round===2){
    if(q.blanks.length>=2)return q.blanks.slice(0,2)
    // 原本只挖1字，補一個相鄰位置湊成2字
    const extra=q.blanks[0]===3?2:q.blanks[0]+1
    return shuffle([q.blanks[0],extra]).sort((a,b)=>a-b)
  }
  return [0,1,2,3] // round 3、4 全挖
}

function drillTiles(q,round){
  const blanks=drillBlanks(q,round)
  const chars=q.idiom.split('')
  const answers=blanks.map(i=>chars[i])
  let opts=[...answers]

  if(round===1){
    // 第1輪：認字+定位，加2個輕度干擾（同類但語意不合）
    const pool=shuffle([...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+2)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }else if(round===2){
    // 第2輪：鞏固+初步判斷，加3個輕度干擾
    const pool=shuffle([...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+3)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }else if(round===3){
    // 第3輪：全字完整重建，無干擾
    opts=[...answers]
  }else{
    // 第4輪：全字挑戰，用形近/音近/同義字做高辨識度干擾
    const pool=shuffle([...(q.hardDistract||[]),...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+4)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }
  return shuffle(opts).map((ch,k)=>({ch,tid:`d${k}`,used:false}))
}

/* 診斷（5 題版：每題 20 分） */
const ROUND_WEIGHT={1:5,2:8,3:10,4:12} // 難度越高權重越高
const ROUND_MAX=Object.values(ROUND_WEIGHT).reduce((a,b)=>a+b,0)*IDIOMS.length // 350

function diagnoseFourRounds(drillAnswers){
  // drillAnswers: [{round,idiom,correct}, ...] 共40筆
  let rawScore=0
  const roundStats={1:{correct:0,total:0},2:{correct:0,total:0},3:{correct:0,total:0},4:{correct:0,total:0}}
  const wrongIdioms={}
  drillAnswers.forEach(a=>{
    roundStats[a.round].total++
    if(a.correct){
      roundStats[a.round].correct++
      rawScore+=ROUND_WEIGHT[a.round]
    }else{
      wrongIdioms[a.idiom]=(wrongIdioms[a.idiom]||0)+1
    }
  })
  const totalScore=Math.round((rawScore/ROUND_MAX)*100)
  const totalCorrect=drillAnswers.filter(a=>a.correct).length

  // 找出表現最弱的輪次（正確率最低）
  let weakestRound=1,weakestRate=1
  for(let r=1;r<=4;r++){
    const st=roundStats[r]
    const rate=st.total?st.correct/st.total:0
    if(rate<weakestRate){weakestRate=rate;weakestRound=r}
  }

  const strengths=[],weaknesses=[]
  for(let r=1;r<=4;r++){
    const st=roundStats[r]
    const rate=st.total?Math.round((st.correct/st.total)*100):0
    const label=DRILL_ROUNDS[r-1].label
    if(rate>=80)strengths.push(`✅ ${label}表現優秀（${st.correct}/${st.total}，${rate}%）`)
    else weaknesses.push(`⚠️ ${label}需要加強（${st.correct}/${st.total}，${rate}%）`)
  }
  const topWrong=Object.entries(wrongIdioms).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([name])=>name)

  let level='B'
  if(totalScore>=80)level='A'
  else if(totalScore<40)level='C'

  return{totalScore,totalCorrect,roundStats,weakestRound,strengths,weaknesses,topWrong,recommendedLevel:level}
}

function getRecommendationText(l){
  const t={
    C:'建議從 C 級開始：有典故故事和提示，一步一步幫你記住每個成語！',
    B:'你的表現不錯！B 級有故事情境但沒有提示，幫你鞏固典故理解。',
    A:'你的成績優秀！A 級只有圖片和意思，考驗你對典故的真正掌握！'
  }
  return t[l]
}
function levelName(l){return l==='A'?'A 級挑戰':l==='B'?'B 級訓練':'C 級基礎'}
function levelEmoji(l){return l==='A'?'🟢':l==='B'?'🟡':'🔴'}

function ImgWithFallback({src,fallback,alt,className,style}){
  const[err,setErr]=useState(false)
  useEffect(()=>{setErr(false)},[src])
  if(!USE_IMAGES||err)return <span style={style}>{fallback}</span>
  return <img src={src} alt={alt} className={className} style={style} onError={()=>setErr(true)}/>
}

function ProgressBar({idx,total}){
  return(
    <div className="progressbar">
      {Array.from({length:total},(_,i)=>(
        <div key={i} className={`pb-step${i===idx?' active':i<idx?' done':''}`}>{i<idx?'✓':i+1}</div>
      ))}
    </div>
  )
}

function Scene({q,qIdx,blankCount}){
  return(
    <div className="scene" style={{background:q.bg}}>
      <span className="twinkle t1">✨</span><span className="twinkle t2">⭐</span><span className="twinkle t3">✨</span>
      {USE_IMAGES?<ImgWithFallback src={quizImg(qIdx)} fallback={q.emoji} alt={q.idiom} className="scene-img"/>:<span className="scene-emoji">{q.emoji}</span>}
      <span className="scene-tag">{q.tag}・填{blankCount??q.blanks.length}字</span>
    </div>
  )
}

function IdiomRow({q,placed,onClickSlot,blanksOverride}){
  const chars=q.idiom.split('')
  const blanks=blanksOverride||q.blanks
  return(
    <div className="idiom-row">
      {chars.map((ch,i)=>blanks.includes(i)?(
        <div key={i} data-pos={i} className={`slot${placed[i]?' filled':''}${placed[i]?.correct===true?' correct':''}${placed[i]?.correct===false?' wrong':''}`} onClick={()=>onClickSlot(i)}>
          {placed[i]?.ch??''}<span className="pos-hint">{POS_NAME[i]}</span>
        </div>
      ):<div key={i} className="fixed-char">{ch}</div>)}
    </div>
  )
}

function burst(count=14){
  const emo=['⭐','✨','🎉','🌟','🎊','🌈','🏆']
  for(let i=0;i<count;i++){
    const el=document.createElement('div')
    el.className='confetti';el.textContent=emo[Math.floor(Math.random()*emo.length)]
    el.style.left=Math.random()*100+'vw';el.style.animationDuration=(1.5+Math.random()*2)+'s'
    el.style.animationDelay=(Math.random()*0.5)+'s';el.style.fontSize=(1.2+Math.random()*1.4)+'rem'
    document.body.appendChild(el);setTimeout(()=>el.remove(),4000)
  }
}

export default function Home(){
  // 畫面：intro / menu / level1-intro / learn / level1 / diagnosis / level2-select / level2-intro / level2-game
  const[screen,setScreen]=useState('intro')
  const[learnIdx,setLearnIdx]=useState(0)          // 學習階段：第幾個典故
  const[drillRound,setDrillRound]=useState(1)       // 四輪訓練：第幾輪（1-4）
  const[drillIdx,setDrillIdx]=useState(0)           // 四輪訓練：第幾題（0-9）
  const[drillScore,setDrillScore]=useState(0)
  const[freeIdiomIdx,setFreeIdiomIdx]=useState(null)  // 自由練習：選的成語
  const[freeRound,setFreeRound]=useState(1)            // 自由練習：選的模式
  const[qIdx,setQIdx]=useState(0)
  const[score,setScore]=useState(0)
  const[answers,setAnswers]=useState([])
  const[diagnosis,setDiagnosis]=useState(null)
  const[placed,setPlaced]=useState({})
  const[tiles,setTiles]=useState([])
  const[result,setResult]=useState(null)
  const[msg,setMsg]=useState('')
  const dragRef=useRef(null)
  const ghostRef=useRef(null)
  const answersRef=useRef([])
  const drillAnswersRef=useRef([])

  const initQ=useCallback((idx)=>{
    setPlaced({});setResult(null);setMsg('')
    setTiles(makeTiles(IDIOMS[idx]))
  },[])

  const initDrillQ=useCallback((round,idx)=>{
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[idx],round))
  },[])

  useEffect(()=>{
  },[qIdx,screen,initQ])

  useEffect(()=>{
    if(screen==='drill')initDrillQ(drillRound,drillIdx)
  },[drillRound,drillIdx,screen,initDrillQ])

  /* ── 流程 ── */
  function startLevel1(){setScreen('level1-intro')}
  function beginLearn(){setLearnIdx(0);setScreen('learn')}
  function nextLearn(){
    if(learnIdx<IDIOMS.length-1)setLearnIdx(i=>i+1)
    else beginDrill()
  }
  function prevLearn(){if(learnIdx>0)setLearnIdx(i=>i-1)}
  function beginDrill(){setDrillRound(1);setDrillIdx(0);setDrillScore(0);drillAnswersRef.current=[];setScreen('drill')}

  function startFreeLearn(idx){setFreeIdiomIdx(idx);setScreen('free-learn')}
  function startFreeDrill(idx,round){
    setFreeIdiomIdx(idx);setFreeRound(round)
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[idx],round))
    setScreen('free-drill')
  }
  function checkFreeDrill(){
    const q=IDIOMS[freeIdiomIdx]
    const blanks=drillBlanks(q,freeRound)
    const chars=q.idiom.split('')
    let allOk=true
    const next={...placed}
    blanks.forEach(pos=>{const ok=next[pos]?.ch===chars[pos];next[pos]={...next[pos],correct:ok};if(!ok)allOk=false})
    setPlaced(next)
    if(allOk){
      setResult('ok');setMsg(`✦ 答對了！「${q.idiom}」`);burst(10)
    }else{
      setResult('err');setMsg('✗ 放錯了，再想想看！')
      setTimeout(()=>{
        setPlaced(prev=>{
          const n={...prev}
          blanks.forEach(pos=>{if(n[pos]?.correct===false){const tid=n[pos].tid;setTiles(ts=>ts.map(t=>t.tid===tid?{...t,used:false}:t));delete n[pos]}})
          return n
        })
        setResult(null);setMsg('')
      },900)
    }
  }

  /* ── 拖曳 ── */
  function handleClickSlot(pos){
    if(!placed[pos]||result!==null)return
    const{tid}=placed[pos]
    setPlaced(p=>{const n={...p};delete n[pos];return n})
    setTiles(ts=>ts.map(t=>t.tid===tid?{...t,used:false}:t))
    setMsg('')
  }
  function dropInto(pos,{ch,tid}){
    setPlaced(prev=>{
      const n={...prev}
      if(n[pos]){const old=n[pos].tid;setTiles(ts=>ts.map(t=>t.tid===old?{...t,used:false}:t))}
      n[pos]={ch,tid,correct:null};return n
    })
    setTiles(ts=>ts.map(t=>t.tid===tid?{...t,used:true}:t))
    setMsg('')
  }

  /* ── 四輪回想訓練（答對才前進，答錯可重試） ── */
  /* ── 四輪盲測（每題1次機會，累積40題後產出評級） ── */
  function checkDrill(){
    const q=IDIOMS[drillIdx]
    const blanks=drillBlanks(q,drillRound)
    const chars=q.idiom.split('')
    let allOk=true
    const next={...placed}
    blanks.forEach(pos=>{const ok=next[pos]?.ch===chars[pos];next[pos]={...next[pos],correct:ok};if(!ok)allOk=false})
    setPlaced(next)
    drillAnswersRef.current.push({round:drillRound,idiom:q.idiom,correct:allOk})
    if(allOk){
      setDrillScore(s=>s+1)
      setResult('ok');setMsg(`✦ 答對了！「${q.idiom}」`);burst(10)
    }else{
      setResult('err');setMsg(`✗ 答錯了，正確答案是「${q.idiom}」`)
    }
    setTimeout(()=>{
      if(drillIdx<IDIOMS.length-1){
        setDrillIdx(i=>i+1)
      }else if(drillRound<4){
        setDrillRound(r=>r+1);setDrillIdx(0);setDrillScore(0)
      }else{
        setDiagnosis(diagnoseFourRounds(drillAnswersRef.current))
        setScreen('diagnosis')
      }
    },1400)
  }

  /* ── 第二關 ── */
  function onTilePointerDown(e,tile){
    if(tile.used||(result!==null&&screen==='drill'))return
    e.preventDefault();dragRef.current=tile
    const g=document.createElement('div');g.className='tile-ghost';g.textContent=tile.ch
    document.body.appendChild(g);ghostRef.current=g;moveGhost(e.clientX,e.clientY)
    const onMove=(ev)=>{
      moveGhost(ev.clientX,ev.clientY)
      document.querySelectorAll('.slot').forEach(s=>s.classList.remove('over'))
      const el=document.elementFromPoint(ev.clientX,ev.clientY);el?.closest('.slot')?.classList.add('over')
    }
    const onUp=(ev)=>{
      document.removeEventListener('pointermove',onMove);document.removeEventListener('pointerup',onUp)
      ghostRef.current?.remove();ghostRef.current=null
      document.querySelectorAll('.slot').forEach(s=>s.classList.remove('over'))
      const el=document.elementFromPoint(ev.clientX,ev.clientY);const slot=el?.closest('.slot')
      if(slot&&dragRef.current){const pos=parseInt(slot.dataset.pos);dropInto(pos,dragRef.current)}
      dragRef.current=null
    }
    document.addEventListener('pointermove',onMove);document.addEventListener('pointerup',onUp)
  }
  function moveGhost(x,y){if(ghostRef.current){ghostRef.current.style.left=x+'px';ghostRef.current.style.top=y+'px'}}


  const q=IDIOMS[qIdx]
  const filled=Object.keys(placed).length
  const canCheck=filled===q.blanks.length&&result===null
  const learn=IDIOMS[learnIdx]

  return(
    <>
      <Head><title>成語穿越者・典故學習館</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>

      <div className="sidebar">
        <div className="sidebar-header">🗺️ 關卡選單</div>
        <button className="sidebar-back" onClick={()=>setScreen('intro')}>🏠 返回首頁</button>
        <div style={{margin:'16px 12px 8px',fontSize:'.85rem',color:'var(--gold-dim)',fontWeight:700,textAlign:'center'}}>關卡</div>
        <div className={`sidebar-item${['menu','level1-intro','learn','drill','diagnosis'].includes(screen)?' active':''}`} onClick={()=>setScreen('menu')}>成語驗驗看 1-1</div>
        <div className={`sidebar-item${['free-select','free-learn','free-drill'].includes(screen)?' active':''}`} onClick={()=>setScreen('free-select')}>🎯 自由練習</div>
        <div className={`sidebar-item${screen.startsWith('level2')?' active':''}`} onClick={()=>{if(diagnosis)setScreen('level2-rules')}} style={{opacity:diagnosis?1:0.4,cursor:diagnosis?'pointer':'not-allowed'}}>第二關：分級訓練 {!diagnosis&&'🔒'}</div>
      </div>

      <div className="cloud c1"/><div className="cloud c2"/><div className="cloud c3"/>

      <div className="wrap">

        {/* ════ 序章 ════ */}
        <section className={`screen intro-screen${screen==='intro'?' show':''}`}>
          <div className="intro">
            <div className="portal"><ImgWithFallback src={introImg} fallback="🌀" alt="序章" style={{width:280,height:280,objectFit:'contain',borderRadius:24}}/></div>
            <h1>成語穿越者</h1>
            <div className="scroll-box">
              <p>你現在是一位穿梭在各個成語故事之中的<span className="hl">穿越者</span>。<br/>每打開一扇門，就會走進一個古老的<span className="hl2">典故世界</span>——<br/>有仗劍直言的毛遂、寫詩感恩的孟郊、勸人學習的荀子……<br/><br/>請先<span className="hl">讀懂每個典故</span>，<br/>再把散落的字拼回成語，證明你真的學會了！</p>
            </div>
            <button className="btn btn-go" onClick={()=>setScreen('menu')}>🚪　推開第一扇門</button>
          </div>
        </section>

        {/* ════ 地圖 ════ */}
        <section className={`screen${screen==='menu'?' show':''}`}>
          <div className="menu-head"><h2>🗺️ 成語故事地圖</h2><p>選擇關卡，開始你的成語冒險吧！</p></div>
          <div className="level-grid">
            <div className="level-card open" onClick={startLevel1}>
              <span className="lv-emoji">📖</span><div className="lv-no">成語驗驗看</div><h3>1-1</h3>
              <div className="lv-desc">先學典故，再進行四輪評級測驗，測出你的理解程度。</div><span className="lv-tag ready">▶ 開始</span>
            </div>
            <div className="level-card open" onClick={()=>setScreen('free-select')}>
              <span className="lv-emoji">🎯</span><div className="lv-no">自由練習</div><h3>單題重複練習</h3>
              <div className="lv-desc">自己選成語、選模式，想練哪一題就練哪一題，可以重複練習。</div><span className="lv-tag ready">▶ 選擇練習</span>
            </div>
          </div>
        </section>

        {/* ════ 自由選關 ════ */}
        <section className={`screen${screen==='free-select'?' show':''}`}>
          <div className="menu-head"><h2>🎯 自由練習</h2><p>選擇任何一個成語，用任何模式重複練習</p></div>
          <div className="free-idiom-grid">
            {IDIOMS.map((it,i)=>(
              <div key={i} className={`free-idiom-card${freeIdiomIdx===i?' selected':''}`} onClick={()=>setFreeIdiomIdx(i)}>
                <span className="free-idiom-emoji">{it.emoji}</span>
                <div className="free-idiom-name">{it.idiom}</div>
                <div className="free-idiom-tag">{it.tag}</div>
              </div>
            ))}
          </div>
          {freeIdiomIdx!==null&&(
            <>
              <p className="section-title">已選擇：{IDIOMS[freeIdiomIdx].emoji} {IDIOMS[freeIdiomIdx].idiom}　選擇練習模式</p>
              <div className="free-mode-grid">
                <div className="free-mode-card" onClick={()=>startFreeLearn(freeIdiomIdx)}>
                  <span className="lv-emoji">📖</span><h3>學習典故</h3><div className="lv-desc">看漫畫和完整原文</div>
                </div>
                <div className="free-mode-card" onClick={()=>startFreeDrill(freeIdiomIdx,1)}>
                  <span className="lv-emoji">1️⃣</span><h3>挖1字</h3><div className="lv-desc">輕度干擾</div>
                </div>
                <div className="free-mode-card" onClick={()=>startFreeDrill(freeIdiomIdx,2)}>
                  <span className="lv-emoji">2️⃣</span><h3>挖2字</h3><div className="lv-desc">輕度干擾</div>
                </div>
                <div className="free-mode-card" onClick={()=>startFreeDrill(freeIdiomIdx,3)}>
                  <span className="lv-emoji">🀄</span><h3>全字挖空</h3><div className="lv-desc">無干擾</div>
                </div>
                <div className="free-mode-card" onClick={()=>startFreeDrill(freeIdiomIdx,4)}>
                  <span className="lv-emoji">🔥</span><h3>全字挑戰</h3><div className="lv-desc">相似字干擾</div>
                </div>
              </div>
            </>
          )}
          <div className="actions"><button className="btn btn-ghost" onClick={()=>setScreen('menu')}>← 返回地圖</button></div>
        </section>

        {/* ════ 自由練習：學習單一典故 ════ */}
        <section className={`screen${screen==='free-learn'?' show':''}`}>
          <div className="topbar">
            <button className="back-btn" onClick={()=>setScreen('free-select')}>← 自由練習</button>
          </div>
          <div className="card">
            <div className="level-banner">📖 自由學習：{IDIOMS[freeIdiomIdx??0]?.idiom}</div>
            <div className="learn-img-box">
              <ImgWithFallback src={storyImg(freeIdiomIdx??0)} fallback={<div className="learn-placeholder"><span style={{fontSize:'4rem'}}>{IDIOMS[freeIdiomIdx??0]?.emoji}</span><p>（此處放 s{(freeIdiomIdx??0)+1}.png 典故漫畫）</p></div>} alt="典故漫畫" className="learn-img"/>
            </div>
            <div className="learn-story">
              <h3>{IDIOMS[freeIdiomIdx??0]?.emoji} {IDIOMS[freeIdiomIdx??0]?.idiom}</h3>
              <p className="learn-kid">{IDIOMS[freeIdiomIdx??0]?.kidStory}</p>
              <p className="meaning">💡 意思：{IDIOMS[freeIdiomIdx??0]?.meaning}</p>
              <p className="learn-full-label">📜 完整典故原文</p>
              <p className="learn-full">{IDIOMS[freeIdiomIdx??0]?.fullStory}</p>
            </div>
            <div className="actions">
              <button className="btn btn-go" onClick={()=>setScreen('free-select')}>選擇練習模式 →</button>
            </div>
          </div>
        </section>

        {/* ════ 自由練習：單題挖空（可重複） ════ */}
        <section className={`screen${screen==='free-drill'?' show':''}`}>
          <div className="topbar">
            <button className="back-btn" onClick={()=>setScreen('free-select')}>← 自由練習</button>
            <div className="score-pill">{freeRound===4?'🔥 全字挑戰':freeRound===3?'🀄 全字挖空':freeRound===2?'2️⃣ 挖2字':'1️⃣ 挖1字'}</div>
          </div>
          {freeIdiomIdx!==null&&(
            <div className="card">
              <div className="level-banner">🎯 自由練習：{IDIOMS[freeIdiomIdx].idiom}</div>
              <Scene q={IDIOMS[freeIdiomIdx]} qIdx={freeIdiomIdx} blankCount={drillBlanks(IDIOMS[freeIdiomIdx],freeRound).length}/>
              <p className="story">「{IDIOMS[freeIdiomIdx].kidStory}」</p>
              <p className="meaning">💡 意思：{IDIOMS[freeIdiomIdx].meaning}</p>
              <IdiomRow q={IDIOMS[freeIdiomIdx]} placed={placed} onClickSlot={handleClickSlot} blanksOverride={drillBlanks(IDIOMS[freeIdiomIdx],freeRound)}/>
              <div className="bank-label">✦　把下面的字拖到上面的空格　✦</div>
              <div className="bank">{tiles.map(tile=>(<div key={tile.tid} className={`tile${tile.used?' used':''}`} onPointerDown={e=>onTilePointerDown(e,tile)}>{tile.ch}</div>))}</div>
              <div className="actions">
                <button className="btn btn-ghost" onClick={()=>initDrillQ(freeRound,freeIdiomIdx)}>🔄 重來</button>
                {result==='ok'
                  ?<button className="btn btn-grass" onClick={()=>initDrillQ(freeRound,freeIdiomIdx)}>🔁 再練一次</button>
                  :<button className="btn btn-sun" disabled={Object.keys(placed).length!==drillBlanks(IDIOMS[freeIdiomIdx],freeRound).length||result!==null} onClick={checkFreeDrill}>✅ 拼好了</button>}
              </div>
              <div className={`result${result==='ok'?' result-success':result==='err'?' result-error':''}`}>{msg}</div>
              <div className="actions" style={{marginTop:8}}>
                <button className="btn btn-ghost" onClick={()=>setScreen('free-select')}>🔀 換題目或模式</button>
              </div>
            </div>
          )}
        </section>

        {/* ════ 第一關簡短說明 ════ */}
        <section className={`screen${screen==='level1-intro'?' show':''}`}>
          <div className="diagnosis-screen">
            <h2>📖 第一關怎麼玩？</h2>
            <div className="diagnosis-details">
              <div className="detail-row"><span>第一步：</span><span className="good">📖 學習 10 個成語典故（漫畫＋原文）</span></div>
              <div className="detail-row"><span>第二步：</span><span className="good">🔁 四輪評級測驗（共 40 題）</span></div>
              <div className="detail-row"><span>測驗規則：</span><span className="warning">每題只有 1 次機會，不能重試</span></div>
            </div>
            <div className="analysis-box">
              <div className="strengths" style={{borderLeftColor:'var(--grass)'}}>
                <h4>🔁 四輪測驗是什麼？</h4>
                <ul>
                  <li>第 1 輪：挖 1 個字，加入少量干擾字</li>
                  <li>第 2 輪：挖 2 個字，干擾字變多</li>
                  <li>第 3 輪：四個字全挖，沒有干擾字（完整重建）</li>
                  <li>第 4 輪：四個字全挖，加入形近、音近的相似字干擾，最有挑戰性！</li>
                </ul>
              </div>
            </div>
            <div className="recommendation-box">
              <h4>💡 小提醒</h4>
              <p>認真看每一個典故漫畫，記住故事裡的<b>人物</b>和<b>道理</b>。四輪測驗<b>每題只有一次機會</b>，答對答錯都會自動進入下一題，最後會依你四輪的表現算出評級喔！</p>
            </div>
            <div className="actions">
              <button className="btn btn-ghost" onClick={()=>setScreen('menu')}>← 返回地圖</button>
              <button className="btn btn-go" onClick={beginLearn}>開始學習典故 →</button>
            </div>
          </div>
        </section>

        {/* ════ 學習階段：典故漫畫 ════ */}
        <section className={`screen${screen==='learn'?' show':''}`}>
          <div className="topbar">
            <button className="back-btn" onClick={()=>setScreen('level1-intro')}>← 說明</button>
            <ProgressBar idx={learnIdx} total={IDIOMS.length}/>
            <div className="score-pill">📖 {learnIdx+1}/{IDIOMS.length}</div>
          </div>
          <div className="card">
            <div className="level-banner">📖 典故學習（{learnIdx+1}/{IDIOMS.length}）：{learn.idiom}</div>
            <div className="learn-img-box">
              <ImgWithFallback src={storyImg(learnIdx)} fallback={<div className="learn-placeholder"><span style={{fontSize:'4rem'}}>{learn.emoji}</span><p>（此處放 s{learnIdx+1}.png 典故漫畫）</p></div>} alt={learn.idiom+' 典故漫畫'} className="learn-img"/>
            </div>
            <div className="learn-story">
              <h3>{learn.emoji} {learn.idiom}</h3>
              <p className="learn-kid">{learn.kidStory}</p>
              <p className="meaning">💡 意思：{learn.meaning}</p>
              <p className="learn-full-label">📜 完整典故原文</p>
              <p className="learn-full">{learn.fullStory}</p>
            </div>
            <div className="actions">
              {learnIdx>0&&<button className="btn btn-ghost" onClick={prevLearn}>← 上一個</button>}
              <button className="btn btn-grass" onClick={nextLearn}>{learnIdx<IDIOMS.length-1?'下一個典故 →':'學完了，開始練習 🔁'}</button>
            </div>
          </div>
        </section>

        {/* ════ 四輪回想訓練 ════ */}
        <section className={`screen${screen==='drill'?' show':''}`}>
          <div className="topbar">
            <div className="score-pill">📝 評級測驗</div>
            <ProgressBar idx={drillIdx} total={IDIOMS.length}/>
            <div className="score-pill">✅ {drillScore}</div>
          </div>
          <div className="card">
            <div className="drill-round-bar">
              {DRILL_ROUNDS.map(r=>(
                <div key={r.id} className={`drill-round-tag${r.id===drillRound?' active':''}${r.id<drillRound?' done':''}`}>{r.id<drillRound?'✓ ':''}{r.label}</div>
              ))}
            </div>
            <div className="level-banner">🔁 {DRILL_ROUNDS[drillRound-1].label}（{drillIdx+1}/{IDIOMS.length}）- 每題只有一次機會！</div>
            <p className="drill-desc">{DRILL_ROUNDS[drillRound-1].desc}</p>
            <Scene q={IDIOMS[drillIdx]} qIdx={drillIdx} blankCount={drillBlanks(IDIOMS[drillIdx],drillRound).length}/>
            <p className="meaning">💡 意思：{IDIOMS[drillIdx].meaning}</p>
            <IdiomRow q={IDIOMS[drillIdx]} placed={placed} onClickSlot={handleClickSlot} blanksOverride={drillBlanks(IDIOMS[drillIdx],drillRound)}/>
            <div className="bank-label">✦　把下面的字拖到上面的空格　✦</div>
            <div className="bank">{tiles.map(tile=>(<div key={tile.tid} className={`tile${tile.used?' used':''}`} onPointerDown={e=>onTilePointerDown(e,tile)}>{tile.ch}</div>))}</div>
            <div className="actions">
              <button className="btn btn-sun" disabled={Object.keys(placed).length!==drillBlanks(IDIOMS[drillIdx],drillRound).length||result!==null} onClick={checkDrill}>✅ 提交答案</button>
            </div>
            <div className={`result${result==='ok'?' result-success':result==='err'?' result-error':''}`}>{msg}</div>
          </div>
        </section>

        {/* ════ 診斷報告 ════ */}
        <section className={`screen${screen==='diagnosis'?' show':''}`}>
          {diagnosis&&(
            <div className="diagnosis-screen">
              <h2>📊 你的成績分析</h2>
              <div className="score-display"><span className="score-number">{diagnosis.totalScore}</span><span className="score-outof">/ 100 分（共 40 題，答對 {diagnosis.totalCorrect} 題）</span></div>
              <div className="diagnosis-details">
                {DRILL_ROUNDS.map(r=>{
                  const st=diagnosis.roundStats[r.id]
                  const rate=st.total?Math.round((st.correct/st.total)*100):0
                  return <div className="detail-row" key={r.id}><span>{r.label}：</span><span className={rate>=80?'good':'warning'}>{st.correct}/{st.total}（{rate}%）</span></div>
                })}
              </div>
              <div className="analysis-box">
                {diagnosis.strengths.length>0&&<div className="strengths"><h4>✅ 表現優秀的部分</h4><ul>{diagnosis.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul></div>}
                {diagnosis.weaknesses.length>0&&<div className="weaknesses"><h4>⚠️ 需要加強的部分</h4><ul>{diagnosis.weaknesses.map((w,i)=><li key={i}>{w}</li>)}</ul></div>}
                {diagnosis.topWrong.length>0&&<div className="weaknesses"><h4>📌 較常答錯的成語</h4><ul>{diagnosis.topWrong.map((name,i)=><li key={i}>「{name}」建議多複習</li>)}</ul></div>}
              </div>
              <div className="recommendation-box"><h4>📈 建議等級：{levelName(diagnosis.recommendedLevel)}</h4><p>{getRecommendationText(diagnosis.recommendedLevel)}</p></div>
              <button className="btn btn-go" onClick={()=>setScreen('level2-rules')}>進入第二關 →</button>
            </div>
          )}
        </section>

        {/* ════ 第二關：評級說明（整頁） ════ */}
        <section className={`screen${screen==='level2-rules'?' show':''}`}>
          <div className="diagnosis-screen">
            <h2>📖 評級是怎麼算的？</h2>
            <div className="recommendation-box">
              <h4>🎯 你的評級依據</h4>
              <p>剛才的四輪測驗（共 40 題）已經測出你的成語理解程度。輪次越難，答對的分數佔比越高，因為它更能證明你真的學會了。</p>
            </div>
            <div className="diagnosis-details">
              <div className="detail-row"><span>評分方式：</span><span className="good">四輪共40題，難度越高權重越高，滿分100分</span></div>
              <div className="detail-row"><span>80 分以上：</span><span className="good">🟢 A 級（掌握良好）</span></div>
              <div className="detail-row"><span>40～79 分：</span><span className="good">🟡 B 級（部分掌握）</span></div>
              <div className="detail-row"><span>40 分以下：</span><span className="good">🔴 C 級（需要加強）</span></div>
            </div>
            <div className="recommendation-box">
              <h4>💡 接下來怎麼做？</h4>
              <p>系統會依照你在<b>四輪中表現最弱的一輪</b>，建議你優先用「自由練習」多加強。自由練習<b>沒有限制</b>，你也可以自己選任何成語、任何模式來反覆練習！</p>
            </div>
            <div className="actions">
              <button className="btn btn-go" onClick={()=>setScreen('level2-select')}>我明白了，看看建議 →</button>
            </div>
          </div>
        </section>

        {/* ════ 第二關：推薦練習 ════ */}
        <section className={`screen${screen==='level2-select'?' show':''}`}>
          <div className="menu-head"><h2>🎯 第二關 - 依評級推薦練習</h2><p>根據你的評級，建議你優先加強的部分</p></div>
          {diagnosis&&(<>
            <p className="section-title">⭐ 你的評級：{levelEmoji(diagnosis.recommendedLevel)} {levelName(diagnosis.recommendedLevel)}（{diagnosis.totalScore} 分）</p>
            <div className="level-card recommended" onClick={()=>setScreen('free-select')}>
              <div className="level-badge">建議優先練習</div>
              <span className="lv-emoji">🔁</span>
              <h3>{DRILL_ROUNDS[diagnosis.weakestRound-1].label}</h3>
              <div className="lv-desc">這是你四輪中表現較弱的部分：{DRILL_ROUNDS[diagnosis.weakestRound-1].desc}</div>
              <span className="lv-tag ready">▶ 前往自由練習</span>
            </div>
            {diagnosis.topWrong.length>0&&(
              <div className="recommendation-box" style={{maxWidth:760,width:'100%',margin:'16px auto'}}>
                <h4>📌 建議優先複習的成語</h4>
                <p>{diagnosis.topWrong.join('、')}</p>
              </div>
            )}
            <p className="section-title">或前往自由練習，自己選擇成語和模式</p>
            <div className="actions">
              <button className="btn btn-go" onClick={()=>setScreen('free-select')}>🎯 前往自由練習 →</button>
            </div>
          </>)}
        </section>

      </div>
    </>
  )
}
