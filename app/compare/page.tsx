'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/lib/store/userStore'
import { Diagnosis } from '@/lib/types'
import { ArrowLeft, BarChart3, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

function ComparePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userData, loadUserData } = useUserStore()
  
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<Diagnosis[]>([])
  const [compareMode, setCompareMode] = useState<'select' | 'compare'>('select')

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',') || []
    if (userData && ids.length > 0) {
      const diagnoses = userData.completedDiagnoses.filter(d => ids.includes(d.id))
      setSelectedDiagnoses(diagnoses)
      if (diagnoses.length >= 2) {
        setCompareMode('compare')
      }
    }
  }, [userData, searchParams])

  const handleSelectDiagnosis = (diagnosis: Diagnosis) => {
    if (selectedDiagnoses.find(d => d.id === diagnosis.id)) {
      setSelectedDiagnoses(prev => prev.filter(d => d.id !== diagnosis.id))
    } else if (selectedDiagnoses.length < 3) {
      setSelectedDiagnoses(prev => [...prev, diagnosis])
    }
  }

  const startComparison = () => {
    if (selectedDiagnoses.length >= 2) {
      setCompareMode('compare')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getScoreDifference = (score1: number, score2: number) => {
    const diff = score1 - score2
    return {
      value: Math.abs(diff),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'equal'
    }
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (userData.completedDiagnoses.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-4">比較するには2つ以上の診断が必要です</h2>
          <p className="text-gray-600 mb-6">診断を複数回受けて、結果を比較してみましょう。</p>
          <button
            onClick={() => router.push('/diagnosis/job-aptitude')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            診断を受ける
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/history')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                履歴に戻る
              </button>
              <h1 className="text-3xl font-bold text-gray-900">診断結果比較</h1>
            </div>
            
            {compareMode === 'compare' && (
              <button
                onClick={() => setCompareMode('select')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                選択に戻る
              </button>
            )}
          </div>

          {compareMode === 'select' ? (
            <>
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">比較する診断を選択してください（2〜3個）</h2>
                <p className="text-gray-600 mb-4">
                  選択済み: {selectedDiagnoses.length}/3
                </p>
                {selectedDiagnoses.length >= 2 && (
                  <button
                    onClick={startComparison}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    比較を開始
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                {userData.completedDiagnoses.map((diagnosis) => {
                  const isSelected = selectedDiagnoses.find(d => d.id === diagnosis.id)
                  const canSelect = !isSelected && selectedDiagnoses.length < 3
                  
                  return (
                    <motion.div
                      key={diagnosis.id}
                      whileHover={{ scale: canSelect ? 1.02 : 1 }}
                      className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-2 border-blue-500 bg-blue-50' 
                          : canSelect
                            ? 'hover:shadow-lg border-2 border-transparent'
                            : 'opacity-50 cursor-not-allowed border-2 border-transparent'
                      }`}
                      onClick={() => canSelect && handleSelectDiagnosis(diagnosis)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {diagnosis.result.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(diagnosis.completedAt)}</span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <span className="text-white text-sm">✓</span>}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="space-y-8">
              {/* 比較サマリー */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">比較サマリー</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {selectedDiagnoses.map((diagnosis, index) => (
                    <div key={diagnosis.id} className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{diagnosis.result.title}</h3>
                      <p className="text-sm text-gray-500">{formatDate(diagnosis.completedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* スコア比較 */}
              {selectedDiagnoses.every(d => d.result.scores) && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-6">スコア比較</h2>
                  
                  {Object.keys(selectedDiagnoses[0].result.scores!).map((scoreType) => {
                    const typeLabels: Record<string, string> = {
                      creative: 'クリエイティブ',
                      analytical: '分析・戦略',
                      technical: '技術・専門',
                      social: '対人サポート',
                      leadership: 'リーダーシップ'
                    }

                    return (
                      <div key={scoreType} className="mb-6 last:mb-0">
                        <h3 className="font-medium text-gray-900 mb-3">
                          {typeLabels[scoreType] || scoreType}
                        </h3>
                        <div className="space-y-2">
                          {selectedDiagnoses.map((diagnosis, index) => {
                            const score = diagnosis.result.scores![scoreType]
                            const maxScore = Math.max(
                              ...selectedDiagnoses.map(d => d.result.scores![scoreType])
                            )
                            const percentage = (score / maxScore) * 100

                            return (
                              <div key={diagnosis.id} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                  index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600">
                                      {formatDate(diagnosis.completedAt)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{score}</span>
                                      {index > 0 && (
                                        <div className="flex items-center gap-1 text-sm">
                                          {(() => {
                                            const diff = getScoreDifference(score, selectedDiagnoses[0].result.scores![scoreType])
                                            return (
                                              <>
                                                {diff.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                                                {diff.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                                                <span className={diff.trend === 'up' ? 'text-green-600' : diff.trend === 'down' ? 'text-red-600' : 'text-gray-500'}>
                                                  {diff.trend === 'equal' ? '±0' : `${diff.trend === 'up' ? '+' : '-'}${diff.value}`}
                                                </span>
                                              </>
                                            )
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 詳細比較 */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">詳細比較</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedDiagnoses.map((diagnosis, index) => (
                    <div key={diagnosis.id} className="border border-gray-200 rounded-lg p-4">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-center mb-2">{diagnosis.result.title}</h3>
                      <p className="text-sm text-gray-600 text-center mb-3">
                        {formatDate(diagnosis.completedAt)}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-4">
                        {diagnosis.result.description}
                      </p>
                      <button
                        onClick={() => router.push(`/results/${diagnosis.id}`)}
                        className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        詳細を見る →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
}