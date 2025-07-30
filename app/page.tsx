'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store/userStore'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp, Users, Gift } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { loadUserData, userData } = useUserStore()

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  const handleStartDiagnosis = () => {
    router.push('/diagnosis/job-aptitude')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              採用診断アプリ
            </h1>
            <p className="text-xl text-gray-600">
              あなたの性格や価値観から、最適な職種を見つけましょう
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">簡単診断</h3>
                <p className="text-gray-600 text-sm">
                  10問の質問に答えるだけで、あなたに最適な職種がわかります
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">詳細な分析</h3>
                <p className="text-gray-600 text-sm">
                  AIが性格特性を分析し、5つの職種タイプから最適なものを提案
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">キャリア提案</h3>
                <p className="text-gray-600 text-sm">
                  具体的な職種や必要なスキルまで、詳しくアドバイスします
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartDiagnosis}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
              >
                診断を始める
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-500 mt-4">
                所要時間：約5分 / 無料で診断できます
              </p>
            </div>
          </div>

          {userData && (
            <div className="space-y-6">
              {/* ガチャとポイント表示 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">ボーナスガチャ</h2>
                    <p className="text-purple-100 mb-4">
                      診断でポイントを貯めて特典をゲット！
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>保有ポイント: {userData.points}</span>
                      <span>獲得報酬: {userData.unlockedRewards.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/gacha')}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <Gift className="w-5 h-5" />
                    ガチャを回す
                  </button>
                </div>
              </motion.div>

              {/* 診断履歴 */}
              {userData.completedDiagnoses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <h2 className="text-xl font-semibold mb-4">診断履歴</h2>
                  <div className="space-y-3">
                    {userData.completedDiagnoses.slice(0, 3).map((diagnosis) => (
                      <div
                        key={diagnosis.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => router.push(`/results/${diagnosis.id}`)}
                      >
                        <div>
                          <p className="font-medium">{diagnosis.result.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(diagnosis.completedAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  {userData.completedDiagnoses.length > 3 && (
                    <button
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      onClick={() => router.push('/history')}
                    >
                      すべての履歴を見る
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* 開発者向けデバッグリンク */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => router.push('/debug')}
                className="text-sm text-gray-400 hover:text-gray-600 underline"
              >
                🔧 デバッグ・メンテナンス
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  )
}