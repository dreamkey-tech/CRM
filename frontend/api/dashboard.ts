import { apiClient } from './client'

export interface StatCardItem {
  id: string
  label: string
  value: string
  sub: string
  icon: string
  color: string
}

export interface BriefingItem {
  id: string | number
  icon: string
  accent: string
  label: string
  title: string
  description: string
  badge: string
  badgeBg: string
  link?: string
}

export interface DashboardOverviewResponse {
  success: boolean
  data: {
    stats: StatCardItem[]
    briefing: BriefingItem[]
  }
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewResponse['data']> {
  const response = await apiClient.get<DashboardOverviewResponse>('/dashboard/overview')
  return response.data.data
}
