'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { BACKGROUND_GRADIENTS } from '@/lib/constants'

interface PageLayoutProps {
  children: React.ReactNode
  backgroundType?: keyof typeof BACKGROUND_GRADIENTS
  showBackButton?: boolean
  backTo?: string
  backLabel?: string
  className?: string
}

export default function PageLayout({
  children,
  backgroundType = 'primary',
  showBackButton = true,
  backTo = '/',
  backLabel = 'ホームに戻る',
  className = ''
}: PageLayoutProps) {
  const router = useRouter()

  return (
    <main className={`min-h-screen ${BACKGROUND_GRADIENTS[backgroundType]} ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {showBackButton && (
            <div className="mb-6">
              <button
                onClick={() => router.push(backTo)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </main>
  )
}