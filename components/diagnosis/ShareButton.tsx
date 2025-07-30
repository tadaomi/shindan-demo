'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Twitter, Copy, Check } from 'lucide-react'
import { DiagnosisResult } from '@/lib/types'

interface ShareButtonProps {
  result: DiagnosisResult
  url?: string
}

export default function ShareButton({ result, url = '' }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareText = `私の適職診断結果は「${result.title}」でした！\n\n${result.description.slice(0, 100)}...\n\n#適職診断 #キャリア診断`
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    if (typeof window !== 'undefined') {
      window.open(twitterUrl, '_blank', 'width=550,height=420')
    }
    setShowMenu(false)
  }

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setShowMenu(false)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `診断結果: ${result.title}`,
          text: shareText,
          url: shareUrl
        })
        setShowMenu(false)
      } catch (error) {
        console.log('Share cancelled or failed:', error)
      }
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
      >
        <Share2 className="w-4 h-4" />
        結果をシェア
      </motion.button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 min-w-48 z-50"
          >
            <div className="p-2">
              {/* ネイティブシェア（対応している場合） */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <Share2 className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">シェア</span>
                </button>
              )}

              {/* Twitter */}
              <button
                onClick={handleTwitterShare}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Twitter className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700">Twitterでシェア</span>
              </button>

              {/* リンクをコピー */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">コピーしました！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">リンクをコピー</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}