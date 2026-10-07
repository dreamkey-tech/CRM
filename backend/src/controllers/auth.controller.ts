import type { Context } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import type { AppEnv } from '../db'
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  getAuthCookieOptions,
  SESSION_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
} from '../lib/auth'
import { seedSystemDefaults } from '../lib/seed'

/**
 * Register a new user
 * If this is the very first user in the system, they automatically receive SUPER_ADMIN role.
 */
export const registerController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; password: string; name?: string }>()

  if (!body.email || !body.password) {
    return c.json(
      {
        success: false,
        error: 'Please provide both your email address and password to create an account.',
        code: 'MISSING_FIELDS',
      },
      400
    )
  }

  if (body.password.length < 6) {
    return c.json(
      {
        success: false,
        error: 'Your password must be at least 6 characters long for security.',
        code: 'PASSWORD_TOO_SHORT',
      },
      400
    )
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase().trim() },
  })

  if (existingUser) {
    return c.json(
      {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
        code: 'EMAIL_ALREADY_EXISTS',
      },
      400
    )
  }

  // Ensure system permissions and default roles exist
  await seedSystemDefaults(prisma)

  const passwordHash = await hashPassword(body.password)
  const totalUsers = await prisma.user.count()
  const isFirstUser = totalUsers === 0

  // Create the user
  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase().trim(),
      name: body.name || null,
      passwordHash,
    },
  })

  // Assign role: First user becomes SUPER_ADMIN, otherwise SALES_AGENT
  const roleName = isFirstUser ? 'SUPER_ADMIN' : 'SALES_AGENT'
  const defaultRole = await prisma.role.findUnique({ where: { name: roleName } })

  if (defaultRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: defaultRole.id,
      },
    })
  }

  // Generate session & cookie
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
  const userAgent = c.req.header('user-agent') || null

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent,
    },
  })

  const isProd = c.env?.DATABASE_URL?.includes('production') || false
  const cookieOpts = getAuthCookieOptions(isProd)
  setCookie(c, cookieOpts.name, token, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })

  // Fetch roles and permissions for the response
  const roles = [roleName]
  const permissions = isFirstUser
    ? ['*:*']
    : ['leads:read', 'leads:create', 'leads:update', 'deals:read', 'deals:create', 'deals:update']

  return c.json(
    {
      success: true,
      message: 'Your account has been created successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        permissions,
      },
    },
    201
  )
}

/**
 * Login user with email and password
 */
export const loginController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; password: string }>()

  if (!body.email || !body.password) {
    return c.json(
      {
        success: false,
        error: 'Please enter both your email address and password.',
        code: 'MISSING_CREDENTIALS',
      },
      400
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase().trim() },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: 'Incorrect email address or password. Please double check and try again.',
        code: 'INVALID_CREDENTIALS',
      },
      401
    )
  }

  if (!user.isActive) {
    return c.json(
      {
        success: false,
        error: 'Your account has been deactivated. Please contact your CRM administrator for help.',
        code: 'ACCOUNT_DEACTIVATED',
      },
      403
    )
  }

  const isValidPassword = await verifyPassword(body.password, user.passwordHash)
  if (!isValidPassword) {
    return c.json(
      {
        success: false,
        error: 'Incorrect email address or password. Please double check and try again.',
        code: 'INVALID_CREDENTIALS',
      },
      401
    )
  }

  // Create a new active session
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
  const userAgent = c.req.header('user-agent') || null

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent,
    },
  })

  // Set the HttpOnly session cookie
  const isProd = c.env?.DATABASE_URL?.includes('production') || false
  const cookieOpts = getAuthCookieOptions(isProd)
  setCookie(c, cookieOpts.name, token, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })

  const roles = user.roles.map((ur) => ur.role.name)
  const permissionsSet = new Set<string>()
  for (const userRole of user.roles) {
    for (const rolePerm of userRole.role.permissions) {
      permissionsSet.add(rolePerm.permission.name)
    }
  }

  return c.json({
    success: true,
    message: 'Welcome back! You have signed in successfully.',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions: Array.from(permissionsSet),
    },
  })
}

/**
 * Get current user & fresh permissions from the active session
 * Frontend calls this on initial load / browser refresh
 */
export const getMeController = async (c: Context<AppEnv>) => {
  const user = c.get('user')
  const roles = c.get('roles') || []
  const permissions = c.get('permissions') || []

  if (!user) {
    return c.json(
      {
        success: false,
        error: 'Your session has expired. Please sign in again to continue.',
        code: 'SESSION_EXPIRED',
      },
      401
    )
  }

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    },
  })
}

/**
 * Logout: Invalidate session in DB and clear HttpOnly cookie
 */
export const logoutController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const token = c.req.header('cookie')?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))?.[1]

  if (token) {
    await prisma.session.deleteMany({
      where: { token },
    })
  }

  deleteCookie(c, AUTH_COOKIE_NAME, { path: '/' })

  return c.json({
    success: true,
    message: 'You have been logged out successfully.',
  })
}
