// 用法: node teal.mjs <造型資料夾 public/images/dingding-outfits/large/NN> ...
// 把後期造型的深藍色（頭盔間條、耳機、手腳、眼睛）和偏冷的白色，
// 換成第 1–17 套的湖水綠和米白色。直接改已製作好的 GIF 和靜態 PNG（保留透明）。
// 做法：同一張圖裡的藍色按深淺排序，對應第 1–17 套湖水綠由深到淺的顏色表。
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

const require = createRequire(path.resolve('package.json'))
const sharp = require('sharp')
// 第 1–17 套湖水綠由深到淺（idle/happy/sad 實際抽樣）
const RAMP = [[0, 16, 16], [0, 29, 31], [0, 54, 56], [4, 66, 70], [0, 71, 78], [0, 79, 86], [1, 89, 95], [0, 92, 105], [0, 111, 116], [0, 118, 126], [0, 126, 137], [0, 146, 154], [0, 155, 161], [16, 162, 168], [37, 171, 176], [77, 188, 189]]
const CREAM = [249, 241, 227]

function hsv(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  if (!d) return [0, 0, mx / 255]
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, d / mx, mx / 255]
}
function recolour(px) {
  const blue = []
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 10) continue
    const [h, s, v] = hsv(px[i], px[i + 1], px[i + 2])
    if (h >= 198 && h <= 265 && s > 0.25 && !(v > 0.82 && s < 0.6)) blue.push([v, i])
  }
  blue.sort((a, b) => a[0] - b[0])
  blue.forEach(([, i], k) => {
    const t = (k / Math.max(1, blue.length - 1)) * (RAMP.length - 1), a = Math.floor(t), f = t - a, c0 = RAMP[a], c1 = RAMP[Math.min(RAMP.length - 1, a + 1)]
    for (let c = 0; c < 3; c++) px[i + c] = Math.round(c0[c] + (c1[c] - c0[c]) * f)
  })
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 10) continue
    const [, s, v] = hsv(px[i], px[i + 1], px[i + 2])
    if (s < 0.12 && v > 0.8) for (let c = 0; c < 3; c++) px[i + c] = Math.min(255, Math.round(CREAM[c] * Math.min(1.02, v / 0.98)))
  }
  return blue.length
}
for (const dir of process.argv.slice(2)) {
  for (const f of fs.readdirSync(dir)) {
    const file = path.join(dir, f), gif = f.endsWith('.gif')
    if (!gif && !f.endsWith('.png')) continue
    const img = sharp(file, gif ? { animated: true } : {})
    const meta = await img.metadata()
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    recolour(data)
    const raw = { width: info.width, height: info.height, channels: 4, ...(gif ? { pageHeight: meta.pageHeight } : {}) }
    const outImg = sharp(data, { raw })
    const buf = gif ? await outImg.gif({ delay: meta.delay, loop: 0, effort: 10 }).toBuffer() : await outImg.png({ compressionLevel: 9 }).toBuffer()
    fs.writeFileSync(file, buf)
  }
  console.log('done', dir)
}
