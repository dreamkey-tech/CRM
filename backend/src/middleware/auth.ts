import { createMiddleware } from 'hono/factory'
import { getCookie, deleteCookie } from 'hono/cookie'
import type { AppEnv, AuthUser } from '../db'
import { AUTH_COOKIE_NAME } from '../lib/auth'

/**
 * Authentication Middleware
 * Validates the HttpOnly `auth_session` cookie against the PostgreSQL session table.
 * Attaches `user`, `roles`, and compiled `permissions` to Hono context `c.var`.
 */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, AUTH_COOKIE_NAME)

  if (!token) {
    return c.json(
      {
        success: false,
        error: 'You are not currently signed in. Please log in to your account to continue.',
        code: 'AUTH_REQUIRED',
      },
      401
    )
  }

  const prisma = c.get('prisma')

  // Find active non-expired session and include user's roles and permissions
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
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
      },
    },
  })

  // Validate session exists, is not expired, and user is active
  if (!session || session.expiresAt < new Date()) {
    deleteCookie(c, AUTH_COOKIE_NAME, { path: '/' })
    return c.json(
      {
        success: false,
        error: 'Your session has expired. Please sign in again to continue.',
        code: 'SESSION_EXPIRED',
      },
      401
    )
  }

  if (!session.user.isActive) {
    deleteCookie(c, AUTH_COOKIE_NAME, { path: '/' })
    return c.json(
      {
        success: false,
        error: 'Your account has been deactivated. Please contact your CRM administrator for help.',
        code: 'ACCOUNT_DEACTIVATED',
      },
      403
    )
  }

  const authUser: AuthUser = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    isActive: session.user.isActive,
  }

  // Extract role names
  const roles = session.user.roles.map((ur) => ur.role.name)

  // Compile unique permissions
  const permissionsSet = new Set<string>()
  for (const userRole of session.user.roles) {
    for (const rolePerm of userRole.role.permissions) {
      permissionsSet.add(rolePerm.permission.name)
    }
  }
  const permissions = Array.from(permissionsSet)

  // Attach to Hono context
  c.set('user', authUser)
  c.set('roles', roles)
  c.set('permissions', permissions)
  c.set('sessionId', session.id)

  await next()
})

/**
 * Optional Authentication Middleware
 * If a valid session cookie is provided, populates `user`, `roles`, and `permissions`.
 * If no cookie or expired, proceeds without blocking the request.
 */
export const optionalAuthMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, AUTH_COOKIE_NAME)

  if (token) {
    const prisma = c.get('prisma')
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
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
        },
      },
    })

    if (session && session.expiresAt >= new Date() && session.user.isActive) {
      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        isActive: session.user.isActive,
      }

      const roles = session.user.roles.map((ur) => ur.role.name)
      const permissionsSet = new Set<string>()
      for (const userRole of session.user.roles) {
        for (const rolePerm of userRole.role.permissions) {
          permissionsSet.add(rolePerm.permission.name)
        }
      }

      c.set('user', authUser)
      c.set('roles', roles)
      c.set('permissions', Array.from(permissionsSet))
      c.set('sessionId', session.id)
    }
  }

  await next()
})

/**
 * Permission Guard Middleware
 * Ensures the authenticated user has a specific atomic permission (or Super Admin `*:*` access).
 */
export function requirePermission(requiredPermission: string) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const userPermissions = c.get('permissions') || []

    // Super Admin override or direct permission match
    const hasAccess = userPermissions.includes('*:*') || userPermissions.includes(requiredPermission)

    if (!hasAccess) {
      return c.json(
        {
          success: false,
          error: `You do not have permission to access this feature (${requiredPermission}). Please contact your CRM administrator if you need access.`,
          code: 'PERMISSION_DENIED',
          requiredPermission,
        },
        403
      )
    }

    await next()
  })
}

/**
 * Role Guard Middleware (Optional convenience helper)
 */
export function requireRole(requiredRole: string) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const userRoles = c.get('roles') || []

    if (!userRoles.includes(requiredRole) && !userRoles.includes('SUPER_ADMIN')) {
      return c.json(
        {
          success: false,
          error: `You do not have the required '${requiredRole}' role to access this section.`,
          code: 'ROLE_DENIED',
          requiredRole,
        },
        403
      )
    }

    await next()
  })
}
