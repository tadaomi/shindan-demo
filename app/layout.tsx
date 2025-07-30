import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "採用診断アプリ - あなたに最適な職種を見つけよう",
    template: "%s | 採用診断アプリ"
  },
  description: "10問の質問に答えるだけで、あなたに最適な職種を診断します。ガチャ機能や履歴管理など、楽しみながら適職を見つけられる無料診断アプリです。",
  keywords: ["適職診断", "職種診断", "採用", "転職", "キャリア", "性格診断", "無料診断"],
  authors: [{ name: "採用診断アプリ" }],
  creator: "採用診断アプリ",
  publisher: "採用診断アプリ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://shindan-demo.vercel.app"), // デプロイ後に実際のURLに変更
  openGraph: {
    title: "採用診断アプリ - あなたに最適な職種を見つけよう",
    description: "10問の質問に答えるだけで、あなたに最適な職種を診断します。無料で簡単に診断できます。",
    url: "https://shindan-demo.vercel.app",
    siteName: "採用診断アプリ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "採用診断アプリ - あなたに最適な職種を見つけよう",
    description: "10問の質問に答えるだけで、あなたに最適な職種を診断します。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  )
}