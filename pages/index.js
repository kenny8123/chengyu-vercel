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


/* ═══════════════════════════════════════════
   單元設定表
   ═══════════════════════════════════════════ */
const UNITS = {
  '1-1': {
    key: '1-1',
    title: '1-1 成語驗驗看',
    idioms: IDIOMS_1_1,
    introImg: IMG_BASE + '1.png',
    storyImg: (i) => `${IMG_BASE}s${i + 1}.png`,
    quizImg:  (i) => `${IMG_BASE}q${i + 1}.png`,
    introText: '你現在是一位穿梭在各個成語故事之中的穿越者。每打開一扇門，就會走進一個古老的典故世界——有仗劍直言的毛遂、寫詩感恩的孟郊、勸人學習的荀子……'
  },
  '2-1': {
    key: '2-1',
    title: '2-1 成語驗驗看',
    idioms: IDIOMS_2_1,
    introImg: IMG_BASE + '2-1 0.png',
    storyImg: (i) => `${IMG_BASE}2-1 ${i + 1}.png`,
    quizImg:  (i) => `${IMG_BASE}2-1 s${i + 1}.png`,
    introText: '歡迎來到成語驗驗看第二單元！這裡有十個新的成語典故等著你認識——有勸諫君王的忠臣、借刀殺人的權謀、赴湯蹈火的忠義……'
  }
}

const POS_NAME  = ['第一字','第二字','第三字','第四字']
const DISTRACT  = ['風','雨','雲','木','心','手','火','三','百','千','頭','東','西','上','下','大','小','天','日','月']

function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

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

function diagnoseFourRounds(drillAnswers, idiomCount){
  const ROUND_MAX = Object.values(ROUND_WEIGHT).reduce((a,b)=>a+b,0) * idiomCount
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

function getRecommendationText(level){
  const t={
    C:'你需要加強基礎。建議從 C 級開始，每道題都有提示，幫助你更好地學習！',
    B:'你的表現不錯！進入 B 級訓練，針對弱點進行強化，鞏固你的知識。',
    A:'你的成績優秀！挑戰 A 級高難度，沒有故事提示，需要依靠成語意思和圖片推測！'
  }
  return t[level]
}
function levelName(l){return l==='A'?'A 級挑戰':l==='B'?'B 級訓練':'C 級基礎'}
function levelEmoji(l){return l==='A'?'🟢':l==='B'?'🟡':'🔴'}

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

function Scene({q,qIdx,blankCount,quizImgFn}){
  return(
    <div className="scene" style={{background:q.bg}}>
      <span className="twinkle t1">✨</span><span className="twinkle t2">⭐</span><span className="twinkle t3">✨</span>
      <ImgWithFallback src={quizImgFn(qIdx)} fallback={q.emoji} alt={q.idiom} className="scene-img"/>
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
  // screen: intro / hub-learn-select / hub-learn-list / hub-learn-detail /
  //         hub-rank-select / rank-level1-intro / rank-learn / rank-drill / rank-diagnosis
  const[screen,setScreen]=useState('intro')
  const[unit,setUnit]=useState('1-1')
  const[selectedIdiomIdx,setSelectedIdiomIdx]=useState(null) // 學習模式：選中的成語
  const[practiceRound,setPracticeRound]=useState(null)       // 學習模式：選中的練習輪次(1-4)
  const[singleRound,setSingleRound]=useState(null)           // 評級後單輪練習：選定的輪次(1-4)

  const[learnIdx,setLearnIdx]=useState(0)      // 評級系統：學習進度
  const[drillRound,setDrillRound]=useState(1)
  const[drillIdx,setDrillIdx]=useState(0)
  const[drillScore,setDrillScore]=useState(0)
  const[diagnosis,setDiagnosis]=useState({})   // { '1-1': {...}, '2-1': {...} }

  const[placed,setPlaced]=useState({})
  const[tiles,setTiles]=useState([])
  const[result,setResult]=useState(null)
  const[msg,setMsg]=useState('')
  const dragRef=useRef(null)
  const ghostRef=useRef(null)
  const drillAnswersRef=useRef([])

  const U = UNITS[unit]
  const IDIOMS = U.idioms

  const initDrillQ=useCallback((round,idx)=>{
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[idx],round))
  },[IDIOMS])

  useEffect(()=>{
    if(screen==='rank-drill')initDrillQ(drillRound,drillIdx)
  },[drillRound,drillIdx,screen,initDrillQ])



  /* ── 學習與練習模式 ── */
  function openIdiom(idx){ setSelectedIdiomIdx(idx); setPracticeRound(null); setScreen('hub-learn-detail') }
  function startPracticeCycle(){
    setPracticeRound(1)
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
      // 四輪都完成，回到典故頁
      setPracticeRound(null)
    }
  }
  function retryPractice(){
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[selectedIdiomIdx],practiceRound))
  }

  /* ── 評級後：單輪次練習（從診斷報告進入） ── */
  function pickRoundToPractice(round){
    setSingleRound(round)
    setScreen('rank-pick-idiom')
  }
  function pickIdiomForSingleRound(idx){
    setSelectedIdiomIdx(idx)
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[idx],singleRound))
    setScreen('rank-single-practice')
  }
  function checkSingleRound(){
    const q=IDIOMS[selectedIdiomIdx]
    const blanks=drillBlanks(q,singleRound)
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
  function retrySingleRound(){
    setPlaced({});setResult(null);setMsg('')
    setTiles(drillTiles(IDIOMS[selectedIdiomIdx],singleRound))
  }

  /* ── 評級系統 ── */
  function beginRankLearn(){setLearnIdx(0);setScreen('rank-learn')}
  function nextRankLearn(){
    if(learnIdx<IDIOMS.length-1)setLearnIdx(i=>i+1)
    else beginRankDrill()
  }
  function prevRankLearn(){if(learnIdx>0)setLearnIdx(i=>i-1)}
  function beginRankDrill(){setDrillRound(1);setDrillIdx(0);setDrillScore(0);drillAnswersRef.current=[];setScreen('rank-drill')}

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

  function checkRankDrill(){
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
        const res = diagnoseFourRounds(drillAnswersRef.current, IDIOMS.length)
        setDiagnosis(d=>({...d,[unit]:res}))
        setScreen('rank-diagnosis')
      }
    },1400)
  }

  function onTilePointerDown(e,tile){
    if(tile.used||(result!==null&&screen==='rank-drill'))return
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

  const currentDiagnosis = diagnosis[unit]
  const rankQ = IDIOMS[drillIdx]
  const filledRank = Object.keys(placed).length
  const canCheckRank = rankQ && filledRank===drillBlanks(rankQ,drillRound).length && result===null

  const selIdiom = selectedIdiomIdx!==null ? IDIOMS[selectedIdiomIdx] : null
  const filledPractice = Object.keys(placed).length
  const canCheckPractice = practiceRound && selIdiom && filledPractice===drillBlanks(selIdiom,practiceRound).length && result===null

  const PRACTICE_MODES=[
    {round:1,emoji:'1️⃣',label:'挖1字',desc:'輕度干擾'},
    {round:2,emoji:'2️⃣',label:'挖2字',desc:'輕度干擾'},
    {round:3,emoji:'🀄',label:'全字挖空',desc:'無干擾'},
    {round:4,emoji:'🔥',label:'全字挑戰',desc:'相似字干擾'},
  ]

  return(
    <>
      <Head><title>成語驗驗看</title><meta name="viewport" content="width=device-width, initial-scale=1"/></Head>

      <div className="sidebar">
        <div className="sidebar-header">🗺️ 關卡選單</div>
        <button className="sidebar-back" onClick={()=>setScreen('intro')}>🏠 返回首頁</button>

        <div style={{margin:'16px 12px 8px',fontSize:'.85rem',color:'var(--gold-dim)',fontWeight:700,textAlign:'center'}}>模式</div>
        <div className={`sidebar-item${['hub-learn-select','hub-learn-list','hub-learn-detail'].includes(screen)?' active':''}`} onClick={()=>setScreen('hub-learn-select')}>📖 學習與練習</div>
        <div className={`sidebar-item${['hub-rank-select','rank-level1-intro','rank-learn','rank-drill','rank-diagnosis','rank-pick-idiom','rank-single-practice'].includes(screen)?' active':''}`} onClick={()=>setScreen('hub-rank-select')}>📝 評級系統</div>
      </div>

      <div className="cloud c1"/><div className="cloud c2"/><div className="cloud c3"/>

      <div className="wrap">

        {/* ════ 序章 ════ */}
        <section className={`screen intro-screen${screen==='intro'?' show':''}`}>
          <div className="intro">
            <div className="portal"><ImgWithFallback src={UNITS['1-1'].introImg} fallback="🌀" alt="序章" style={{width:280,height:280,objectFit:'contain',borderRadius:24}}/></div>
            <h1>成語驗驗看</h1>
            <div className="scroll-box">
              <p>你現在是一位穿梭在各個成語故事之中的<span className="hl">穿越者</span>。<br/>每打開一扇門，就會走進一個古老的<span className="hl2">典故世界</span>——<br/>請先<span className="hl">讀懂每個典故</span>，再透過反覆練習，證明你真的學會了！</p>
            </div>
            <button className="btn btn-go" onClick={()=>setScreen('hub-learn-select')}>🚪　推開第一扇門</button>
          </div>
        </section>

        {/* ════ 學習與練習：選單元 ════ */}
        <section className={`screen${screen==='hub-learn-select'?' show':''}`}>
          <div className="menu-head"><h2>📖 學習與練習</h2><p>選擇單元，開始認識成語典故</p></div>
          <div className="level-grid">
            <div className="level-card open" onClick={()=>{setUnit('1-1');setScreen('hub-learn-list')}}>
              <span className="lv-emoji">📖</span><div className="lv-no">單元</div><h3>1-1</h3>
              <div className="lv-desc">一言九鼎、寸草春暉、人山人海、水落石出、青出於藍等 10 個成語。多來自歷史故事與詩詞典故，適合初次接觸成語典故的學習。</div><span className="lv-tag ready">▶ 進入</span>
            </div>
            <div className="level-card open" onClick={()=>{setUnit('2-1');setScreen('hub-learn-list')}}>
              <span className="lv-emoji">📖</span><div className="lv-no">單元</div><h3>2-1</h3>
              <div className="lv-desc">千方百計、始作俑者、白頭偕老、借刀殺人、賞心悅目等 10 個成語。多來自聖賢語錄與歷史事件，難度稍進階，適合鞏固後挑戰。</div><span className="lv-tag ready">▶ 進入</span>
            </div>
          </div>
        </section>

        {/* ════ 學習與練習：成語清單 ════ */}
        <section className={`screen${screen==='hub-learn-list'?' show':''}`}>
          <div className="menu-head"><h2>📖 {unit} 成語清單</h2><p>點選一個成語，開始學習典故</p></div>
          <div className="free-idiom-grid">
            {IDIOMS.map((it,i)=>(
              <div key={i} className="free-idiom-card" onClick={()=>openIdiom(i)}>
                <span className="free-idiom-emoji">{it.emoji}</span>
                <div className="free-idiom-name">{it.idiom}</div>
                <div className="free-idiom-tag">{it.tag}</div>
              </div>
            ))}
          </div>
          <div className="actions"><button className="btn btn-ghost" onClick={()=>setScreen('hub-learn-select')}>← 返回選單元</button></div>
        </section>

        {/* ════ 學習與練習：典故+練習入口（同一頁） ════ */}
        <section className={`screen${screen==='hub-learn-detail'?' show':''}`}>
          {selIdiom&&(
          <div className="topbar">
            <button className="back-btn" onClick={()=>setScreen('hub-learn-list')}>← 成語清單</button>
          </div>
          )}
          {selIdiom&&practiceRound===null&&(
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
                <button className="btn btn-go" onClick={startPracticeCycle}>✏️ 開始練習這個成語 →</button>
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
              <div className="level-banner">✏️ {selIdiom.idiom}・{PRACTICE_MODES[practiceRound-1].label}（{practiceRound}/4）</div>
              <Scene q={selIdiom} qIdx={selectedIdiomIdx} blankCount={drillBlanks(selIdiom,practiceRound).length} quizImgFn={U.quizImg}/>
              <p className="story">「{selIdiom.kidStory}」</p>
              <p className="meaning">💡 意思：{selIdiom.meaning}</p>
              <IdiomRow q={selIdiom} placed={placed} onClickSlot={handleClickSlot} blanksOverride={drillBlanks(selIdiom,practiceRound)}/>
              <div className="bank-label">✦　把下面的字拖到上面的空格　✦</div>
              <div className="bank">{tiles.map(tile=>(<div key={tile.tid} className={`tile${tile.used?' used':''}`} onPointerDown={e=>onTilePointerDown(e,tile)}>{tile.ch}</div>))}</div>
              <div className="actions">
                {result!=='ok'&&<button className="btn btn-ghost" onClick={retryPractice}>🔄 重來</button>}
                {result==='ok'
                  ?<button className="btn btn-grass" onClick={nextPracticeStep}>{practiceRound<4?`下一輪：${PRACTICE_MODES[practiceRound].label} →`:'四輪完成！回到典故 🎉'}</button>
                  :<button className="btn btn-sun" disabled={!canCheckPractice} onClick={checkPractice}>✅ 拼好了</button>}
              </div>
              <div className={`result${result==='ok'?' result-success':result==='err'?' result-error':''}`}>{msg}</div>
              <div className="actions" style={{marginTop:8}}>
                <button className="btn btn-ghost" onClick={()=>setPracticeRound(null)}>📜 回看典故</button>
                <button className="btn btn-ghost" onClick={()=>setScreen('hub-learn-list')}>🔀 換其他成語</button>
              </div>
            </div>
          )}
        </section>

        {/* ════ 評級系統：選單元 ════ */}
        <section className={`screen${screen==='hub-rank-select'?' show':''}`}>
          <div className="menu-head"><h2>📝 評級系統</h2><p>選擇單元，測試你對成語的理解程度</p></div>
          <div className="level-grid">
            <div className="level-card open" onClick={()=>{setUnit('1-1');setScreen('rank-level1-intro')}}>
              <span className="lv-emoji">📝</span><div className="lv-no">單元</div><h3>1-1</h3>
              <div className="lv-desc">先學典故，再進行四輪評級測驗。</div><span className="lv-tag ready">▶ 開始</span>
            </div>
            <div className="level-card open" onClick={()=>{setUnit('2-1');setScreen('rank-level1-intro')}}>
              <span className="lv-emoji">📝</span><div className="lv-no">單元</div><h3>2-1</h3>
              <div className="lv-desc">先學典故，再進行四輪評級測驗。</div><span className="lv-tag ready">▶ 開始</span>
            </div>
          </div>
        </section>

        {/* ════ 評級系統：簡短說明 ════ */}
        <section className={`screen${screen==='rank-level1-intro'?' show':''}`}>
          <div className="diagnosis-screen">
            <h2>📖 {unit} 評級怎麼玩？</h2>
            <div className="diagnosis-details">
              <div className="detail-row"><span>第一步：</span><span className="good">📖 學習 {IDIOMS.length} 個成語典故（漫畫＋原文）</span></div>
              <div className="detail-row"><span>第二步：</span><span className="good">🔁 四輪評級測驗（共 {IDIOMS.length*4} 題）</span></div>
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
              <p>建議先到「📖 學習與練習」熟悉這些成語，再來挑戰評級測驗，成績會更準確喔！</p>
            </div>
            <div className="actions">
              <button className="btn btn-ghost" onClick={()=>setScreen('hub-rank-select')}>← 返回選單元</button>
              <button className="btn btn-go" onClick={beginRankLearn}>開始學習典故 →</button>
            </div>
          </div>
        </section>

        {/* ════ 評級系統：學習階段 ════ */}
        <section className={`screen${screen==='rank-learn'?' show':''}`}>
          <div className="topbar">
            <button className="back-btn" onClick={()=>setScreen('rank-level1-intro')}>← 說明</button>
            <ProgressBar idx={learnIdx} total={IDIOMS.length}/>
            <div className="score-pill">📖 {learnIdx+1}/{IDIOMS.length}</div>
          </div>
          <div className="card">
            <div className="level-banner">📖 典故學習（{learnIdx+1}/{IDIOMS.length}）：{IDIOMS[learnIdx].idiom}</div>
            <div className="learn-img-box">
              <ImgWithFallback src={U.storyImg(learnIdx)} fallback={<div className="learn-placeholder"><span style={{fontSize:'4rem'}}>{IDIOMS[learnIdx].emoji}</span><p>（典故漫畫圖片未上傳）</p></div>} alt={IDIOMS[learnIdx].idiom+' 典故漫畫'} className="learn-img"/>
            </div>
            <div className="learn-story">
              <h3>{IDIOMS[learnIdx].emoji} {IDIOMS[learnIdx].idiom}</h3>
              <p className="learn-kid">{IDIOMS[learnIdx].kidStory}</p>
              <p className="meaning">💡 意思：{IDIOMS[learnIdx].meaning}</p>
              <p className="learn-full-label">📜 完整典故原文</p>
              <p className="learn-full">{IDIOMS[learnIdx].fullStory}</p>
            </div>
            <div className="actions">
              {learnIdx>0&&<button className="btn btn-ghost" onClick={prevRankLearn}>← 上一個</button>}
              <button className="btn btn-grass" onClick={nextRankLearn}>{learnIdx<IDIOMS.length-1?'下一個典故 →':'學完了，開始測驗 🔁'}</button>
            </div>
          </div>
        </section>

        {/* ════ 評級系統：四輪盲測 ════ */}
        <section className={`screen${screen==='rank-drill'?' show':''}`}>
          <div className="topbar">
            <div className="score-pill">📝 評級測驗</div>
            <ProgressBar idx={drillIdx} total={IDIOMS.length}/>
            <div className="score-pill">✅ {drillScore}</div>
          </div>
          {rankQ&&(
          <div className="card">
            <div className="drill-round-bar">
              {DRILL_ROUNDS.map(r=>(
                <div key={r.id} className={`drill-round-tag${r.id===drillRound?' active':''}${r.id<drillRound?' done':''}`}>{r.id<drillRound?'✓ ':''}{r.label}</div>
              ))}
            </div>
            <div className="level-banner">🔁 {DRILL_ROUNDS[drillRound-1].label}（{drillIdx+1}/{IDIOMS.length}）- 每題只有一次機會！</div>
            <p className="drill-desc">{DRILL_ROUNDS[drillRound-1].desc}</p>
            <Scene q={rankQ} qIdx={drillIdx} blankCount={drillBlanks(rankQ,drillRound).length} quizImgFn={U.quizImg}/>
            <p className="meaning">💡 意思：{rankQ.meaning}</p>
            <IdiomRow q={rankQ} placed={placed} onClickSlot={handleClickSlot} blanksOverride={drillBlanks(rankQ,drillRound)}/>
            <div className="bank-label">✦　把下面的字拖到上面的空格　✦</div>
            <div className="bank">{tiles.map(tile=>(<div key={tile.tid} className={`tile${tile.used?' used':''}`} onPointerDown={e=>onTilePointerDown(e,tile)}>{tile.ch}</div>))}</div>
            <div className="actions">
              <button className="btn btn-sun" disabled={!canCheckRank} onClick={checkRankDrill}>✅ 提交答案</button>
            </div>
            <div className={`result${result==='ok'?' result-success':result==='err'?' result-error':''}`}>{msg}</div>
          </div>
          )}
        </section>

        {/* ════ 評級系統：診斷報告 ════ */}
        <section className={`screen${screen==='rank-diagnosis'?' show':''}`}>
          {currentDiagnosis&&(
            <div className="diagnosis-screen">
              <h2>📊 {unit}・成績分析</h2>
              <div className="score-display"><span className="score-number">{currentDiagnosis.totalScore}</span><span className="score-outof">/ 100 分（共 {IDIOMS.length*4} 題，答對 {currentDiagnosis.totalCorrect} 題）</span></div>
              <div className="diagnosis-details">
                {DRILL_ROUNDS.map(r=>{
                  const st=currentDiagnosis.roundStats[r.id]
                  const rate=st.total?Math.round((st.correct/st.total)*100):0
                  return <div className="detail-row" key={r.id}><span>{r.label}：</span><span className={rate>=80?'good':'warning'}>{st.correct}/{st.total}（{rate}%）</span></div>
                })}
              </div>
              <div className="analysis-box">
                {currentDiagnosis.strengths.length>0&&<div className="strengths"><h4>✅ 表現優秀的部分</h4><ul>{currentDiagnosis.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul></div>}
                {currentDiagnosis.weaknesses.length>0&&<div className="weaknesses"><h4>⚠️ 需要加強的部分</h4><ul>{currentDiagnosis.weaknesses.map((w,i)=><li key={i}>{w}</li>)}</ul></div>}
                {currentDiagnosis.topWrong.length>0&&<div className="weaknesses"><h4>📌 較常答錯的成語</h4><ul>{currentDiagnosis.topWrong.map((name,i)=><li key={i}>「{name}」建議多複習</li>)}</ul></div>}
              </div>
              <div className="recommendation-box"><h4>📈 建議等級：{levelName(currentDiagnosis.recommendedLevel)}</h4><p>{getRecommendationText(currentDiagnosis.recommendedLevel)}</p></div>

              <p className="section-title">⭐ 根據你的表現，建議優先加強</p>
              <div className="level-card recommended" onClick={()=>pickRoundToPractice(currentDiagnosis.weakestRound)}>
                <div className="level-badge">推薦</div>
                <span className="lv-emoji">🔁</span>
                <h3>{DRILL_ROUNDS[currentDiagnosis.weakestRound-1].label}</h3>
                <div className="lv-desc">這是你四輪中表現較弱的部分：{DRILL_ROUNDS[currentDiagnosis.weakestRound-1].desc}</div>
                <span className="lv-tag ready">▶ 練習這一輪</span>
              </div>

              <p className="section-title">或自己選擇想加強的輪次</p>
              <div className="level-cards-grid">
                {PRACTICE_MODES.map(m=>(
                  <div key={m.round} className="level-card open" onClick={()=>pickRoundToPractice(m.round)}>
                    <span className="lv-emoji">{m.emoji}</span><h3>{m.label}</h3><div className="lv-desc">{m.desc}</div>
                  </div>
                ))}
              </div>

              <div className="actions" style={{marginTop:24}}>
                <button className="btn btn-ghost" onClick={()=>setScreen('hub-learn-select')}>📖 回去加強練習</button>
                <button className="btn btn-go" onClick={()=>setScreen('hub-rank-select')}>🔀 挑戰其他單元</button>
              </div>
            </div>
          )}
        </section>

        {/* ════ 評級後：選成語來練這一輪 ════ */}
        <section className={`screen${screen==='rank-pick-idiom'?' show':''}`}>
          <div className="menu-head"><h2>{PRACTICE_MODES[(singleRound||1)-1].emoji} {PRACTICE_MODES[(singleRound||1)-1].label}</h2><p>選一個成語來練習這一輪</p></div>
          <div className="free-idiom-grid">
            {IDIOMS.map((it,i)=>(
              <div key={i} className="free-idiom-card" onClick={()=>pickIdiomForSingleRound(i)}>
                <span className="free-idiom-emoji">{it.emoji}</span>
                <div className="free-idiom-name">{it.idiom}</div>
                <div className="free-idiom-tag">{it.tag}</div>
              </div>
            ))}
          </div>
          <div className="actions"><button className="btn btn-ghost" onClick={()=>setScreen('rank-diagnosis')}>← 返回評級報告</button></div>
        </section>

        {/* ════ 評級後：單輪次練習 ════ */}
        <section className={`screen${screen==='rank-single-practice'?' show':''}`}>
          {selectedIdiomIdx!==null&&singleRound&&(
            <div className="card">
              <div className="level-banner">✏️ {IDIOMS[selectedIdiomIdx].idiom}・{PRACTICE_MODES[singleRound-1].label}</div>
              <Scene q={IDIOMS[selectedIdiomIdx]} qIdx={selectedIdiomIdx} blankCount={drillBlanks(IDIOMS[selectedIdiomIdx],singleRound).length} quizImgFn={U.quizImg}/>
              <p className="story">「{IDIOMS[selectedIdiomIdx].kidStory}」</p>
              <p className="meaning">💡 意思：{IDIOMS[selectedIdiomIdx].meaning}</p>
              <IdiomRow q={IDIOMS[selectedIdiomIdx]} placed={placed} onClickSlot={handleClickSlot} blanksOverride={drillBlanks(IDIOMS[selectedIdiomIdx],singleRound)}/>
              <div className="bank-label">✦　把下面的字拖到上面的空格　✦</div>
              <div className="bank">{tiles.map(tile=>(<div key={tile.tid} className={`tile${tile.used?' used':''}`} onPointerDown={e=>onTilePointerDown(e,tile)}>{tile.ch}</div>))}</div>
              <div className="actions">
                <button className="btn btn-ghost" onClick={retrySingleRound}>🔄 重來</button>
                {result==='ok'
                  ?<button className="btn btn-grass" onClick={retrySingleRound}>🔁 再練一次</button>
                  :<button className="btn btn-sun" disabled={Object.keys(placed).length!==drillBlanks(IDIOMS[selectedIdiomIdx],singleRound).length||result!==null} onClick={checkSingleRound}>✅ 拼好了</button>}
              </div>
              <div className={`result${result==='ok'?' result-success':result==='err'?' result-error':''}`}>{msg}</div>
              <div className="actions" style={{marginTop:8}}>
                <button className="btn btn-ghost" onClick={()=>setScreen('rank-pick-idiom')}>🔀 換其他成語</button>
                <button className="btn btn-ghost" onClick={()=>setScreen('rank-diagnosis')}>📊 返回評級報告</button>
              </div>
            </div>
          )}
        </section>

      </div>
    </>
  )
}
