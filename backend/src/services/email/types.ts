export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

export const EMAIL_SENDERS = {
  ONBOARDING: 'DreamKey Onboarding <onboarding@dreamkeykol.com>',
  SALES: 'DreamKey Sales <sales@dreamkeykol.com>',
  INFO: 'DreamKey Info <info@dreamkeykol.com>',
  CAREERS: 'DreamKey Careers <careers@dreamkeykol.com>',
  TECH: 'DreamKey Tech Support <tech@dreamkeykol.com>',
  HR: 'DreamKey HR <hr@dreamkeykol.com>',
} as const

export interface EmployeeWelcomeEmailData {
  to: string
  name: string
  email: string
  password: string
  loginUrl?: string
  portalName?: string
  from?: string
}

export interface PasswordResetEmailData {
  to: string
  name: string
  email: string
  newPassword: string
  loginUrl?: string
  portalName?: string
  from?: string
}

export interface WebsiteLoginOtpEmailData {
  to: string
  name?: string | null
  email: string
  otp: string
  expiresInMinutes?: number
  from?: string
}

export interface WebsiteResetPasswordOtpEmailData {
  to: string
  name?: string | null
  email: string
  otp: string
  expiresInMinutes?: number
  from?: string
}

