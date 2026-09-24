import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════
   圖片設定
   1-1： /public/images/1.png（序章）、s1~s10.png（學習）、q1~q10.png（測驗）
   2-1： /public/images/2-1 0.png（序章）、2-1 1~10.png（學習）、2-1 s1~s10.png（測驗）
   ═══════════════════════════════════════════ */
const IMG_BASE = '/images/'

const IDIOMS_1_1 = [
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

const IDIOMS_2_1 = [
  {
    idiom: '千方百計',
    blanks: [0, 2],
    meaning: '形容費盡心機，想盡一切辦法、計謀。',
    kidStory: '宋代彭龜年勸皇帝，朝中有些壞人會「千方百計」蒙蔽皇上，想盡各種辦法、計謀達到目的，提醒皇帝不要輕易聽信讒言。',
    fullStory: '「千方百計」的「方」和「計」，指的是方法和計謀，「千」和「百」，則都是用來表很多，所以「千方百計」就是用了很多的方法和計謀。此一成語可見於宋代彭龜年的〈論小人疑間兩宮乞車駕過宮面質疏〉。彭龜年，字子壽，清江人。南宋乾道進士，歷任煥章閣待制、知江陵府，遷湖北安撫使。諡忠肅。在朝言事，善惡是非，辨析甚嚴。他的〈論小人疑間兩宮乞車駕過宮面質疏〉，即是勸諫君王應以古代聖君為榜樣，當朝中小人費盡心機，想盡一切辦法、計謀，想要蒙蔽聖上的時候，不要輕易聽信讒言。他批評朝中奸佞小人「千方百計誤陛下之聽」，使皇上無法省察群臣的諫言。「千方百計」這句成語可能出於此，就用來形容費盡心機，想盡一切辦法、計謀。',
    emoji: '🧠', bg: 'linear-gradient(160deg,#e6d4ff,#c9aef0)', tag: '歷史故事',
    mildDistract: ['萬','種','法','門'], hardDistract: ['干','計','汁','十']
  },
  {
    idiom: '始作俑者',
    blanks: [3],
    meaning: '比喻首創惡例的人。',
    kidStory: '古人曾用真人陪葬，後來改用木頭或泥土做的人偶（俑）代替。孔子仍然很生氣，說第一個發明用「俑」陪葬的人一定會遭報應，因為這個念頭本身就很殘忍。',
    fullStory: '「始作俑者」的「俑」，指的是古代用來殉葬的人偶。「始作俑者」則是指發明以俑陪葬的人。在殷周時期，貴族或有身分地位的人，死後往往會以活人陪葬，例如春秋時的秦武公，死時陪葬者多達六十餘人，秦穆公死時陪葬者更多達百餘人。後來，以活人殉葬的風俗逐漸被廢除，改以木製或土製人偶取而代之，即所謂的「俑葬」。孔子對於這樣的習俗極為厭惡，他認為用像人的俑陪葬，在意念上其實與用真人陪葬沒有差別，都是非常殘忍的，所以他說：「始作俑者，其無後乎！」就是指責最初那個發明以俑陪葬的人，一定會得到報應，絕子絕孫。後來孟子向梁惠王談為政之道時曾引用孔子的這句話。在此，「始作俑者」仍是指最初那個發明以俑陪葬的人，後來「始作俑者」則被用來比喻首創惡例的人。',
    emoji: '⚱️', bg: 'linear-gradient(160deg,#ffe3c4,#ffc98f)', tag: '聖賢故事',
    mildDistract: ['人','事','物','者'], hardDistract: ['甬','桶','俑','誦']
  },
  {
    idiom: '白頭偕老',
    blanks: [2, 3],
    meaning: '用來形容夫妻恩愛到老，現今多用為祝賀新婚的賀詞。',
    kidStory: '「白頭」出自一首古詩，希望有個真心相待的人能一起生活到老。「偕老」出自《詩經》，寫一對相愛的夫妻約定要一起白頭到老。兩個詞合起來就是「白頭偕老」，祝福夫妻恩愛一輩子。',
    fullStory: '「白頭偕老」係由「白頭」及「偕老」二語組合而成。「白頭」是出自樂府古辭〈白頭吟〉二首之一，內容是說夫妻二人原本相愛，後來丈夫變心，妻子便寫了這首詩，與之決絕。詩中提到，希望能有一個真心相待的人，可以共同生活，直到白頭，永不相離。「偕老」則是出自《詩經．鄭風．女曰雞鳴》，詩歌內容是寫一對夫妻歡樂美好的家庭生活。兩人十分相愛，並且誓約相守到白頭。後來這兩個典源被合用成「白頭偕老」，用來形容夫妻恩愛到老。現今這個成語多用為祝賀新婚的賀詞，也常用作「白頭到老」。',
    emoji: '💑', bg: 'linear-gradient(160deg,#ffe0ec,#ffc0d6)', tag: '詩詞典故',
    mildDistract: ['髮','首','終','久'], hardDistract: ['楷','皆','偕','階']
  },
  {
    idiom: '借刀殺人',
    blanks: [0, 1],
    meaning: '比喻假他人之手去害人。',
    kidStory: '東漢的禰衡很有才華但脾氣不好。曹操不想親自動手殺他，就把他送給別人，最後禰衡真的被別人殺了。曹操沒有動手，卻等於是借別人的刀達成目的，這就是「借刀殺人」。',
    fullStory: '「借刀殺人」指借別人的刀來殺人。例如在《後漢書．禰衡傳》裡有一則故事：東漢末年，有個名叫禰衡的年輕人，他相當有才華，但脾氣不好，常常得罪人。曹操本來很喜歡他，但後來被他傲慢的態度觸怒了，氣得想殺掉他。但又因為他聲名在外，怕遭來非議，於是將他送給荊州刺史劉表。劉表之前也聽聞禰衡的才華過人，對他十分禮遇。但禰衡仍不改暴躁的脾氣，以致劉表也受不了他，於是就將他送給黃祖。有一次黃祖在宴請賓客時，禰衡當場和他起了衝突，而且出言不遜，黃祖一怒之下就將他殺了。曹操當初把禰衡送給別人就是想借別人的手殺他，後來果然成真。這就是「借刀殺人」。後來，「借刀殺人」就用來比喻假他人之手去害人。',
    emoji: '🗡️', bg: 'linear-gradient(160deg,#d4e0ff,#aec4f0)', tag: '歷史故事',
    mildDistract: ['用','拿','取','使'], hardDistract: ['惜','措','錯','借']
  },
  {
    idiom: '賞心悅目',
    blanks: [0, 2],
    meaning: '用來形容情景美好，使心目都感到快樂舒暢。',
    kidStory: '「賞心」是說能和好朋友一起做美好的事，心情很愉快。「悅目」是說衣服容貌整齊得體，能讓眼睛看了很舒服。兩個詞合起來，就是形容景象美好、讓人心情愉快。',
    fullStory: '「賞心悅目」係由「賞心」及「悅目」二語組合而成。「賞心」見於南朝宋．謝靈運〈擬魏太子鄴中集詩八首并序〉。謝靈運認為：美好的時光、宜人的景色、愉悅的心情、歡樂的事情，這四種世間樂事一向最難同時具備，但是能和許多優秀的文人一起唱和應酬，這四者便同時都享受到了。「悅目」一詞見於漢．劉向《說苑．卷一九．修文》。劉向認為：衣服容貌是用來愉悅眼目，談吐應對是用來愉悅耳朵，嗜好行為是用來愉悅心志。後來這兩個詞語被合用成「賞心悅目」，用來形容情景美好，使心目都感到快樂舒暢。',
    emoji: '🌸', bg: 'linear-gradient(160deg,#c8f0e0,#9be0c9)', tag: '詩詞典故',
    mildDistract: ['歡','喜','樂','爽'], hardDistract: ['賞','嘗','當','裳']
  },
  {
    idiom: '日新月異',
    blanks: [0, 1],
    meaning: '用來形容發展或進步快速，不斷出現新事物或新現象。',
    kidStory: '古書說：「如果一天讓自己更好，就能天天更好，並一直持續進步。」後來這句話演變成「日新月異」，用來形容進步得非常快，每天都有新變化。',
    fullStory: '在古代的儒者，認為一個人應敦品勵學才可成為身心兼修的大家。特別是對品德的涵養，更是古人所重視的。所以在《禮記．大學》中，有一段記錄個人品德修養的銘文：「苟日新，日日新，又日新。」意思是說：「如果能夠一天使品德更新，那就能天天使品德更新，且一直持續不斷地更新。」《書經》的〈康誥〉篇說這是「鼓勵人民振作、自新。」因此，君子無不盡力修養自己的品德，以期能達到完善的境界。典源只見「日新」，後來更見結合「月異」之「日新月異」一語，用來形容發展或進步快速，不斷出現新事物或新現象。',
    emoji: '🌅', bg: 'linear-gradient(160deg,#fff4c4,#ffe08f)', tag: '經典語錄',
    mildDistract: ['天','年','週','歲'], hardDistract: ['曰','白','舊','昔']
  },
  {
    idiom: '緣木求魚',
    blanks: [0, 1],
    meaning: '用來比喻用錯方法，徒勞無功。',
    kidStory: '孟子告訴齊宣王，如果不從照顧愛護百姓開始做起，卻想靠武力稱霸天下，就像爬到樹上去抓魚一樣，方法錯了，是不可能成功的。',
    fullStory: '戰國時的齊宣王，因為仰慕春秋時齊桓公與晉文公的霸業，很想效法他們，便向孟子請教有關他們的事蹟。孟子說他沒聽說過，但可以為齊宣王講述如何以仁德統治天下。孟子認為，要以仁德統治天下，最重要的就是要知道去照顧、愛護百姓。可以先從尊敬自己的父兄、愛護自己的子弟開始，然後推及別人的父兄子弟，這樣就能治國、平天下了。如果不從這基礎開始做起，就想開疆闢土，使其他諸侯歸順而稱霸天下的話，正如同爬到樹上去抓魚，是不可能達成的。後來《孟子》原文的「緣木求魚」演變成一句成語，用來比喻用錯方法，徒勞無功。',
    emoji: '🐟', bg: 'linear-gradient(160deg,#c4ecff,#8fd4f0)', tag: '聖賢故事',
    mildDistract: ['爬','抓','摘','找'], hardDistract: ['椽','緣','原','源']
  },
  {
    idiom: '赴湯蹈火',
    blanks: [0, 2],
    meaning: '用來比喻奮不顧身，不避艱險。',
    kidStory: '西漢的鼂錯建議皇帝，要獎賞奮勇守城、攻城的將士，這樣將士才願意冒著生命危險，不怕滾燙的水、猛烈的火，勇敢為國家效力，這就是「赴湯蹈火」的由來。',
    fullStory: '鼂錯為西漢潁川人，文帝時，奉命記錄和整理已失傳的《尚書》，後屢屢升遷。他曾對邊塞的守備提出建議，主張應用鼓勵的方式激勵將士保衛疆土，他說：「對於能固守城池及戰勝敵人者，要給予爵位以示獎賞；對於能攻陷敵方城池者，要贈予所得的財貨以增加他的財富與權勢。唯有如此，才能使將士們甘願冒著生命的危險，不顧生死的為國效忠。」後來「赴湯蹈火」這句成語就從這裡演變而出，用來比喻奮不顧身，不避艱險。也有學者以為此語應源自《傅子》，東漢末年劉表部下韓嵩曾說：「雖赴湯蹈火，死無辭也。」意思同樣是奮不顧身，不避艱險。',
    emoji: '🔥', bg: 'linear-gradient(160deg,#ffd4c4,#ff9e8f)', tag: '歷史故事',
    mildDistract: ['進','踏','跳','衝'], hardDistract: ['赴','付','計','起']
  },
  {
    idiom: '初來乍到',
    blanks: [1, 3],
    meaning: '剛來到一個新的地方或環境，對周遭的人地事物還不熟悉。',
    kidStory: '「初來乍到」是說一個人剛剛來到一個新地方，對周圍的人、事、物都還很陌生，需要時間慢慢熟悉。',
    fullStory: '「初來乍到」意指剛來到一個新的地方或環境，對周遭的人地事物還不熟悉。這是日常生活中常用的成語，用來形容一個人到了陌生的環境，一切都還在適應、認識的階段。',
    emoji: '🚪', bg: 'linear-gradient(160deg,#e0f0ff,#a8d4f0)', tag: '生活用語',
    mildDistract: ['去','走','回','離'], hardDistract: ['乍','詐','作','昨']
  },
  {
    idiom: '弱肉強食',
    blanks: [0, 2],
    meaning: '比喻強者欺凌、吞併弱者。',
    kidStory: '韓愈說，動物們大多躲在深山裡，因為害怕被其他動物傷害，但即使小心翼翼，弱小的動物還是常常變成強壯動物的食物，這就是「弱肉強食」。',
    fullStory: '唐代由於佛教鼎盛，因此當時的文人及達官貴人，多與僧侶往來，互贈詩文。〈送浮屠文暢師序〉就是韓愈贈予僧文暢的文章。他認為：在天下未教化之初，人民和禽獸是沒有什麼不同的。後來聖人出現，治理天下，人民才得以安逸的生活。就像鳥兒，一低頭就是要覓食；野獸們大多藏身在隱僻的深山，很少出來活動，這都是因為害怕其他的動物會傷害自己。但是這樣的小心翼翼，仍然無法擺脫弱者被強者欺凌的危險，弱者之肉，就是強者的食物。後來「弱肉強食」這句成語就從這裡演變而出，比喻強者欺凌、吞併弱者。',
    emoji: '🦁', bg: 'linear-gradient(160deg,#f0e0c4,#d4b88f)', tag: '經典語錄',
    mildDistract: ['小','弱','虛','柔'], hardDistract: ['肉','肌','內','丙']
  },
]

const IDIOMS_3_1 = [
  {
    idiom: '禮尚往來',
    blanks: [0, 2],
    meaning: '比喻別人以禮相待，也要以禮回報。',
    kidStory: '《禮記》說，古人受到別人的恩惠，也要回報別人的恩惠，這樣才合乎禮節。如果只收禮卻不回禮，或只回禮卻沒收過禮，都不合乎禮，這就是「禮尚往來」的由來。',
    fullStory: '《禮記》是儒家典籍之一，由漢朝戴聖所輯，為十三經之一，內容多是孔子的弟子及後學所記。書中所記載的，都是上古時期的禮俗儀式和儒家理想中的政治制度。在《禮記．曲禮上》中提到，上古時代人心純樸，凡事沒什麼準則，只照著內心的誠意來行為；到了文明時代，就講究施與受間的互相往來，受到別人的恩惠，也要回報別人的恩惠。如果受到恩惠卻不報答，就不合乎禮；如果受人報答卻沒有給人恩惠，也於禮不合。人與人的關係，因為禮的作用而能保持和諧，如果沒有禮，就會發生危機。所以禮是一定要學習的。「禮尚往來」比喻別人以禮相待，也要以禮回報。',
    emoji: '🎁', bg: 'linear-gradient(160deg,#ffe0ec,#ffc0d6)', tag: '經典語錄',
    mildDistract: ['敬','待','恩','情'], hardDistract: ['尚','當','當','裳']
  },
  {
    idiom: '爭先恐後',
    blanks: [0, 2],
    meaning: '指競相爭先，惟恐落後。',
    kidStory: '晉國和楚國搶著要先歃血結盟，這是「爭先」；後來王莽掌權，各諸侯搶著討好他、爭相奉上印璽，深怕自己落在別人後面，這是「恐後」。兩個故事合起來就是「爭先恐後」。',
    fullStory: '「爭先恐後」係由「爭先」及「恐後」二語組合而成。「爭先」是出自《左傳．襄公二十七年》，提到晉國與楚國爭執於歃血盟誓的先後。晉國人認為：晉國一向是諸侯的盟主，從來沒有其他國家在晉國之前歃血的。楚國人認為：晉國和楚國的地位是對等的，如果讓晉國一直在先，這就是楚國比晉國弱小了。因雙方爭執不下，於是叔向對趙孟說：「諸侯是歸服於晉國的德行，不是歸服於晉國是否主持盟會。」因此就讓楚國先歃血。「恐後」是出自於《漢書．卷一四．諸侯王表》，內容是說王莽在西漢末年時，已察知漢朝即將走到盡頭，國力衰微，因而心生貪念，以外戚的權勢，作威作福。其他的諸侯王看到這樣的局勢，都紛紛向王莽致上最敬禮，爭相奉上印璽，惟恐落於他人之後。後來這兩個典源被合用成「爭先恐後」，指競相爭先，惟恐落後。',
    emoji: '🏃', bg: 'linear-gradient(160deg,#ffe3c4,#ffc98f)', tag: '歷史故事',
    mildDistract: ['搶','搏','奪','趕'], hardDistract: ['諍','靜','淨','箏']
  },
  {
    idiom: '立竿見影',
    blanks: [0, 2],
    meaning: '比喻迅速收到成效。',
    kidStory: '古人在陽光下豎立一根竹竿，馬上就能看到竿子的影子，用來測量節氣。因為效果非常快速直接，後來「立竿見影」就用來形容做一件事很快就看到成果。',
    fullStory: '「立竿見影」本為古代一種測量、訂定節氣的方法。指在陽光下豎立一根竹竿，根據投射日影的長度、方位等觀察自然界的變化。因為在陽光下豎立竹竿，可立即見其影，故「立竿見影」又用來比喻迅速收到成效。此語可見於漢代魏伯陽所作的《參同契》。《參同契》為道教最早系統論述煉丹的典籍，也稱得上是全世界最早的煉丹術理論性著作，全書托易象而論煉丹，其中存在著許多先進的化學觀念，對煉丹術有重大的影響。〈如審遭逢章〉談到修煉的方法。「五行」指的是金、木、水、火、土五種物質，古人認為世界萬事萬物都是由這五種物質所組成，此五種物質以循環的規律相互滋生，但亦相互制約。修煉時若能順應五行，並且專心一意，沒有任何遺漏，則可收快速而立即的功效。後來原文中的「立竿見影」演變為成語，就用來比喻迅速收到成效。',
    emoji: '☀️', bg: 'linear-gradient(160deg,#fff4c4,#ffe08f)', tag: '自然景象',
    mildDistract: ['站','放','插','豎'], hardDistract: ['杆','竽','桿','肝']
  },
  {
    idiom: '吳牛喘月',
    blanks: [0, 3],
    meaning: '比喻人見到曾受其害的類似事物而過分害怕驚懼，也用來形容天氣酷熱。',
    kidStory: '南方的水牛很怕熱，晚上看到月亮，會誤以為是太陽升起而嚇得直喘氣。晉朝的滿奮很怕冷，看到窗外寒冷的景象也會發抖，他說自己就像吳牛一樣，看到月亮就喘。',
    fullStory: '水牛原產於長江、淮水流域一帶，生性怕熱，所以夏天時喜歡泡在水中或待在樹蔭下休息。因為太陽的熱力實在太過強烈，水牛深受其苦，因此有時在晚上看見月亮，誤以為是太陽已經出來，氣溫又要升高，而被嚇得氣喘吁吁。所以在漢代應劭的《風俗演義．佚文》中便有「吳牛望月則喘」之語。後來「吳牛喘月」這句成語就從這裡演變而出，用來比喻人見到曾受其害的類似事物而過分害怕驚懼。也用來形容天氣酷熱。在《世說新語》中有一個關於「吳牛喘月」的故事。晉武帝的臣子滿奮很怕冷，有一次他看到琉璃窗外頭的寒冷景象，即使知道琉璃窗很厚實，不會透風，仍不由得打起寒顫。武帝看到了就笑他，滿奮便很不好意思地回答：「我像吳牛一樣，只要見到了月亮就會氣喘吁吁。」',
    emoji: '🐃', bg: 'linear-gradient(160deg,#c4ecff,#8fd4f0)', tag: '生活趣談',
    mildDistract: ['牛','羊','馬','豬'], hardDistract: ['喘','湍','揣','端']
  },
  {
    idiom: '異曲同工',
    blanks: [0, 2],
    meaning: '原用來比喻不同人的辭章或言論同樣精彩，後則用於比喻不同的作法收到同樣的功效。',
    kidStory: '韓愈寫〈進學解〉，藉學生的話說：老師您的文章風格雖然和別的名家不同，但技巧造詣一樣高明。這就是「異曲同工」——曲調不同，但一樣巧妙。',
    fullStory: '「異曲同工」原作「同工異曲」。「曲」指曲調，「工」指巧妙。韓愈是唐代的著名文人，他精通六經百家，崇尚儒學，排斥佛老，文章自成一家，為後世治古文者所取法。其登進士第後，曾任國子博士、監察御史等職，卻因直言敢諫，屢次被貶，久久不得升遷。韓愈自認才高，不應受此待遇，因此作〈進學解〉一文自嘲。文中敘述一日國子先生教誨學生說：「學業要精進，就要勤勉；學業之所以荒廢，就是因為嬉戲。」學生卻回說：「老師您如此勤勉向學，作品的旨趣，及得上《莊子》、《楚辭》的宏肆深奧，寫作技巧也如同《史記》般豐富，能力比得上揚雄、司馬相如等人，雖然風格不同，但是技巧造詣是一樣的高明。」文中的國子先生即韓愈自稱，韓愈藉著別人的口吻，宣洩自己懷才不遇的憤慨。後來「異曲同工」這句成語就從這裡演變而出，比喻不同的作法收到同樣的功效。',
    emoji: '🎼', bg: 'linear-gradient(160deg,#e6d4ff,#c9aef0)', tag: '詩詞典故',
    mildDistract: ['歌','詞','調','音'], hardDistract: ['異','翼','冀','翌']
  },
  {
    idiom: '格殺勿論',
    blanks: [0, 2],
    meaning: '指殺凶惡的人不以殺人罪論。',
    kidStory: '《周禮》記載，如果盜賊聚眾搶劫、殺害別人的家人，這些匪徒若因此被殺，殺人的人是無罪的。這就是「格殺勿論」的由來，表示殺凶惡的人不算犯罪。',
    fullStory: '《周禮》一書相傳為周公所撰，記載了周代的官制。在該書《秋官．朝士》中提到「凡盜賊軍鄉邑及家人，殺之無罪」，漢代鄭眾解釋這句話的意思說：「如果有盜賊聚眾成軍，來攻打搶劫別人的村舍，殺害別人的家人，這些匪徒假如因此被殺，殺人者無罪。這就好像現行法律，無故侵入他人屋裡、強行登上他人之車、強迫他人犯法，如果因此被人格殺，殺人者無罪。」這就是「格殺無論」的典源，這句成語就是用來指殺凶惡的人不以殺人罪論。',
    emoji: '⚖️', bg: 'linear-gradient(160deg,#d4e0ff,#aec4f0)', tag: '歷史故事',
    mildDistract: ['打','擊','抓','捕'], hardDistract: ['格','洛','絡','客']
  },
  {
    idiom: '半斤八兩',
    blanks: [0, 2],
    meaning: '比喻彼此相當，不相上下。',
    kidStory: '古代十六兩是一斤，半斤剛好等於八兩，所以「半斤八兩」用來說兩個人或兩件事其實一樣，分不出高下。宋代的戲曲裡已經有人用這句話來形容兩人一樣厲害。',
    fullStory: '斤、兩都是計算重量的單位。宋制以十六兩為一斤，半斤就等於八兩，所以用「半斤八兩」來比喻兩者相等，彼此一樣。在宋代的戲曲已見使用，如《張協狀元》裡一個粗獷的淨角和一個滑稽的丑角為錢起了爭執，居中調停的末角就說兩人「半斤八兩」，一樣無理。《宋元戲文輯佚．王質》：「伊嬌俊，我鶻伶，算半斤八兩稱兒稱著不沉不輕。」意思是兩人一樣輕巧嬌美，可見此為當時常用的俗語。後來「半斤八兩」就被用來比喻彼此相當，不相上下。',
    emoji: '⚖️', bg: 'linear-gradient(160deg,#f0e0c4,#d4b88f)', tag: '生活智慧',
    mildDistract: ['一','兩','三','全'], hardDistract: ['斤','斥','斧','近']
  },
  {
    idiom: '少見多怪',
    blanks: [0, 2],
    meaning: '用來譏諷人見識不廣，遇平常之事亦以為驚怪。',
    kidStory: '有人問佛的相貌為什麼跟一般人差這麼多，牟子回答：「少所見，多所怪，看到駱駝的駝峰以為是腫起的馬背。」意思是見識太少的人，看到平常的事也會覺得很奇怪。',
    fullStory: '「少見多怪」一語原是譏人因見識狹隘，故而對佛的超凡相貌有所懷疑，以為是過於誇大的傳言。據漢．牟融《理惑論》載，有人問道：「你說佛的相貌有三十二種顯著特徵、八十種細微特徵，這與一般人差太多了，應該不太可能吧！」牟子回答：「俗話說得好：少所見，多所怪，看到駱駝的駝峰以為是腫起的馬背。像堯的眉毛有八種色彩，舜的眼睛有兩個瞳孔……，這不都與平常人有極大差異？所以這些異相是確實存在的，你不能因為自己沒看過就懷疑佛的不凡相貌啊！」牟子以為，若有人因為沒見過異人與佛的超凡相貌，便膚淺地以為那是不可能的，那樣的人與「睹馲駝言馬腫背」者同樣可笑。後來「少見多怪」這句成語就從這裡演變而出，用來譏諷人見識不廣，遇平常之事亦以為驚怪。',
    emoji: '🐫', bg: 'linear-gradient(160deg,#e0f0ff,#a8d4f0)', tag: '生活趣談',
    mildDistract: ['多','常','初','偶'], hardDistract: ['怪','恠','塊','拐']
  },
  {
    idiom: '包羅萬象',
    blanks: [0, 2],
    meaning: '形容內容豐富，應有盡有。',
    kidStory: '《黃帝宅經》的序文說，這本書的知識「包羅萬象」，包括日月、乾坤、寒暑、晝夜、陰陽等各方面，內容非常豐富廣泛，什麼都有涵蓋到。',
    fullStory: '「包羅萬象」是指包含各種事物，形容豐富多樣，與「森羅萬象」一詞同意。「萬象」即是指各式各樣的事物，「包羅萬象」或許出自〈黃帝宅經序〉。《黃帝宅經》是古代風水學的書籍，講述陰陽宅位的風水易理。其書序的作者在文中提到當今流傳不少宅經，教世人宅位風水之學，這些書的主旨雖大同小異，但每本所闡述的頗多不同，若不遍覽則無以會通。有不少人篤信風水，在一知半解之下，死守禁忌，房子蓋好也不敢住，實在可惜！這些知識「包羅萬象」、內容廣泛，包括日月、乾坤、寒暑、雌雄、晝夜、陰陽等各方面，人每天都會接觸到，又是祖先留下來的智慧，一定要好好利用。所以作者除了作序外，還寫了一篇總論，描述這本書的基本理論，讓讀者容易入門。「包羅萬象」這句成語被用來形容內容豐富，應有盡有。',
    emoji: '🌌', bg: 'linear-gradient(160deg,#c8f0e0,#9be0c9)', tag: '經典語錄',
    mildDistract: ['含','裝','收','藏'], hardDistract: ['羅','蘿','邏','籮']
  },
  {
    idiom: '莫逆之交',
    blanks: [0, 1],
    meaning: '用來形容心意相投、至好無嫌的朋友。',
    kidStory: '莊子筆下四個好朋友一起討論生死的道理，結果彼此心意相通，相視而笑，就結為好朋友。這種心意完全契合、毫無隔閡的友情，就叫做「莫逆之交」。',
    fullStory: '莊子是戰國時期道家思想的著名代表人物，他在《莊子》一書中對生命的認識有許多闡述。例如在〈大宗師〉一文裡，記述子祀、子輿、子犁、子來等四人，互相談論道：「誰能把『無』當作頭，把『生』當作背脊，將『死』當作尾脊骨，或者是有誰能知道死生存亡是同為一體的，我就與他做朋友。」結果四個人都心領意會於生命來自於無而至於有，最後又歸於死亡─即無。因而四人相視而笑，彼此心意相通，遂結為至交好友。後來「莫逆之交」這句成語，就從原文「莫逆於心，遂相與為友」演變而出，用來形容心意相投、至好無嫌的朋友。',
    emoji: '🤝', bg: 'linear-gradient(160deg,#ffe0ec,#ffc0d6)', tag: '聖賢故事',
    mildDistract: ['順','合','投','契'], hardDistract: ['莫','暮','幕','墓']
  },
]

const IDIOMS_4_1 = [
  {
    idiom: '天衣無縫',
    blanks: [0, 3],
    meaning: '比喻詩文渾然天成，沒有斧鑿痕跡；亦用於比喻事物或計畫周密完美，沒有一絲破綻或缺點。',
    kidStory: '《神異經》記載，西方的天神賜給人們特別的衣服，這些衣服不是用凡間的針線縫製的，所以完全看不到縫痕，就是「天衣無縫」，用來形容事情做得完美沒有破綻。',
    fullStory: '《神異經》大約是一本漢代的小說。此書是在《山海經》的影響下產生的，不論是在內容、筆法等各方面都有意模仿《山海經》，只是作者另外添加了神仙方術和儒家思想的觀念在其中。《神異經》記載了一段故事：西方邊遠的地方有一些人，他們不必閱讀傳統的典籍巨著，但行為思想，卻能合乎禮儀規範。天神賜給他們衣服，男的穿著紅色衣服，白色腰帶，戴著帽子；女的穿著綠色衣服，戴著華麗的首飾。這些天衣不是用一般凡間針線縫製，所以都沒有縫痕。後來這個故事被濃縮成「天衣無縫」，用來比喻詩文渾然天成，沒有斧鑿痕跡；亦用於比喻事物或計畫周密完美，沒有一絲破綻或缺點。',
    emoji: '👘', bg: 'linear-gradient(160deg,#e6d4ff,#c9aef0)', tag: '神話傳說',
    mildDistract: ['地','人','神','仙'], hardDistract: ['縫','逢','蓬','峰']
  },
  {
    idiom: '土崩瓦解',
    blanks: [0, 2],
    meaning: '比喻澈底潰敗，不可收拾。',
    kidStory: '漢代徐樂勸皇帝，國家最大的危機是「土崩」——人民受不了暴政而群起反抗，這比「瓦解」（政權內部鬥爭）更嚴重。後來這兩個詞合起來，就用來形容徹底崩潰、無法挽回。',
    fullStory: '「土崩」是指土石崩落，則土石之上的東西，必然隨之消解傾覆。「瓦解」則是指磚瓦破碎。磚瓦破碎可以再行修復，較之於土崩，相對損害程度較輕。在漢代，徐樂為勸諫漢武帝的窮兵黷武，所以曾上書談到當時的國家情況，分別用了「土崩」與「瓦解」這兩個語詞，加以說明二者的不同。他特別強調地舉史事說明：「國家最大的憂患，在於土崩，而不在於瓦解。所謂的土崩，就是人民因為不堪暴政之苦，終於群起反抗。所謂的瓦解，就是政權內部的互相鬥爭。土崩將讓舊有的政權遭到推翻，建立新的政權；而瓦解只是造成人事的改變而已。」徐樂希望能惕勵武帝不可一味地窮兵黷武，更應該體諒人民的疾苦。到了班固寫〈秦紀論〉時，「土崩」與「瓦解」已經合用，作為一句成語來使用。後來「土崩瓦解」這句成語就從這裡演變而出，用來比喻澈底潰敗，不可收拾。',
    emoji: '🏚️', bg: 'linear-gradient(160deg,#f0e0c4,#d4b88f)', tag: '歷史故事',
    mildDistract: ['山','石','磚','牆'], hardDistract: ['崩','棚','蹦','繃']
  },
  {
    idiom: '博古通今',
    blanks: [0, 2],
    meaning: '用來形容人學問淵博，通曉古今。',
    kidStory: '孔子曾對弟子稱讚老子，說老子學問淵博，通曉古今，又懂禮樂和道德的道理，值得當老師學習。「博古通今」就是形容一個人像老子這樣，古今的學問都懂。',
    fullStory: '「博古通今」原作「博古知今」。「博」、「通」都有見識廣大的意思，一個人如果對於古今之事都能通曉，學問自然十分淵博。《孔子家語．卷三．觀周》中記載著孔子曾對弟子南宮敬叔稱讚老子，說老子的學問淵博，通曉古今，又明白禮樂的源流演變，明白道德的道理，可以作為自己的老師，便要弟子駕車，前往拜訪老子，向他請教禮樂之事。後來「博古通今」這句成語就從這裡演變而出，用來形容人學問淵博，通曉古今。',
    emoji: '📜', bg: 'linear-gradient(160deg,#ffe3c4,#ffc98f)', tag: '聖賢故事',
    mildDistract: ['知','識','明','懂'], hardDistract: ['博','搏','薄','膊']
  },
  {
    idiom: '各有千秋',
    blanks: [0, 2],
    meaning: '用來比喻各有長處和特色，或各有其長期存在的價值。',
    kidStory: '清代詩人趙翼晚年寫詩，感嘆與他同時代的幾位著名學者，雖然都已年老，但每個人在文壇上都曾經有自己的特色和成就，這就是「各有千秋」——每個人都有自己獨特而長久的價值。',
    fullStory: '趙翼為清中葉時期的著名詩人，生於雍正，卒於嘉慶年間，享有八十八歲的高齡，著作不下千卷。乾嘉詩壇中，主要有「性靈」、「格調」、「肌理」等三個詩派，趙翼為「性靈」派的一員大將，崇尚性情自然流露。晚年時，他寫下〈吳穀人祭酒枉過草堂邀稚存味辛同集〉，記敘與吳穀人、洪亮吉、趙懷玉相聚共飲之事。詩中提到袁枚、蔣士銓、王鳴盛、錢大昕等同時期著名學者，然而無論他們曾經多麼顯赫，畢竟已是時過境遷，終將化為塵土。所以在「名流各有千秋在」的時勢下，垂垂老矣者只能帶著昔日榮景，逐漸走向衰逝之途。而其中所用「千秋」一詞，其實早見於漢代李陵〈與蘇武〉詩中，此處「千秋」意指「時間久遠」，爾後才又衍申出「可長久存在」的含意。後來「各有千秋」演變為成語，用來比喻各有長處和特色，或各有其長期存在的價值。',
    emoji: '🍂', bg: 'linear-gradient(160deg,#fff4c4,#ffe08f)', tag: '詩詞典故',
    mildDistract: ['都','皆','人','自'], hardDistract: ['秋','秒','愁','揪']
  },
  {
    idiom: '與虎謀皮',
    blanks: [0, 2],
    meaning: '用來比喻所謀者與對方有利害衝突，事情必辦不成。',
    kidStory: '有個故事說，一個人想找狐狸和羊商量，要牠們的毛皮和肉，結果狐狸和羊都嚇得逃走躲藏。因為找錯了商量的對象，事情當然辦不成。後來這個故事演變成「與虎謀皮」，比喻找了利害衝突的對象商量，注定失敗。',
    fullStory: '「與虎謀皮」的意思是向老虎商量要取牠的皮，皮是老虎的生命必需品，當然牠是不肯了。所以「與虎謀皮」用來比喻所謀者與對方有利害衝突，事情必辦不成。考其典源可能出自《符子》裡一則「與狐謀皮」的寓言。據載，魯定公時，孔子被任命為中都宰，績效卓然。一年以後，定公又想授予孔子司徒一職，但擔心掌握實際政權的三桓不會同意。左丘明於是用一則寓言勸阻定公，他說：「周朝有個人很喜歡皮製的裘衣，也喜歡吃珍奇美味的食物。他分別去和狐狸和羊商量，希望牠們能提供毛皮和羊肉。他話都還沒說完，所有的狐狸就互相引領逃往深山，所有的羊也彼此呼叫著躲藏進茂密的樹林。結果，這個人花了十年都做不成一件皮衣，花了五年也辦不了一場盛宴。這是因為他找錯了商量的對象。」魯定公聽了這個故事，便打消了念頭。而「與狐謀皮」的寓言故事，可能就是後來「與虎謀皮」的出處，只是把「狐」改成「虎」，更強調了「找錯對象」的意思。',
    emoji: '🐯', bg: 'linear-gradient(160deg,#ffd4c4,#ff9e8f)', tag: '寓言故事',
    mildDistract: ['狐','羊','狼','豹'], hardDistract: ['謀','媒','某','煤']
  },
  {
    idiom: '同舟共濟',
    blanks: [0, 2],
    meaning: '用來比喻同心協力，戰勝困難。',
    kidStory: '孫子說，即使是世仇的吳國人和越國人，只要同坐一條船遇到風雨，也會像左右手一樣互相救助，同心協力度過難關。這就是「同舟共濟」，形容大家一起合作克服困難。',
    fullStory: '「同舟共濟」原作「同舟而濟」。《孫子．九地》曾說到用兵要如「率然」。「率然」是生活在會稽常山的大蛇，如果攻擊牠的頭，尾巴就會來救應；攻擊牠的尾巴，頭部就來救應；攻擊牠的腰部，頭尾都會一起來救應。孫子認為善於用兵作戰的，指揮軍隊，也可以用這樣的做法。像吳、越兩國的人，一直是世仇，但是當他們同坐一條船，在遇到風雨的時候，也一定會團結一致，互相救助，如同左右手一般，合作無間，同心協力地度過難關。後來「同舟共濟」這句成語就從這裡演變而出，用來比喻同心協力，戰勝困難。',
    emoji: '⛵', bg: 'linear-gradient(160deg,#c4ecff,#8fd4f0)', tag: '兵法典故',
    mildDistract: ['行','走','過','渡'], hardDistract: ['濟','齊','擠','霽']
  },
  {
    idiom: '門可羅雀',
    blanks: [0, 2],
    meaning: '用來形容做官的人失勢後賓客稀少的景況，亦可用以泛指一般來客稀少、門庭冷清的景況。',
    kidStory: '漢朝的翟公當官時，家裡賓客絡繹不絕；失去官職後，門外冷清得可以張網捕鳥雀。後來他又復職，賓客又都回來了。這種世態炎涼，就是「門可羅雀」的由來。',
    fullStory: '《史記．汲鄭列傳》中敘述的是漢初汲黯、鄭當時二人事跡。兩人在當時都是位居高官，受到眾人敬畏，每日上門巴結逢迎的人不計其數。但由於他們剛正不阿的個性不適官場，後俱丟官失勢，往日川流不息的賓客也就消失無蹤了。同樣的，歷史上有位翟公，他是漢朝時的大臣，曾經任職廷尉，位高權重。在他任官期間，每天家中賓客亦是絡繹不絕，把大門擠得水洩不通。但當他失去官職後，就不再有人造訪，門外冷冷清清，空曠得似乎可以張開用來捕捉鳥雀的大網。後來，他又官復原職，昔日的賓客又再度登門了。司馬遷以翟公的這段史實，表達了對官場中人情冷暖之感慨。後來「門可羅雀」這句成語就從這裡演變而出，用來形容做官的人失勢後賓客稀少的景況。',
    emoji: '🚪', bg: 'linear-gradient(160deg,#e0f0ff,#a8d4f0)', tag: '歷史故事',
    mildDistract: ['庭','戶','窗','院'], hardDistract: ['羅','蘿','邏','籮']
  },
  {
    idiom: '若無其事',
    blanks: [0, 2],
    meaning: '用來形容神態鎮靜、自然，明明有重大的事發生，卻能像沒事一樣。',
    kidStory: '清末商人胡雪巖的米廠發生動亂，負責人緊張地通報他，沒想到胡雪巖的反應卻很鎮定，說「不妨事」。這種明明遇到大事卻表現得很平靜的樣子，就是「若無其事」。',
    fullStory: '「若無其事」，意即「好像沒那回事」，一般用在明明有件重大的事發生，但卻能像沒事一樣，舉止與神情都無異於平常。晚清大橋式羽的著作《雪巖外傳》曾用及此成語。胡雪巖為清末大資本家，憑藉著官場中的廣結善緣與個人的獨到眼光，吒叱商場，成為富可敵國的巨商。《雪巖外傳》中記有一事：一年嚴冬，胡雪巖設廠施捨米糧給災民，不料民眾與廠裡的員工起了爭執，最後竟導致動亂。米廠的負責人魏實甫認為事關重大，懷著忐忑不安的心情趕緊通報胡雪巖，沒想到他的反應居然是「若無其事，說不妨事」，先安撫了魏實甫，然後才開始處置此事。「若無其事」這句成語就用來形容神態鎮靜、自然。',
    emoji: '😌', bg: 'linear-gradient(160deg,#c8f0e0,#9be0c9)', tag: '生活趣談',
    mildDistract: ['好','像','似','彷'], hardDistract: ['若','苦','惹','弱']
  },
  {
    idiom: '目不識丁',
    blanks: [0, 2],
    meaning: '用來比喻不識字或毫無學問。',
    kidStory: '唐代官員張弘靖的部下罵士兵：「你們會拉弓射箭有什麼用，還不如去認識一個『丁』字！」意思是說士兵連最簡單的「丁」字都不認識，就是沒學問。後來就用「目不識丁」形容不識字。',
    fullStory: '「目不識丁」原作「不識一丁」。據《舊唐書．卷一二九．張延賞列傳》載，唐代時，張弘靖被任命為幽州節度使，掌管幽州地方的軍政。他的兩個從官韋雍、張宗厚行為囂張跋扈，常吃喝玩樂直到深夜，喝醉酒還要大隊人馬護送他們回家。看到不滿意的事就亂罵大叫，還對士兵說：「現在天下太平，你們會拉弓射箭有什麼用？還不如去認識一個『丁』字來得有用！」因為「丁」字是很容易認識的字，如果連「丁」字都不認識，那就接近文盲了。所以這句話不但誇讚了自己，也取笑了長於武藝的兵士。使得士兵們相當地氣憤，對他們深惡痛絕。後來「目不識丁」這句成語就從這裡演變而出，用來比喻不識字或毫無學問。',
    emoji: '📖', bg: 'linear-gradient(160deg,#ffe0ec,#ffc0d6)', tag: '歷史故事',
    mildDistract: ['耳','口','手','心'], hardDistract: ['丁','了','刁','叮']
  },
  {
    idiom: '雞犬不寧',
    blanks: [0, 2],
    meaning: '用來比喻被嚴重騷擾。',
    kidStory: '柳宗元寫〈捕蛇者說〉，描述凶狠的差役到村裡收稅，大呼小叫、四處騷擾，把整個村子搞得「雞犬不寧」——連雞和狗都不得安寧，形容騷擾非常嚴重。',
    fullStory: '中唐時期是唐王朝由盛轉衰的階段，歷經安史之亂後，藩鎮割據，稅制破壞，物價飛漲，社會陷入空前的貧困與混亂。柳宗元謫居永州期間，深切體認了「苛政猛於虎」的道理，於是寫下傳頌千古的〈捕蛇者說〉。文中描述一位蔣姓捕蛇人，家族三代以捕蛇抵稅為業，祖父和父親都喪命於此。柳宗元同情他的遭遇，表示願助他脫離此業，捕蛇人卻哀戚地說：「每當凶狠的差役大呼小叫，在村裡到處騷擾破壞，搞得雞飛狗跳時，看到瓦罐裡的蛇安然無恙，我就可以放心。」柳宗元藉捕蛇人之口，諷刺朝廷的苛政，文中「叫囂乎東西，隳突乎南北，譁然而駭者，雖雞狗不得寧焉」一段，生動刻畫了得勢者的可惡與人民的無助可悲。後來「雞犬不寧」這句成語就從這裡演變而出，用來比喻被嚴重騷擾。',
    emoji: '🐓', bg: 'linear-gradient(160deg,#f0e0c4,#d4b88f)', tag: '生活趣談',
    mildDistract: ['安','靜','穩','和'], hardDistract: ['寧','擰','檸','獰']
  },
]


/* ═══════════════════════════════════════════
   單元設定表
   ═══════════════════════════════════════════ */
const UNITS = {
  '1-1': {
    key: '1-1',
    title: '單元一・成語穿越者',
    displayName: '單元一',
    idioms: IDIOMS_1_1,
    introImg: IMG_BASE + '1.png',
    storyImg: (i) => `${IMG_BASE}s${i + 1}.png`,
    quizImg:  (i) => `${IMG_BASE}q${i + 1}.png`,
    introText: '你現在是一位穿梭在各個成語故事之中的穿越者。每打開一扇門，就會走進一個古老的典故世界——有仗劍直言的毛遂、寫詩感恩的孟郊、勸人學習的荀子……'
  },
  '2-1': {
    key: '2-1',
    title: '單元二・成語穿越者',
    displayName: '單元二',
    idioms: IDIOMS_2_1,
    introImg: IMG_BASE + '2-1 0.png',
    storyImg: (i) => `${IMG_BASE}2-1 ${i + 1}.png`,
    quizImg:  (i) => `${IMG_BASE}2-1 s${i + 1}.png`,
    introText: '歡迎來到成語穿越者第二單元！這裡有十個新的成語典故等著你認識——有勸諫君王的忠臣、借刀殺人的權謀、赴湯蹈火的忠義……'
  },
  '3-1': {
    key: '3-1',
    title: '單元三・成語穿越者',
    displayName: '單元三',
    idioms: IDIOMS_3_1,
    introImg: IMG_BASE + '3-1-0.png',
    storyImg: (i) => `${IMG_BASE}3-1-${i + 1}.png`,
    quizImg:  (i) => `${IMG_BASE}3-1-${i + 1}.png`,
    introText: '歡迎來到成語穿越者第三單元！這裡有十個新的成語典故等著你認識——有懂得回禮的古人、爭先恐後的諸侯、心意相投的莫逆之交……'
  },
  '4-1': {
    key: '4-1',
    title: '單元四・成語穿越者',
    displayName: '單元四',
    idioms: IDIOMS_4_1,
    introImg: IMG_BASE + '4-0.png',
    storyImg: (i) => `${IMG_BASE}4-${i + 1}.png`,
    quizImg:  (i) => `${IMG_BASE}4-${i + 1}.png`,
    introText: '歡迎來到成語穿越者第四單元！這裡有十個新的成語典故等著你認識——有天衣無縫的仙衣、與虎謀皮的寓言、同舟共濟的智慧……'
  }
}

const DISTRACT  = ['風','雨','雲','木','心','手','火','三','百','千','頭','東','西','上','下','大','小','天','日','月']

function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const DRILL_ROUNDS=[
  {id:1,label:'第一階段'},
  {id:2,label:'第二階段'},
  {id:3,label:'第三階段'},
  {id:4,label:'第四階段'},
]

function drillBlanks(q,round){
  if(round===1)return [...q.blanks].slice(0,1)
  if(round===2){
    if(q.blanks.length>=2)return q.blanks.slice(0,2)
    const extra=q.blanks[0]===3?2:q.blanks[0]+1
    return shuffle([q.blanks[0],extra]).sort((a,b)=>a-b)
  }
  return [0,1,2,3]
}

function drillTiles(q,round){
  const blanks=drillBlanks(q,round)
  const chars=q.idiom.split('')
  const answers=blanks.map(i=>chars[i])
  let opts=[...answers]

  if(round===1){
    const pool=shuffle([...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+2)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }else if(round===2){
    const pool=shuffle([...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+3)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }else if(round===3){
    opts=[...answers]
  }else{
    const pool=shuffle([...(q.hardDistract||[]),...(q.mildDistract||[])])
    for(const d of pool){if(opts.length>=answers.length+4)break;if(!opts.includes(d)&&!chars.includes(d))opts.push(d)}
  }
  return shuffle(opts).map((ch,k)=>({ch,tid:`d${k}`,used:false}))
}

const ROUND_WEIGHT={1:5,2:8,3:10,4:12}

/* ═══════════════════════════════════════════
   挑戰系統：抽題邏輯
   模式A「自由選題」：自選單元 + 自選階段，該單元10個成語全部用同一階段出題
   模式B「AI對決」：橫跨全部單元，40題，每題隨機單元+隨機階段，與AI搶答
   佇列項目格式：{unitKey, idiomIdx, round}
   ═══════════════════════════════════════════ */
function buildFreeQuizQueue(unitKey, round){
  const idioms = UNITS[unitKey].idioms
  return shuffle(idioms.map((_,idx)=>({unitKey, idiomIdx:idx, round})))
}

/* AI對決設定 */
/* 各階段的難度說明，選階段畫面用 */
const ROUND_DESC = {
  1:'挖 1 個字，最容易',
  2:'挖 2 個字，稍微難一點',
  3:'整句挖空，要全部記得',
  4:'整句挖空＋干擾字，最難',
}

const BATTLE_SECONDS = 20   // 每題限時
const BATTLE_TOTAL   = 40   // 總題數
const BATTLE_ROUND   = 4    // 固定使用第四階段（整句挖空＋干擾字），挑戰模式只考最難的
const AI_NAME        = '鼎鼎'   // 對手與導覽機器人是同一個角色

/* AI 對手行為模型：模擬國中生的作答速度與正確率
   階段越後面空格越多、干擾字越多，所以想得越久、也越容易錯 */
const AI_PROFILE = {
  1:{min:4000, max: 9000, acc:.90},
  2:{min:6000, max:12000, acc:.82},
  3:{min:8000, max:15000, acc:.72},
  4:{min:9000, max:17000, acc:.62},
}
function rollAiTurn(round){
  const p = AI_PROFILE[round] || AI_PROFILE[1]
  return {
    at: p.min + Math.random()*(p.max-p.min),   // 第幾毫秒出手
    correct: Math.random() < p.acc,            // 這題會不會答對
  }
}

function buildFullRandomQueue(){
  const pool=[]
  Object.keys(UNITS).forEach(unitKey=>{
    UNITS[unitKey].idioms.forEach((_,idx)=>{
      pool.push({unitKey, idiomIdx:idx})
    })
  })
  const shuffled=shuffle(pool).slice(0,BATTLE_TOTAL)
  // AI對決是最高難度的挑戰模式，固定使用第四階段（整句挖空＋干擾字）
  return shuffled.map(item=>({...item, round: BATTLE_ROUND}))
}

/* 練習模式結算：依總錯誤次數給評語，並找出錯最多的階段 */
function summarisePractice(mistakes){
  const total=[1,2,3,4].reduce((s,r)=>s+(mistakes[r]||0),0)
  // 錯最多的階段（同分時取較後面的階段，因為難度較高）
  let weakest=null,worst=0
  ;[1,2,3,4].forEach(r=>{ if((mistakes[r]||0)>=worst&&(mistakes[r]||0)>0){worst=mistakes[r];weakest=r} })
  let emoji,title,comment
  if(total===0){
    emoji='🏆';title='完美通關！'
    comment='四個階段都一次就答對，這個成語你已經記得很牢了。'
  }else if(total<=2){
    emoji='🌟';title='表現很好！'
    comment='只有少數地方卡住，再複習一下就完全掌握了。'
  }else if(total<=5){
    emoji='💪';title='繼續加油！'
    comment='有幾個字的位置還不太熟，建議回到典故，理解每個字的意思會更好記。'
  }else{
    emoji='📖';title='再練一次會更好！'
    comment='這個成語對你來說有點難度，建議先回去把典故故事讀一遍，再重新練習。'
  }
  return {total,weakest,worst,emoji,title,comment}
}

/* 通用診斷函式：answers = [{unitKey, idiomIdx, round, correct}]，題數不固定 */
function diagnoseQuiz(answers){
  const total = answers.length
  const ROUND_MAX_PER_Q = ROUND_WEIGHT
  let rawScore=0, maxScore=0
  const roundStats={1:{correct:0,total:0},2:{correct:0,total:0},3:{correct:0,total:0},4:{correct:0,total:0}}
  const wrongMap={} // key: `${unitKey}_${idiomIdx}` -> {count, unitKey, idiomIdx}
  answers.forEach(a=>{
    roundStats[a.round].total++
    maxScore+=ROUND_WEIGHT[a.round]
    if(a.correct){
      roundStats[a.round].correct++
      rawScore+=ROUND_WEIGHT[a.round]
    }else{
      const key=`${a.unitKey}_${a.idiomIdx}`
      if(!wrongMap[key])wrongMap[key]={count:0,rounds:[],unitKey:a.unitKey,idiomIdx:a.idiomIdx}
      wrongMap[key].count++
      wrongMap[key].rounds.push(a.round)
    }
  })
  const totalScore = maxScore?Math.round((rawScore/maxScore)*100):0
  const totalCorrect = answers.filter(a=>a.correct).length

  const topWrong = Object.values(wrongMap)
    .sort((a,b)=>b.count-a.count)
    .slice(0,5)
    .map(w=>({
      count:w.count,
      rounds:w.rounds,
      unitKey:w.unitKey,
      idiomIdx:w.idiomIdx,
      idiom:UNITS[w.unitKey].idioms[w.idiomIdx]
    }))

  // 最弱階段：正確率最低的那個階段（有作答過、且不是全對才回報）
  let weakestRound=null, worstRate=101
  ;[1,2,3,4].forEach(r=>{
    const st=roundStats[r]
    if(!st.total)return
    const rate=(st.correct/st.total)*100
    if(rate<worstRate&&rate<100){worstRate=rate;weakestRound=r}
  })

  return {totalScore, totalCorrect, totalQuestions:total, roundStats, topWrong, weakestRound}
}

/* ═══════════════════════════════════════════
   歷史成績（localStorage）
   ═══════════════════════════════════════════ */
function historyKey(unit){ return `chengyu_history_${unit}` }

function loadHistory(unit){
  if(typeof window==='undefined')return []
  try{
    const raw = window.localStorage.getItem(historyKey(unit))
    return raw ? JSON.parse(raw) : []
  }catch(e){ return [] }
}

function saveHistoryRecord(unit, diagnosis){
  if(typeof window==='undefined')return
  try{
    const list = loadHistory(unit)
    list.unshift({
      date: new Date().toISOString(),
      totalScore: diagnosis.totalScore,
      totalCorrect: diagnosis.totalCorrect,
      totalQuestions: diagnosis.totalQuestions,
      weakestRound: diagnosis.weakestRound,
      topWrong: diagnosis.topWrong,
      roundStats: diagnosis.roundStats
    })
    // 最多保留 20 筆
    window.localStorage.setItem(historyKey(unit), JSON.stringify(list.slice(0,20)))
  }catch(e){}
}

function getBestScore(unit){
  const list = loadHistory(unit)
  if(list.length===0)return null
  return list.reduce((best,rec)=>rec.totalScore>best.totalScore?rec:best, list[0])
}

function formatHistoryDate(iso){
  const d = new Date(iso)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}


function ImgWithFallback({src,fallback,alt,className,style}){
  const[err,setErr]=useState(false)
  useEffect(()=>{setErr(false)},[src])
  if(err)return <span style={style}>{fallback}</span>
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
    <div className="scene scene-text" style={{background:q.bg}}>
      <p className="scene-meaning-main">{q.meaning}</p>
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
          {placed[i]?.ch??''}
        </div>
      ):<div key={i} className="fixed-char">{ch}</div>)}
    </div>
  )
}

function ModeCard({modeKey,displayName,desc,onStart}){
  const[best,setBest]=useState(null)
  useEffect(()=>{
    setBest(getBestScore(modeKey))
  },[modeKey])
  return(
    <div className="level-card open" onClick={onStart}>
      <span className="lv-emoji">📝</span><h3>{displayName}</h3>
      <div className="lv-desc">{desc}</div>
      {best?(
        <div className="lv-last-score">🏆 最佳成績：{best.totalScore} 分</div>
      ):(
        <div className="lv-desc">尚未測驗過</div>
      )}
      <span className="lv-tag ready">▶ 開始</span>
    </div>
  )
}

function burst(count=14){
  const emo=['⭐','✨','🎉','🌟','🎊','🌈','🏆']
  for(let i=0;i<count;i++){
    const el=document.createElement('div')
    el.className='confetti';el.textContent=emo[Math.floor(Math.random()*emo.length)]
    el.style.left=(4+Math.random()*88)+'vw';el.style.animationDuration=(1.5+Math.random()*2)+'s'
    el.style.animationDelay=(Math.random()*0.5)+'s';el.style.fontSize=(1.2+Math.random()*1.4)+'rem'
    document.body.appendChild(el);setTimeout(()=>el.remove(),4000)
  }
}

/* ═══════════════════════════════════════════
   導覽機器人「鼎鼎」－ 依畫面狀態提醒下一步
   ═══════════════════════════════════════════ */
function getGuideTip({screen,unit,practiceRound,practiceCycleDone,idiomCount}){
  switch(screen){
    case 'home':
      return '嗨，我是鼎鼎！點選一個單元，展開成語清單吧！'
    case 'hub-learn-detail':
      if(practiceCycleDone)return '四個階段都完成了！可以換下一個成語繼續。'
      if(practiceRound===null)return '看完典故後，點「開始練習」吧！'
      return `第 ${practiceRound} 階段：把字拖進空格吧！`
    case 'hub-rank-select':
      return '選一個模式吧！選 AI 對決的話，對手就是我喔 ⚔️'
    case 'rank-drill':
      return `每題只有一次機會，看清楚再把字拖進空格！`
    case 'rank-diagnosis':
      return '來看看你的成績吧！'
    case 'battle-drill':
      return `這次換我當對手！每題 ${BATTLE_SECONDS} 秒，看誰搶得快 ⚔️`
    case 'battle-result':
      return '這場結束了！來看看誰搶到比較多分'
    default:
      return '跟著我一起探索成語的世界吧！'
  }
}

/* 鼎鼎頭像：public/images/robot.gif，檔案不存在時自動退回 🤖 */
function BotFace({size=22}){
  return <ImgWithFallback src={IMG_BASE+'robot.gif'} fallback="🤖" alt="鼎鼎"
    className="bot-face" style={{width:size,height:size,verticalAlign:'middle'}}/>
}

function Guide({tip,open,onToggle}){
  return(
    <div className="guide-wrap">
      {open&&(
        <div className="guide-bubble">
          <button className="guide-close" onClick={onToggle} aria-label="收起嚮導">×</button>
          <p>{tip}</p>
        </div>
      )}
      <button className="guide-avatar" onClick={onToggle} aria-label="打開嚮導">
        <span className="guide-face"><BotFace size={64}/></span>
      </button>
    </div>
  )
}

function TextScaleControl({scale,onChange}){
  return(
    <div className="text-scale-ctrl">
      <span className="ts-label">Aa</span>
      <button className={scale==='sm'?'active':''} onClick={()=>onChange('sm')}>小</button>
      <button className={scale==='md'?'active':''} onClick={()=>onChange('md')}>中</button>
      <button className={scale==='lg'?'active':''} onClick={()=>onChange('lg')}>大</button>
    </div>
  )
}

export default function Home(){
  // screen: home / hub-learn-detail /
  //         hub-rank-select / rank-mode-a-select / rank-drill / rank-diagnosis
  const[screen,setScreen]=useState('home')
  const[unit,setUnit]=useState('1-1')
  const[selectedIdiomIdx,setSelectedIdiomIdx]=useState(null) // 學習模式：選中的成語
  const[practiceRound,setPracticeRound]=useState(null)       // 學習模式：選中的練習階段(1-4)
  const[practiceCycleDone,setPracticeCycleDone]=useState(false) // 一鍵四階段是否已跑完
  const[practiceMistakes,setPracticeMistakes]=useState({1:0,2:0,3:0,4:0}) // 本輪練習各階段答錯次數

  const[quizMode,setQuizMode]=useState(null)   // 挑戰系統：'a'（自由選題）或 'b'（隨機40題）
  const[quizQueue,setQuizQueue]=useState([])   // [{unitKey,idiomIdx,round}]
  const[quizIdx,setQuizIdx]=useState(0)
  const[quizScore,setQuizScore]=useState(0)
  const[diagnosis,setDiagnosis]=useState(null) // 最新一次挑戰結果
  const[modeAUnit,setModeAUnit]=useState(null)         // 模式A：選好的單元，等待選階段
  const[battleScore,setBattleScore]=useState({me:0,ai:0})
  const[battleTimeLeft,setBattleTimeLeft]=useState(BATTLE_SECONDS)
  const[battleMsg,setBattleMsg]=useState('')
  const[battleAiState,setBattleAiState]=useState('thinking') // thinking | correct | wrong | beaten
  const[battleFinal,setBattleFinal]=useState(null)           // 對決結算 {me,ai,total,diag}
  const battleRef=useRef({start:0,aiAt:0,aiCorrect:true,aiDone:false,myDone:false,resolved:false})
  const battleAnswersRef=useRef([])
  const battleScoreRef=useRef({me:0,ai:0})
  const[viewingRecord,setViewingRecord]=useState(null) // 從歷史記錄點進來查看的那一筆（null代表看最新測驗結果）

  const[placed,setPlaced]=useState({})
  const[tiles,setTiles]=useState([])
  const[result,setResult]=useState(null)
  const[msg,setMsg]=useState('')
  const dragRef=useRef(null)
  const ghostRef=useRef(null)
  const quizAnswersRef=useRef([])

  const[guideOpen,setGuideOpen]=useState(true)   // 導覽機器人：泡泡開關
  const[textScale,setTextScale]=useState('md')   // 文字大小：sm / md / lg
  const[portalFlash,setPortalFlash]=useState(false)
  const prevScreenRef=useRef(screen)

  useEffect(()=>{
    if(prevScreenRef.current!==screen){
      prevScreenRef.current=screen
      setGuideOpen(true)
      setPortalFlash(true)
      const t=setTimeout(()=>setPortalFlash(false),500)
      return ()=>clearTimeout(t)
    }
  },[screen])

  const U = UNITS[unit]
  const IDIOMS = U.idioms

  const currentQuizItem = quizQueue[quizIdx] || null
  const quizIdiom = currentQuizItem ? UNITS[currentQuizItem.unitKey].idioms[currentQuizItem.idiomIdx] : null

  const initDrillQ=useCallback((round,idx)=>{
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[idx],round))
  },[IDIOMS])

  const initQuizQ=useCallback((item)=>{
    if(!item)return
    setPlaced({});setResult(null);setMsg('')
    const q = UNITS[item.unitKey].idioms[item.idiomIdx]
    setTiles(drillTiles(q,item.round))
  },[])

  useEffect(()=>{
    if(screen==='rank-drill'||screen==='battle-drill')initQuizQ(currentQuizItem)
  },[quizIdx,quizQueue,screen])


  /* ── 學習與練習模式 ── */
  function openIdiom(unitKey,idx){ setUnit(unitKey); setSelectedIdiomIdx(idx); setPracticeRound(null); setPracticeCycleDone(false); setPracticeMistakes({1:0,2:0,3:0,4:0}); setScreen('hub-learn-detail') }
  function startPracticeCycle(){
    setPracticeRound(1)
    setPracticeCycleDone(false)
    setPracticeMistakes({1:0,2:0,3:0,4:0})
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[selectedIdiomIdx],1))
  }
  function checkPractice(){
    const q=IDIOMS[selectedIdiomIdx]
    const blanks=drillBlanks(q,practiceRound)
    const chars=q.idiom.split('')
    let allOk=true
    const next={...placed}
    blanks.forEach(pos=>{const ok=next[pos]?.ch===chars[pos];next[pos]={...next[pos],correct:ok};if(!ok)allOk=false})
    setPlaced(next)
    if(allOk){
      setResult('ok');setMsg(`✦ 答對了！「${q.idiom}」`);burst(10)
    }else{
      setResult('err');setMsg('✗ 放錯了，再想想看！')
      setPracticeMistakes(m=>({...m,[practiceRound]:m[practiceRound]+1}))
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
  function nextPracticeStep(){
    if(practiceRound<4){
      const nr=practiceRound+1
      setPracticeRound(nr)
      setPlaced({});setResult(null);setMsg('')
      setTiles(drillTiles(IDIOMS[selectedIdiomIdx],nr))
    }else{
      // 四個階段都完成，留在原地顯示完成訊息，不自動跳轉
      setPracticeCycleDone(true)
    }
  }
  function retryPractice(){
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[selectedIdiomIdx],practiceRound))
  }

  /* ── 挑戰後：點錯題直接跳去該成語的典故頁複習 ── */
  function reviewWrongIdiom(unitKey,idx){
    setUnit(unitKey)
    setSelectedIdiomIdx(idx)
    setPracticeRound(null)
    setPracticeCycleDone(false)
    setPracticeMistakes({1:0,2:0,3:0,4:0})
    setScreen('hub-learn-detail')
  }

  /* ── 挑戰系統 ── */
  function startQuizModeA(unitKey, round){
    const queue = buildFreeQuizQueue(unitKey, round)
    setQuizMode('a')
    setQuizQueue(queue)
    setQuizIdx(0)
    setQuizScore(0)
    quizAnswersRef.current=[]
    setViewingRecord(null)
    setScreen('rank-drill')
  }

  /* ── AI對決 ── */
  function startBattle(){
    const queue = buildFullRandomQueue()
    setQuizMode('battle')
    setQuizQueue(queue)
    setQuizIdx(0)
    battleAnswersRef.current=[]
    battleScoreRef.current={me:0,ai:0}
    setBattleScore({me:0,ai:0})
    setBattleFinal(null)
    setBattleMsg('')
    setViewingRecord(null)
    setScreen('battle-drill')
  }

  /* 結束這一題：winner = 'me' | 'ai' | 'none'
     outcome 另外記錄是被搶走、自己答錯還是超時，結算時可以分開說明 */
  function resolveBattle(winner, outcome, item){
    const st=battleRef.current
    if(st.resolved)return
    st.resolved=true

    battleAnswersRef.current.push({
      unitKey:item.unitKey, idiomIdx:item.idiomIdx, round:item.round,
      correct: winner==='me', outcome,
    })

    if(winner==='me'){
      battleScoreRef.current.me++
      setBattleScore({...battleScoreRef.current})
      setBattleAiState('beaten')
      setBattleMsg(`✦ 搶答成功！你得 1 分`)
      burst(10)
      setResult('ok')
    }else if(winner==='ai'){
      battleScoreRef.current.ai++
      setBattleScore({...battleScoreRef.current})
      setBattleAiState('correct')
      setBattleMsg(`${AI_NAME}搶先答對了，這分被拿走`)
      setResult('err')
    }else{
      setBattleMsg(outcome==='timeout'?'⏰ 時間到，沒有人得分':'兩邊都答錯，沒有人得分')
      setResult('err')
    }

    setTimeout(()=>{
      if(quizIdx<quizQueue.length-1){
        setQuizIdx(i=>i+1)
      }else{
        const diag = diagnoseQuiz(battleAnswersRef.current)
        const final = {...battleScoreRef.current, total:battleAnswersRef.current.length, diag}
        setBattleFinal(final)
        setDiagnosis(diag)
        saveHistoryRecord('ai-battle', diag)
        setViewingRecord(null)
        setScreen('battle-result')
      }
    },1700)
  }

  function checkBattleAnswer(){
    const item = currentQuizItem
    const st = battleRef.current
    if(!item||st.resolved||st.myDone)return
    const q = UNITS[item.unitKey].idioms[item.idiomIdx]
    const blanks=drillBlanks(q,item.round)
    const chars=q.idiom.split('')
    let allOk=true
    const next={...placed}
    blanks.forEach(pos=>{const ok=next[pos]?.ch===chars[pos];next[pos]={...next[pos],correct:ok};if(!ok)allOk=false})
    setPlaced(next)

    if(allOk){
      resolveBattle('me','win',item)
    }else{
      st.myDone=true
      setResult('err')
      if(st.aiDone){
        // AI 也已經出手且答錯，這題沒人拿得到分
        resolveBattle('none','both-wrong',item)
      }else{
        setMsg(`✗ 答錯了，看${AI_NAME}接不接得住…`)
      }
    }
  }

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

  function checkQuizAnswer(){
    const item = currentQuizItem
    if(!item)return
    const q = UNITS[item.unitKey].idioms[item.idiomIdx]
    const blanks=drillBlanks(q,item.round)
    const chars=q.idiom.split('')
    let allOk=true
    const next={...placed}
    blanks.forEach(pos=>{const ok=next[pos]?.ch===chars[pos];next[pos]={...next[pos],correct:ok};if(!ok)allOk=false})
    setPlaced(next)
    quizAnswersRef.current.push({unitKey:item.unitKey,idiomIdx:item.idiomIdx,round:item.round,correct:allOk})
    if(allOk){
      setQuizScore(s=>s+1)
      setResult('ok');setMsg('✦ 答對了！');burst(10)
    }else{
      setResult('err');setMsg('✗ 答錯了')
    }
    setTimeout(()=>{
      if(quizIdx<quizQueue.length-1){
        setQuizIdx(i=>i+1)
      }else{
        const key = quizMode==='a' ? item.unitKey : 'full-random'
        const res = diagnoseQuiz(quizAnswersRef.current)
        setDiagnosis(res)
        saveHistoryRecord(key, res)
        setViewingRecord(null)
        setScreen('rank-diagnosis')
      }
    },1400)
  }

  function onTilePointerDown(e,tile){
    if(tile.used||(result!==null&&(screen==='rank-drill'||screen==='battle-drill')))return
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

  const selIdiom = selectedIdiomIdx!==null ? IDIOMS[selectedIdiomIdx] : null
  const filledPractice = Object.keys(placed).length
  const canCheckPractice = practiceRound && selIdiom && filledPractice===drillBlanks(selIdiom,practiceRound).length && result===null

  // 練習模式：空格全部填滿後自動判定（留一點延遲讓使用者看到字落定）
  useEffect(()=>{
    if(screen!=='hub-learn-detail')return
    if(!canCheckPractice)return
    const t=setTimeout(()=>{checkPractice()},380)
    return ()=>clearTimeout(t)
  },[canCheckPractice,screen])

  // 練習模式：答對後自動進入下一階段（最後一階段則自動進結算畫面）
  useEffect(()=>{
    if(screen!=='hub-learn-detail')return
    if(practiceRound===null||result!=='ok')return
    const t=setTimeout(()=>{nextPracticeStep()},1200)
    return ()=>clearTimeout(t)
  },[result,practiceRound,screen])

  // AI對決：每題開始時擲出 AI 的出手時間與對錯，並啟動 20 秒倒數
  useEffect(()=>{
    if(screen!=='battle-drill')return
    const item = currentQuizItem
    if(!item)return

    const turn = rollAiTurn(item.round)
    battleRef.current={start:Date.now(),aiAt:turn.at,aiCorrect:turn.correct,aiDone:false,myDone:false,resolved:false}
    setBattleTimeLeft(BATTLE_SECONDS)
    setBattleAiState('thinking')
    setBattleMsg('')

    const tick=setInterval(()=>{
      const st=battleRef.current
      if(st.resolved)return
      const el=Date.now()-st.start
      setBattleTimeLeft(Math.max(0,(BATTLE_SECONDS*1000-el)/1000))

      // AI 出手
      if(!st.aiDone && el>=st.aiAt){
        st.aiDone=true
        if(st.aiCorrect){
          resolveBattle('ai','ai-steal',item)
          return
        }
        setBattleAiState('wrong')
        setBattleMsg(`${AI_NAME}答錯了！機會是你的`)
        if(st.myDone){ resolveBattle('none','both-wrong',item); return }
      }

      // 時間到
      if(el>=BATTLE_SECONDS*1000){
        resolveBattle('none','timeout',item)
      }
    },100)

    return ()=>clearInterval(tick)
  },[quizIdx,quizQueue,screen])

  const canCheckBattle = screen==='battle-drill' && quizIdiom && currentQuizItem && result===null &&
    Object.keys(placed).length===drillBlanks(quizIdiom,currentQuizItem.round).length

  // AI對決：填滿即判定，延遲比一般測驗短，因為是搶答
  useEffect(()=>{
    if(!canCheckBattle)return
    const t=setTimeout(()=>{checkBattleAnswer()},250)
    return ()=>clearTimeout(t)
  },[canCheckBattle])

  const canCheckQuiz = quizIdiom && currentQuizItem && result===null &&
    Object.keys(placed).length===drillBlanks(quizIdiom,currentQuizItem.round).length

  // 挑戰測驗：同樣自動判定，但延遲較長（每題只有一次機會，留時間反悔改字）
  useEffect(()=>{
    if(screen!=='rank-drill')return
    if(!canCheckQuiz)return
    const t=setTimeout(()=>{checkQuizAnswer()},700)
    return ()=>clearTimeout(t)
  },[canCheckQuiz,screen])

  const PRACTICE_MODES=[
    {round:1,label:'第一階段'},
    {round:2,label:'第二階段'},
    {round:3,label:'第三階段'},
    {round:4,label:'第四階段'},
  ]

  const guideTip=getGuideTip({screen,unit,practiceRound,practiceCycleDone,idiomCount:IDIOMS.length})

  return(
    <>
      <Head><title>成語穿越者</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>

      <div className="sidebar">
        <div className="sidebar-header">🗺️ 關卡選單</div>

        {screen!=='rank-drill'&&screen!=='battle-drill'&&(<>
          <div className={`sidebar-item${['home','hub-learn-detail'].includes(screen)?' active':''}`} onClick={()=>setScreen('home')}>📖 學習與練習</div>
          <div className={`sidebar-item${['hub-rank-select','rank-mode-a-select','rank-diagnosis'].includes(screen)?' active':''}`} onClick={()=>setScreen('hub-rank-select')}>📝 挑戰系統</div>
        </>)}
        {(screen==='rank-drill'||screen==='battle-drill')&&(
          <div style={{margin:'16px 12px',fontSize:'.8rem',color:'var(--gold-dim)',textAlign:'center',lineHeight:1.6}}>
            {screen==='battle-drill'?<>⚔️ AI對決進行中<br/>結束後可切換其他模式</>:<>📝 挑戰測驗進行中<br/>完成測驗後可切換其他模式</>}
          </div>
        )}
      </div>

      <div className="cloud c1"/><div className="cloud c2"/><div className="cloud c3"/>

      {portalFlash&&<div className="portal-flash"/>}

      <TextScaleControl scale={textScale} onChange={setTextScale}/>
      <Guide tip={guideTip} open={guideOpen} onToggle={()=>setGuideOpen(o=>!o)}/>

      <div className={`wrap text-scale-${textScale}`}>

        {/* ════ 序章 ════ */}
        <section className={`screen${screen==='home'?' show':''}`}>
          <div className="hero">
            <ImgWithFallback src={UNITS['1-1'].introImg} fallback="🌀" alt="成語穿越者" className="hero-img"/>
            <div className="hero-content">
              <h1 className="hero-title">成語穿越者</h1>
              <div className="scroll-box">
                <p>你現在是一位穿梭在各個成語故事之中的<span className="hl">穿越者</span>。<br/>每個單元都是一段古老的<span className="hl2">典故世界</span>——<br/>請先<span className="hl">讀懂每個典故</span>，再透過反覆練習，<br/><span className="nb">證明你真的學會了！</span></p>
              </div>
            </div>
          </div>

          <div className="unit-accordion">
            {Object.values(UNITS).map(u=>(
              <div key={u.key} className="unit-block">
                <div className="unit-block-header">
                  <span className="lv-emoji">📖</span>
                  <div className="unit-block-title">
                    <h3>{u.displayName}</h3>
                    <p>{u.idioms.map(x=>x.idiom).slice(0,5).join('、')} 等 10 個成語</p>
                  </div>
                </div>
                <div className="free-idiom-grid unit-block-list">
                  {u.idioms.map((it,i)=>(
                    <div key={i} className="free-idiom-card" onClick={()=>openIdiom(u.key,i)}>
                      <span className="free-idiom-emoji">{it.emoji}</span>
                      <div className="free-idiom-name">{it.idiom}</div>
                      <div className="free-idiom-tag">{it.tag}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════ 學習與練習：典故+練習入口（同一頁） ════ */}
        <section className={`screen${screen==='hub-learn-detail'?' show':''}`}>
          {selIdiom&&(
          <div className="topbar">
            <button className="back-btn" onClick={()=>setScreen('home')}>← 返回首頁</button>
          </div>
          )}
          {selIdiom&&practiceRound===null&&!practiceCycleDone&&(
            <div className="card">
              <div className="level-banner">📖 {selIdiom.idiom}</div>
              <div className="learn-img-box">
                <ImgWithFallback src={U.storyImg(selectedIdiomIdx)} fallback={<div className="learn-placeholder"><span style={{fontSize:'4rem'}}>{selIdiom.emoji}</span><p>（典故漫畫圖片未上傳）</p></div>} alt={selIdiom.idiom+' 典故漫畫'} className="learn-img"/>
              </div>
              <div className="learn-story">
                <h3>{selIdiom.emoji} {selIdiom.idiom}</h3>
                <p className="learn-kid">{selIdiom.kidStory}</p>
                <p className="meaning">💡 意思：{selIdiom.meaning}</p>
                <p className="learn-full-label">📜 完整典故原文</p>
                <p className="learn-full">{selIdiom.fullStory}</p>
              </div>
              <div className="actions" style={{marginTop:24}}>
                <button className="btn btn-go" onClick={startPracticeCycle}>✏️ 開始練習成語 →</button>
              </div>
            </div>
          )}
          {selIdiom&&practiceRound!==null&&(
            <div className="card">
              <div className="drill-round-bar">
                {PRACTICE_MODES.map(m=>(
                  <div key={m.round} className={`drill-round-tag${m.round===practiceRound?' active':''}${m.round<practiceRound?' done':''}`}>{m.round<practiceRound?'✓ ':''}{m.label}</div>
                ))}
              </div>
              <div className="level-banner">第{selectedIdiomIdx+1}題・{PRACTICE_MODES[practiceRound-1].label}</div>
              <Scene q={selIdiom} qIdx={selectedIdiomIdx} blankCount={drillBlanks(selIdiom,practiceRound).length}/>
              <IdiomRow q={selIdiom} placed={placed} onClickSlot={handleClickSlot} blanksOverride={drillBlanks(selIdiom,practiceRound)}/>
              <div className="bank">{tiles.map(tile=>(<div key={tile.tid} className={`tile${tile.used?' used':''}`} onPointerDown={e=>onTilePointerDown(e,tile)}>{tile.ch}</div>))}</div>
              {result!=='ok'&&(
                <div className="actions">
                  <button className="btn btn-ghost" onClick={retryPractice}>🔄 重來</button>
                </div>
              )}
              <div className={`result${result==='ok'?' result-success':result==='err'?' result-error':''}`}>{msg}</div>
            </div>
          )}
          {selIdiom&&practiceCycleDone&&(
            <div className="card finish-inner">
              {(() => {
                const s = summarisePractice(practiceMistakes)
                return (
                  <>
                    <div className="big">{s.emoji}</div>
                    <h2>「{selIdiom.idiom}」四階段練習完成！</h2>
                    <p className="practice-verdict">{s.title}{s.comment}</p>

                    <div className="diagnosis-details">
                      {DRILL_ROUNDS.map(r=>{
                        const m=practiceMistakes[r.id]||0
                        return (
                          <div className="detail-row" key={r.id}>
                            <span>{r.label}：</span>
                            <span className={m===0?'good':'warning'}>{m===0?'一次答對 ✓':`答錯 ${m} 次`}</span>
                          </div>
                        )
                      })}
                      <div className="detail-row">
                        <span>總計答錯：</span>
                        <span className={s.total===0?'good':'warning'}>{s.total} 次</span>
                      </div>
                    </div>

                    {s.weakest&&(
                      <p className="weak-round-tip">
                        📌 <span className="nb">你在「{DRILL_ROUNDS[s.weakest-1].label}」錯得最多（{s.worst} 次），</span>
                        <span className="nb">建議多練習這個階段。</span>
                      </p>
                    )}
                  </>
                )
              })()}
              <div className="actions">
                <button className="btn btn-go" onClick={()=>{setPracticeRound(null);setPracticeCycleDone(false);setPracticeMistakes({1:0,2:0,3:0,4:0});setScreen('home')}}>🏠 回到首頁</button>
              </div>
            </div>
          )}
        </section>

        {/* ════ 挑戰系統：選模式 ════ */}
        <section className={`screen${screen==='hub-rank-select'?' show':''}`}>
          <div className="menu-head"><h2>📝 挑戰系統</h2><p>選擇模式，測試你對成語的理解程度</p></div>
          <div className="level-grid">
            <ModeCard modeKey="mode-a" displayName="自由選題" desc="自選單元、自選階段，該單元10題一次練透" onStart={()=>{setModeAUnit(null);setScreen('rank-mode-a-select')}}/>
            <ModeCard modeKey="ai-battle" displayName="⚔️ AI對決" desc={`跟${AI_NAME}搶答${BATTLE_TOTAL}題，全部第四階段，每題${BATTLE_SECONDS}秒`} onStart={startBattle}/>
          </div>
        </section>

        {/* ════ 挑戰系統：模式A選單元 ════ */}
        <section className={`screen${screen==='rank-mode-a-select'?' show':''}`}>
          <div className="topbar">
            <button className="back-btn" onClick={()=>setScreen('hub-rank-select')}>← 選模式</button>
          </div>
          <div className="menu-head"><h2>📝 自由選題</h2><p>第一步：選一個單元</p></div>
          <div className="level-grid cols-4">
            <ModeCard modeKey="1-1" displayName="單元一" desc="10 個成語" onStart={()=>{setModeAUnit('1-1');setScreen('rank-mode-a-round')}}/>
            <ModeCard modeKey="2-1" displayName="單元二" desc="10 個成語" onStart={()=>{setModeAUnit('2-1');setScreen('rank-mode-a-round')}}/>
            <ModeCard modeKey="3-1" displayName="單元三" desc="10 個成語" onStart={()=>{setModeAUnit('3-1');setScreen('rank-mode-a-round')}}/>
            <ModeCard modeKey="4-1" displayName="單元四" desc="10 個成語" onStart={()=>{setModeAUnit('4-1');setScreen('rank-mode-a-round')}}/>
          </div>
        </section>

        {/* ════ 挑戰系統：模式A選階段 ════ */}
        <section className={`screen${screen==='rank-mode-a-round'?' show':''}`}>
          <div className="topbar">
            <button className="back-btn" onClick={()=>setScreen('rank-mode-a-select')}>← 選單元</button>
          </div>
          <div className="menu-head">
            <h2>📝 {modeAUnit?UNITS[modeAUnit].title.split('・')[0]:''}</h2>
            <p>第二步：自由選擇要挑戰的階段，10 題都用這個階段出題</p>
          </div>
          <div className="level-grid cols-4">
            {DRILL_ROUNDS.map(r=>(
              <div key={r.id} className="level-card open round-pick-card" onClick={()=>modeAUnit&&startQuizModeA(modeAUnit,r.id)}>
                <span className="lv-emoji">{['🟢','🟡','🟠','🔴'][r.id-1]}</span>
                <h3>{r.label}</h3>
                <div className="lv-desc">{ROUND_DESC[r.id]}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════ 挑戰系統：評測作答 ════ */}
        <section className={`screen${screen==='rank-drill'?' show':''}`}>
          <div className="topbar">
            <div className="score-pill">📝 挑戰測驗</div>
            <ProgressBar idx={quizIdx} total={quizQueue.length}/>
            <div className="score-pill">✅ {quizScore}</div>
          </div>
          {quizIdiom&&currentQuizItem&&(
          <div className="card">
            <div className="level-banner">第{quizIdx+1}題・{DRILL_ROUNDS[currentQuizItem.round-1].label}</div>
            <Scene q={quizIdiom} qIdx={currentQuizItem.idiomIdx} blankCount={drillBlanks(quizIdiom,currentQuizItem.round).length}/>
            <IdiomRow q={quizIdiom} placed={placed} onClickSlot={handleClickSlot} blanksOverride={drillBlanks(quizIdiom,currentQuizItem.round)}/>
            <div className="bank">{tiles.map(tile=>(<div key={tile.tid} className={`tile${tile.used?' used':''}`} onPointerDown={e=>onTilePointerDown(e,tile)}>{tile.ch}</div>))}</div>
            <div className={`result${result==='ok'?' result-success':result==='err'?' result-error':''}`}>{msg}</div>
          </div>
          )}
        </section>

        {/* ════ 挑戰系統：AI對決作答 ════ */}
        <section className={`screen${screen==='battle-drill'?' show':''}`}>
          <div className="topbar">
            <div className="score-pill">⚔️ 第 {quizIdx+1} / {quizQueue.length} 題</div>
            <div className="battle-scoreboard">
              <div className="bs-side bs-me"><span className="bs-label">你</span><span className="bs-num">{battleScore.me}</span></div>
              <span className="bs-vs">VS</span>
              <div className={`bs-side bs-ai${battleAiState==='thinking'?' thinking':''}`}>
                <span className="bs-label"><BotFace size={40}/> {AI_NAME}</span><span className="bs-num">{battleScore.ai}</span>
              </div>
            </div>
          </div>

          <div className="battle-timer">
            <div className="bt-bar">
              <div className={`bt-fill${battleTimeLeft<=5?' urgent':''}`} style={{width:`${(battleTimeLeft/BATTLE_SECONDS)*100}%`}}/>
            </div>
            <div className={`bt-num${battleTimeLeft<=5?' urgent':''}`}>{Math.ceil(battleTimeLeft)}s</div>
          </div>

          {quizIdiom&&currentQuizItem&&(
          <div className="card">
            <div className="level-banner">第{quizIdx+1}題・{DRILL_ROUNDS[currentQuizItem.round-1].label}</div>
            <Scene q={quizIdiom} qIdx={currentQuizItem.idiomIdx} blankCount={drillBlanks(quizIdiom,currentQuizItem.round).length}/>
            <IdiomRow q={quizIdiom} placed={placed} onClickSlot={handleClickSlot} blanksOverride={drillBlanks(quizIdiom,currentQuizItem.round)}/>
            <div className="bank">{tiles.map(tile=>(<div key={tile.tid} className={`tile${tile.used?' used':''}`} onPointerDown={e=>onTilePointerDown(e,tile)}>{tile.ch}</div>))}</div>
            <div className={`battle-ai-status ai-${battleAiState}`}>
              {battleAiState==='thinking'&&<><BotFace size={54}/> {AI_NAME}思考中…</>}
              {battleAiState==='wrong'&&<><BotFace size={54}/> {AI_NAME}答錯了！</>}
              {battleAiState==='correct'&&<><BotFace size={54}/> {AI_NAME}答對，搶走這一分</>}
              {battleAiState==='beaten'&&<><BotFace size={54}/> {AI_NAME}來不及了！</>}
            </div>
            <div className={`result${result==='ok'?' result-success':result==='err'?' result-error':''}`}>{battleMsg||msg}</div>
          </div>
          )}
        </section>

        {/* ════ 挑戰系統：AI對決結算 ════ */}
        <section className={`screen${screen==='battle-result'?' show':''}`}>
          {battleFinal&&(()=>{
            const {me,ai,total,diag}=battleFinal
            const noScore = total-me-ai
            const win = me>ai, draw = me===ai
            const counts = battleAnswersRef.current.reduce((a,x)=>{a[x.outcome]=(a[x.outcome]||0)+1;return a},{})
            return(
            <div className="card finish-inner">
              <div className="big">{draw?'🤝':win?'🏆':'💪'}</div>
              <h2>{draw?'平手！':win?`你贏了${AI_NAME}！`:`${AI_NAME}這次比較快`}</h2>

              <div className="battle-final">
                <div className={`bf-side${win?' bf-winner':''}`}>
                  <div className="bf-name">你</div>
                  <div className="bf-score">{me}</div>
                </div>
                <div className="bf-vs">VS</div>
                <div className={`bf-side${!win&&!draw?' bf-winner':''}`}>
                  <div className="bf-name"><BotFace size={96}/><br/>{AI_NAME}</div>
                  <div className="bf-score">{ai}</div>
                </div>
              </div>
              <p className="bf-total">滿分 {total} 分・你搶到 {me} 分・{AI_NAME} 搶到 {ai} 分{noScore>0&&`・${noScore} 題雙方都沒拿到`}</p>

              <div className="diagnosis-details">
                <div className="detail-row"><span>搶答成功：</span><span className="good">{counts['win']||0} 題</span></div>
                <div className="detail-row"><span>被 {AI_NAME} 搶先：</span><span className="warning">{counts['ai-steal']||0} 題</span></div>
                <div className="detail-row"><span>自己答錯：</span><span className="warning">{counts['both-wrong']||0} 題</span></div>
                <div className="detail-row"><span>時間到沒答完：</span><span className="warning">{counts['timeout']||0} 題</span></div>
              </div>

              <p className="weak-round-tip">
                📌 <span className="nb">挑戰模式全部採用「{DRILL_ROUNDS[BATTLE_ROUND-1].label}」，</span>
                <span className="nb">是整句挖空加干擾字的最高難度。</span>
              </p>

              {(diag.topWrong||[]).length>0&&(<>
                <p className="section-title">這些成語沒搶到，點一下回去複習典故</p>
                <div className="free-idiom-grid">
                  {diag.topWrong.map((w,i)=>{
                    const it=w.idiom
                    if(!it)return null
                    return(
                      <div className="free-idiom-card" key={i} onClick={()=>reviewWrongIdiom(w.unitKey,w.idiomIdx)}>
                        <div className="free-idiom-emoji">{it.emoji}</div>
                        <div className="free-idiom-name">{it.idiom}</div>
                        <div className="free-idiom-tag">待複習</div>
                      </div>
                    )
                  })}
                </div>
              </>)}

              <div className="actions">
                <button className="btn btn-ghost" onClick={()=>setScreen('hub-rank-select')}>← 返回挑戰系統</button>
                <button className="btn btn-go" onClick={startBattle}>⚔️ 再戰一次</button>
              </div>
            </div>
            )
          })()}
        </section>

        {/* ════ 挑戰系統：診斷報告 ════ */}
        <section className={`screen${screen==='rank-diagnosis'?' show':''}`}>
          {(() => {
            const d = viewingRecord || diagnosis
            if(!d) return null
            const totalQ = d.totalQuestions || (d.roundStats?Object.values(d.roundStats).reduce((a,st)=>a+st.total,0):0)
            return (
            <div className="diagnosis-screen">
              <h2>📊 成績{viewingRecord && `（${formatHistoryDate(viewingRecord.date)}）`}</h2>
              <div className="score-display"><span className="score-number">{d.totalScore}</span><span className="score-outof">/ 100 分（共 {totalQ} 題，答對 {d.totalCorrect} 題）</span></div>

              {d.roundStats&&(
                <div className="diagnosis-details">
                  {DRILL_ROUNDS.map(r=>{
                    const st=d.roundStats[r.id]
                    if(!st||!st.total)return null
                    const rate=st.total?Math.round((st.correct/st.total)*100):0
                    return <div className="detail-row" key={r.id}><span>{r.label}：</span><span className={rate>=80?'good':'warning'}>{st.correct}/{st.total}（{rate}%）</span></div>
                  })}
                </div>
              )}

              {d.weakestRound&&(
                <p className="weak-round-tip">
                  📌 <span className="nb">你在「{DRILL_ROUNDS[d.weakestRound-1].label}」錯得最多，</span>
                  <span className="nb">建議多練習這個階段。</span>
                </p>
              )}

              {(d.topWrong||[]).length>0?(
                <>
                  <p className="section-title">點下面的成語直接複習</p>
                  <div className="free-idiom-grid">
                    {(d.topWrong||[]).map((w,i)=>{
                      const it = w.idiom || UNITS[w.unitKey]?.idioms[w.idiomIdx]
                      return it?(
                        <div key={i} className="free-idiom-card" onClick={()=>reviewWrongIdiom(w.unitKey,w.idiomIdx)}>
                          <span className="free-idiom-emoji">{it.emoji}</span>
                          <div className="free-idiom-name">{it.idiom}</div>
                          <div className="free-idiom-tag">{w.count>1?`答錯 ${w.count} 次`:(w.rounds&&w.rounds[0]?`${DRILL_ROUNDS[w.rounds[0]-1].label}答錯`:'答錯')}</div>
                        </div>
                      ):null
                    })}
                  </div>
                </>
              ):(
                <p className="section-title">🎉 全部答對！</p>
              )}
              <div className="actions" style={{marginTop:20}}>
                <button className="btn btn-ghost" onClick={()=>{setViewingRecord(null);setScreen('hub-rank-select')}}>← 返回挑戰系統</button>
              </div>
            </div>
            )
          })()}
        </section>

      </div>
    </>
  )
}
