import { create } from 'zustand'
import { DiagnosisType, Question, Answer } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

interface DiagnosisState {
  currentDiagnosis: DiagnosisType | null
  currentDiagnosisId: string | null
  currentQuestionIndex: number
  answers: Answer[]
  isCompleted: boolean
  
  // Actions
  startDiagnosis: (type: DiagnosisType) => void
  answerQuestion: (questionId: string, value: string | number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeDiagnosis: () => void
  resetDiagnosis: () => void
}

export const useDiagnosisStore = create<DiagnosisState>((set) => ({
  currentDiagnosis: null,
  currentDiagnosisId: null,
  currentQuestionIndex: 0,
  answers: [],
  isCompleted: false,
  
  startDiagnosis: (type: DiagnosisType) => {
    set({
      currentDiagnosis: type,
      currentDiagnosisId: uuidv4(),
      currentQuestionIndex: 0,
      answers: [],
      isCompleted: false
    })
  },
  
  answerQuestion: (questionId: string, value: string | number) => {
    set((state) => {
      const existingAnswerIndex = state.answers.findIndex(
        (answer) => answer.questionId === questionId
      )
      
      const newAnswer: Answer = {
        questionId,
        value,
        answeredAt: new Date().toISOString()
      }
      
      const newAnswers = [...state.answers]
      
      if (existingAnswerIndex >= 0) {
        newAnswers[existingAnswerIndex] = newAnswer
      } else {
        newAnswers.push(newAnswer)
      }
      
      return { answers: newAnswers }
    })
  },
  
  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1
    }))
  },
  
  previousQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
    }))
  },
  
  completeDiagnosis: () => {
    set({ isCompleted: true })
  },
  
  resetDiagnosis: () => {
    set({
      currentDiagnosis: null,
      currentDiagnosisId: null,
      currentQuestionIndex: 0,
      answers: [],
      isCompleted: false
    })
  }
}))