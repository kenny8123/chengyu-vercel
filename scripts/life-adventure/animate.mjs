// 用法: node scripts/life-adventure/animate.mjs
// 把去背角色圖做成會動的 animated webp（比 GIF 好：邊緣柔和、背景透明）。
//   bounce：原地輕輕彈跳；walk：左右擺動走路；float：飄浮（墨影）。
import { createRequire } from 'module'
import path from 'path'

const require = createRequire(path.resolve('package.json'))
const sharp = require('sharp')
const DIR = path.resolve('public/images/life-adventure')
const JOBS = [
  ['xiaoyue-wave', 'xiaoyue-bounce', 'bounce'],
  ['xiaoyue-cheer', 'xiaoyue-walk', 'walk'],
  ['dingding-wave', 'dingding-bounce', 'bounce'],
  ['moying-giggle', 'moying-float', 'float'],
  ['moying-suck', 'moying-suck-float', 'float'],
  ['moying-sad', 'moying-sad-float', 'float'],
]
const FRAMES = 12, H = 320

for (const [src, out, kind] of JOBS) {
  const base = await sharp(path.join(DIR, src + '.webp')).resize({ height: H }).png().toBuffer()
  const { width: w } = await sharp(base).metadata()
  const CW = Math.round(w * 1.3), CH = Math.round(H * 1.22)
  const frames = []
  for (let f = 0; f < FRAMES; f++) {
    const t = f / FRAMES * Math.PI * 2
    let dy = 0, sy = 1, deg = 0
    if (kind === 'bounce') { dy = -Math.abs(Math.sin(t)) * H * 0.07; sy = 1 - 0.035 * Math.cos(t * 2) * 0.5 }
    if (kind === 'walk') { dy = -Math.abs(Math.sin(t * 2)) * H * 0.05; deg = Math.sin(t) * 5 }
    if (kind === 'float') { dy = Math.sin(t) * H * 0.06; deg = Math.sin(t + 1) * 6 }
    let img = sharp(base).resize({ width: w, height: Math.round(H * sy), fit: 'fill' })
    if (deg) img = sharp(await img.png().toBuffer()).rotate(deg, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    const buf = await img.png().toBuffer(), m = await sharp(buf).metadata()
    const left = Math.round((CW - m.width) / 2), top = Math.round(CH - m.height - H * 0.08 + dy)
    frames.push(await sharp({ create: { width: CW, height: CH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: buf, left: Math.max(0, left), top: Math.max(0, top) }]).png().toBuffer())
  }
  await sharp(frames, { join: { animated: true } }).webp({ quality: 82, alphaQuality: 90, loop: 0, delay: frames.map(() => kind === 'walk' ? 70 : 90) }).toFile(path.join(DIR, out + '.webp'))
  console.log('anim', out)
}
