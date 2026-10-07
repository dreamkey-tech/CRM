import bcrypt from 'bcryptjs'

export const WEBSITE_AUTH_COOKIE_NAME = 'access_token'
export const WEBSITE_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days

/**
 * Hash a plain text password for website users
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
export function generateWebsiteSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Get cookie options for setting the website access_token cookie
 */
export function getWebsiteAuthCookieOptions(isHttps: boolean = false) {
  return {
    name: WEBSITE_AUTH_COOKIE_NAME,
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? ('None' as const) : ('Lax' as const),
    maxAge: WEBSITE_SESSION_MAX_AGE_SECONDS,
  }
}
