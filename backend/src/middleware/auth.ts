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
 * Translates technical atomic permission strings into plain-English, non-technical feature descriptions
 */
export function getHumanReadablePermissionDescription(permission: string): string {
  const map: Record<string, string> = {
    'properties:read': 'view property listings',
    'properties:create': 'add new properties',
    'properties:update': 'edit properties',
    'properties:delete': 'delete properties',
    'clients:read': 'view the client directory',
    'clients:create': 'register new clients',
    'clients:update': 'edit client details',
    'clients:delete': 'delete clients',
    'clients:documents:view_sensitive': 'view confidential client documents (KYC / Aadhaar)',
    'brokers:read': 'view the broker directory',
    'brokers:create': 'add new brokers',
    'brokers:update': 'edit brokers',
    'brokers:delete': 'delete brokers',
    'owners:read': 'view property owners',
    'owners:create': 'add property owners',
    'owners:update': 'edit property owners',
    'owners:delete': 'delete property owners',
    'finance:read': 'view financial ledgers & reports',
    'finance:manage': 'manage financial transactions',
    'employees:read': 'view staff members & organization access',
    'employees:manage': 'manage staff accounts & permissions',
    'audit:read': 'view system audit logs',
    'settings:read': 'view system settings',
    'settings:update': 'update system settings',
    'roles:read': 'view security roles',
    'roles:create': 'create security roles',
    'roles:update': 'modify security roles',
    'roles:delete': 'delete security roles',
  }

  if (map[permission]) {
    return map[permission]
  }

  const parts = permission.split(':')
  if (parts.length >= 2) {
    const action = parts[parts.length - 1]
    const module = parts[0]
    return `${action} ${module}`
  }

  return 'access this section'
}

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
      const featureDesc = getHumanReadablePermissionDescription(requiredPermission)
      return c.json(
        {
          success: false,
          error: `You do not have permission to ${featureDesc}. Please contact your CRM administrator if you need access.`,
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
