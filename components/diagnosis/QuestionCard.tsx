'use client'

import { Question } from '@/lib/types'
import { motion } from 'framer-motion'

interface QuestionCardProps {
  question: Question
  currentAnswer?: string | number
  onAnswer: (value: string | number) => void
}

export default function QuestionCard({ question, currentAnswer, onAnswer }: QuestionCardProps) {
  if (question.type === 'single' && question.options) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{question.text}</h2>
        <div className="space-y-3">
          {question.options.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => onAnswer(option.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                currentAnswer === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {currentAnswer === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-sm">✓</span>
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    )
  }

  if (question.type === 'scale') {
    const scale = Array.from(
      { length: (question.max || 5) - (question.min || 1) + 1 },
      (_, i) => (question.min || 1) + i
    )

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{question.text}</h2>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">低い</span>
          <span className="text-sm text-gray-500">高い</span>
        </div>
        <div className="flex gap-2">
          {scale.map((value) => (
            <motion.button
              key={value}
              onClick={() => onAnswer(value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-4 rounded-lg font-semibold transition-all duration-200 ${
                currentAnswer === value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {value}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )
  }

  return null
}