import { create } from 'zustand'
import { fetchDashboardOverview, type StatCardItem, type BriefingItem } from '../api/dashboard'

interface DashboardState {
  stats: StatCardItem[]
  briefing: BriefingItem[]
  isLoading: boolean
  lastFetchedAt: number
  loadOverview: (force?: boolean) => Promise<void>
}

let inFlightOverviewPromise: Promise<{ stats: StatCardItem[]; briefing: BriefingItem[] }> | null = null

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: [],
  briefing: [],
  isLoading: false,
  lastFetchedAt: 0,
  loadOverview: async (force = false) => {
    const { stats, lastFetchedAt } = get()

    // Reuse existing data within 20s unless forced
    if (!force && stats.length > 0 && Date.now() - lastFetchedAt < 20000) {
      return
    }

    // Deduplicate in-flight promises so multiple mounting components share 1 single API call
    if (inFlightOverviewPromise) {
      await inFlightOverviewPromise
      return
    }

    set({ isLoading: stats.length === 0 })

    inFlightOverviewPromise = fetchDashboardOverview()
      .then((data) => {
        set({
          stats: data.stats || [],
          briefing: data.briefing || [],
          lastFetchedAt: Date.now(),
        })
        return data
      })
      .finally(() => {
        inFlightOverviewPromise = null
        set({ isLoading: false })
      })

    await inFlightOverviewPromise
  },
}))
