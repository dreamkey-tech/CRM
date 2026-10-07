import { authApiClient } from './client'
import type { LoginCredentials, RegisterPayload, AuthResponse, UserProfile } from '../types/auth'

export type { UserProfile, LoginCredentials, RegisterPayload, AuthResponse }



/**
 * Log in a user with email and password
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await authApiClient.post<AuthResponse>('/login', credentials)
  return response.data
}

/**
 * Register a new user
 */
export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await authApiClient.post<AuthResponse>('/register', payload)
  return response.data
}

/**
 * Fetch current authenticated user's profile and active permissions
 */
export async function getMeApi(): Promise<{ user: UserProfile }> {
  const response = await authApiClient.get<{ user: UserProfile }>('/me')
  return response.data
}

/**
 * Log out user and invalidate session
 */
export async function logoutApi(): Promise<{ message: string }> {
  const response = await authApiClient.post<{ message: string }>('/logout')
  return response.data
}
