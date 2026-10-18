// 用法: node preview.mjs <repo> <造型編號> <輸出.png>
// 把 8 個動作 × 4 格貼在淺綠底上，方便檢查去背和位置。
import { createRequire } from 'module'
import path from 'path'
const [repo, idArg, out] = process.argv.slice(2)
const require = createRequire(path.resolve(repo, 'package.json'))
const sharp = require('sharp')
const id = String(idArg).padStart(2, '0')
const STATES = ['idle', 'thinking', 'happy', 'sad', 'celebrate', 'eat', 'shy', 'sleep']
const T = 160, comps = []
for (const [r, st] of STATES.entries()) {
  const file = path.join(repo, 'public/images/dingding-outfits/large', id, st + '.gif')
  const meta = await sharp(file).metadata()
  for (let f = 0; f < meta.pages; f++) {
    const buf = await sharp(file, { page: f }).resize(T, T).png().toBuffer()
    comps.push({ input: buf, left: f * T, top: r * T })
  }
}
await sharp({ create: { width: 4 * T, height: STATES.length * T, channels: 4, background: { r: 190, g: 225, b: 195, alpha: 1 } } })
  .composite(comps).png().toFile(out)
console.log(out)
