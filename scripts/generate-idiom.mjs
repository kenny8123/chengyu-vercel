#!/usr/bin/env node
/*
 * 離線內容產生工具 —— 不會被打包進網站，也不會修改 pages/index.js。
 * 用 Claude API 依照現有成語資料的格式與語氣，草擬新成語的教材內容，
 * 輸出成一個檔案讓你複製、人工核對史實與用字後，再自己貼進
 * pages/index.js 對應的 IDIOMS_x_x 陣列。
 *
 * 用法：
 *   node scripts/generate-idiom.mjs 入木三分 破釜沉舟
 *
 * 需要 ANTHROPIC_API_KEY：複製 .env.local.example 為 .env.local 並填入金鑰，
 * 或執行前自行在終端機設定環境變數。
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function loadEnvLocal(){
  const envPath = path.join(ROOT, '.env.local')
  if(!existsSync(envPath)) return
  for(const line of readFileSync(envPath, 'utf8').split('\n')){
    const trimmed = line.trim()
    if(!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if(eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))){
      value = value.slice(1, -1)
    }
    if(!(key in process.env)) process.env[key] = value
  }
}
loadEnvLocal()

const API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'
const idioms = process.argv.slice(2).filter(Boolean)

if(!idioms.length){
  console.log(`
用法： node scripts/generate-idiom.mjs 成語一 成語二 成語三 ...
範例： node scripts/generate-idiom.mjs 入木三分 破釜沉舟

會呼叫 Claude API，依照 pages/index.js 現有的成語資料格式，
產生可貼入 IDIOMS_x_x 陣列的物件內容，存到
scripts/output/generated-idioms.js 供你複製、校對後手動貼入。

這個工具不會自動修改 pages/index.js —— 內容請務必人工核對史實
與用字後再貼入，尤其是 fullStory 的歷史細節。

需要先設定 ANTHROPIC_API_KEY：
  1) 複製 .env.local.example 為 .env.local，填入你的金鑰，或
  2) 執行前手動設定：$env:ANTHROPIC_API_KEY = "sk-ant-..."
`)
  process.exit(0)
}

if(!API_KEY){
  console.error('缺少 ANTHROPIC_API_KEY。請參考 .env.local.example 設定後再執行。')
  process.exit(1)
}

// 沿用頁面現有的柔和漸層色票，輪流套用在新產生的成語卡上（不新增配色）
const BG_PALETTE = [
  'linear-gradient(160deg,#ffe3c4,#ffc98f)',
  'linear-gradient(160deg,#c8f0d0,#9be0ad)',
  'linear-gradient(160deg,#ffe0ec,#ffc0d6)',
  'linear-gradient(160deg,#c4ecff,#8fd4f0)',
  'linear-gradient(160deg,#d4e0ff,#aec4f0)',
  'linear-gradient(160deg,#d4f0c4,#a8e08f)',
  'linear-gradient(160deg,#e6d4ff,#c9aef0)',
  'linear-gradient(160deg,#c8f0e0,#9be0c9)',
  'linear-gradient(160deg,#fff4c4,#ffe08f)',
  'linear-gradient(160deg,#ffd4c4,#ff9e8f)',
  'linear-gradient(160deg,#e0f0ff,#a8d4f0)',
  'linear-gradient(160deg,#f0e0c4,#d4b88f)',
]

const EXAMPLE_1 = {
  idiom: '一言九鼎', blanks: [3],
  meaning: '形容說話很有分量，或說話很有信用。',
  kidStory: '戰國時，趙國被秦國圍攻，平原君帶毛遂去楚國求救。毛遂勇敢地向楚王分析情勢，說服楚王結盟。平原君稱讚他：「毛先生一句話，比九鼎還有份量！」',
  fullStory: '戰國時，秦國攻打趙國，首都邯鄲被圍，情況相當危急。趙王派平原君到楚國求援，想聯合楚國來抵抗秦國。平原君要從門下食客選二十個人一起去楚國，但挑來挑去只挑到十九人，有個叫毛遂的人便自我推薦，平原君就接納他。到了楚國，平原君一直不能說服楚王援助趙國。毛遂仗劍向前，向楚王分析情勢，義正詞嚴，氣勢凌人，楚王便答應與趙國訂立盟約。平原君完成任務回到趙國後，讚賞毛遂說：「毛先生一到楚國，就使我們趙國的地位大大提升，比九鼎大呂還要有份量。毛先生的口才，真是比百萬軍力還要強大。」自此便一直將毛遂奉為上賓。後來「一言九鼎」這句成語就從這裡演變而出，用來形容說話很有分量，後亦用於形容說話很有信用。',
  emoji: '🏺', tag: '歷史故事', mildDistract: ['鐘', '劍', '印', '袋'], hardDistract: ['鍋', '爐', '缸', '缽']
}
const EXAMPLE_2 = {
  idiom: '千方百計', blanks: [0, 2],
  meaning: '形容費盡心機，想盡一切辦法、計謀。',
  kidStory: '宋代彭龜年勸皇帝，朝中有些壞人會「千方百計」蒙蔽皇上，想盡各種辦法、計謀達到目的，提醒皇帝不要輕易聽信讒言。',
  fullStory: '「千方百計」的「方」和「計」，指的是方法和計謀，「千」和「百」，則都是用來表很多，所以「千方百計」就是用了很多的方法和計謀。此一成語可見於宋代彭龜年的〈論小人疑間兩宮乞車駕過宮面質疏〉。彭龜年，字子壽，清江人。南宋乾道進士，歷任煥章閣待制、知江陵府，遷湖北安撫使。諡忠肅。在朝言事，善惡是非，辨析甚嚴。他的〈論小人疑間兩宮乞車駕過宮面質疏〉，即是勸諫君王應以古代聖君為榜樣，當朝中小人費盡心機，想盡一切辦法、計謀，想要蒙蔽聖上的時候，不要輕易聽信讒言。他批評朝中奸佞小人「千方百計誤陛下之聽」，使皇上無法省察群臣的諫言。「千方百計」這句成語可能出於此，就用來形容費盡心機，想盡一切辦法、計謀。',
  emoji: '🧠', tag: '歷史故事', mildDistract: ['萬', '種', '法', '門'], hardDistract: ['干', '計', '汁', '十']
}

const SYSTEM_PROMPT = `你是「成語穿越者」這款兒童成語學習遊戲的內容編輯。
請依照範例的語氣、長度與格式，為使用者指定的成語產生教材內容。
只能回傳一個 JSON 物件，不要有任何其他文字、不要用 markdown code fence 包起來。

JSON 欄位規格：
- idiom: 成語本身（string，通常 4 個字）
- blanks: 挖空練習要考的字元「索引」陣列（從 0 開始），1~2 個索引，
  挑選最能代表這句成語核心意涵、最容易寫錯或最值得記憶的字
- meaning: 一句話白話解釋（string，20~35字）
- kidStory: 給國小中年級孩子看的簡化故事，2~4句話，生動但精簡，
  最後要能自然帶出成語本身
- fullStory: 完整的典故原文說明，仿古典成語辭典的敘述風格，
  200~400字，需包含朝代/人物/出處，最後帶出成語演變與現代用法
- emoji: 一個最能代表這句成語意象的表情符號
- tag: 分類標籤，從「歷史故事、詩詞典故、生活景象、自然景象、勵志學習、
  神話傳說、生活智慧、聖賢故事、三國故事、經典語錄、生活用語、生活趣談、
  寓言故事、兵法典故」中選一個最貼切的，找不到貼切的才自訂新標籤
- mildDistract: 4 個「簡單」干擾字（string 陣列），字形或意思與正確答案
  略有關聯但一望即知是錯的，不可與成語本身的字重複
- hardDistract: 4 個「困難」干擾字（string 陣列），字形或部首與正確答案
  相近、容易寫錯認錯的形近字，不可與成語本身的字重複

範例1（單一挖空）：
${JSON.stringify(EXAMPLE_1, null, 2)}

範例2（雙挖空、四組干擾字）：
${JSON.stringify(EXAMPLE_2, null, 2)}

請維持相同的口吻與豐富度（fullStory 要比 kidStory 詳細很多），
不要輸出範例以外的任何文字。`

async function generateOne(idiom){
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `請產生「${idiom}」這句成語的教材內容 JSON。` }],
    }),
  })
  if(!res.ok){
    const text = await res.text()
    throw new Error(`API 錯誤 (${res.status}): ${text.slice(0, 300)}`)
  }
  const data = await res.json()
  const raw = (data.content?.[0]?.text ?? '').trim()
  const cleaned = raw.replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  try{
    return JSON.parse(cleaned)
  }catch(e){
    throw new Error(`無法解析回傳的 JSON：\n${raw}`)
  }
}

function toObjectLiteral(entry, bg){
  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const arr = a => `[${(a || []).map(x => `'${esc(x)}'`).join(', ')}]`
  return `  {
    idiom: '${esc(entry.idiom)}',
    blanks: [${(entry.blanks || []).join(', ')}],
    meaning: '${esc(entry.meaning)}',
    kidStory: '${esc(entry.kidStory)}',
    fullStory: '${esc(entry.fullStory)}',
    emoji: '${esc(entry.emoji)}', bg: '${bg}', tag: '${esc(entry.tag)}',
    mildDistract: ${arr(entry.mildDistract)}, hardDistract: ${arr(entry.hardDistract)}
  }`
}

const results = []
let bgIndex = Math.floor(Math.random() * BG_PALETTE.length)

for(const idiom of idioms){
  process.stdout.write(`產生中：${idiom} ... `)
  try{
    const entry = await generateOne(idiom)
    const bg = BG_PALETTE[bgIndex % BG_PALETTE.length]
    bgIndex++
    results.push(toObjectLiteral(entry, bg))
    console.log('完成')
  }catch(e){
    console.log('失敗')
    console.error(`  ${idiom}：${e.message}`)
  }
}

if(results.length){
  const outDir = path.join(ROOT, 'scripts', 'output')
  mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'generated-idioms.js')
  const header = '/* 由 scripts/generate-idiom.mjs 產生，尚未人工校對。\n' +
    '   請逐筆檢查史實、用字、干擾字是否恰當，確認無誤後\n' +
    '   再手動貼入 pages/index.js 對應的 IDIOMS_x_x 陣列中。 */\n\n'
  writeFileSync(outPath, header + '[\n' + results.join(',\n') + '\n]\n', 'utf8')
  console.log(`\n已寫入 ${path.relative(ROOT, outPath)}，共 ${results.length} 筆，請人工核對後再貼入 pages/index.js。`)
}
