/**
 * 適職診断システム - 計算ロジック
 * 
 * 10個の質問に対する回答を分析し、5つの職種タイプから最適な適職を判定します。
 * 詳細な計算ロジックについては /docs/calculation-logic.md を参照してください。
 * 
 * @author Generated with Claude Code
 * @version 1.0.0
 */

import { Answer, DiagnosisResult } from '@/lib/types'
import resultsData from '@/data/results.json'

/**
 * 5つの職種タイプごとのスコア重み
 */
interface ScoreWeights {
  creative: number      // クリエイティブ職: 創造性と革新性重視
  analytical: number    // 分析・戦略職: データと論理重視
  technical: number     // 技術・専門職: 専門知識と技術力重視
  social: number        // 対人サポート職: 人との接触と貢献重視
  leadership: number    // リーダー・マネジメント職: チーム統率と戦略立案重視
}

/**
 * 適職診断の計算メイン関数
 * 
 * @param answers 10個の質問に対する回答配列
 * @returns 診断結果オブジェクト（タイトル、説明、スコア、推奨職種を含む）
 */
export function calculateJobAptitudeResult(answers: Answer[]): DiagnosisResult {
  // 5つの職種タイプのスコアを初期化
  const scores: ScoreWeights = {
    creative: 0,
    analytical: 0,
    technical: 0,
    social: 0,
    leadership: 0
  }

  // 各回答を分析してスコアを計算
  // 配点詳細は /docs/calculation-logic.md を参照
  answers.forEach((answer) => {
    switch (answer.questionId) {
      case 'q1': // 仕事で重要なもの - 価値観の根本を測定
        if (answer.value === 'growth') {
          // 自己成長志向 → 技術力向上と分析的思考に寄与
          scores.technical += 2
          scores.analytical += 1
        } else if (answer.value === 'stability') {
          // 安定志向 → 対人関係重視と分析的判断に寄与
          scores.social += 2
          scores.analytical += 1
        } else if (answer.value === 'impact') {
          // 社会貢献志向 → 対人支援とリーダーシップに寄与
          scores.social += 2
          scores.leadership += 1
        } else if (answer.value === 'creativity') {
          // 創造性重視 → クリエイティブ職に強く寄与
          scores.creative += 3
        }
        break

      case 'q2': // 職場環境 - 働き方の志向を評価
        if (answer.value === 'collaborative') {
          // チームワーク重視 → 対人関係とリーダーシップに寄与
          scores.social += 2
          scores.leadership += 1
        } else if (answer.value === 'independent') {
          // 個人裁量重視 → 技術的独立性と創造的自由度に寄与
          scores.technical += 2
          scores.creative += 1
        } else if (answer.value === 'structured') {
          // 構造化志向 → 分析的思考と技術的体系性に寄与
          scores.analytical += 2
          scores.technical += 1
        } else if (answer.value === 'flexible') {
          // 柔軟性重視 → 創造的適応力とリーダーシップに寄与
          scores.creative += 2
          scores.leadership += 1
        }
        break

      case 'q3': // 新技術への興味 - 技術志向の強さを段階的評価
        const techInterest = Number(answer.value)
        // 技術興味度をそのまま技術スコアに反映
        scores.technical += techInterest
        // 高い技術興味は創造性にも寄与（3以上で効果）
        scores.creative += Math.max(0, techInterest - 2)
        // 中程度以上の技術興味は分析力にも寄与（2以上で効果）
        scores.analytical += Math.max(0, techInterest - 1)
        break

      case 'q4': // 問題解決アプローチ - 根本的思考パターンを判定
        if (answer.value === 'analytical') {
          // データ分析志向 → 分析職の核となる特徴
          scores.analytical += 3
        } else if (answer.value === 'creative') {
          // 創造的解決志向 → クリエイティブ職の核となる特徴
          scores.creative += 3
        } else if (answer.value === 'collaborative') {
          // 協力的解決志向 → 対人関係とチーム統率に寄与
          scores.social += 2
          scores.leadership += 1
        } else if (answer.value === 'practical') {
          // 実践的解決志向 → 技術的経験と分析的判断に寄与
          scores.technical += 2
          scores.analytical += 1
        }
        break

      case 'q5': // 作業スタイル - 日常業務での行動特性を測定
        if (answer.value === 'detail') {
          // 細部重視 → 技術的精密性と分析的注意力に寄与
          scores.technical += 2
          scores.analytical += 1
        } else if (answer.value === 'speed') {
          // 効率重視 → 技術的生産性とリーダーシップに寄与
          scores.technical += 1
          scores.leadership += 1
        } else if (answer.value === 'strategic') {
          // 戦略重視 → 分析力とリーダーシップの両方に強く寄与
          scores.analytical += 2
          scores.leadership += 2
        } else if (answer.value === 'innovative') {
          // 革新重視 → クリエイティブ職の核となる特徴
          scores.creative += 3
        }
        break

      case 'q6': // 人との接触好感度 - 対人志向の強さを段階的評価
        const socialLevel = Number(answer.value)
        // 対人好感度をそのまま社会性スコアに反映
        scores.social += socialLevel
        // 高い対人好感度はリーダーシップにも寄与（3以上で効果）
        scores.leadership += Math.max(0, socialLevel - 2)
        // 中程度以上の対人好感度は創造性にも寄与（2以上で効果）
        scores.creative += Math.max(0, socialLevel - 1)
        break

      case 'q7': // キャリア方向性 - 将来志向を明確に判定
        if (answer.value === 'specialist') {
          // 専門特化志向 → 技術職に強く寄与
          scores.technical += 3
        } else if (answer.value === 'manager') {
          // マネジメント志向 → リーダーシップに強く寄与
          scores.leadership += 3
        } else if (answer.value === 'entrepreneur') {
          // 起業志向 → 創造性とリーダーシップの混合特性
          scores.leadership += 2
          scores.creative += 2
        } else if (answer.value === 'generalist') {
          // ジェネラリスト志向 → 対人関係と分析力に寄与
          scores.social += 2
          scores.analytical += 1
        }
        break

      case 'q8': // 働く時間の理想 - 勤務形態の好みから職種適性を推測
        if (answer.value === 'fixed') {
          // 規則的勤務志向 → 分析的規律性と対人関係安定性に寄与
          scores.analytical += 1
          scores.social += 1
        } else if (answer.value === 'flexible') {
          // フレックス志向 → 創造的自由度と技術的柔軟性に寄与
          scores.creative += 1
          scores.technical += 1
        } else if (answer.value === 'remote') {
          // リモート志向 → 技術的独立性と創造的環境に寄与
          scores.technical += 2
          scores.creative += 1
        } else if (answer.value === 'project') {
          // プロジェクト志向 → リーダーシップと創造的挑戦に寄与
          scores.leadership += 2
          scores.creative += 1
        }
        break

      case 'q9': // リスク許容度 - リスク志向と安定志向を評価
        const riskLevel = Number(answer.value)
        // リスク許容度をそのままリーダーシップスコアに反映
        scores.leadership += riskLevel
        // 高いリスク許容度は創造性にも寄与（3以上で効果）
        scores.creative += Math.max(0, riskLevel - 2)
        // 低いリスク許容度（安定志向）は技術職に寄与（逆相関）
        scores.technical += Math.max(0, 3 - riskLevel)
        break

      case 'q10': // やりがいを感じる瞬間 - モチベーション源泉を測定
        if (answer.value === 'achievement') {
          // 達成志向 → リーダーシップと技術的成果に寄与
          scores.leadership += 2
          scores.technical += 1
        } else if (answer.value === 'recognition') {
          // 承認志向 → リーダーシップと創造的表現に寄与
          scores.leadership += 2
          scores.creative += 1
        } else if (answer.value === 'helping') {
          // 貢献志向 → 対人支援職に強く寄与
          scores.social += 3
        } else if (answer.value === 'learning') {
          // 学習志向 → 技術的成長と分析的探求に寄与
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

  // 判定された職種タイプの詳細情報を取得
  const result = resultsData['job-aptitude'][resultType]

  // 診断結果オブジェクトを構築して返却
  return {
    type: result.type,
    title: result.title,
    description: result.description,
    scores: scores as unknown as Record<string, number>, // 全スコアを表示用に含める
    recommendations: result.recommendations,
    imageUrl: result.imageUrl
  }
}