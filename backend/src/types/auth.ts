import { z } from 'zod'
import { registerSchema, loginSchema } from '../zod/auth'

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

export interface AuthUserResponse {
  id: string
  email: string
  name: string | null
  roles: string[]
  permissions: string[]
}

export interface AuthResponse {
  message: string
  user: AuthUserResponse
}

export interface MeResponse {
  user: AuthUserResponse
}

export interface MessageResponse {
  message: string
}
