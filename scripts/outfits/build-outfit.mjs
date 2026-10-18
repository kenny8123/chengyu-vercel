// 用法: node build-outfit.mjs <來源資料夾> <repo> <造型編號> [--holes 面積]
// 把 ChatGPT 的 2x2 四格表切開、去背、統一位置，輸出大(512)細(64) GIF 和靜態 PNG。
// 背景色自動偵測：
//   洋紅色底（建議）：全圖接近洋紅的像素都去掉，連被圍住的空隙也乾淨。
//   白色底（舊圖）：只去掉跟格邊相連的白色，避免挖穿頭盔、眼白。
//   --holes N：白色底時，再去掉面積大於 N 的被圍住純白空隙（例如第 17 套釣魚綫後面）。
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const [src, repo, idArg] = args
const holesAt = args.indexOf('--holes'), HOLES = holesAt > 0 ? +args[holesAt + 1] : 0
const require = createRequire(path.resolve(repo, 'package.json'))
const sharp = require('sharp')
const id = String(idArg).padStart(2, '0')
const STATES = ['idle', 'thinking', 'happy', 'sad', 'celebrate', 'eat', 'shy', 'sleep']
const OUT = 512, MARGIN = 14, DELAY = 220

let BG = [255, 255, 255], KEYED = false
const dist = (d, i) => Math.hypot(d[i] - BG[0], d[i + 1] - BG[1], d[i + 2] - BG[2])
const isWhite = (d, i, t) => d[i] > t && d[i + 1] > t && d[i + 2] > t

// 四個角的平均色 = 背景色；夠鮮豔就當作洋紅色鍵控底
function detectBg(d, w, h) {
  const acc = [0, 0, 0]; let n = 0
  for (const [cx, cy] of [[0, 0], [w - 6, 0], [0, h - 6], [w - 6, h - 6]])
    for (let y = cy; y < cy + 6; y++) for (let x = cx; x < cx + 6; x++) { const i = (y * w + x) * 4; acc[0] += d[i]; acc[1] += d[i + 1]; acc[2] += d[i + 2]; n++ }
  BG = acc.map(v => v / n)
  KEYED = Math.max(...BG) - Math.min(...BG) > 80
}

// 找格與格之間最像背景的那條直線/橫線
function findGap(d, w, h, vertical) {
  const len = vertical ? w : h, other = vertical ? h : w
  let best = -1, bestScore = -1
  for (let a = Math.floor(len * 0.4); a < Math.floor(len * 0.6); a++) {
    let s = 0
    for (let b = 0; b < other; b += 2) {
      const x = vertical ? a : b, y = vertical ? b : a
      if (dist(d, (y * w + x) * 4) < 26) s++
    }
    if (s > bestScore) { bestScore = s; best = a }
  }
  return best
}

// 洋紅色底：按顏色距離去背，半透明邊緣把洋紅色「減走」避免紫邊
function cutoutKeyed(rgba, w, h) {
  for (let p = 0; p < w * h; p++) {
    const i = p * 4, dd = dist(rgba, i)
    if (dd < 70) { rgba[i + 3] = 0; continue }
    if (dd < 140) {
      const a = (dd - 70) / 70
      for (let c = 0; c < 3; c++) rgba[i + c] = Math.max(0, Math.min(255, Math.round((rgba[i + c] - (1 - a) * BG[c]) / a)))
      rgba[i + 3] = Math.round(255 * a)
    }
  }
  return rgba
}

// 白色底：由格邊開始把相連的白色變透明，再柔化邊緣
function cutout(rgba, w, h) {
  if (KEYED) return cutoutKeyed(rgba, w, h)
  const bg = new Uint8Array(w * h), stack = []
  const push = (x, y) => { if (x >= 0 && y >= 0 && x < w && y < h) { const p = y * w + x; if (!bg[p] && isWhite(rgba, p * 4, 232)) { bg[p] = 1; stack.push(p) } } }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  while (stack.length) { const p = stack.pop(), x = p % w, y = (p / w) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1) }
  if (HOLES) {
    const seen = new Uint8Array(w * h)
    for (let s = 0; s < w * h; s++) {
      if (bg[s] || seen[s] || !isWhite(rgba, s * 4, 246)) continue
      const region = [s], q = [s]; seen[s] = 1
      while (q.length) {
        const p = q.pop(), x = p % w, y = (p / w) | 0
        for (const n of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
          if (n >= 0 && !bg[n] && !seen[n] && isWhite(rgba, n * 4, 246)) { seen[n] = 1; q.push(n); region.push(n) }
        }
      }
      if (region.length > HOLES) for (const p of region) bg[p] = 1
    }
  }
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
const union = bs => bs.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }))

// 1. 讀入並切成 4 格
const cells = {}
for (const st of STATES) {
  const { data, info } = await sharp(path.join(src, st + '.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  detectBg(data, w, h)
  const gx = findGap(data, w, h, true), gy = findGap(data, w, h, false)
  const rects = [[0, 0, gx, gy], [gx, 0, w - gx, gy], [0, gy, gx, h - gy], [gx, gy, w - gx, h - gy]]
  cells[st] = []
  for (const [x, y, cw, ch] of rects) {
    const buf = await sharp(data, { raw: info }).extract({ left: x, top: y, width: cw, height: ch }).raw().toBuffer()
    const rgba = cutout(buf, cw, ch)
    cells[st].push({ rgba, w: cw, h: ch, box: bbox(rgba, cw, ch) })
  }
}

// 1b. 逐格對齊：ChatGPT 每格角色位置會差幾十 px，用下半身（腳、地面）比對，
//     求出每格相對參考格的位移 (ox, oy)，GIF 才不會跳。shy 對齊自己第一格。
function register(ref, cell) {
  const lo = Math.round(ref.box.y0 + (ref.box.y1 - ref.box.y0) * 0.55), hi = ref.box.y1
  const on = (c, x, y) => x >= 0 && y >= 0 && x < c.w && y < c.h && c.rgba[(y * c.w + x) * 4 + 3] > 128
  const iou = (ox, oy, step) => {
    let i = 0, u = 0
    for (let y = lo; y <= hi; y += step) for (let x = ref.box.x0; x <= ref.box.x1; x += step) {
      const a = on(ref, x, y), b = on(cell, x + ox, y + oy)
      if (a && b) i++
      if (a || b) u++
    }
    return u ? i / u : 0
  }
  let best = { v: -1, ox: 0, oy: 0 }
  for (let oy = -80; oy <= 80; oy += 4) for (let ox = -80; ox <= 80; ox += 4) { const v = iou(ox, oy, 4); if (v > best.v) best = { v, ox, oy } }
  const c = best
  for (let oy = c.oy - 4; oy <= c.oy + 4; oy++) for (let ox = c.ox - 4; ox <= c.ox + 4; ox++) { const v = iou(ox, oy, 2); if (v > best.v) best = { v, ox, oy } }
  return best
}
for (const st of STATES) {
  const ref = st === 'shy' ? cells.shy[0] : cells.idle[0]
  for (const c of cells[st]) {
    const r = c === ref ? { ox: 0, oy: 0 } : register(ref, c)
    c.ox = r.ox; c.oy = r.oy
    // 換算成參考格座標的外框
    c.box = { x0: c.box.x0 - c.ox, y0: c.box.y0 - c.oy, x1: c.box.x1 - c.ox, y1: c.box.y1 - c.oy }
  }
  console.log('offsets', st, cells[st].map(c => c.ox + ',' + c.oy).join('  '))
}

// 2. 共用取景框：除 shy 外所有格的聯集（切換動作時角色不會跳）；shy 另計
const frameOf = (box) => {
  const bw = box.x1 - box.x0 + 1, bh = box.y1 - box.y0 + 1
  const k = (OUT - 2 * MARGIN) / Math.max(bw, bh)
  const offX = (OUT - bw * k) / 2, offY = OUT - MARGIN - bh * k
  return { box, k, offX, offY }
}
const main = frameOf(union(STATES.filter(s => s !== 'shy').flatMap(s => cells[s].map(c => c.box))))
const shyF = frameOf(union(cells.shy.map(c => c.box)))

async function render(cell, f) {
  const { box, k, offX, offY } = f
  // 取景框搬到這一格的位置；超出格子的地方補透明
  const x0 = box.x0 + cell.ox, y0 = box.y0 + cell.oy, x1 = box.x1 + cell.ox, y1 = box.y1 + cell.oy
  const padL = Math.max(0, -x0), padT = Math.max(0, -y0)
  const padR = Math.max(0, x1 + 1 - cell.w), padB = Math.max(0, y1 + 1 - cell.h)
  const padded = await sharp(cell.rgba, { raw: { width: cell.w, height: cell.h, channels: 4 } })
    .extend({ left: padL, top: padT, right: padR, bottom: padB, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  const crop = await sharp(padded)
    .extract({ left: x0 + padL, top: y0 + padT, width: box.x1 - box.x0 + 1, height: box.y1 - box.y0 + 1 })
    .resize(Math.round((box.x1 - box.x0 + 1) * k), Math.round((box.y1 - box.y0 + 1) * k), { kernel: 'lanczos3' })
    .png().toBuffer()
  return sharp({ create: { width: OUT, height: OUT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: crop, left: Math.round(offX), top: Math.round(offY) }]).png().toBuffer()
}

// 3. 輸出
for (const size of ['large', 'small']) fs.mkdirSync(path.join(repo, 'public/images/dingding-outfits', size, id), { recursive: true })
for (const st of STATES) {
  const f = st === 'shy' ? shyF : main
  const frames = []
  for (const c of cells[st]) frames.push(await render(c, f))
  for (const [size, px] of [['large', OUT], ['small', 64]]) {
    const dir = path.join(repo, 'public/images/dingding-outfits', size, id)
    const sized = px === OUT ? frames : await Promise.all(frames.map(b => sharp(b).resize(px, px, { kernel: 'lanczos3' }).png().toBuffer()))
    await sharp(sized[0]).png({ compressionLevel: 9 }).toFile(path.join(dir, st + '-static.png'))
    await sharp(sized, { join: { animated: true } }).gif({ delay: sized.map(() => DELAY), loop: 0, effort: 10 }).toFile(path.join(dir, st + '.gif'))
  }
  console.log('done', st)
}

// 4. 摸頭對齊：令 shy 圖的角色同其他動作一樣大、一樣位置
const S = main.k / shyF.k
const tx = (main.offX - main.box.x0 * main.k) - S * (shyF.offX - shyF.box.x0 * shyF.k)
const ty = (main.offY - main.box.y0 * main.k) - S * (shyF.offY - shyF.box.y0 * shyF.k)
const align = { scale: +S.toFixed(3), x: +(tx / OUT * 100).toFixed(3), y: +(ty / OUT * 100).toFixed(3) }
console.log('PAT_ALIGN', JSON.stringify(align))
