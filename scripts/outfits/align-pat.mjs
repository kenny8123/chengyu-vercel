// 用法: node align-pat.mjs <repo> <造型編號>
// 找出 shy 圖要放大/移動多少，身體和樹枝才會跟 idle 重疊（只比對下半部，避開摸頭的手）。
import { createRequire } from 'module'
import path from 'path'
const [repo, idArg] = process.argv.slice(2)
const require = createRequire(path.resolve(repo, 'package.json'))
const sharp = require('sharp')
const id = String(idArg).padStart(2, '0')
const dir = path.join(repo, 'public/images/dingding-outfits/large', id)

async function mask(file, n) {
  const { data } = await sharp(file).resize(n, n).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const m = new Uint8Array(n * n)
  for (let p = 0; p < n * n; p++) m[p] = data[p * 4 + 3] > 128 ? 1 : 0
  return m
}

function score(a, b, n, S, tx, ty) {
  // shy 像素 q 經變換後落在 S*q + t；比較 idle 下半部 (y > 45%) 的重疊程度
  let inter = 0, uni = 0
  for (let y = Math.floor(n * 0.45); y < n; y++) for (let x = 0; x < n; x++) {
    const qx = Math.round((x - tx) / S), qy = Math.round((y - ty) / S)
    const bv = qx >= 0 && qy >= 0 && qx < n && qy < n ? b[qy * n + qx] : 0
    const av = a[y * n + x]
    if (av && bv) inter++
    if (av || bv) uni++
  }
  return uni ? inter / uni : 0
}

async function search(n, sRange, tRange, sStep, tStep) {
  const a = await mask(path.join(dir, 'idle-static.png'), n)
  const b = await mask(path.join(dir, 'shy-static.png'), n)
  let best = { v: -1 }
  for (let S = sRange[0]; S <= sRange[1] + 1e-9; S += sStep)
    for (let tx = tRange[0]; tx <= tRange[1]; tx += tStep)
      for (let ty = tRange[2]; ty <= tRange[3]; ty += tStep) {
        const v = score(a, b, n, S, tx, ty)
        if (v > best.v) best = { v, S, tx, ty }
      }
  return best
}

// 粗搜 (128px) 再細搜 (256px)
const c = await search(128, [0.7, 1.5], [-40, 40, -40, 40], 0.02, 2)
const f = await search(256, [c.S - 0.03, c.S + 0.03], [c.tx * 2 - 6, c.tx * 2 + 6, c.ty * 2 - 6, c.ty * 2 + 6], 0.005, 1)
const out = { scale: +f.S.toFixed(3), x: +(f.tx / 256 * 100).toFixed(3), y: +(f.ty / 256 * 100).toFixed(3) }
console.log('coarse IoU', c.v.toFixed(3), 'fine IoU', f.v.toFixed(3))
console.log(JSON.stringify(out))
