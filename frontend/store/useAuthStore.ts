import { create } from 'zustand'
import { getMeApi, logoutApi, type UserProfile } from '../api/auth'

type AuthState = {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: UserProfile | null) => void
  fetchUser: () => Promise<UserProfile | null>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasRole: (role: string) => boolean
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  /**
   * Called on app initialization / browser reload.
   * Calls getMeApi() to validate active session cookie with the database.
   */
  fetchUser: async () => {
    try {
      set({ isLoading: true })
      const data = await getMeApi()
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return data.user
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return null
    }
  },

  /**
   * Checks if user has a specific permission or super admin *:* wildcard
   */
  hasPermission: (permission: string) => {
    const user = get().user
    if (!user) return false
    if (user.permissions.includes('*:*')) return true
    return user.permissions.includes(permission)
  },

  /**
   * Checks if user has at least one of the listed permissions
   */
  hasAnyPermission: (permissions: string[]) => {
    const user = get().user
    if (!user) return false
    if (user.permissions.includes('*:*')) return true
    return permissions.some((p) => user.permissions.includes(p))
  },

  /**
   * Checks if user has a specific role
   */
  hasRole: (role: string) => {
    const user = get().user
    if (!user) return false
    if (user.roles.includes('SUPER_ADMIN')) return true
    return user.roles.includes(role)
  },

  /**
   * Logout user, clear DB session & HttpOnly cookie
   */
  logout: async () => {
    try {
      await logoutApi()
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false })
      window.location.href = '/login'
    }
  },
}))
