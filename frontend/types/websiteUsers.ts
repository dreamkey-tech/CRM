// ── Website User Stats ────────────────────────────────────────────────────────
export interface WebsiteUserStats {
  totalUsers: number
  returningUsers: number
  returningRatePercentage: number
  activeUsers7d: number
  activeUsers30d: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
}

export interface WebsiteUserStatsResponse {
  success: boolean
  stats: WebsiteUserStats
}

// ── Website User Record ───────────────────────────────────────────────────────
export interface WebsiteUser {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  authProvider: string // "EMAIL" | "GOOGLE" | "BOTH"
  lastAuthProvider: string | null
  googleId: string | null
  isActive: boolean
  loginCount: number
  isReturningUser: boolean
  lastLoginAt: string | null
  lastActiveAt: string | null
  createdAt: string
  updatedAt: string
  totalSessions: number
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface WebsiteUsersListResponse {
  success: boolean
  users: WebsiteUser[]
  pagination: PaginationMeta
}

// ── User Detail ───────────────────────────────────────────────────────────────
export interface WebsiteUserSession {
  id: string
  userAgent: string | null
  ipAddress: string | null
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string
}

export interface WebsiteUserDetail extends WebsiteUser {
  recentSessions: WebsiteUserSession[]
}

export interface WebsiteUserDetailResponse {
  success: boolean
  user: WebsiteUserDetail
}

// ── Status Update ─────────────────────────────────────────────────────────────
export interface UpdateUserStatusResponse {
  success: boolean
  message: string
  user: {
    id: string
    email: string
    name: string | null
    isActive: boolean
  }
}

// ── List Query Params ─────────────────────────────────────────────────────────
export interface WebsiteUsersListParams {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | ''
  authProvider?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'lastActiveAt' | 'loginCount' | 'name' | 'email' | 'authProvider' | 'emailVerified'
  sortOrder?: 'asc' | 'desc'
}
