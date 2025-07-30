'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store/userStore'
import { useDiagnosisStore } from '@/lib/store/diagnosisStore'
import { ArrowLeft, Trash2, RefreshCw, Download, AlertTriangle } from 'lucide-react'

export default function DebugPage() {
  const router = useRouter()
  const { userData, loadUserData, clearUserData } = useUserStore()
  const { resetDiagnosis } = useDiagnosisStore()
  const [isClearing, setIsClearing] = useState(false)
  const [clearSuccess, setClearSuccess] = useState(false)

  const handleClearAllData = async () => {
    if (confirm('全てのデータを削除しますか？この操作は取り消せません。')) {
      setIsClearing(true)
      try {
        // ストアのデータをクリア
        await clearUserData()
        resetDiagnosis()
        
        // ローカルストレージを完全にクリア
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        
        setClearSuccess(true)
        setTimeout(() => {
          setClearSuccess(false)
          loadUserData()
        }, 2000)
      } catch (error) {
        console.error('データクリア中にエラーが発生:', error)
        alert('データクリア中にエラーが発生しました')
      } finally {
        setIsClearing(false)
      }
    }
  }

  const handleReloadData = async () => {
    await loadUserData()
  }

  const exportLocalStorageData = () => {
    if (typeof window === 'undefined') return
    
    const allData: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key) || 'null')
        } catch {
          allData[key] = localStorage.getItem(key)
        }
      }
    }
    
    const dataStr = JSON.stringify(allData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `debug-localStorage-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ホームに戻る
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">デバッグ・メンテナンス</h1>
            </div>
            <p className="text-gray-600 mb-6">
              開発者向けの機能です。データの問題が発生した場合にご利用ください。
            </p>

            {clearSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                データが正常にクリアされました！
              </div>
            )}

            <div className="grid gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">データ状態</h3>
                <div className="space-y-2 text-sm">
                  <div>ユーザーデータ: {userData ? '存在' : '未設定'}</div>
                  {userData && (
                    <>
                      <div>診断履歴数: {userData.completedDiagnoses.length}件</div>
                      <div>ポイント: {userData.points}</div>
                      <div>作成日: {new Date(userData.createdAt).toLocaleString('ja-JP')}</div>
                    </>
                  )}
                  <div>LocalStorage使用量: {typeof window !== 'undefined' ? `${JSON.stringify(localStorage).length} 文字` : 'N/A'}</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">メンテナンス操作</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleReloadData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    データを再読み込み
                  </button>
                  
                  <button
                    onClick={exportLocalStorageData}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    LocalStorageデータをエクスポート
                  </button>
                  
                  <button
                    onClick={handleClearAllData}
                    disabled={isClearing}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isClearing ? 'クリア中...' : '全データをクリア'}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">LocalStorageの内容</h3>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono max-h-60 overflow-auto">
                  {typeof window !== 'undefined' ? (
                    <pre>
                      {JSON.stringify(
                        Object.fromEntries(
                          Array.from({ length: localStorage.length }, (_, i) => {
                            const key = localStorage.key(i)!
                            try {
                              return [key, JSON.parse(localStorage.getItem(key)!)]
                            } catch {
                              return [key, localStorage.getItem(key)]
                            }
                          })
                        ),
                        null,
                        2
                      )}
                    </pre>
                  ) : (
                    'サーバーサイド - LocalStorageにアクセスできません'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">注意事項</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 「全データをクリア」は全ての診断履歴とユーザーデータを削除します</li>
                  <li>• この操作は取り消すことができません</li>
                  <li>• データに問題がある場合のみ使用してください</li>
                  <li>• 本番環境では使用しないでください</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}