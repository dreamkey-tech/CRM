import { apiClient } from './client'

export interface CrmNotification {
  id: string
  userId?: string | null
  requiredPermission?: string | null
  targetRole?: string | null
  title: string
  message: string
  type: string
  link?: string | null
  isRead: boolean
  readAt?: string | null
  metadata?: any
  createdAt: string
}

export interface ListNotificationsResponse {
  success: boolean
  notifications: CrmNotification[]
  unreadCount: number
}

export async function fetchNotifications(): Promise<{
  notifications: CrmNotification[]
  unreadCount: number
}> {
  const response = await apiClient.get<ListNotificationsResponse>('/notifications')
  return {
    notifications: response.data.notifications || [],
    unreadCount: response.data.unreadCount || 0,
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const response = await apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`)
  return response.data.success
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  const response = await apiClient.patch<{ success: boolean; count: number }>(
    '/notifications/read-all'
  )
  return response.data.success
}
