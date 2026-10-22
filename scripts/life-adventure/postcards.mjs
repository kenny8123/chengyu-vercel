// 用法: node scripts/life-adventure/postcards.mjs <來源資料夾>
// 成語明信片：來源檔名「NN-成語.png」（NN＝成語編號），輸出 public/images/scroll-postcards/NN.webp（3:2，1200 闊）。
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

const require = createRequire(path.resolve('package.json'))
const sharp = require('sharp')
const SRC = process.argv[2], OUT = path.resolve('public/images/scroll-postcards')
fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(SRC).filter(f => /^\d\d-.*\.png$/.test(f))) {
  await sharp(path.join(SRC, f)).resize({ width: 1200, height: 800, fit: 'cover' }).webp({ quality: 82 }).toFile(path.join(OUT, f.slice(0, 2) + '.webp'))
  console.log('postcard', f)
}
