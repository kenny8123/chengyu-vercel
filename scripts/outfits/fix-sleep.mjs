// 用法: node fix-sleep.mjs <sleep.png> <輸出.png> [--debug 標記圖.png]
// 睡覺圖統一成安詳樣，避免似喊：
//  1. 清走白底上獨立的藍色小圓點（似水滴），Zzz 字母保留
//  2. 臉部抹平成炭黑色（去掉白色反光條、粗白閉眼線），保留粉紅面珠
//  3. 重新畫上幼細淺色閉眼弧線和細細的小嘴
import { createRequire } from 'module'
import path from 'path'

const args = process.argv.slice(2)
const [src, out] = args
const dbgAt = args.indexOf('--debug'), DEBUG = dbgAt > 0 ? args[dbgAt + 1] : null
const require = createRequire(path.resolve('package.json'))
const sharp = require('sharp')

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, C = 3
function hsv(p) {
  const i = p * C, r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  let h = 0
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx]
}
const isWhite = p => data[p * C] > 235 && data[p * C + 1] > 235 && data[p * C + 2] > 235

function components(mask, x0, y0, x1, y1) {
  const lab = new Int32Array(W * H), comps = []
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const s = y * W + x
    if (!mask[s] || lab[s]) continue
    const id = comps.length + 1, q = [s], px = []; lab[s] = id
    let bx0 = W, bx1 = 0, by0 = H, by1 = 0
    while (q.length) {
      const p = q.pop(), px_ = p % W, py = (p / W) | 0; px.push(p)
      bx0 = Math.min(bx0, px_); bx1 = Math.max(bx1, px_); by0 = Math.min(by0, py); by1 = Math.max(by1, py)
      for (const n of [px_ > x0 ? p - 1 : -1, px_ < x1 - 1 ? p + 1 : -1, py > y0 ? p - W : -1, py < y1 - 1 ? p + W : -1])
        if (n >= 0 && mask[n] && !lab[n]) { lab[n] = id; q.push(n) }
    }
    comps.push({ id, px, x0: bx0, x1: bx1, y0: by0, y1: by1 })
  }
  return comps
}
function morph(mask, n, grow, x0, y0, x1, y1) {
  let a = mask
  for (let k = 0; k < n; k++) {
    const b = new Uint8Array(W * H)
    for (let y = y0 + 1; y < y1 - 1; y++) for (let x = x0 + 1; x < x1 - 1; x++) {
      const p = y * W + x, nb = [a[p], a[p - 1], a[p + 1], a[p - W], a[p + W]]
      b[p] = grow ? (nb.some(Boolean) ? 1 : 0) : (nb.every(Boolean) ? 1 : 0)
    }
    a = b
  }
  return a
}

// 1. 藍色小圓點
const blue = new Uint8Array(W * H)
for (let p = 0; p < W * H; p++) { const [h, s, v] = hsv(p); if (h >= 185 && h <= 250 && s > 0.3 && v > 0.35) blue[p] = 1 }
let dots = 0
for (const c of components(blue, 0, 0, W, H)) {
  const bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1, fill = c.px.length / (bw * bh)
  const cp = ((c.y0 + c.y1) >> 1) * W + ((c.x0 + c.x1) >> 1), hollow = !blue[cp] && bw < 40 && bh < 40
  if (c.px.length > 900 || (fill < 0.68 && !hollow) || bw / bh > 1.5 || bh / bw > 1.5) continue
  let ring = 0, white = 0
  for (let y = c.y0 - 4; y <= c.y1 + 4; y++) for (let x = c.x0 - 4; x <= c.x1 + 4; x++) {
    if (x < 0 || y < 0 || x >= W || y >= H) continue
    if (x >= c.x0 - 1 && x <= c.x1 + 1 && y >= c.y0 - 1 && y <= c.y1 + 1) continue
    ring++; if (isWhite(y * W + x)) white++
  }
  if (!ring || white / ring < 0.7) continue
  // 連同深色描邊一起抹白
  for (let y = c.y0 - 3; y <= c.y1 + 3; y++) for (let x = c.x0 - 3; x <= c.x1 + 3; x++) {
    if (x < 0 || y < 0 || x >= W || y >= H) continue
    const p = y * W + x; data[p * C] = data[p * C + 1] = data[p * C + 2] = 255
  }
  dots++
}

// 2 + 3. 每格找臉
const hw = W >> 1, hh = H >> 1, svgs = [], dbg = []
for (let qy = 0; qy < 2; qy++) for (let qx = 0; qx < 2; qx++) {
  const X0 = qx * hw, Y0 = qy * hh, X1 = X0 + hw, Y1 = Y0 + hh
  const dark = new Uint8Array(W * H)
  for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) { const p = y * W + x, [, s, v] = hsv(p); if (v < 0.3 && s < 0.6) dark[p] = 1 }
  const core = morph(dark, 5, false, X0, Y0, X1, Y1)
  // 臉常被閉眼線、反光切成幾塊：把中間位置的幾塊合起來
  const pieces = components(core, X0, Y0, X1, Y1).filter(c => {
    const cx = ((c.x0 + c.x1) / 2 - X0) / hw, cy = ((c.y0 + c.y1) / 2 - Y0) / hh
    return c.px.length > hw * hh * 0.0015 && cx > 0.22 && cx < 0.78 && cy > 0.26 && cy < 0.64
  })
  if (!pieces.length) { console.log('cell', qx, qy, 'NO FACE'); continue }
  const main = pieces.reduce((a, b) => b.px.length > a.px.length ? b : a)
  // 只要貼近主塊的才算（避免把身體、道具的黑色算進來）
  const near = pieces.filter(c => c === main || (c.x0 < main.x1 + 30 && c.x1 > main.x0 - 30 && c.y0 < main.y1 + 40 && c.y1 > main.y0 - 40))
  const bx0 = Math.max(X0, Math.min(...near.map(c => c.x0)) - 7), bx1 = Math.min(X1 - 1, Math.max(...near.map(c => c.x1)) + 7)
  const by0 = Math.max(Y0, Math.min(...near.map(c => c.y0)) - 7), by1 = Math.min(Y1 - 1, Math.max(...near.map(c => c.y1)) + 7)
  // 框內：由框邊經非深色像素走得到的是外面；其餘（深色＋被包住的白線、反光）是臉
  const bw = bx1 - bx0 + 1, outside = new Uint8Array(bw * (by1 - by0 + 1)), q = []
  const push = (x, y) => { const k = (y - by0) * bw + (x - bx0); if (!outside[k] && !dark[y * W + x]) { outside[k] = 1; q.push(k) } }
  for (let x = bx0; x <= bx1; x++) { push(x, by0); push(x, by1) }
  for (let y = by0; y <= by1; y++) { push(bx0, y); push(bx1, y) }
  while (q.length) { const k = q.pop(), x = bx0 + k % bw, y = by0 + ((k / bw) | 0); if (x > bx0) push(x - 1, y); if (x < bx1) push(x + 1, y); if (y > by0) push(x, y - 1); if (y < by1) push(x, y + 1) }
  const fx0 = bx0 + 7, fx1 = bx1 - 7, fy0 = by0 + 7, fy1 = by1 - 7, fw = fx1 - fx0, fh = fy1 - fy0
  const ecx = (fx0 + fx1) / 2, ecy = (fy0 + fy1) / 2, erx = fw / 2 + 4, ery = fh / 2 + 4
  const face = []
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
    const inEllipse = ((x - ecx) / erx) ** 2 + ((y - ecy) / ery) ** 2 <= 1
    if (!outside[(y - by0) * bw + (x - bx0)] || (inEllipse && ((x - ecx) / erx) ** 2 + ((y - ecy) / ery) ** 2 <= 1.0)) face.push(y * W + x)
  }
  // 臉邊的灰色反光、舊面珠：在放大 15% 的橢圓內，灰色／粉紅色也塗黑（頭盔是白色，不受影響）
  for (let y = Math.max(Y0, Math.floor(ecy - ery * 1.15)); y <= Math.min(Y1 - 1, Math.ceil(ecy + ery * 1.15)); y++)
    for (let x = Math.max(X0, Math.floor(ecx - erx * 1.15)); x <= Math.min(X1 - 1, Math.ceil(ecx + erx * 1.15)); x++) {
      if (((x - ecx) / (erx * 1.15)) ** 2 + ((y - ecy) / (ery * 1.15)) ** 2 > 1) continue
      const p = y * W + x, [h, s, v] = hsv(p)
      if ((s < 0.3 && v < 0.8) || ((h >= 320 || h <= 20) && s > 0.2 && v > 0.55)) face.push(p)
    }
  let painted = 0
  for (const p of face) {
    const [h, s, v] = hsv(p)
    const pink = (h >= 320 || h <= 20) && s > 0.2 && v > 0.55 && false
    if (pink) continue
    data[p * C] = 54; data[p * C + 1] = 49; data[p * C + 2] = 52; painted++
  }
  // 幼細閉眼弧線（向下彎，安詳）＋細小嘴
  // 照第 1–17 套的睡顏：上面細白眉弧、下面粗白彎月閉眼、細細粉紅笑嘴、兩邊粉紅面珠
  const W_ = fw, white = '#f4efe8'
  const brow = cx => { const bw = W_ * 0.1, by = fy0 + fh * 0.36; return `<path d="M ${cx - bw / 2} ${by + bw * 0.12} Q ${cx} ${by - bw * 0.28} ${cx + bw / 2} ${by + bw * 0.12}" stroke="${white}" stroke-width="${Math.max(3, W_ * 0.024)}" fill="none" stroke-linecap="round"/>` }
  const eye = cx => { const ew = W_ * 0.3, ey = fy0 + fh * 0.58; return `<path d="M ${cx - ew / 2} ${ey} Q ${cx} ${ey + ew * 0.42} ${cx + ew / 2} ${ey} Q ${cx} ${ey + ew * 0.2} ${cx - ew / 2} ${ey} Z" fill="${white}" stroke="${white}" stroke-width="${Math.max(1.5, W_ * 0.008)}" stroke-linejoin="round"/>` }
  const blush = cx => `<ellipse cx="${cx}" cy="${fy0 + fh * 0.75}" rx="${W_ * 0.065}" ry="${W_ * 0.04}" fill="#f48a9a" opacity="0.85"/>`
  const mx = fx0 + fw / 2, my = fy0 + fh * 0.74, mw = W_ * 0.05
  const mouth = `<path d="M ${mx - mw} ${my} Q ${mx} ${my + mw * 1.3} ${mx + mw} ${my} Z" fill="#f27c8e"/>`
  svgs.push(blush(fx0 + fw * 0.17) + blush(fx0 + fw * 0.83) + brow(fx0 + fw * 0.3) + brow(fx0 + fw * 0.7) + eye(fx0 + fw * 0.3) + eye(fx0 + fw * 0.7) + mouth)
  dbg.push(`cell ${qx},${qy} face ${fw}x${fh} painted ${painted}`)
}
const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${svgs.join('')}</svg>`)
await sharp(data, { raw: info }).composite([{ input: svg, left: 0, top: 0 }]).png().toFile(out)
console.log('dots removed', dots, '|', dbg.join(' | '))
if (DEBUG) await sharp(out).resize(800).toFile(DEBUG)
