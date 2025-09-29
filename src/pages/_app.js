// pages/_app.js
import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  // Firebase関連のコードを一時的にコメントアウト
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}