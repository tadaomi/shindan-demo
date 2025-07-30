import { UserData, Diagnosis, Reward } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'shindan_user_data'
const STORAGE_LIMIT = 5 * 1024 * 1024 // 5MB

export class LocalStorageManager {
  private static instance: LocalStorageManager
  
  private constructor() {}
  
  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager()
    }
    return LocalStorageManager.instance
  }
  
  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }
  
  private calculateStorageSize(): number {
    if (!this.isClient()) return 0
    
    let size = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length
      }
    }
    return size * 2 // UTF-16 encoding
  }
  
  private checkStorageLimit(): boolean {
    return this.calculateStorageSize() < STORAGE_LIMIT
  }
  
  getUserData(): UserData | null {
    if (!this.isClient()) return null
    
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const userData = JSON.parse(data) as UserData
        // データ整合性チェック
        if (this.validateUserData(userData)) {
          return userData
        } else {
          console.warn('Invalid user data detected, creating new user data')
          this.clearUserData()
          return this.createNewUserData()
        }
      }
      
      // 新規ユーザーの場合
      return this.createNewUserData()
    } catch (error) {
      console.error('Failed to get user data:', error)
      console.warn('Clearing corrupted data and creating new user data')
      this.clearUserData()
      return this.createNewUserData()
    }
  }

  private createNewUserData(): UserData {
    const newUserData: UserData = {
      userId: uuidv4(),
      completedDiagnoses: [],
      points: 0,
      unlockedRewards: [],
      preferences: {
        theme: 'system',
        notifications: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.saveUserData(newUserData)
    return newUserData
  }

  private validateUserData(userData: any): userData is UserData {
    return (
      userData &&
      typeof userData === 'object' &&
      typeof userData.userId === 'string' &&
      Array.isArray(userData.completedDiagnoses) &&
      typeof userData.points === 'number' &&
      Array.isArray(userData.unlockedRewards) &&
      userData.preferences &&
      typeof userData.preferences === 'object' &&
      typeof userData.createdAt === 'string' &&
      typeof userData.updatedAt === 'string'
    )
  }
  
  saveUserData(userData: UserData): boolean {
    if (!this.isClient()) return false
    
    try {
      userData.updatedAt = new Date().toISOString()
      const dataString = JSON.stringify(userData)
      
      // ストレージ容量チェック
      if (!this.checkStorageLimit()) {
        this.cleanupOldData(userData)
      }
      
      localStorage.setItem(STORAGE_KEY, dataString)
      return true
    } catch (error) {
      console.error('Failed to save user data:', error)
      return false
    }
  }
  
  private cleanupOldData(userData: UserData): void {
    // 古い診断結果を削除（最新10件を保持）
    if (userData.completedDiagnoses.length > 10) {
      userData.completedDiagnoses = userData.completedDiagnoses
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 10)
    }
    
    // 古い報酬を削除（最新20件を保持）
    if (userData.unlockedRewards.length > 20) {
      userData.unlockedRewards = userData.unlockedRewards
        .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
        .slice(0, 20)
    }
  }
  
  addDiagnosis(diagnosis: Diagnosis): boolean {
    const userData = this.getUserData()
    if (!userData) return false
    
    // 既に同じIDの診断が存在する場合は追加しない
    const existingDiagnosis = userData.completedDiagnoses.find(d => d.id === diagnosis.id)
    if (existingDiagnosis) {
      console.log('Diagnosis with this ID already exists:', diagnosis.id)
      return true // 既に存在するため成功として扱う
    }
    
    userData.completedDiagnoses.push(diagnosis)
    userData.points += 10 // 診断完了で10ポイント獲得
    
    return this.saveUserData(userData)
  }
  
  addReward(reward: Reward): boolean {
    const userData = this.getUserData()
    if (!userData) return false
    
    // 報酬に一意のIDを付与（同じ報酬を複数回獲得する場合の重複を防ぐ）
    const rewardWithUniqueId = {
      ...reward,
      id: `${reward.id}_${Date.now()}_${uuidv4().slice(0, 8)}`
    }
    
    userData.unlockedRewards.push(rewardWithUniqueId)
    
    return this.saveUserData(userData)
  }
  
  updatePoints(points: number): boolean {
    const userData = this.getUserData()
    if (!userData) return false
    
    userData.points = points
    
    return this.saveUserData(userData)
  }
  
  removeDiagnosis(diagnosisId: string): boolean {
    const userData = this.getUserData()
    if (!userData) return false
    
    userData.completedDiagnoses = userData.completedDiagnoses.filter(
      diagnosis => diagnosis.id !== diagnosisId
    )
    
    return this.saveUserData(userData)
  }
  
  removeMultipleDiagnoses(diagnosisIds: string[]): boolean {
    const userData = this.getUserData()
    if (!userData) return false
    
    userData.completedDiagnoses = userData.completedDiagnoses.filter(
      diagnosis => !diagnosisIds.includes(diagnosis.id)
    )
    
    return this.saveUserData(userData)
  }
  
  clearUserData(): boolean {
    if (!this.isClient()) return false
    
    try {
      localStorage.removeItem(STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear user data:', error)
      return false
    }
  }
  
  exportUserData(): string | null {
    const userData = this.getUserData()
    if (!userData) return null
    
    try {
      return JSON.stringify(userData, null, 2)
    } catch (error) {
      console.error('Failed to export user data:', error)
      return null
    }
  }
  
  importUserData(dataString: string): boolean {
    try {
      const userData = JSON.parse(dataString) as UserData
      return this.saveUserData(userData)
    } catch (error) {
      console.error('Failed to import user data:', error)
      return false
    }
  }
}