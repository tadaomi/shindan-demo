'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDiagnosisStore } from '@/lib/store/diagnosisStore'
import { useUserStore } from '@/lib/store/userStore'
import { DiagnosisResult } from '@/lib/types'
import { calculateJobAptitudeResult } from '@/lib/diagnosis-logic/jobAptitude'
import ShareButton from '@/components/diagnosis/ShareButton'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { JOB_TYPE_LABELS, BACKGROUND_GRADIENTS, COLORS } from '@/lib/constants'
import { ArrowLeft, RefreshCw, Award } from 'lucide-react'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const resultId = params.id as string
  
  const { currentDiagnosis, currentDiagnosisId, answers, resetDiagnosis } = useDiagnosisStore()
  const { addDiagnosis, userData, loadUserData } = useUserStore()
  
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  
  // userDataを確実に読み込む
  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  useEffect(() => {
    const handleNewDiagnosis = () => {
      const calculatedResult = currentDiagnosis === 'job-aptitude' 
        ? calculateJobAptitudeResult(answers)
        : { type: 'unknown', title: '診断結果', description: '診断が完了しました。', scores: {}, recommendations: [] }

      setResult(calculatedResult)
      addDiagnosis({
        id: currentDiagnosisId || resultId,
        type: currentDiagnosis!,
        answers,
        result: calculatedResult,
        completedAt: new Date().toISOString()
      })
      setSaved(true)
      setIsLoading(false)
    }

    const handleSavedDiagnosis = () => {
      const savedDiagnosis = userData?.completedDiagnoses.find(d => d.id === resultId)
      if (savedDiagnosis) {
        setResult(savedDiagnosis.result)
        setIsLoading(false)
      } else {
        router.push('/history')
      }
    }

    // 新規診断の処理
    if (currentDiagnosis && answers.length > 0 && !saved) {
      handleNewDiagnosis()
    } 
    // 保存済み診断の表示
    else if (resultId && userData && !currentDiagnosis) {
      handleSavedDiagnosis()
    }
    // データ不足時のホームリダイレクト
    else if (!currentDiagnosis && userData && !userData.completedDiagnoses.find(d => d.id === resultId) && !saved) {
      router.push('/')
    }
  }, [currentDiagnosis, answers, resultId, saved, userData, addDiagnosis, currentDiagnosisId, router])


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
      <div className={`min-h-screen ${BACKGROUND_GRADIENTS.results} flex items-center justify-center`}>
        <LoadingSpinner message="結果を計算しています..." />
      </div>
    )
  }

  return (
    <main className={`min-h-screen ${BACKGROUND_GRADIENTS.results}`}>
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
            <div className={`${COLORS.primary} text-white p-8 text-center`}>
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
                      

                      return (
                        <div key={key} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-gray-700">
                            {JOB_TYPE_LABELS[key] || key}
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
                  className={`flex items-center gap-2 px-6 py-3 ${COLORS.button.secondary} text-white font-medium rounded-lg transition-colors`}
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