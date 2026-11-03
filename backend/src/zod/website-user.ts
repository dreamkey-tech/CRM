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

/**
 * Zod validation schema for verifying website login OTP
 */
export const websiteVerifyLoginOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  otp: z
    .string()
    .trim()
    .length(4, 'OTP must be exactly 4 digits')
    .regex(/^\d{4}$/, 'OTP must consist of 4 numeric digits'),
})

/**
 * Zod validation schema for requesting password reset OTP
 */
export const websiteForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

/**
 * Zod validation schema for verifying password reset OTP
 */
export const websiteVerifyResetOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  otp: z
    .string()
    .trim()
    .length(4, 'OTP must be exactly 4 digits')
    .regex(/^\d{4}$/, 'OTP must consist of 4 numeric digits'),
})

/**
 * Zod validation schema for resetting password with OTP
 */
export const websiteResetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  otp: z
    .string()
    .trim()
    .length(4, 'OTP must be exactly 4 digits')
    .regex(/^\d{4}$/, 'OTP must consist of 4 numeric digits'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long'),
})

/**
 * Zod validation schema for resending OTP
 */
export const websiteResendOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  purpose: z.enum(['LOGIN', 'PASSWORD_RESET']).optional().default('LOGIN'),
})

export type WebsiteVerifyLoginOtpInput = z.infer<typeof websiteVerifyLoginOtpSchema>
export type WebsiteForgotPasswordInput = z.infer<typeof websiteForgotPasswordSchema>
export type WebsiteVerifyResetOtpInput = z.infer<typeof websiteVerifyResetOtpSchema>
export type WebsiteResetPasswordInput = z.infer<typeof websiteResetPasswordSchema>
export type WebsiteResendOtpInput = z.infer<typeof websiteResendOtpSchema>

