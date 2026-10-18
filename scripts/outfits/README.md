# 鼎鼎造型製作流程

每套造型 = 8 個動作（idle、thinking、happy、sad、celebrate、eat、shy、sleep），
每個動作是 ChatGPT 畫的一張 2x2 四格動畫表（白底、正方形）。

- **shy 是「被摸頭」**：右上方要有一隻人手（白色袖口完整在格內）摸頭盔頂。
- 學士帽和頭頂燈泡每套都保留。

## 步驟

1. 把 8 張圖放進一個資料夾，檔名用動作名，例如 `idle.png`、`shy.png`。
2. 產生大(512)細(64) GIF 和靜態圖，直接寫入 `public/images/dingding-outfits/`：
   ```
   node scripts/outfits/build-outfit.mjs <圖片資料夾> . <造型編號>
   ```
3. 計算摸頭對齊，結果貼進 `components/patAlignment.json`：
   ```
   node scripts/outfits/align-pat.mjs . <造型編號>
   ```
4. 檢查去背和位置（輸出一張 8×4 的預覽圖）：
   ```
   node scripts/outfits/preview.mjs . <造型編號> preview.png
   ```
5. 在 `components/outfitAssets.js` 的 `READY_OUTFITS` 加上造型編號。
