'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDiagnosisStore } from '@/lib/store/diagnosisStore'
import { useUserStore } from '@/lib/store/userStore'
import { DiagnosisResult } from '@/lib/types'
import { calculateJobAptitudeResult } from '@/lib/diagnosis-logic/jobAptitude'
import ShareButton from '@/components/diagnosis/ShareButton'
import { ArrowLeft, RefreshCw, Award } from 'lucide-react'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const resultId = params.id as string
  
  const { currentDiagnosis, currentDiagnosisId, answers, resetDiagnosis } = useDiagnosisStore()
  const { addDiagnosis, userData } = useUserStore()
  
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (currentDiagnosis && answers.length > 0 && !saved) {
      let calculatedResult: DiagnosisResult

      if (currentDiagnosis === 'job-aptitude') {
        calculatedResult = calculateJobAptitudeResult(answers)
      } else {
        // 他の診断タイプの場合のフォールバック
        calculatedResult = {
          type: 'unknown',
          title: '診断結果',
          description: '診断が完了しました。',
          scores: {},
          recommendations: []
        }
      }

      setResult(calculatedResult)
      
      // 診断結果を保存（一度だけ実行）
      const diagnosis = {
        id: currentDiagnosisId || resultId,
        type: currentDiagnosis,
        answers,
        result: calculatedResult,
        completedAt: new Date().toISOString()
      }
      
      addDiagnosis(diagnosis)
      setSaved(true)
      setIsLoading(false)
    } else if (!currentDiagnosis || answers.length === 0) {
      // 診断データがない場合はホームにリダイレクト
      router.push('/')
    }
  }, [currentDiagnosis, answers, resultId, saved])


  const handleRetry = () => {
    resetDiagnosis()
    if (currentDiagnosis) {
      router.push(`/diagnosis/${currentDiagnosis}`)
    } else {
      router.push('/')
    }
  }

  if (isLoading || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">結果を計算しています...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ホームに戻る
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-4"
              >
                <Award className="w-16 h-16 mx-auto" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">診断完了！</h1>
              <p className="text-blue-100">あなたの適職タイプが判明しました</p>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {result.title}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {result.description}
                </p>
              </div>

              {result.scores && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">適性スコア</h3>
                  <div className="space-y-3">
                    {Object.entries(result.scores).map(([key, score]) => {
                      const maxScore = Math.max(...Object.values(result.scores!))
                      const percentage = (score / maxScore) * 100
                      
                      const typeLabels: Record<string, string> = {
                        creative: 'クリエイティブ',
                        analytical: '分析・戦略',
                        technical: '技術・専門',
                        social: '対人サポート',
                        leadership: 'リーダーシップ'
                      }

                      return (
                        <div key={key} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-gray-700">
                            {typeLabels[key] || key}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                          <div className="w-12 text-sm text-gray-600 text-right">
                            {score}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">おすすめの職種</h3>
                  <div className="grid gap-3">
                    {result.recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                      >
                        <p className="font-medium text-blue-800">{recommendation}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <ShareButton result={result} />
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  もう一度診断
                </button>
              </div>
            </div>
          </motion.div>

          {userData && userData.points && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 bg-white rounded-xl shadow-md p-6 text-center"
            >
              <h3 className="text-lg font-semibold mb-2">診断完了ボーナス！</h3>
              <p className="text-gray-600">
                10ポイントを獲得しました（合計: {userData.points}ポイント）
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}