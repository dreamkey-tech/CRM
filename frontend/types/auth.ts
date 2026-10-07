/**
 * Authenticated User Profile stored in global state & returned by /auth/me
 */
export type UserProfile = {
  id: string
  email: string
  name: string | null
  roles: string[]
  permissions: string[]
}

/**
 * Login Request Credentials
 */
export type LoginCredentials = {
  email: string
  password: string
}

/**
 * User Registration Request Payload
 */
export type RegisterPayload = {
  email: string
  password: string
  name?: string
}

/**
 * Standard Auth Response from Backend
 */
export type AuthResponse = {
  message: string
  user: UserProfile
}

/**
 * Atomic Permission Definition
 */
export type Permission = {
  id: string
  name: string
  category: string
  description?: string | null
}

/**
 * Role Definition with nested permissions
 */
export type Role = {
  id: string
  name: string
  description?: string | null
  isSystem: boolean
  userCount?: number
  permissions: Permission[]
}
