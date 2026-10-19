# 鼎鼎的 Claude 互動

鼎鼎聊天改為**用家自行輸入自己的 Claude API 金鑰**，伺服器不再用網站或老師的金鑰。

1. 到 [Claude 開發者平台](https://platform.claude.com/settings/keys) 建立 API 金鑰（以 `sk-ant-` 開頭），建議設定每月用量上限。
2. 開啟 `/pet`，按右上角「🔑 輸入金鑰」，貼上金鑰再按「儲存金鑰」。
3. 預設只記住在這個分頁，關閉後自動清除；自己的電腦可勾選「在這部裝置記住金鑰」。公用或學校電腦請不要勾選。
4. 想換或刪除金鑰，再按「🔑 金鑰」。

未輸入金鑰時，照顧鼎鼎、換造型、典故提醒照常可用；一傳訊息就會彈出金鑰視窗；金鑰無效時亦會提示重新輸入，不會冒充 Claude 回答。

金鑰只存在用家瀏覽器（sessionStorage 或 localStorage），每次聊天以 `x-user-api-key` 標頭送到本站 `/api/dingding`，由伺服器轉交 Anthropic Messages API，伺服器不儲存、不記錄。費用由用家自己的 Anthropic 帳戶支付。伺服器 `.env.local` 只需（可選）`ANTHROPIC_MODEL`，未設定時用 `claude-haiku-5-5`；`ANTHROPIC_API_KEY` 只留給 `scripts/generate-idiom.mjs` 製作教材用。

送出內容包含對話、相關典故教材和最近 20 筆成語學習摘要（成語、讀過或作答、對錯），不包含學生暱稱。每個來源每分鐘最多 20 次。

目前為本機版本，學生檔案存於瀏覽器，沒有登入及跨裝置同步。正式公開部署前需加上登入、伺服器端學生紀錄、測驗狀態驗證與持久化用量限制；目前測驗頁隱藏聊天，API 也會拒絕 quiet 請求，但不能用來防止學生另開頁面尋求答案。

API 文件：https://platform.claude.com/docs/en/api/messages/create

本機 Windows 請用 `npm run start -- -p 3100` 或 `npm run dev`。啟動程式會在支援的 Node.js 版本使用 Windows 已信任的憑證，保持 HTTPS 驗證。若 Node 不支援 --use-system-ca，請更新至支援的版本。
