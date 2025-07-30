import { Answer, DiagnosisResult } from '@/lib/types'
import resultsData from '@/data/results.json'

interface ScoreWeights {
  creative: number
  analytical: number
  technical: number
  social: number
  leadership: number
}

export function calculateJobAptitudeResult(answers: Answer[]): DiagnosisResult {
  const scores: ScoreWeights = {
    creative: 0,
    analytical: 0,
    technical: 0,
    social: 0,
    leadership: 0
  }

  // 各回答を分析してスコアを計算
  answers.forEach((answer) => {
    switch (answer.questionId) {
      case 'q1': // 仕事で重要なもの
        if (answer.value === 'growth') {
          scores.technical += 2
          scores.analytical += 1
        } else if (answer.value === 'stability') {
          scores.social += 2
          scores.analytical += 1
        } else if (answer.value === 'impact') {
          scores.social += 2
          scores.leadership += 1
        } else if (answer.value === 'creativity') {
          scores.creative += 3
        }
        break

      case 'q2': // 職場環境
        if (answer.value === 'collaborative') {
          scores.social += 2
          scores.leadership += 1
        } else if (answer.value === 'independent') {
          scores.technical += 2
          scores.creative += 1
        } else if (answer.value === 'structured') {
          scores.analytical += 2
          scores.technical += 1
        } else if (answer.value === 'flexible') {
          scores.creative += 2
          scores.leadership += 1
        }
        break

      case 'q3': // 新技術への興味
        const techInterest = Number(answer.value)
        scores.technical += techInterest
        scores.creative += Math.max(0, techInterest - 2)
        scores.analytical += Math.max(0, techInterest - 1)
        break

      case 'q4': // 問題解決アプローチ
        if (answer.value === 'analytical') {
          scores.analytical += 3
        } else if (answer.value === 'creative') {
          scores.creative += 3
        } else if (answer.value === 'collaborative') {
          scores.social += 2
          scores.leadership += 1
        } else if (answer.value === 'practical') {
          scores.technical += 2
          scores.analytical += 1
        }
        break

      case 'q5': // 作業スタイル
        if (answer.value === 'detail') {
          scores.technical += 2
          scores.analytical += 1
        } else if (answer.value === 'speed') {
          scores.technical += 1
          scores.leadership += 1
        } else if (answer.value === 'strategic') {
          scores.analytical += 2
          scores.leadership += 2
        } else if (answer.value === 'innovative') {
          scores.creative += 3
        }
        break

      case 'q6': // 人との接触好感度
        const socialLevel = Number(answer.value)
        scores.social += socialLevel
        scores.leadership += Math.max(0, socialLevel - 2)
        scores.creative += Math.max(0, socialLevel - 1)
        break

      case 'q7': // キャリア方向性
        if (answer.value === 'specialist') {
          scores.technical += 3
        } else if (answer.value === 'manager') {
          scores.leadership += 3
        } else if (answer.value === 'entrepreneur') {
          scores.leadership += 2
          scores.creative += 2
        } else if (answer.value === 'generalist') {
          scores.social += 2
          scores.analytical += 1
        }
        break

      case 'q8': // 働く時間の理想
        if (answer.value === 'fixed') {
          scores.analytical += 1
          scores.social += 1
        } else if (answer.value === 'flexible') {
          scores.creative += 1
          scores.technical += 1
        } else if (answer.value === 'remote') {
          scores.technical += 2
          scores.creative += 1
        } else if (answer.value === 'project') {
          scores.leadership += 2
          scores.creative += 1
        }
        break

      case 'q9': // リスク許容度
        const riskLevel = Number(answer.value)
        scores.leadership += riskLevel
        scores.creative += Math.max(0, riskLevel - 2)
        scores.technical += Math.max(0, 3 - riskLevel)
        break

      case 'q10': // やりがいを感じる瞬間
        if (answer.value === 'achievement') {
          scores.leadership += 2
          scores.technical += 1
        } else if (answer.value === 'recognition') {
          scores.leadership += 2
          scores.creative += 1
        } else if (answer.value === 'helping') {
          scores.social += 3
        } else if (answer.value === 'learning') {
          scores.technical += 2
          scores.analytical += 1
        }
        break
    }
  })

  // 最高スコアの職種タイプを決定
  const maxScore = Math.max(...Object.values(scores))
  const resultType = Object.keys(scores).find(
    key => scores[key as keyof ScoreWeights] === maxScore
  ) as keyof typeof resultsData['job-aptitude']

  const result = resultsData['job-aptitude'][resultType]

  return {
    type: result.type,
    title: result.title,
    description: result.description,
    scores: scores as unknown as Record<string, number>,
    recommendations: result.recommendations,
    imageUrl: result.imageUrl
  }
}