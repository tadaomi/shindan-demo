'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/lib/store/userStore'
import GachaWheel from '@/components/gacha/GachaWheel'
import PageLayout from '@/components/common/PageLayout'
import { COLORS } from '@/lib/constants'
import { ArrowLeft, Star, Gift, Coins } from 'lucide-react'
import rewardsData from '@/data/rewards.json'

interface Reward {
  id: string
  type: string
  title: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  points: number
}

export default function GachaPage() {
  const router = useRouter()
  const { userData, loadUserData, addReward, updatePoints } = useUserStore()
  const [isSpinning, setIsSpinning] = useState(false)
  const [canSpin, setCanSpin] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  useEffect(() => {
    if (userData) {
      // 診断を完了している、かつポイントが10以上ある場合にガチャが回せる
      const hasCompletedDiagnosis = userData.completedDiagnoses.length > 0
      const hasEnoughPoints = userData.points >= 10
      setCanSpin(hasCompletedDiagnosis && hasEnoughPoints)
    }
  }, [userData])

  const getRandomReward = (): Reward => {
    const rewards = rewardsData.rewards as Reward[]
    
    // レアリティ別の確率設定
    const rarityWeights = {
      common: 50,    // 50%
      uncommon: 30,  // 30%
      rare: 15,      // 15%
      legendary: 5   // 5%
    }

    // 重み付きランダム選択
    const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    let selectedRarity: keyof typeof rarityWeights = 'common'
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      if (random < weight) {
        selectedRarity = rarity as keyof typeof rarityWeights
        break
      }
      random -= weight
    }

    // 選択されたレアリティの報酬からランダムに選択
    const availableRewards = rewards.filter(reward => reward.rarity === selectedRarity)
    const randomIndex = Math.floor(Math.random() * availableRewards.length)
    
    return availableRewards[randomIndex] || rewards[0]
  }

  const handleSpin = async (): Promise<Reward> => {
    if (!userData || !canSpin || isSpinning) {
      throw new Error('Cannot spin gacha')
    }

    setIsSpinning(true)

    try {
      // ポイントを消費（10ポイント）
      const newPoints = userData.points - 10
      await updatePoints(newPoints)

      // ランダムで報酬を選択
      const reward = getRandomReward()

      // 報酬をユーザーデータに追加（一意のIDは LocalStorageManager で生成される）
      const userReward = {
        id: reward.id,
        type: reward.type as any,
        title: reward.title,
        description: reward.description,
        unlockedAt: new Date().toISOString()
      }

      await addReward(userReward)

      // 報酬のポイントを追加
      await updatePoints(newPoints + reward.points)

      return reward
    } finally {
      setTimeout(() => {
        setIsSpinning(false)
      }, 2500)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600'
      case 'uncommon': return 'text-green-600'
      case 'rare': return 'text-blue-600'
      case 'legendary': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                ホームに戻る
              </button>
              <h1 className="text-3xl font-bold text-gray-900">診断ボーナスガチャ</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{userData.points} ポイント</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 mb-2">
              診断をお疲れ様でした！ボーナスガチャで特典をゲットしよう🎉
            </p>
            <p className="text-sm text-gray-600">
              1回 10ポイント消費 • 採用のコツや業界情報などがもらえます
            </p>
          </div>

          {/* ガチャホイール */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <GachaWheel
              onSpin={handleSpin}
              canSpin={canSpin}
              isSpinning={isSpinning}
            />
          </div>

          {/* 統計情報 */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <Gift className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">獲得報酬</h3>
              <p className="text-2xl font-bold text-purple-600">{userData.unlockedRewards.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">診断完了</h3>
              <p className="text-2xl font-bold text-yellow-600">{userData.completedDiagnoses.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <Coins className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">保有ポイント</h3>
              <p className="text-2xl font-bold text-green-600">{userData.points}</p>
            </div>
          </div>

          {/* 獲得済み報酬一覧 */}
          {userData.unlockedRewards.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">獲得済み報酬</h2>
              <div className="grid gap-4">
                {userData.unlockedRewards.slice(0, 5).map((reward, index) => (
                  <motion.div
                    key={`${reward.id}_${reward.unlockedAt}_${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <Gift className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{reward.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(reward.unlockedAt).toLocaleDateString('ja-JP')} に獲得
                      </p>
                    </div>
                  </motion.div>
                ))}
                {userData.unlockedRewards.length > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    他 {userData.unlockedRewards.length - 5} 件の報酬があります
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ガチャが回せない場合のメッセージ */}
          {!canSpin && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-yellow-800 mb-2">ガチャを回すには</h3>
              {userData.completedDiagnoses.length === 0 ? (
                <div>
                  <p className="text-yellow-700 mb-4">まずは診断を受けてみましょう！</p>
                  <button
                    onClick={() => router.push('/diagnosis/job-aptitude')}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    診断を始める
                  </button>
                </div>
              ) : userData.points < 10 ? (
                <div>
                  <p className="text-yellow-700 mb-4">
                    10ポイント必要です（現在: {userData.points}ポイント）
                  </p>
                  <p className="text-sm text-yellow-600">
                    診断を受けるとポイントがもらえます
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}