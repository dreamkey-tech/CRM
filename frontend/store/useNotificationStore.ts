import { create } from 'zustand'
import {
  fetchNotifications,
  markNotificationAsRead as apiMarkRead,
  markAllNotificationsAsRead as apiMarkAllRead,
  type CrmNotification,
} from '../api/notifications'

interface NotificationState {
  notifications: CrmNotification[]
  unreadCount: number
  isLoading: boolean
  lastFetchedAt: number
  loadNotifications: (force?: boolean) => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

let inFlightNotifPromise: Promise<{ notifications: CrmNotification[]; unreadCount: number }> | null = null

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetchedAt: 0,
  loadNotifications: async (force = false) => {
    const { notifications, lastFetchedAt } = get()

    // Deduplicate rapid calls within 8 seconds unless forced
    if (!force && notifications.length > 0 && Date.now() - lastFetchedAt < 8000) {
      return
    }

    // Deduplicate in-flight promises across components or Strict Mode double-invocations
    if (inFlightNotifPromise) {
      await inFlightNotifPromise
      return
    }

    set({ isLoading: notifications.length === 0 })

    inFlightNotifPromise = fetchNotifications()
      .then((res) => {
        // Native Web Push / Notification API for new alerts
        if (
          notifications.length > 0 &&
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          const prevIds = new Set(notifications.map((n) => n.id))
          const newItems = (res.notifications || []).filter((n) => !n.isRead && !prevIds.has(n.id))
          for (const item of newItems.slice(0, 2)) {
            try {
              new Notification(item.title, {
                body: item.message,
                icon: '/favicon.ico',
              })
            } catch {}
          }
        }

        set({
          notifications: res.notifications || [],
          unreadCount: res.unreadCount || 0,
          lastFetchedAt: Date.now(),
        })
        return res
      })
      .finally(() => {
        inFlightNotifPromise = null
        set({ isLoading: false })
      })

    await inFlightNotifPromise
  },

  markRead: async (id: string) => {
    const prev = get().notifications
    const item = prev.find((n) => n.id === id)
    if (!item || item.isRead) return

    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))

    try {
      await apiMarkRead(id)
    } catch {
      set({ notifications: prev })
    }
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
    try {
      await apiMarkAllRead()
    } catch {}
  },
}))
