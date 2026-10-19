// 用法: node fix-face.mjs <輸入.png> <輸出.png> [--debug 標記圖.png]
// 把 ChatGPT 四格表裡鼎鼎變成啡色的臉改回原本的炭黑色（第 1–16 套的顏色），
// 保留眼睛、面珠、反光的明暗。每格只改「頭頂燈泡正下方」那一塊最大的啡色區域，
// 不會改到夥伴動物或木頭道具。
import { createRequire } from 'module'
import path from 'path'

const args = process.argv.slice(2)
const [src, out] = args
const dbgAt = args.indexOf('--debug'), DEBUG = dbgAt > 0 ? args[dbgAt + 1] : null
// --light-lines：睡覺圖的閉眼線原本是深啡色，臉變黑後會看不見，改成第 1–16 套那種淺色弧線
const LIGHT_LINES = args.includes('--light-lines')
const require = createRequire(path.resolve('package.json'))
const sharp = require('sharp')

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, C = 3

function hsv(i) {
  const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  let h = 0
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx]
}
// 啡色臉：橙啡色調、有一定飽和度、不太亮（太亮的是面珠）、不太黑（黑色是描邊）
const brown = new Uint8Array(W * H)
for (let p = 0; p < W * H; p++) {
  const [h, s, v] = hsv(p * C)
  if (h >= 4 && h <= 45 && s >= 0.22 && v >= 0.13 && (v <= 0.88 || (v <= 0.98 && s >= 0.45 && h >= 14))) brown[p] = 1
}

// 先收窄 2px，切斷臉和相鄰啡色物件之間的細接位
function erode(m, n) {
  let a = m
  for (let k = 0; k < n; k++) {
    const b = new Uint8Array(W * H)
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = y * W + x
      if (a[p] && a[p - 1] && a[p + 1] && a[p - W] && a[p + W]) b[p] = 1
    }
    a = b
  }
  return a
}
const core = erode(brown, 2)

// 找連通區域
const label = new Int32Array(W * H), comps = [null]
for (let s = 0; s < W * H; s++) {
  if (!core[s] || label[s]) continue
  const id = comps.length, q = [s]; label[s] = id
  let n = 0, sx = 0, sy = 0, x0 = W, x1 = 0, y0 = H, y1 = 0
  while (q.length) {
    const p = q.pop(), x = p % W, y = (p / W) | 0
    n++; sx += x; sy += y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
    for (const m of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1])
      if (m >= 0 && core[m] && !label[m]) { label[m] = id; q.push(m) }
  }
  comps.push({ id, n, cx: sx / n, cy: sy / n, x0, x1, y0, y1 })
}

// 每格揀一塊：位置在格中上部、面積夠大、越近中間越好
const hw = W / 2, hh = H / 2, chosen = []
for (let qy = 0; qy < 2; qy++) for (let qx = 0; qx < 2; qx++) {
  let best = null, bestScore = 0
  for (const c of comps.slice(1)) {
    const fx = (c.cx - qx * hw) / hw, fy = (c.cy - qy * hh) / hh
    if (fx < 0 || fx > 1 || fy < 0 || fy > 1) continue
    if (c.n < hw * hh * 0.008) continue
    if (fx < 0.15 || fx > 0.75 || fy < 0.08 || fy > 0.66) continue
    const score = c.n * (1 - Math.abs(fx - 0.47)) * (1 - Math.abs(fy - 0.38))
    if (score > bestScore) { bestScore = score; best = c }
  }
  if (best) {
    chosen.push(best)
    // 臉被手、笛子等分開成幾塊時，把貼著主塊的其他啡色塊也算進去
    const mx = (best.x1 - best.x0) * 0.15, my = (best.y1 - best.y0) * 0.15
    for (const c of comps.slice(1)) {
      if (c === best || c.n < best.n * 0.04) continue
      if (c.cx < qx * hw || c.cx > (qx + 1) * hw || c.cy < qy * hh || c.cy > (qy + 1) * hh) continue
      const inside = c.x0 >= best.x0 - mx && c.x1 <= best.x1 + mx && c.y0 >= best.y0 - my && c.y1 <= best.y1 + my
      if (inside) chosen.push(c)
    }
  }
  console.log('cell', qx, qy, best ? `face ${best.n}px at ${Math.round(best.cx)},${Math.round(best.cy)}` : 'NO FACE FOUND')
}

// 把選中區域放回原大小（在啡色範圍內擴張 3px），然後重新上色
const sel = new Uint8Array(W * H), ids = new Set(chosen.map(c => c.id))
for (let p = 0; p < W * H; p++) if (ids.has(label[p])) sel[p] = 1
for (let k = 0; k < 3; k++) {
  const add = []
  for (let p = W; p < W * H - W; p++) if (!sel[p] && brown[p] && (sel[p - 1] || sel[p + 1] || sel[p - W] || sel[p + W])) add.push(p)
  for (const p of add) sel[p] = 1
}
// 臉中間被包住的細小啡色位（嘴巴線、反光條）也一併改色；眼睛、面珠不是啡色所以保留
for (const c of chosen) {
  const x0 = Math.max(0, c.x0 - 6), x1 = Math.min(W - 1, c.x1 + 6), y0 = Math.max(0, c.y0 - 6), y1 = Math.min(H - 1, c.y1 + 6)
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, outside = new Uint8Array(bw * bh), q = []
  const push = (x, y) => { const k = (y - y0) * bw + (x - x0); if (!outside[k] && !sel[y * W + x]) { outside[k] = 1; q.push(k) } }
  for (let x = x0; x <= x1; x++) { push(x, y0); push(x, y1) }
  for (let y = y0; y <= y1; y++) { push(x0, y); push(x1, y) }
  while (q.length) {
    const k = q.pop(), x = x0 + k % bw, y = y0 + ((k / bw) | 0)
    if (x > x0) push(x - 1, y); if (x < x1) push(x + 1, y); if (y > y0) push(x, y - 1); if (y < y1) push(x, y + 1)
  }
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const p = y * W + x
    if (sel[p] || outside[(y - y0) * bw + (x - x0)]) continue
    const [h, s] = hsv(p * C)
    if (h >= 4 && h <= 45 && s >= 0.15) sel[p] = 1
  }
}
// 臉頂的淺色反光貼著頭盔，上面那步捉不到：在主塊橢圓的上半部，淺橙啡色也一併改（嘴巴在下半部，面珠偏粉紅，所以保留）
for (const c of chosen) {
  if (c.n < hw * hh * 0.008) continue
  const cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2, rx = (c.x1 - c.x0) / 2 * 1.04, ry = (c.y1 - c.y0) / 2 * 1.08
  for (let y = Math.max(0, Math.floor(cy - ry)); y <= Math.min(H - 1, Math.ceil(cy - ry * 0.1)); y++)
    for (let x = Math.max(0, Math.floor(cx - rx)); x <= Math.min(W - 1, Math.ceil(cx + rx)); x++) {
      const p = y * W + x
      if (sel[p] || ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1) continue
      const [h, s, v] = hsv(p * C)
      if (h >= 13 && h <= 45 && s >= 0.12 && v >= 0.13) sel[p] = 1
    }
}
// 以每塊臉的中位亮度做基準：基準 → 炭黑 (57,51,54)，較亮的反光變成柔和的灰
const lum = i => 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2]
const vals = []
for (let p = 0; p < W * H; p++) if (sel[p]) vals.push(lum(p * C))
vals.sort((a, b) => a - b)
const mid = vals[vals.length >> 1] || 1
let changed = 0
// 只在臉的內部（離邊緣 9px 以上）把深色線變淺，避免臉邊出現白圈
const inner = LIGHT_LINES ? erode(sel, 9) : null
for (let p = 0; p < W * H; p++) {
  if (!sel[p]) continue
  const i = p * C, t = Math.max(-1, Math.min(2.2, (lum(i) - mid) / mid))
  if (LIGHT_LINES && t < -0.38 && inner[p]) { const k = Math.min(1, (-0.38 - t) / 0.2); const lv = 54 + k * 176; data[i] = Math.round(lv); data[i + 1] = Math.round(lv * 0.97); data[i + 2] = Math.round(lv * 0.93); changed++; continue }
  const v = Math.max(26, Math.min(135, 54 + t * 34))
  data[i] = Math.round(v * 1.05); data[i + 1] = Math.round(v * 0.94); data[i + 2] = Math.round(v)
  changed++
}
await sharp(data, { raw: info }).png().toFile(out)
console.log('recoloured', changed, 'px')
if (DEBUG) {
  const d = Buffer.from(data)
  for (let p = 0; p < W * H; p++) if (sel[p]) { d[p * C] = 0; d[p * C + 1] = 255; d[p * C + 2] = 80 }
  await sharp(d, { raw: info }).resize(800).png().toFile(DEBUG)
}
