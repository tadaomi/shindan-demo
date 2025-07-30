/**
 * 診断システム共通定数
 */

// 職種適性タイプのラベルマッピング
export const JOB_TYPE_LABELS: Record<string, string> = {
  creative: 'クリエイティブ',
  analytical: '分析・戦略',
  technical: '技術・専門',
  social: '対人サポート',
  leadership: 'リーダーシップ'
}

// 背景グラデーションクラス
export const BACKGROUND_GRADIENTS = {
  primary: 'bg-gradient-to-br from-blue-50 to-indigo-100',
  results: 'bg-gradient-to-br from-blue-50 to-indigo-100',
  debug: 'bg-gradient-to-br from-red-50 to-orange-100',
  gacha: 'bg-gradient-to-br from-purple-50 to-pink-100'
} as const

// カラーパレット
export const COLORS = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700'
  }
} as const