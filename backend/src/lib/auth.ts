import bcrypt from 'bcryptjs'

export const AUTH_COOKIE_NAME = 'auth_session'
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days

/**
 * Hash a plain text password with a secure salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a plain text password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Get cookie options for setting the auth session
 */
export function getAuthCookieOptions(isProduction: boolean = false) {
  return {
    name: AUTH_COOKIE_NAME,
    path: '/',
    httpOnly: true,
    secure: isProduction, // Set to true on HTTPS
    sameSite: isProduction ? ('None' as const) : ('Lax' as const),
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}
