// 用法: node scripts/life-adventure/busts.mjs
// 由去背全身圖做 RPG 式半身立繪（bust-xxx.webp）：自動找頸部，裁頭＋上半身，
// 再縮放到頭部一樣高，所以每個角色的頭一樣大。
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

const require = createRequire(path.resolve('package.json'))
const sharp = require('sharp')
const DIR = path.resolve('public/images/life-adventure')
const HEAD = 260, BODY = 1.05            // 輸出：頭高 260px，頸以下再留 1.05 個頭高
const SKIP = /^(bg-|map-|cover|bust-|shoot)|-(bounce|walk|float)/
// 頭部（連帽）所佔全身高度的比例：自動找頸部不穩定，改為逐個角色人手指定
const HEAD_FRAC = {
  xiaoyue: .28, brother: .25, 'little-brother': .39, cousin: .36, xiaoming: .3, xiaomei: .31, ahhei: .3,
  mother: .3, father: .3, teacher: .3, grandpa: .3, 'great-grandma': .38, firefighter: .33, dingding: .55,
  maosui: .32, mengjiao: .27, 'meng-mother': .32, 'ouyang-xiu': .35, xunzi: .27, magu: .26,
  jianjian: .5, boss: .5, gongong: .33, popo: .37,
  'yuan-zhi': .3, 'li-biao': .32, confucius: .26, 'lu-meng': .3, 'lu-su': .32, pingyuan: .3,
}
const fracOf = name => HEAD_FRAC[name] ?? HEAD_FRAC[name.split('-')[0]] ?? .35

for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.webp') && !SKIP.test(f))) {
  const name = f.replace(/\.webp$/, '')
  if (/^moying/.test(name)) continue
  const { data, info } = await sharp(path.join(DIR, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  // 最頂一行有角色的位置
  let top = 0
  find: for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 100) { top = y; break find }
  const neck = Math.round(top + (h - top) * fracOf(name.replace(/^brother-.*/, 'brother')))
  const headH = neck - top
  const bottom = Math.min(h, Math.round(neck + headH * BODY))
  const k = HEAD / headH
  await sharp(path.join(DIR, f))
    .extract({ left: 0, top, width: w, height: bottom - top })
    .resize({ height: Math.round((bottom - top) * k) })
    .webp({ quality: 86, alphaQuality: 90 }).toFile(path.join(DIR, 'bust-' + name + '.webp'))
  console.log(name, 'head', (headH / (h - top)).toFixed(2))
}
