'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Gift } from 'lucide-react'

interface Reward {
  id: string
  type: string
  title: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  points: number
}

interface GachaWheelProps {
  onSpin: () => Promise<Reward>
  canSpin: boolean
  isSpinning: boolean
}

export default function GachaWheel({ onSpin, canSpin, isSpinning }: GachaWheelProps) {
  const [result, setResult] = useState<Reward | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return
    
    setResult(null)
    setShowResult(false)
    
    try {
      const reward = await onSpin()
      
      // スピン演出の後に結果を表示
      setTimeout(() => {
        setResult(reward)
        setShowResult(true)
      }, 2000)
    } catch (error) {
      console.error('Gacha spin failed:', error)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600'
      case 'uncommon': return 'from-green-400 to-green-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'legendary': return 'from-purple-400 to-purple-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'コモン'
      case 'uncommon': return 'アンコモン'
      case 'rare': return 'レア'
      case 'legendary': return 'レジェンダリー'
      default: return 'コモン'
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* ガチャホイール */}
      <div className="relative mb-8">
        <motion.div
          animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
          transition={isSpinning ? { 
            duration: 2, 
            ease: "easeOut",
            repeat: 0
          } : { duration: 0 }}
          className="w-64 h-64 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-2xl flex items-center justify-center relative overflow-hidden"
        >
          {/* ガチャホイールの装飾 */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center">
            <motion.div
              animate={isSpinning ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
            >
              <Gift className="w-20 h-20 text-yellow-700" />
            </motion.div>
          </div>
          
          {/* スパークル演出 */}
          {isSpinning && (
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0'
                  }}
                  animate={{
                    rotate: i * 45,
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white" style={{ transform: 'translate(100px, -8px)' }} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* 指針 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>
      </div>

      {/* スピンボタン */}
      <motion.button
        onClick={handleSpin}
        disabled={!canSpin || isSpinning}
        whileHover={canSpin && !isSpinning ? { scale: 1.05 } : {}}
        whileTap={canSpin && !isSpinning ? { scale: 0.95 } : {}}
        className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-200 ${
          canSpin && !isSpinning
            ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSpinning ? 'スピン中...' : 'ガチャを回す！'}
      </motion.button>

      {!canSpin && !isSpinning && (
        <p className="text-sm text-gray-500 mt-2">
          診断を完了するとガチャが回せます
        </p>
      )}

      {/* 結果表示 */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: 0.2
            }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className={`bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border-4 bg-gradient-to-br ${getRarityColor(result.rarity)}`}>
              <div className="bg-white rounded-xl p-6 m-2">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="mb-4"
                >
                  <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getRarityColor(result.rarity)}`}>
                    {getRarityText(result.rarity)}
                  </div>
                </motion.div>
                
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-bold text-gray-900 mb-4"
                >
                  {result.title}
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-gray-700 mb-6 leading-relaxed"
                >
                  {result.description}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                  className="bg-yellow-100 rounded-lg p-3 mb-6"
                >
                  <p className="text-yellow-800 font-semibold">
                    +{result.points} ポイント獲得！
                  </p>
                </motion.div>
                
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  onClick={() => setShowResult(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  閉じる
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}