import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const MAX_COMPARE = 3

interface CompareState {
  ids: string[]
  add: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  isSelected: (id: string) => boolean
  get count(): number
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],

      add: (id: string) => {
        const { ids } = get()
        if (ids.includes(id)) return
        if (ids.length >= MAX_COMPARE) return
        set({ ids: [...ids, id] })
      },

      remove: (id: string) => {
        set({ ids: get().ids.filter((i) => i !== id) })
      },

      clear: () => set({ ids: [] }),

      isSelected: (id: string) => get().ids.includes(id),

      get count() {
        return get().ids.length
      },
    }),
    {
      name: 'hmz-compare',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
        return localStorage
      }),
      skipHydration: true,
    }
  )
)
