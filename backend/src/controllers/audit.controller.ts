import type { Context } from 'hono'
import type { AppEnv } from '../db'
import type { AuditQueryInput } from '../zod/audit'
import { parseDeviceInfo } from '../lib/device'

/**
 * List audit logs with pagination and granular filters
 */
export const listAuditLogsController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const query = c.req.valid('query' as never) as AuditQueryInput

  const where: any = {}

  if (query.module && query.module !== 'ALL') {
    where.module = query.module.toUpperCase().trim()
  }

  if (query.action && query.action !== 'ALL') {
    where.action = query.action.toUpperCase().trim()
  }

  if (query.status && query.status !== 'ALL') {
    where.status = query.status
  }

  if (query.userId) {
    where.userId = query.userId
  }

  if (query.deviceType && query.deviceType !== 'ALL') {
    where.deviceType = query.deviceType
  }

  if (query.search) {
    where.OR = [
      { details: { contains: query.search, mode: 'insensitive' } },
      { resourceName: { contains: query.search, mode: 'insensitive' } },
      { ipAddress: { contains: query.search, mode: 'insensitive' } },
      { deviceName: { contains: query.search, mode: 'insensitive' } },
      { user: { name: { contains: query.search, mode: 'insensitive' } } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
    ]
  }

  const [total, logs, userProfile, userLastLogin, userCounts] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    }),
    query.userId
      ? prisma.user.findUnique({
          where: { id: query.userId },
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        })
      : Promise.resolve(null),
    query.userId
      ? prisma.auditLog.findFirst({
          where: { userId: query.userId, action: 'LOGIN' },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve(null),
    query.userId
      ? Promise.all([
          prisma.auditLog.count({ where: { userId: query.userId } }),
          prisma.auditLog.count({ where: { userId: query.userId, action: 'LOGIN' } }),
          prisma.auditLog.count({
            where: {
              userId: query.userId,
              OR: [{ action: 'CREATE' }, { action: { startsWith: 'CREATE_' } }],
            },
          }),
          prisma.auditLog.count({
            where: {
              userId: query.userId,
              OR: [{ action: 'UPDATE' }, { action: { startsWith: 'UPDATE_' } }],
            },
          }),
          prisma.auditLog.count({
            where: {
              userId: query.userId,
              OR: [{ action: 'DELETE' }, { action: { startsWith: 'DELETE_' } }],
            },
          }),
          prisma.auditLog.count({
            where: {
              userId: query.userId,
              OR: [{ action: 'VIEW_DOCUMENT' }, { module: 'DOCUMENTS' }],
            },
          }),
        ])
      : Promise.resolve(null),
  ])

  // Build employee activity summary if an individual employee is queried
  let userSummary: any = null
  if (query.userId && userProfile) {
    const roles = userProfile.roles.map((r) => r.role.name)
    const primaryRole = roles[0] || 'STAFF'

    let lastLoginDevice = userLastLogin?.deviceName
    let lastLoginDeviceType = userLastLogin?.deviceType
    if (userLastLogin && (!lastLoginDevice || !lastLoginDeviceType)) {
      const parsed = parseDeviceInfo(userLastLogin.userAgent)
      lastLoginDevice = parsed.deviceName
      lastLoginDeviceType = parsed.deviceType
    }

    userSummary = {
      employee: {
        id: userProfile.id,
        name: userProfile.name || userProfile.email,
        email: userProfile.email,
        isActive: userProfile.isActive,
        role: primaryRole,
        roles,
      },
      lastLogin: userLastLogin
        ? {
            createdAt: userLastLogin.createdAt,
            deviceType: lastLoginDeviceType || 'UNKNOWN',
            deviceName: lastLoginDevice || 'Unknown Device',
            ipAddress: userLastLogin.ipAddress,
            city: userLastLogin.city,
            country: userLastLogin.country,
          }
        : null,
      totalActions: userCounts ? userCounts[0] : 0,
      actionBreakdown: {
        logins: userCounts ? userCounts[1] : 0,
        creations: userCounts ? userCounts[2] : 0,
        updates: userCounts ? userCounts[3] : 0,
        deletions: userCounts ? userCounts[4] : 0,
        views: userCounts ? userCounts[5] : 0,
      },
    }
  }

  return c.json({
    success: true,
    logs: logs.map((log) => {
      let deviceType = log.deviceType
      let deviceName = log.deviceName
      if (!deviceType || !deviceName) {
        const parsed = parseDeviceInfo(log.userAgent)
        deviceType = deviceType || parsed.deviceType
        deviceName = deviceName || parsed.deviceName
      }

      const roles = log.user ? log.user.roles.map((r) => r.role.name) : []
      const primaryRole = roles[0] || 'STAFF'

      return {
        id: log.id,
        action: log.action,
        module: log.module,
        details: log.details,
        changes: log.changes || null,
        resourceId: log.resourceId,
        resourceName: log.resourceName,
        status: log.status,
        deviceType: deviceType || 'UNKNOWN',
        deviceName: deviceName || 'Unknown Device',
        city: log.city,
        country: log.country,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        actor: log.user
          ? {
              id: log.user.id,
              name: log.user.name || log.user.email,
              email: log.user.email,
              role: primaryRole,
              roles,
            }
          : null,
      }
    }),
    userSummary,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  })
}

/**
 * Get aggregate audit stats for the dashboard summary
 */
export const getAuditStatsController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [
    totalLogs,
    actionsToday,
    securityDenials,
    sensitiveDocViews,
    mobileActions,
    desktopActions,
  ] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.auditLog.count({ where: { status: 'DENIED' } }),
    prisma.auditLog.count({
      where: {
        OR: [{ action: 'VIEW_DOCUMENT' }, { module: 'DOCUMENTS' }],
      },
    }),
    prisma.auditLog.count({ where: { deviceType: 'MOBILE' } }),
    prisma.auditLog.count({ where: { deviceType: 'DESKTOP' } }),
  ])

  return c.json({
    success: true,
    stats: {
      totalLogs,
      actionsToday,
      securityDenials,
      sensitiveDocViews,
      mobileActions,
      desktopActions,
    },
  })
}
