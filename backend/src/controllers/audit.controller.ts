import type { Context } from 'hono'
import type { AppEnv } from '../db'
import type { AuditQueryInput } from '../zod/audit'

/**
 * List audit logs with pagination and filters
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

  if (query.search) {
    where.OR = [
      { details: { contains: query.search, mode: 'insensitive' } },
      { resourceName: { contains: query.search, mode: 'insensitive' } },
      { user: { name: { contains: query.search, mode: 'insensitive' } } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
    ]
  }

  const [total, logs] = await Promise.all([
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
          },
        },
      },
    }),
  ])

  return c.json({
    success: true,
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      module: log.module,
      details: log.details,
      resourceId: log.resourceId,
      resourceName: log.resourceName,
      status: log.status,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
      actor: log.user
        ? {
            id: log.user.id,
            name: log.user.name || log.user.email,
            email: log.user.email,
          }
        : null,
    })),
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

  const [totalLogs, actionsToday, securityDenials, sensitiveDocViews] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.auditLog.count({ where: { status: 'DENIED' } }),
    prisma.auditLog.count({
      where: {
        OR: [
          { action: 'VIEW_DOCUMENT' },
          { module: 'DOCUMENTS' },
        ],
      },
    }),
  ])

  return c.json({
    success: true,
    stats: {
      totalLogs,
      actionsToday,
      securityDenials,
      sensitiveDocViews,
    },
  })
}
