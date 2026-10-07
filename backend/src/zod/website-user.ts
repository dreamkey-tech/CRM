import { z } from 'zod'

/**
 * Zod validation schema for website user registration
 */
export const websiteRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
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
 * Zod validation schema for website user login
 */
export const websiteLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type WebsiteRegisterInput = z.infer<typeof websiteRegisterSchema>
export type WebsiteLoginInput = z.infer<typeof websiteLoginSchema>
