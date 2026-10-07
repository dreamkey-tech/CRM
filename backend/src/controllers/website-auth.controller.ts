import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { AppEnv } from '../db'
import {
  hashPassword,
  verifyPassword,
  generateWebsiteSessionToken,
  getWebsiteAuthCookieOptions,
  WEBSITE_AUTH_COOKIE_NAME,
  WEBSITE_SESSION_MAX_AGE_SECONDS,
} from '../lib/website-auth'

/**
 * Register a new website user
 * Endpoint: POST /v1/user/auth/register
 */
export const websiteRegisterController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; password: string; name?: string }>()

  if (!body.email || !body.password) {
    return c.json({ message: 'Email and password are required.' }, 400)
  }

  if (body.password.length < 6) {
    return c.json({ message: 'Password must be at least 6 characters long.' }, 400)
  }

  const normalizedEmail = body.email.toLowerCase().trim()

  const existingUser = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  if (existingUser) {
    return c.json({ message: 'An account with this email address already exists.' }, 400)
  }

  const passwordHash = await hashPassword(body.password)
  const now = new Date()

  // Create the website user with initial login tracking
  const user = await prisma.websiteUser.create({
    data: {
      email: normalizedEmail,
      name: body.name?.trim() || null,
      passwordHash,
      authProvider: 'EMAIL',
      lastAuthProvider: 'EMAIL',
      loginCount: 1,
      lastLoginAt: now,
      lastActiveAt: now,
    },
  })

  // Generate session & cookie
  const token = generateWebsiteSessionToken()
  const expiresAt = new Date(Date.now() + WEBSITE_SESSION_MAX_AGE_SECONDS * 1000)
  const userAgent = c.req.header('user-agent') || null
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || null

  await prisma.websiteUserSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent,
      ipAddress,
      lastUsedAt: now,
    },
  })

  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    c.env?.DATABASE_URL?.includes('production') ||
    false
  const cookieOpts = getWebsiteAuthCookieOptions(isHttps)
  setCookie(c, cookieOpts.name, token, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })

  return c.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    201
  )
}

/**
 * Login website user
 * Endpoint: POST /v1/user/auth/login
 */
export const websiteLoginController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; password: string }>()

  if (!body.email || !body.password) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  const normalizedEmail = body.email.toLowerCase().trim()

  const user = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  if (!user.isActive) {
    return c.json({ message: 'Your account has been deactivated. Please contact support.' }, 403)
  }

  // If user registered with Google and has not set a password yet
  if (!user.passwordHash) {
    return c.json(
      {
        message: 'This account was created with Google. Please sign in using Google.',
        code: 'USE_GOOGLE_LOGIN',
      },
      400
    )
  }

  const isValidPassword = await verifyPassword(body.password, user.passwordHash)
  if (!isValidPassword) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  const now = new Date()

  // Track login count, last provider, and activity for measuring returning users
  await prisma.websiteUser.update({
    where: { id: user.id },
    data: {
      loginCount: { increment: 1 },
      lastAuthProvider: 'EMAIL',
      lastLoginAt: now,
      lastActiveAt: now,
    },
  })

  // Create session
  const token = generateWebsiteSessionToken()
  const expiresAt = new Date(Date.now() + WEBSITE_SESSION_MAX_AGE_SECONDS * 1000)
  const userAgent = c.req.header('user-agent') || null
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || null

  await prisma.websiteUserSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent,
      ipAddress,
      lastUsedAt: now,
    },
  })

  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    c.env?.DATABASE_URL?.includes('production') ||
    false
  const cookieOpts = getWebsiteAuthCookieOptions(isHttps)
  setCookie(c, cookieOpts.name, token, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  })
}

/**
 * Get current website user profile
 * Endpoint: GET /v1/user/auth/me
 */
export const websiteGetMeController = async (c: Context<AppEnv>) => {
  const websiteUser = c.get('websiteUser')

  if (!websiteUser) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  return c.json({
    user: {
      id: websiteUser.id,
      name: websiteUser.name,
      email: websiteUser.email,
    },
  })
}

/**
 * Refresh current website user session
 * Endpoint: POST /v1/user/auth/refresh
 */
export const websiteRefreshTokenController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  let token = getCookie(c, WEBSITE_AUTH_COOKIE_NAME) || getCookie(c, 'better-auth.session_token')

  if (!token) {
    const authHeader = c.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
  }

  if (!token) {
    deleteCookie(c, WEBSITE_AUTH_COOKIE_NAME, { path: '/' })
    deleteCookie(c, 'better-auth.session_token', { path: '/' })
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const session = await prisma.websiteUserSession.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    deleteCookie(c, WEBSITE_AUTH_COOKIE_NAME, { path: '/' })
    deleteCookie(c, 'better-auth.session_token', { path: '/' })
    return c.json({ message: 'Unauthorized' }, 401)
  }

  // Generate new token & extend session
  const newToken = generateWebsiteSessionToken()
  const newExpiresAt = new Date(Date.now() + WEBSITE_SESSION_MAX_AGE_SECONDS * 1000)
  const now = new Date()

  await prisma.websiteUserSession.update({
    where: { id: session.id },
    data: {
      token: newToken,
      expiresAt: newExpiresAt,
      lastUsedAt: now,
    },
  })

  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    (c.env?.BACKEND_URL && c.env.BACKEND_URL.startsWith('https://')) ||
    false
  const cookieOpts = getWebsiteAuthCookieOptions(isHttps)
  setCookie(c, cookieOpts.name, newToken, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })
  setCookie(c, 'better-auth.session_token', newToken, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })

  return c.json({ message: 'Token refreshed successfully' })
}

/**
 * Logout website user: Delete session and clear cookie
 * Endpoint: POST /v1/user/auth/logout
 */
export const websiteLogoutController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  let token = getCookie(c, WEBSITE_AUTH_COOKIE_NAME) || getCookie(c, 'better-auth.session_token')

  if (!token) {
    const authHeader = c.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
  }

  if (token) {
    await prisma.websiteUserSession.deleteMany({
      where: { token },
    }).catch(() => {})
  }

  deleteCookie(c, WEBSITE_AUTH_COOKIE_NAME, { path: '/' })
  deleteCookie(c, 'better-auth.session_token', { path: '/' })

  return c.json({ message: 'Logged out successfully' })
}
