'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDiagnosisStore } from '@/lib/store/diagnosisStore'
import { useUserStore } from '@/lib/store/userStore'
import { DiagnosisType, Question } from '@/lib/types'
import QuestionCard from '@/components/diagnosis/QuestionCard'
import ProgressBar from '@/components/diagnosis/ProgressBar'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import questionsData from '@/data/questions.json'
import { v4 as uuidv4 } from 'uuid'

export default function DiagnosisPage() {
  const router = useRouter()
  const params = useParams()
  const diagnosisType = params.type as DiagnosisType
  
  const {
    currentQuestionIndex,
    currentDiagnosisId,
    answers,
    startDiagnosis,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    completeDiagnosis
  } = useDiagnosisStore()
  
  const { userData } = useUserStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (diagnosisType && questionsData[diagnosisType as keyof typeof questionsData]) {
      const typeQuestions = questionsData[diagnosisType as keyof typeof questionsData] as Question[]
      setQuestions(typeQuestions)
      startDiagnosis(diagnosisType)
      setIsLoading(false)
    } else {
      router.push('/')
    }
  }, [diagnosisType, startDiagnosis, router])

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id)?.value
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const canProceed = currentAnswer !== undefined

  const handleAnswer = (value: string | number) => {
    if (currentQuestion && currentDiagnosisId) {
      answerQuestion(currentQuestion.id, value)
      
      // 回答後、少し遅延してから自動で次に進む
      setTimeout(() => {
        if (isLastQuestion) {
          completeDiagnosis()
          router.push(`/results/${currentDiagnosisId}`)
        } else {
          nextQuestion()
        }
      }, 500) // 500ms後に自動遷移
    }
  }

  const handleNext = () => {
    if (isLastQuestion && currentDiagnosisId) {
      completeDiagnosis()
      router.push(`/results/${currentDiagnosisId}`)
    } else {
      nextQuestion()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion()
    }
  }

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">診断を準備しています...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ホームに戻る
            </button>
          </div>

          <ProgressBar 
            current={currentQuestionIndex + 1} 
            total={questions.length} 
          />

          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              currentAnswer={currentAnswer}
              onAnswer={handleAnswer}
            />
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              前の質問
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                選択肢をタップすると自動で次に進みます
              </p>
              {canProceed && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm"
                >
                  手動で{isLastQuestion ? '結果を見る' : '次へ進む'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}