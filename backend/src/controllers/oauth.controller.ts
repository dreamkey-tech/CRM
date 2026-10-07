import type { Context } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import type { AppEnv } from '../db'
import {
  generateWebsiteSessionToken,
  WEBSITE_SESSION_MAX_AGE_SECONDS,
} from '../lib/website-auth'

export const BETTER_AUTH_COOKIE_NAME = 'better-auth.session_token'
const OAUTH_STATE_COOKIE = 'oauth_state'

function getBackendOrigin(c: Context<AppEnv>): string {
  if (c.env?.BACKEND_URL) {
    return c.env.BACKEND_URL.replace(/\/$/, '')
  }
  // Automatically detects dynamic request origin (e.g. https://backend.dreamkey-crm.workers.dev or http://localhost:8787)
  return new URL(c.req.url).origin
}

function getSessionCookieOptions(c: Context<AppEnv>) {
  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    (c.env?.BACKEND_URL && c.env.BACKEND_URL.startsWith('https://')) ||
    false

  return {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? ('None' as const) : ('Lax' as const),
    maxAge: WEBSITE_SESSION_MAX_AGE_SECONDS,
  }
}

/**
 * 1. Initiate Google Login
 * Endpoint: POST /api/auth/sign-in/social
 */
export const oauthSignInSocialController = async (c: Context<AppEnv>) => {
  const body = await c.req.json<{
    provider: string
    callbackURL: string
    errorCallbackURL?: string
    redirectURI?: string
  }>().catch(() => ({
    provider: 'google',
    callbackURL: 'http://localhost:3000/dashboard',
    errorCallbackURL: 'http://localhost:3000/login',
    redirectURI: undefined,
  }))

  if (body.provider !== 'google') {
    return c.json({ error: 'Only google provider is currently supported.' }, 400)
  }

  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return c.json(
      { error: 'GOOGLE_CLIENT_ID is not configured in backend environment variables.' },
      500
    )
  }

  const backendUrl = getBackendOrigin(c)

  // Determine redirect URI:
  // 1. Explicit redirectURI provided in request body
  // 2. Or dynamically from callbackURL origin if routed through Next.js proxy (/api-proxy/...)
  // 3. Or default backend callback
  let redirectUri = body.redirectURI
  if (!redirectUri) {
    const callbackTarget = body.callbackURL || ''
    try {
      if (callbackTarget.startsWith('http://') || callbackTarget.startsWith('https://')) {
        const targetOrigin = new URL(callbackTarget).origin
        redirectUri = `${targetOrigin}/api-proxy/api/auth/callback/google`
      } else {
        redirectUri = `${backendUrl}/api/auth/callback/google`
      }
    } catch {
      redirectUri = `${backendUrl}/api/auth/callback/google`
    }
  }

  // State parameter to prevent CSRF, remember redirect target and redirectUri
  const stateData = {
    csrf: crypto.randomUUID(),
    callbackURL: body.callbackURL || 'http://localhost:3000/dashboard',
    errorCallbackURL: body.errorCallbackURL || 'http://localhost:3000/login',
    redirectURI: redirectUri,
  }
  const stateString = btoa(JSON.stringify(stateData))

  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    (c.env?.BACKEND_URL && c.env.BACKEND_URL.startsWith('https://')) ||
    false
  setCookie(c, OAUTH_STATE_COOKIE, stateString, {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'None' : 'Lax',
    maxAge: 10 * 60, // 10 minutes
  })

  // Build Google OAuth authorization URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('state', stateString)
  googleAuthUrl.searchParams.set('prompt', 'select_account')

  return c.json({ url: googleAuthUrl.toString() })
}

/**
 * 2. Google Callback (Internal)
 * Endpoint: GET /api/auth/callback/google
 */
export const oauthGoogleCallbackController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const code = c.req.query('code')
  const state = c.req.query('state')
  const storedState = getCookie(c, OAUTH_STATE_COOKIE)

  let callbackURL = 'http://localhost:3000/dashboard'
  let errorCallbackURL = 'http://localhost:3000/login'
  const backendUrl = getBackendOrigin(c)
  let redirectUri = `${backendUrl}/api/auth/callback/google`

  try {
    if (state) {
      const parsed = JSON.parse(atob(state))
      callbackURL = parsed.callbackURL || callbackURL
      errorCallbackURL = parsed.errorCallbackURL || errorCallbackURL
      if (parsed.redirectURI) {
        redirectUri = parsed.redirectURI
      }
    }
  } catch (e) {
    console.error('Failed to parse OAuth state:', e)
  }

  if (!code || !state) {
    return c.redirect(`${errorCallbackURL}?error=invalid_request`)
  }

  // If storedState is present in cookie, verify it matches
  if (storedState && state !== storedState) {
    console.warn('OAuth state mismatch warning')
  }

  // Clear state cookie
  deleteCookie(c, OAUTH_STATE_COOKIE, { path: '/' })

  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in backend environment.')
    return c.redirect(`${errorCallbackURL}?error=missing_oauth_configuration`)
  }

  // Step A: Exchange authorization code with Google for Access Token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text()
    console.error('Google token exchange failed:', errorBody)
    return c.redirect(`${errorCallbackURL}?error=oauth_token_exchange_failed`)
  }

  const tokenData = (await tokenRes.json()) as { access_token: string }

  // Step B: Fetch user profile info from Google (ignoring avatar/image)
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!profileRes.ok) {
    return c.redirect(`${errorCallbackURL}?error=failed_to_fetch_profile`)
  }

  const profile = (await profileRes.json()) as {
    sub: string
    email: string
    name?: string
    email_verified?: boolean
  }

  const normalizedEmail = profile.email.toLowerCase().trim()
  const now = new Date()

  // Step C: Upsert User in Database & Handle account linking
  let user = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    // New user signing up via Google
    user = await prisma.websiteUser.create({
      data: {
        email: normalizedEmail,
        name: profile.name || null,
        emailVerified: profile.email_verified ?? true,
        authProvider: 'GOOGLE',
        lastAuthProvider: 'GOOGLE',
        googleId: profile.sub,
        loginCount: 1,
        lastLoginAt: now,
        lastActiveAt: now,
      },
    })
  } else {
    // Existing user (e.g. previously registered via email/password)
    const newAuthProvider = user.passwordHash ? 'BOTH' : 'GOOGLE'

    user = await prisma.websiteUser.update({
      where: { id: user.id },
      data: {
        name: user.name || profile.name || null,
        emailVerified: profile.email_verified ?? true,
        authProvider: newAuthProvider,
        lastAuthProvider: 'GOOGLE',
        googleId: profile.sub || user.googleId,
        loginCount: { increment: 1 },
        lastLoginAt: now,
        lastActiveAt: now,
      },
    })
  }

  // Step D: Create Database Session
  const sessionToken = generateWebsiteSessionToken()
  const expiresAt = new Date(Date.now() + WEBSITE_SESSION_MAX_AGE_SECONDS * 1000)
  const userAgent = c.req.header('user-agent') || null
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || null

  await prisma.websiteUserSession.create({
    data: {
      userId: user.id,
      token: sessionToken,
      expiresAt,
      userAgent,
      ipAddress,
      lastUsedAt: now,
    },
  })

  // Step E: Set HttpOnly Cookies (both better-auth.session_token and access_token)
  const cookieOpts = getSessionCookieOptions(c)
  setCookie(c, BETTER_AUTH_COOKIE_NAME, sessionToken, cookieOpts)
  setCookie(c, 'access_token', sessionToken, cookieOpts)

  // Attach token query param so cross-domain frontends (e.g. localhost:3000 with Cloudflare Workers) receive the session
  try {
    const redirectUrl = new URL(callbackURL)
    redirectUrl.searchParams.set('token', sessionToken)
    return c.redirect(redirectUrl.toString())
  } catch {
    return c.redirect(callbackURL)
  }
}

/**
 * 3. Get Current User / Session (Me)
 * Endpoint: GET /api/auth/get-session
 */
export const oauthGetSessionController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  let token = getCookie(c, BETTER_AUTH_COOKIE_NAME) || getCookie(c, 'access_token')

  if (!token) {
    const authHeader = c.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
  }

  if (!token) {
    return c.json(null, 200)
  }

  const session = await prisma.websiteUserSession.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    deleteCookie(c, BETTER_AUTH_COOKIE_NAME, { path: '/' })
    deleteCookie(c, 'access_token', { path: '/' })
    return c.json(null, 200)
  }

  // Update last activity timestamp
  const now = new Date()
  await prisma.websiteUserSession.update({
    where: { id: session.id },
    data: { lastUsedAt: now },
  }).catch(() => { })

  return c.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      createdAt: session.user.createdAt.toISOString(),
      updatedAt: session.user.updatedAt.toISOString(),
    },
    session: {
      id: session.id,
      userId: session.userId,
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.lastUsedAt.toISOString(),
    },
  })
}

/**
 * 4. Logout
 * Endpoint: POST /api/auth/sign-out
 */
export const oauthSignOutController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  let token = getCookie(c, BETTER_AUTH_COOKIE_NAME) || getCookie(c, 'access_token')

  if (!token) {
    const authHeader = c.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
  }

  if (token) {
    await prisma.websiteUserSession.deleteMany({
      where: { token },
    }).catch(() => { })
  }

  deleteCookie(c, BETTER_AUTH_COOKIE_NAME, { path: '/' })
  deleteCookie(c, 'access_token', { path: '/' })

  return c.json({ success: true })
}
