'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/lib/store/userStore'
import { Diagnosis } from '@/lib/types'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { downloadJSON, formatDateJP } from '@/lib/utils'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { JOB_TYPE_LABELS, BACKGROUND_GRADIENTS, COLORS } from '@/lib/constants'
import { ArrowLeft, Calendar, FileText, Download, Trash2, Search, BarChart3, X } from 'lucide-react'

export default function HistoryPage() {
  const router = useRouter()
  const { userData, loadUserData, removeDiagnosis, removeMultipleDiagnoses } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date')
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  
  // フィルタリングとソートを最適化
  const filteredDiagnoses = useMemo(() => {
    if (!userData?.completedDiagnoses) return []
    
    let filtered = userData.completedDiagnoses.filter(diagnosis =>
      diagnosis.result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.result.type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // ソート
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      } else {
        return a.result.title.localeCompare(b.result.title)
      }
    })
  }, [userData?.completedDiagnoses, searchTerm, sortBy])
  
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: 'single' | 'multiple'
    diagnosisId?: string
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'single',
    title: '',
    message: ''
  })

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // 最適化されたコールバック関数
  const handleExportData = useCallback(() => {
    if (userData) {
      const filename = `shindan-data-${new Date().toISOString().split('T')[0]}.json`
      downloadJSON(userData, filename)
    }
  }, [userData])

  const handleDeleteSingle = useCallback((diagnosis: Diagnosis) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      diagnosisId: diagnosis.id,
      title: '診断結果を削除',
      message: `「${diagnosis.result.title}」の診断結果を削除してもよろしいですか？この操作は取り消すことができません。`
    })
  }, [])

  const handleDeleteMultiple = useCallback(() => {
    if (selectedDiagnoses.length > 0) {
      setDeleteModal({
        isOpen: true,
        type: 'multiple',
        title: '複数の診断結果を削除',
        message: `選択した${selectedDiagnoses.length}件の診断結果を削除してもよろしいですか？この操作は取り消すことができません。`
      })
    }
  }, [selectedDiagnoses.length])

  const handleConfirmDelete = useCallback(() => {
    if (deleteModal.type === 'single' && deleteModal.diagnosisId) {
      removeDiagnosis(deleteModal.diagnosisId)
    } else if (deleteModal.type === 'multiple') {
      removeMultipleDiagnoses(selectedDiagnoses)
      setSelectedDiagnoses([])
      setSelectionMode(false)
    }
  }, [deleteModal, selectedDiagnoses, removeDiagnosis, removeMultipleDiagnoses])

  const toggleSelection = (diagnosisId: string) => {
    setSelectedDiagnoses(prev => 
      prev.includes(diagnosisId)
        ? prev.filter(id => id !== diagnosisId)
        : [...prev, diagnosisId]
    )
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedDiagnoses([])
  }

  const selectAll = () => {
    setSelectedDiagnoses(filteredDiagnoses.map(d => d.id))
  }

  const clearSelection = () => {
    setSelectedDiagnoses([])
  }

  const getScoreColor = (scores: Record<string, number> | undefined, type: string) => {
    if (!scores) return 'bg-gray-200'
    
    const maxScore = Math.max(...Object.values(scores))
    const score = scores[type] || 0
    const percentage = (score / maxScore) * 100
    
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  if (!userData) {
    return (
      <div className={`min-h-screen ${BACKGROUND_GRADIENTS.primary} flex items-center justify-center`}>
        <LoadingSpinner message="データを読み込んでいます..." />
      </div>
    )
  }

  return (
    <main className={`min-h-screen ${BACKGROUND_GRADIENTS.primary}`}>
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
              <h1 className="text-3xl font-bold text-gray-900">診断履歴</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                合計: {userData.completedDiagnoses.length}件
                {selectionMode && selectedDiagnoses.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    （{selectedDiagnoses.length}件選択中）
                  </span>
                )}
              </span>
              
              {!selectionMode ? (
                <>
                  {userData.completedDiagnoses.length >= 2 && (
                    <button
                      onClick={() => router.push('/compare')}
                      className={`flex items-center gap-2 px-4 py-2 ${COLORS.button.primary} text-white rounded-lg transition-colors text-sm`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      結果を比較
                    </button>
                  )}
                  {userData.completedDiagnoses.length > 0 && (
                    <button
                      onClick={toggleSelectionMode}
                      className={`flex items-center gap-2 px-4 py-2 ${COLORS.button.danger} text-white rounded-lg transition-colors text-sm`}
                    >
                      <Trash2 className="w-4 h-4" />
                      削除
                    </button>
                  )}
                  <button
                    onClick={handleExportData}
                    className={`flex items-center gap-2 px-4 py-2 ${COLORS.button.success} text-white rounded-lg transition-colors text-sm`}
                  >
                    <Download className="w-4 h-4" />
                    データ出力
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={selectAll}
                    disabled={selectedDiagnoses.length === filteredDiagnoses.length}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors disabled:opacity-50"
                  >
                    全選択
                  </button>
                  <button
                    onClick={clearSelection}
                    disabled={selectedDiagnoses.length === 0}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50"
                  >
                    選択解除
                  </button>
                  <button
                    onClick={handleDeleteMultiple}
                    disabled={selectedDiagnoses.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 ${COLORS.button.danger} text-white rounded-lg transition-colors text-sm disabled:opacity-50`}
                  >
                    <Trash2 className="w-4 h-4" />
                    削除 ({selectedDiagnoses.length})
                  </button>
                  <button
                    onClick={toggleSelectionMode}
                    className={`flex items-center gap-2 px-4 py-2 ${COLORS.button.secondary} text-white rounded-lg transition-colors text-sm`}
                  >
                    <X className="w-4 h-4" />
                    キャンセル
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 検索・フィルタ */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="診断結果を検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">日付順</option>
                <option value="type">タイプ順</option>
              </select>
            </div>
          </div>

          {/* 履歴一覧 */}
          {filteredDiagnoses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? '検索結果がありません' : '診断履歴がありません'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? '別のキーワードで検索してみてください' : '診断を受けて履歴を作成しましょう'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/diagnosis/job-aptitude')}
                  className={`px-6 py-3 ${COLORS.button.primary} text-white rounded-lg transition-colors`}
                >
                  診断を始める
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDiagnoses.map((diagnosis, index) => (
                <motion.div
                  key={diagnosis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all ${
                    selectionMode 
                      ? selectedDiagnoses.includes(diagnosis.id)
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : 'border-2 border-transparent'
                      : 'cursor-pointer'
                  }`}
                  onClick={(e) => {
                    if (selectionMode) {
                      toggleSelection(diagnosis.id)
                    } else {
                      router.push(`/results/${diagnosis.id}`)
                    }
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* 選択チェックボックス */}
                      {selectionMode && (
                        <div className="mr-4 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedDiagnoses.includes(diagnosis.id)}
                            onChange={() => toggleSelection(diagnosis.id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {diagnosis.result.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getScoreColor(diagnosis.result.scores, diagnosis.result.type)}`}>
                            {diagnosis.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {diagnosis.result.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateJP(diagnosis.completedAt)}</span>
                          </div>
                          <span>質問数: {diagnosis.answers.length}問</span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-start gap-2">
                        {!selectionMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSingle(diagnosis)
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                    
                    {diagnosis.result.scores && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {Object.entries(diagnosis.result.scores).map(([key, score]) => {
                            const maxScore = Math.max(...Object.values(diagnosis.result.scores!))
                            const percentage = (score / maxScore) * 100
                            

                            return (
                              <div key={key} className="text-center">
                                <div className="text-xs text-gray-600 mb-1">
                                  {JOB_TYPE_LABELS[key] || key}
                                </div>
                                <div className="bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="text-xs font-medium text-gray-700 mt-1">
                                  {score}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 削除確認モーダル */}
          <DeleteConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
            onConfirm={handleConfirmDelete}
            title={deleteModal.title}
            message={deleteModal.message}
          />
        </div>
      </div>
    </main>
  )
}