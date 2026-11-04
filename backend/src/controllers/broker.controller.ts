import type { Context } from 'hono'
import type { AppEnv } from '../db'
import type { CreateBrokerInput, UpdateBrokerInput } from '../zod/broker'
import { directoryInclude, validateContactPartner, linkedPropertiesController } from '../lib/directory'
import { brokerQuerySchema } from '../zod/broker'
import { AppError } from '../lib/errors'
import { BrokerStatus } from '@prisma/client'
import { logAudit, computeEntityDiff } from '../lib/audit'
import { cache } from '../lib/cache'

/**
 * Helper to clean empty string values into null for optional DB columns
 */
function sanitizeBrokerData<T extends Record<string, any>>(data: T): T {
  const sanitized: Record<string, any> = { ...data }
  const nullableFields = [
    'phone',
    'email',
    'whatsappNumber',
    'areaOfOperation',
    'primaryContactPartnerId',
    'notes',
  ]

  for (const field of nullableFields) {
    if (field in sanitized && (sanitized[field] === '' || sanitized[field] === undefined)) {
      sanitized[field] = null
    }
  }

  return sanitized as T
}

/**
 * 1. Create a new Broker
 * Endpoint: POST /v1/brokers
 * Automatically assigns `primaryContactPartnerId` to the currently authenticated user
 */
export const createBrokerController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const authUser = c.get('user')
  const rawBody = c.req.valid('json' as never) as CreateBrokerInput

  const data = sanitizeBrokerData(rawBody)

  try {
    if (!authUser) throw new AppError('Please sign in before adding a broker.', 401, 'AUTH_REQUIRED')
    const partnerId = data.primaryContactPartnerId === undefined ? authUser.id : data.primaryContactPartnerId
    await validateContactPartner(c, partnerId)

    const broker = await prisma.broker.create({
      data: {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        whatsappNumber: data.whatsappNumber ?? null,
        areaOfOperation: data.areaOfOperation ?? null,
        primaryContactPartnerId: partnerId,
        minDealValue: data.minDealValue !== null && data.minDealValue !== undefined ? Number(data.minDealValue) : null,
        societyExpertise: data.societyExpertise ?? [],
        status: (data.status as BrokerStatus) || BrokerStatus.ACTIVE,
        notes: data.notes ?? null,
      },
      include: directoryInclude,
    })

    const { diffs, summary } = computeEntityDiff(null, {
      name: broker.name,
      phone: broker.phone,
      email: broker.email,
      areaOfOperation: broker.areaOfOperation,
      status: broker.status,
    })
    await logAudit(c, {
      action: 'CREATE',
      module: 'BROKERS',
      resourceId: broker.id,
      resourceName: broker.name,
      details: `Added new broker '${broker.name}' (${broker.phone || 'No phone'})${summary ? ` | ${summary}` : ''}`,
      changes: diffs,
    })

    await cache.deletePrefix('brokers:stats')
    await cache.deletePrefix('dashboard:overview')

    return c.json(
      {
        success: true,
        message: 'Broker registered successfully.',
        broker,
      },
      201
    )
  } catch (err) {
    console.error('Error creating broker:', err)
    throw err
  }
}

/**
 * 2. Get Broker Statistics & Metrics for Dashboard
 * Endpoint: GET /v1/brokers/stats
 */
export const getBrokerStatsController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const authUser = c.get('user')

  const cacheKey = `brokers:stats:${authUser?.id || 'all'}`
  const cached = await cache.get<any>(cacheKey)
  if (cached) {
    c.header?.('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
    return c.json({ success: true, stats: cached })
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  let stats: any = {
    totalBrokers: 0,
    activeBrokers: 0,
    inactiveBrokers: 0,
    blockedBrokers: 0,
    myBrokersCount: 0,
    newBrokersToday: 0,
    newBrokersThisWeek: 0,
    newBrokersThisMonth: 0,
    topAreas: [],
  }

  try {
    if (typeof (prisma as any).$queryRaw === 'function') {
      const [countRows, areaRows] = await Promise.all([
        (prisma as any).$queryRaw`
          SELECT
            COUNT(*)::int AS "totalBrokers",
            COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS "activeBrokers",
            COUNT(*) FILTER (WHERE status = 'INACTIVE')::int AS "inactiveBrokers",
            COUNT(*) FILTER (WHERE status = 'BLOCKED')::int AS "blockedBrokers",
            COUNT(*) FILTER (WHERE "createdAt" >= ${startOfToday})::int AS "newBrokersToday",
            COUNT(*) FILTER (WHERE "createdAt" >= ${sevenDaysAgo})::int AS "newBrokersThisWeek",
            COUNT(*) FILTER (WHERE "createdAt" >= ${thirtyDaysAgo})::int AS "newBrokersThisMonth",
            COUNT(*) FILTER (WHERE "primaryContactPartnerId" = ${authUser?.id || null})::int AS "myBrokersCount"
          FROM brokers
        `,
        (prisma as any).$queryRaw`
          SELECT "areaOfOperation" AS "area", COUNT(*)::int AS "count"
          FROM brokers
          WHERE "areaOfOperation" IS NOT NULL
          GROUP BY "areaOfOperation"
          ORDER BY "count" DESC
          LIMIT 5
        `,
      ])

      const counts = countRows[0] || {}
      stats = {
        totalBrokers: counts.totalBrokers || 0,
        activeBrokers: counts.activeBrokers || 0,
        inactiveBrokers: counts.inactiveBrokers || 0,
        blockedBrokers: counts.blockedBrokers || 0,
        myBrokersCount: counts.myBrokersCount || 0,
        newBrokersToday: counts.newBrokersToday || 0,
        newBrokersThisWeek: counts.newBrokersThisWeek || 0,
        newBrokersThisMonth: counts.newBrokersThisMonth || 0,
        topAreas: areaRows.map((a: any) => ({ area: a.area, count: a.count })),
      }
    } else {
      const [
        totalBrokers, activeBrokers, inactiveBrokers, blockedBrokers,
        newBrokersToday, newBrokersThisWeek, newBrokersThisMonth, myBrokersCount,
      ] = await Promise.all([
        prisma.broker.count(),
        prisma.broker.count({ where: { status: BrokerStatus.ACTIVE } }),
        prisma.broker.count({ where: { status: BrokerStatus.INACTIVE } }),
        prisma.broker.count({ where: { status: BrokerStatus.BLOCKED } }),
        prisma.broker.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.broker.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.broker.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        authUser?.id
          ? prisma.broker.count({ where: { primaryContactPartnerId: authUser.id } })
          : Promise.resolve(0),
      ])

      const areasWithCount = await prisma.broker.groupBy({
        by: ['areaOfOperation'],
        where: { areaOfOperation: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      })

      const topAreas = areasWithCount
        .filter((a) => a.areaOfOperation)
        .map((a) => ({ area: a.areaOfOperation as string, count: a._count.id }))

      stats = {
        totalBrokers, activeBrokers, inactiveBrokers, blockedBrokers,
        myBrokersCount, newBrokersToday, newBrokersThisWeek, newBrokersThisMonth,
        topAreas,
      }
    }

    await cache.set(cacheKey, stats, 60_000)
    c.header?.('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')

    return c.json({
      success: true,
      stats,
    })
  } catch (err: any) {
    console.warn('[getBrokerStatsController] DB query failed, using fallback:', err?.message || err)
    const fallback = cache.getLatest<any>(cacheKey) || stats
    return c.json({ success: true, stats: fallback, isFallback: true })
  }
}

/**
 * 2. Fetch Brokers with filter, search, and pagination
 * Endpoint: GET /v1/brokers
 */
export const getBrokersListController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')

  const { page, limit, search, status, primaryContactPartnerId, areaOfOperation, sortBy, sortOrder } = brokerQuerySchema.parse(c.req.query())
  const skip = (page - 1) * limit

  const whereClause: any = {}

  // Filter by status if specified and not 'ALL'
  if (status && status !== 'ALL') {
    if (Object.values(BrokerStatus).includes(status as BrokerStatus)) {
      whereClause.status = status as BrokerStatus
    }
  }

  // Filter by primary contact partner
  if (primaryContactPartnerId) {
    whereClause.primaryContactPartnerId = primaryContactPartnerId
  }

  // Filter by area of operation
  if (areaOfOperation) {
    whereClause.areaOfOperation = {
      contains: areaOfOperation,
      mode: 'insensitive',
    }
  }

  // Search across multiple fields
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { whatsappNumber: { contains: search, mode: 'insensitive' } },
      { areaOfOperation: { contains: search, mode: 'insensitive' } },
      { societyExpertise: { has: search } },
    ]
  }

  // Allowed sort fields to prevent invalid property sorting
  const validSortFields = ['name', 'createdAt', 'updatedAt', 'minDealValue', 'status']
  const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'

  const [totalCount, brokers] = await Promise.all([
    prisma.broker.count({ where: whereClause }),
    prisma.broker.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        [orderByField]: sortOrder,
      },
      include: directoryInclude,
    }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return c.json({
    success: true,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: totalPages || 1,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    brokers,
  })
}

/**
 * 3. Fetch a single broker by ID
 * Endpoint: GET /v1/brokers/:id
 */
export const getBrokerByIdController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const brokerId = c.req.param('id')

  const broker = await prisma.broker.findUnique({
    where: { id: brokerId },
    include: directoryInclude,
  })

  if (!broker) {
    return c.json(
      {
        success: false,
        error: 'Broker not found. The record may have been deleted.',
        code: 'BROKER_NOT_FOUND',
      },
      404
    )
  }

  return c.json({
    success: true,
    broker,
  })
}

/**
 * 4. Update an existing broker
 * Endpoint: PUT /v1/brokers/:id or PATCH /v1/brokers/:id
 */
export const updateBrokerController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const brokerId = c.req.param('id')
  const rawBody = c.req.valid('json' as never) as UpdateBrokerInput

  // Check if broker exists
  const existingBroker = await prisma.broker.findUnique({
    where: { id: brokerId },
  })

  if (!existingBroker) {
    return c.json(
      {
        success: false,
        error: 'Broker not found. Please refresh the page and try again.',
        code: 'BROKER_NOT_FOUND',
      },
      404
    )
  }

  const data = sanitizeBrokerData(rawBody)

  await validateContactPartner(c, data.primaryContactPartnerId)

  const updatedBroker = await prisma.broker.update({
    where: { id: brokerId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber }),
      ...(data.areaOfOperation !== undefined && { areaOfOperation: data.areaOfOperation }),
      ...(data.primaryContactPartnerId !== undefined && { primaryContactPartnerId: data.primaryContactPartnerId }),
      ...(data.minDealValue !== undefined && { minDealValue: data.minDealValue }),
      ...(data.societyExpertise !== undefined && { societyExpertise: data.societyExpertise }),
      ...(data.status !== undefined && { status: data.status as BrokerStatus }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: directoryInclude,
  })

  const { diffs, summary } = computeEntityDiff(existingBroker, updatedBroker)
  if (diffs.length > 0) {
    await logAudit(c, {
      action: 'UPDATE',
      module: 'BROKERS',
      resourceId: updatedBroker.id,
      resourceName: updatedBroker.name,
      details: `Updated broker '${updatedBroker.name}': ${summary}`,
      changes: diffs,
    })
  }

  await cache.deletePrefix('brokers:stats')
  await cache.deletePrefix('dashboard:overview')

  return c.json({
    success: true,
    message: 'Broker information updated successfully.',
    broker: updatedBroker,
  })
}

/**
 * 5. Delete a broker
 * Endpoint: DELETE /v1/brokers/:id
 */
export const deleteBrokerController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const brokerId = c.req.param('id')

  const existingBroker = await prisma.broker.findUnique({
    where: { id: brokerId },
  })

  if (!existingBroker) {
    return c.json(
      {
        success: false,
        error: 'Broker not found or already deleted.',
        code: 'BROKER_NOT_FOUND',
      },
      404
    )
  }

  await prisma.broker.delete({
    where: { id: brokerId },
  })

  await logAudit(c, {
    action: 'DELETE',
    module: 'BROKERS',
    resourceId: existingBroker.id,
    resourceName: existingBroker.name,
    details: `Deleted broker '${existingBroker.name}' (${existingBroker.phone || 'No phone'})`,
  })

  await cache.deletePrefix('brokers:stats')
  await cache.deletePrefix('dashboard:overview')

  return c.json({
    success: true,
    message: 'Broker deleted successfully.',
  })
}

export const getBrokerPropertiesController = linkedPropertiesController('broker')
