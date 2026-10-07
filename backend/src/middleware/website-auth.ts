import { createMiddleware } from 'hono/factory'
import { getCookie, deleteCookie } from 'hono/cookie'
import type { AppEnv, WebsiteAuthUser } from '../db'
import { WEBSITE_AUTH_COOKIE_NAME } from '../lib/website-auth'

/** 
 * Website User Authentication Middleware
 * Validates the HttpOnly `access_token` cookie against the PostgreSQL `website_user_sessions` table.
 * Attaches `websiteUser` and `websiteSessionId` to Hono context `c.var`.
 * Returns 401 { "message": "Unauthorized" } if session is invalid or missing.
 */
export const websiteAuthMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  let token = getCookie(c, WEBSITE_AUTH_COOKIE_NAME) || getCookie(c, 'better-auth.session_token')

  // Fallback: check Authorization: Bearer <token> if cookie is not present
  if (!token) {
    const authHeader = c.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
  }

  if (!token) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const prisma = c.get('prisma')

  const session = await prisma.websiteUserSession.findUnique({
    where: { token },
    include: {
      user: true,
    },
  })

  // Validate session exists, is not expired, and user is active
  if (!session || session.expiresAt < new Date()) {
    deleteCookie(c, WEBSITE_AUTH_COOKIE_NAME, { path: '/' })
    deleteCookie(c, 'better-auth.session_token', { path: '/' })
    return c.json({ message: 'Unauthorized' }, 401)
  }

  if (!session.user.isActive) {
    deleteCookie(c, WEBSITE_AUTH_COOKIE_NAME, { path: '/' })
    deleteCookie(c, 'better-auth.session_token', { path: '/' })
    return c.json({ message: 'Account is deactivated' }, 401)
  }

  // Update lastActiveAt and lastUsedAt
  const now = new Date()
  await Promise.all([
    prisma.websiteUser.update({
      where: { id: session.user.id },
      data: { lastActiveAt: now },
    }),
    prisma.websiteUserSession.update({
      where: { id: session.id },
      data: { lastUsedAt: now },
    }),
  ]).catch(() => {
    // Non-blocking update failure
  })

  const websiteUser: WebsiteAuthUser = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    isActive: session.user.isActive,
  }

  c.set('websiteUser', websiteUser)
  c.set('websiteSessionId', session.id)

  await next()
})
