import { Html, Head, Main, NextScript } from 'next/document'
export default function Document() {
  return (
    <Html lang="zh-Hant">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Noto+Sans+TC:wght@500;700;900&display=swap" rel="stylesheet" />
        <link rel="icon" href={`data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='16' fill='#ff7e9d'/><text x='32' y='45' font-size='34' text-anchor='middle'>🤖</text></svg>")}`} />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  )
}
