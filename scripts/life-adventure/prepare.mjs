// 用法: node scripts/life-adventure/prepare.mjs <來源資料夾>
// 把 ChatGPT 畫的生活小教室插畫整理成遊戲用圖，輸出到 public/images/life-adventure/。
//   背景、地圖：縮到 1600 闊的 webp。
//   角色四格表：切成 4 格、去掉跟格邊相連的白底、裁到角色外框，輸出 512 高的 webp。
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

const require = createRequire(path.resolve('package.json'))
const sharp = require('sharp')
const SRC = process.argv[2]
const OUT = path.resolve('public/images/life-adventure')
fs.mkdirSync(OUT, { recursive: true })

// 每張四格表的格子名（左上、右上、左下、右下）
const SHEETS = {
  'xiaoyue-sheet': ['xiaoyue-wave', 'xiaoyue-surprised', 'xiaoyue-think', 'xiaoyue-cheer'],
  'xiaoyue-sheet-2': ['xiaoyue-puzzled', 'xiaoyue-wonder', 'xiaoyue-oops', 'xiaoyue-determined'],
  'moying-sheet': ['moying-giggle', 'moying-suck', 'moying-sad', 'moying-happy'],
  'dingding-sheet': ['dingding-wave', 'dingding-talk', 'dingding-think', 'dingding-cheer'],
  'brother-sheet': ['brother', 'brother-talk', 'brother-think', 'brother-thumb'],
  'jianjian-sheet': ['jianjian-smile', 'jianjian-talk', 'jianjian-think', 'jianjian-surprised'],
  'couple-sheet': ['gongong', 'gongong-talk', 'popo', 'popo-talk'],
  'shooter-sheet': ['shooter-aim', 'shooter-fire', 'shooter-recoil', 'shooter-cheer'],
  // 四個射擊角度：左上、右上、左、右（瞄準／開槍）
  'shoot-diag-sheet': ['shoot-ul-aim', 'shoot-ul-fire', 'shoot-ur-aim', 'shoot-ur-fire'],
  'shoot-side-sheet': ['shoot-l-aim', 'shoot-l-fire', 'shoot-r-aim', 'shoot-r-fire'],
  'family-1': ['brother-old', 'little-brother', 'mother', 'father'],
  'family-2': ['grandpa', 'great-grandma', 'teacher', 'cousin'],
  'friends': ['xiaoming', 'xiaomei', 'ahhei', 'firefighter'],
  'ancient-01': ['maosui', 'mengjiao', 'meng-mother', 'ouyang-xiu'],
  'ancient-02': ['xunzi', 'magu', 'yuan-zhi', 'li-biao'],
  'ancient-03': ['confucius', 'lu-meng', 'lu-su', 'pingyuan'],
}

// 動畫用的四格（開槍動作）：四格用同一個取景框，切換動作時角色才不會跳
const SAME_FRAME = new Set(['shooter-sheet', 'shoot-diag-sheet', 'shoot-side-sheet'])

const isWhite = (d, i, t) => d[i] > t && d[i + 1] > t && d[i + 2] > t

// 找格與格之間最白的那條直線/橫線
function findGap(d, w, h, vertical) {
  const len = vertical ? w : h, other = vertical ? h : w
  let best = -1, bestScore = -1
  for (let a = Math.floor(len * 0.4); a < Math.floor(len * 0.6); a++) {
    let s = 0
    for (let b = 0; b < other; b += 2) {
      const x = vertical ? a : b, y = vertical ? b : a
      if (isWhite(d, (y * w + x) * 4, 240)) s++
    }
    if (s > bestScore) { bestScore = s; best = a }
  }
  return best
}

// 由格邊開始把相連的白色變透明，邊緣按亮度柔化
function cutout(rgba, w, h) {
  const bg = new Uint8Array(w * h), stack = []
  const push = (x, y) => { if (x >= 0 && y >= 0 && x < w && y < h) { const p = y * w + x; if (!bg[p] && isWhite(rgba, p * 4, 232)) { bg[p] = 1; stack.push(p) } } }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  while (stack.length) { const p = stack.pop(), x = p % w, y = (p / w) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1) }
  for (let p = 0; p < w * h; p++) {
    if (bg[p]) { rgba[p * 4 + 3] = 0; continue }
    const x = p % w, y = (p / w) | 0
    const edge = (x > 0 && bg[p - 1]) || (x < w - 1 && bg[p + 1]) || (y > 0 && bg[p - w]) || (y < h - 1 && bg[p + w])
    if (edge) {
      const lum = (rgba[p * 4] + rgba[p * 4 + 1] + rgba[p * 4 + 2]) / 3
      if (lum > 190) rgba[p * 4 + 3] = Math.round(255 * (255 - lum) / 65)
    }
  }
  return rgba
}

function bbox(rgba, w, h) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rgba[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  return { x0, y0, x1, y1 }
}

for (const file of fs.readdirSync(SRC).filter(f => f.endsWith('.png'))) {
  const name = file.replace(/\.png$/, '')
  const src = path.join(SRC, file)
  if (!SHEETS[name]) {
    await sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, name + '.webp'))
    console.log('scene', name)
    continue
  }
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const gx = findGap(data, w, h, true), gy = findGap(data, w, h, false)
  const rects = [[0, 0, gx, gy], [gx, 0, w - gx, gy], [0, gy, gx, h - gy], [gx, gy, w - gx, h - gy]]
  const cw0 = Math.min(gx, w - gx), ch0 = Math.min(gy, h - gy)
  for (const [n, [x, y, cw1, ch1]] of rects.entries()) {
    const same = SAME_FRAME.has(name), cw = same ? cw0 : cw1, ch = same ? ch0 : ch1
    const buf = await sharp(data, { raw: info }).extract({ left: x, top: y, width: cw, height: ch }).raw().toBuffer()
    const rgba = cutout(buf, cw, ch), b = same ? { x0: 0, y0: 0, x1: cw - 1, y1: ch - 1 } : bbox(rgba, cw, ch)
    await sharp(rgba, { raw: { width: cw, height: ch, channels: 4 } })
      .extract({ left: b.x0, top: b.y0, width: b.x1 - b.x0 + 1, height: b.y1 - b.y0 + 1 })
      .resize({ height: 512, withoutEnlargement: true })
      .webp({ quality: 85, alphaQuality: 90 }).toFile(path.join(OUT, SHEETS[name][n] + '.webp'))
  }
  console.log('sheet', name)
}
