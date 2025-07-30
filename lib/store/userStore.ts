import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserData, Diagnosis, Reward } from '@/lib/types'
import { LocalStorageManager } from '@/lib/storage/localStorage'
import { getErrorMessage } from '@/lib/utils'

interface UserStore {
  userData: UserData | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadUserData: () => void
  addDiagnosis: (diagnosis: Diagnosis) => boolean
  addReward: (reward: Reward) => boolean
  updatePoints: (points: number) => boolean
  removeDiagnosis: (diagnosisId: string) => boolean
  removeMultipleDiagnoses: (diagnosisIds: string[]) => boolean
  clearUserData: () => boolean
  exportData: () => string | null
  importData: (dataString: string) => boolean
  setError: (error: string | null) => void
}

const storageManager = LocalStorageManager.getInstance()

// 共通のエラーハンドリング関数
const handleStoreOperation = <T>(
  operation: () => T,
  set: (state: Partial<UserStore>) => void,
  errorMessage: string
): T | false => {
  try {
    const result = operation()
    set({ error: null })
    return result
  } catch (error) {
    const message = getErrorMessage(error, errorMessage)
    set({ error: message })
    console.error(errorMessage, error)
    return false as T
  }
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userData: null,
      isLoading: false,
      error: null,
      
      setError: (error: string | null) => set({ error }),
      
      loadUserData: () => {
        return handleStoreOperation(
          () => {
            set({ isLoading: true })
            const userData = storageManager.getUserData()
            set({ userData, isLoading: false })
            return userData
          },
          set,
          'Failed to load user data'
        )
      },
      
      addDiagnosis: (diagnosis: Diagnosis) => {
        return handleStoreOperation(
          () => {
            const success = storageManager.addDiagnosis(diagnosis)
            if (success) {
              const updatedData = storageManager.getUserData()
              set({ userData: updatedData })
            }
            return success
          },
          set,
          'Failed to add diagnosis'
        ) as boolean
      },
      
      addReward: (reward: Reward) => {
        return handleStoreOperation(
          () => {
            const success = storageManager.addReward(reward)
            if (success) {
              const updatedData = storageManager.getUserData()
              set({ userData: updatedData })
            }
            return success
          },
          set,
          'Failed to add reward'
        ) as boolean
      },
      
      updatePoints: (points: number) => {
        return handleStoreOperation(
          () => {
            const success = storageManager.updatePoints(points)
            if (success) {
              const updatedData = storageManager.getUserData()
              set({ userData: updatedData })
            }
            return success
          },
          set,
          'Failed to update points'
        ) as boolean
      },
      
      removeDiagnosis: (diagnosisId: string) => {
        return handleStoreOperation(
          () => {
            const success = storageManager.removeDiagnosis(diagnosisId)
            if (success) {
              const updatedData = storageManager.getUserData()
              set({ userData: updatedData })
            }
            return success
          },
          set,
          'Failed to remove diagnosis'
        ) as boolean
      },
      
      removeMultipleDiagnoses: (diagnosisIds: string[]) => {
        return handleStoreOperation(
          () => {
            const success = storageManager.removeMultipleDiagnoses(diagnosisIds)
            if (success) {
              const updatedData = storageManager.getUserData()
              set({ userData: updatedData })
            }
            return success
          },
          set,
          'Failed to remove diagnoses'
        ) as boolean
      },
      
      clearUserData: () => {
        return handleStoreOperation(
          () => {
            const success = storageManager.clearUserData()
            if (success) {
              set({ userData: null })
            }
            return success
          },
          set,
          'Failed to clear user data'
        ) as boolean
      },
      
      exportData: () => {
        return handleStoreOperation(
          () => storageManager.exportUserData(),
          set,
          'Failed to export data'
        ) as string | null
      },
      
      importData: (dataString: string) => {
        return handleStoreOperation(
          () => {
            const success = storageManager.importUserData(dataString)
            if (success) {
              const updatedData = storageManager.getUserData()
              set({ userData: updatedData })
            }
            return success
          },
          set,
          'Failed to import data'
        ) as boolean
      }
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ userData: state.userData })
    }
  )
)