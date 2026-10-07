import type { Context } from 'hono'
import type { AppEnv } from '../db'

/**
 * Get website user analytics and metrics for CRM Dashboard
 * Endpoint: GET /v1/admin/website-users/stats
 */
export const getWebsiteUserStatsController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    activeUsers7d,
    activeUsers30d,
    returningUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
  ] = await Promise.all([
    prisma.websiteUser.count(),
    prisma.websiteUser.count({
      where: { lastActiveAt: { gte: sevenDaysAgo } },
    }),
    prisma.websiteUser.count({
      where: { lastActiveAt: { gte: thirtyDaysAgo } },
    }),
    prisma.websiteUser.count({
      where: { loginCount: { gt: 1 } },
    }),
    prisma.websiteUser.count({
      where: { createdAt: { gte: startOfToday } },
    }),
    prisma.websiteUser.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.websiteUser.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ])

  const returningRate = totalUsers > 0 ? Number(((returningUsers / totalUsers) * 100).toFixed(1)) : 0

  return c.json({
    success: true,
    stats: {
      totalUsers,
      returningUsers,
      returningRatePercentage: returningRate,
      activeUsers7d,
      activeUsers30d,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    },
  })
}

/**
 * List website users with pagination, search, and sorting
 * Endpoint: GET /v1/admin/website-users
 */
export const getWebsiteUsersListController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
  const skip = (page - 1) * limit
  const search = c.req.query('search')?.trim()
  const status = c.req.query('status')
  const authProvider = c.req.query('authProvider')
  const sortBy = c.req.query('sortBy') || 'createdAt'
  const sortOrder = c.req.query('sortOrder') === 'asc' ? 'asc' : 'desc'

  const whereClause: any = {}

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { googleId: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status === 'active') {
    whereClause.isActive = true
  } else if (status === 'inactive') {
    whereClause.isActive = false
  }

  if (authProvider) {
    whereClause.authProvider = { equals: authProvider.toUpperCase(), mode: 'insensitive' }
  }

  const validSortFields = [
    'createdAt',
    'updatedAt',
    'lastLoginAt',
    'lastActiveAt',
    'loginCount',
    'name',
    'email',
    'authProvider',
    'emailVerified',
  ]
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'

  const [total, users] = await Promise.all([
    prisma.websiteUser.count({ where: whereClause }),
    prisma.websiteUser.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [orderField]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        authProvider: true,
        lastAuthProvider: true,
        googleId: true,
        isActive: true,
        loginCount: true,
        lastLoginAt: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { sessions: true },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(total / limit) || 1

  const formattedUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    emailVerified: u.emailVerified,
    authProvider: u.authProvider,
    lastAuthProvider: u.lastAuthProvider,
    googleId: u.googleId,
    isActive: u.isActive,
    loginCount: u.loginCount,
    isReturningUser: u.loginCount > 1,
    lastLoginAt: u.lastLoginAt,
    lastActiveAt: u.lastActiveAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    totalSessions: u._count.sessions,
  }))

  return c.json({
    success: true,
    users: formattedUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  })
}

/**
 * Get website user detail by ID
 * Endpoint: GET /v1/admin/website-users/:id
 */
export const getWebsiteUserDetailController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')

  const user = await prisma.websiteUser.findUnique({
    where: { id },
    include: {
      sessions: {
        orderBy: { lastUsedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          userAgent: true,
          ipAddress: true,
          createdAt: true,
          lastUsedAt: true,
          expiresAt: true,
        },
      },
    },
  })

  if (!user) {
    return c.json(
      {
        success: false,
        error: 'Website user not found',
        code: 'USER_NOT_FOUND',
      },
      404
    )
  }

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      authProvider: user.authProvider,
      lastAuthProvider: user.lastAuthProvider,
      googleId: user.googleId,
      isActive: user.isActive,
      loginCount: user.loginCount,
      isReturningUser: user.loginCount > 1,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      recentSessions: user.sessions,
    },
  })
}

/**
 * Update website user status (active / deactivated)
 * Endpoint: PATCH /v1/admin/website-users/:id/status
 */
export const updateWebsiteUserStatusController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  const body = await c.req.json<{ isActive: boolean }>()

  if (typeof body.isActive !== 'boolean') {
    return c.json(
      {
        success: false,
        error: 'isActive must be a boolean value',
        code: 'INVALID_INPUT',
      },
      400
    )
  }

  const existing = await prisma.websiteUser.findUnique({ where: { id } })
  if (!existing) {
    return c.json(
      {
        success: false,
        error: 'Website user not found',
        code: 'USER_NOT_FOUND',
      },
      404
    )
  }

  const updated = await prisma.websiteUser.update({
    where: { id },
    data: { isActive: body.isActive },
  })

  // If deactivating, terminate active sessions
  if (!body.isActive) {
    await prisma.websiteUserSession.deleteMany({
      where: { userId: id },
    })
  }

  return c.json({
    success: true,
    message: `Website user has been ${body.isActive ? 'activated' : 'deactivated'} successfully.`,
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      isActive: updated.isActive,
    },
  })
}

/**
 * Get website enquiries list with pagination, search, status filter, and sorting
 * Endpoint: GET /v1/admin/website-users/enquiries
 */
export const getWebsiteEnquiriesListController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
  const skip = (page - 1) * limit
  const search = c.req.query('search')?.trim()
  const status = c.req.query('status')
  const propertyType = c.req.query('propertyType')
  const sortBy = c.req.query('sortBy') || 'createdAt'
  const sortOrder = c.req.query('sortOrder') === 'asc' ? 'asc' : 'desc'

  const whereClause: any = {}

  if (search) {
    whereClause.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobileNo: { contains: search, mode: 'insensitive' } },
      { propertyType: { contains: search, mode: 'insensitive' } },
      { preferredLocation: { contains: search, mode: 'insensitive' } },
      { estimatedBudgetBand: { contains: search, mode: 'insensitive' } },
      { specificRequirements: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status && status !== 'ALL') {
    whereClause.status = { equals: status.toUpperCase() }
  }

  if (propertyType && propertyType !== 'ALL') {
    whereClause.propertyType = { equals: propertyType, mode: 'insensitive' }
  }

  const validSortFields = [
    'createdAt',
    'updatedAt',
    'fullName',
    'email',
    'mobileNo',
    'propertyType',
    'preferredLocation',
    'estimatedBudgetBand',
    'status',
  ]
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [total, enquiries, totalAll, newTodayCount, pendingCount, inProgressCount, resolvedCount] = await Promise.all([
    prisma.websiteEnquiry.count({ where: whereClause }),
    prisma.websiteEnquiry.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [orderField]: sortOrder },
    }),
    prisma.websiteEnquiry.count(),
    prisma.websiteEnquiry.count({
      where: { createdAt: { gte: startOfToday } },
    }),
    prisma.websiteEnquiry.count({
      where: { status: 'NEW' },
    }),
    prisma.websiteEnquiry.count({
      where: { status: 'IN_PROGRESS' },
    }),
    prisma.websiteEnquiry.count({
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
    }),
  ])

  const totalPages = Math.ceil(total / limit) || 1

  return c.json({
    success: true,
    enquiries,
    stats: {
      totalEnquiries: totalAll,
      newToday: newTodayCount,
      pendingCount,
      inProgressCount,
      resolvedCount,
    },
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  })
}

/**
 * Get stats & summary metrics for website enquiries
 * Endpoint: GET /v1/admin/website-users/enquiries/stats
 */
export const getWebsiteEnquiryStatsController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [total, newToday, newThisWeek, pending, inProgress, resolved] = await Promise.all([
    prisma.websiteEnquiry.count(),
    prisma.websiteEnquiry.count({
      where: { createdAt: { gte: startOfToday } },
    }),
    prisma.websiteEnquiry.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.websiteEnquiry.count({
      where: { status: 'NEW' },
    }),
    prisma.websiteEnquiry.count({
      where: { status: 'IN_PROGRESS' },
    }),
    prisma.websiteEnquiry.count({
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
    }),
  ])

  return c.json({
    success: true,
    stats: {
      total,
      newToday,
      newThisWeek,
      pending,
      inProgress,
      resolved,
    },
  })
}

/**
 * Update website enquiry status & notes
 * Endpoint: PATCH /v1/admin/website-users/enquiries/:id/status
 */
export const updateWebsiteEnquiryStatusController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  const body = await c.req.json<{ status?: string; notes?: string }>()

  const existing = await prisma.websiteEnquiry.findUnique({ where: { id } })
  if (!existing) {
    return c.json(
      {
        success: false,
        error: 'Website enquiry not found',
        code: 'ENQUIRY_NOT_FOUND',
      },
      404
    )
  }

  const updateData: { status?: string; notes?: string } = {}
  if (body.status) {
    updateData.status = body.status.toUpperCase()
  }
  if (typeof body.notes === 'string') {
    updateData.notes = body.notes.trim()
  }

  const updated = await prisma.websiteEnquiry.update({
    where: { id },
    data: updateData,
  })

  return c.json({
    success: true,
    message: 'Enquiry updated successfully',
    enquiry: updated,
  })
}

/**
 * Delete website enquiry by ID
 * Endpoint: DELETE /v1/admin/website-users/enquiries/:id
 */
export const deleteWebsiteEnquiryController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')

  const existing = await prisma.websiteEnquiry.findUnique({ where: { id } })
  if (!existing) {
    return c.json(
      {
        success: false,
        error: 'Website enquiry not found',
        code: 'ENQUIRY_NOT_FOUND',
      },
      404
    )
  }

  await prisma.websiteEnquiry.delete({ where: { id } })

  return c.json({
    success: true,
    message: 'Enquiry deleted successfully',
  })
}

