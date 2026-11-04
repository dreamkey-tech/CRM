import { create } from 'zustand'
import { toast } from '../utils/toast'

interface RefreshStore {
  refreshTick: number
  isRefreshing: boolean
  triggerRefresh: () => void
}

export const useRefreshStore = create<RefreshStore>((set) => ({
  refreshTick: 0,
  isRefreshing: false,
  triggerRefresh: () => {
    set((state) => ({ isRefreshing: true, refreshTick: state.refreshTick + 1 }))
   // toast.success('Active view refreshed', 'All live data has been updated.')
    setTimeout(() => {
      set({ isRefreshing: false })
    }, 600)
  },
}))
