import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserData, Diagnosis, Reward } from '@/lib/types'
import { LocalStorageManager } from '@/lib/storage/localStorage'

interface UserStore {
  userData: UserData | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadUserData: () => Promise<void>
  addDiagnosis: (diagnosis: Diagnosis) => Promise<boolean>
  addReward: (reward: Reward) => Promise<boolean>
  updatePoints: (points: number) => Promise<boolean>
  removeDiagnosis: (diagnosisId: string) => Promise<boolean>
  removeMultipleDiagnoses: (diagnosisIds: string[]) => Promise<boolean>
  clearUserData: () => Promise<boolean>
  exportData: () => string | null
  importData: (dataString: string) => Promise<boolean>
}

const storageManager = LocalStorageManager.getInstance()

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userData: null,
      isLoading: false,
      error: null,
      
      loadUserData: async () => {
        set({ isLoading: true, error: null })
        try {
          const userData = storageManager.getUserData()
          set({ userData, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load user data',
            isLoading: false 
          })
        }
      },
      
      addDiagnosis: async (diagnosis: Diagnosis) => {
        const { userData } = get()
        if (!userData) return false
        
        try {
          const success = storageManager.addDiagnosis(diagnosis)
          if (success) {
            const updatedData = storageManager.getUserData()
            set({ userData: updatedData })
          }
          return success
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add diagnosis'
          })
          return false
        }
      },
      
      addReward: async (reward: Reward) => {
        const { userData } = get()
        if (!userData) return false
        
        try {
          const success = storageManager.addReward(reward)
          if (success) {
            const updatedData = storageManager.getUserData()
            set({ userData: updatedData })
          }
          return success
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add reward'
          })
          return false
        }
      },
      
      updatePoints: async (points: number) => {
        const { userData } = get()
        if (!userData) return false
        
        try {
          const success = storageManager.updatePoints(points)
          if (success) {
            const updatedData = storageManager.getUserData()
            set({ userData: updatedData })
          }
          return success
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update points'
          })
          return false
        }
      },
      
      removeDiagnosis: async (diagnosisId: string) => {
        const { userData } = get()
        if (!userData) return false
        
        try {
          const success = storageManager.removeDiagnosis(diagnosisId)
          if (success) {
            const updatedData = storageManager.getUserData()
            set({ userData: updatedData })
          }
          return success
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove diagnosis'
          })
          return false
        }
      },
      
      removeMultipleDiagnoses: async (diagnosisIds: string[]) => {
        const { userData } = get()
        if (!userData) return false
        
        try {
          const success = storageManager.removeMultipleDiagnoses(diagnosisIds)
          if (success) {
            const updatedData = storageManager.getUserData()
            set({ userData: updatedData })
          }
          return success
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove diagnoses'
          })
          return false
        }
      },
      
      clearUserData: async () => {
        try {
          const success = storageManager.clearUserData()
          if (success) {
            set({ userData: null })
          }
          return success
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to clear user data'
          })
          return false
        }
      },
      
      exportData: () => {
        try {
          return storageManager.exportUserData()
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to export data'
          })
          return null
        }
      },
      
      importData: async (dataString: string) => {
        try {
          const success = storageManager.importUserData(dataString)
          if (success) {
            const updatedData = storageManager.getUserData()
            set({ userData: updatedData })
          }
          return success
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to import data'
          })
          return false
        }
      }
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ userData: state.userData })
    }
  )
)