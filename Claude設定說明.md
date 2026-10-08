# 鼎鼎的 Claude 互動

1. 將 `.env.example` 複製成專案根目錄的 `.env.local`。
2. 在本機編輯 `.env.local`，填入 `ANTHROPIC_API_KEY` 和帳戶可用的 `ANTHROPIC_MODEL` 模型 ID。不要將金鑰貼在聊天、前端程式或公開儲存庫。
3. 重新啟動 Next.js 伺服器，開啟 `/pet`，使用「和鼎鼎聊聊」。

此功能使用 Anthropic Messages API。只有按下送出才呼叫 Claude；平時典故提醒、學習記憶、養成與造型不需要 API。尚未設定金鑰時會明確提示，不會冒充 Claude 回答。

送出內容包含對話、40 個典故教材和最近 20 筆成語學習摘要（成語、讀過或作答、對錯），不包含學生暱稱。金鑰只由伺服器讀取。每次回覆最多 650 tokens，每個來源每分鐘最多 8 次；請在 Anthropic 帳戶另外設定用量限制。

目前為本機版本，學生檔案存於瀏覽器，沒有登入及跨裝置同步。正式公開部署前需加上登入、伺服器端學生紀錄、測驗狀態驗證與持久化用量限制；目前測驗頁隱藏聊天，API 也會拒絕 quiet 請求，但不能用來防止學生另開頁面尋求答案。

API 文件：https://platform.claude.com/docs/en/api/messages/create
