export type DiagnosisType = 'job-aptitude' | 'culture-match' | 'career-type' | 'industry-aptitude'

export type RewardType = 'novelty' | 'information' | 'discount' | 'special'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
}

export interface Answer {
  questionId: string
  value: string | number
  answeredAt: string
}

export interface DiagnosisResult {
  type: string
  title: string
  description: string
  scores?: Record<string, number>
  recommendations?: string[]
  imageUrl?: string
}

export interface Diagnosis {
  id: string
  type: DiagnosisType
  answers: Answer[]
  result: DiagnosisResult
  completedAt: string
}

export interface Reward {
  id: string
  type: RewardType
  title: string
  description: string
  imageUrl?: string
  unlockedAt: string
}

export interface UserData {
  userId: string
  completedDiagnoses: Diagnosis[]
  points: number
  unlockedRewards: Reward[]
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  type: 'single' | 'multiple' | 'scale'
  text: string
  options?: {
    value: string | number
    label: string
  }[]
  min?: number
  max?: number
}

// DiagnosisConfig interface removed - not used in current implementation