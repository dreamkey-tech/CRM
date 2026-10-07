import { z } from 'zod'

/**
 * Zod validation schema for user registration
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .optional(),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
})

/**
 * Zod validation schema for user login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})
