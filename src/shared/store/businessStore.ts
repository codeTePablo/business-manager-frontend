import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Business } from '@/shared/types'

interface BusinessState {
  activeBusiness: Business | null
  setActiveBusiness: (b: Business) => void
  clearBusiness: () => void
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      activeBusiness: null,
      setActiveBusiness: (b) => set({ activeBusiness: b }),
      clearBusiness: () => set({ activeBusiness: null }),
    }),
    { name: 'abastos-business', storage: createJSONStorage(() => sessionStorage) }
  )
)
