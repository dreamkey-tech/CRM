import type { Context } from 'hono'
import type { AppEnv } from '../db'
import type { CreateBrokerInput, UpdateBrokerInput } from '../zod/broker'
import { directoryInclude, validateContactPartner, linkedPropertiesController } from '../lib/directory'
import { brokerQuerySchema } from '../zod/broker'
import { AppError } from '../lib/errors'
import { BrokerStatus } from '@prisma/client'

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

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalBrokers,
    activeBrokers,
    inactiveBrokers,
    blockedBrokers,
    newBrokersToday,
    newBrokersThisWeek,
    newBrokersThisMonth,
    myBrokersCount,
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

  // Aggregate areas of operation
  const areasWithCount = await prisma.broker.groupBy({
    by: ['areaOfOperation'],
    where: {
      areaOfOperation: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 5,
  })

  const topAreas = areasWithCount
    .filter((a) => a.areaOfOperation)
    .map((a) => ({
      area: a.areaOfOperation as string,
      count: a._count.id,
    }))

  return c.json({
    success: true,
    stats: {
      totalBrokers,
      activeBrokers,
      inactiveBrokers,
      blockedBrokers,
      myBrokersCount,
      newBrokersToday,
      newBrokersThisWeek,
      newBrokersThisMonth,
      topAreas,
    },
  })
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

  return c.json({
    success: true,
    message: 'Broker deleted successfully.',
  })
}

export const getBrokerPropertiesController = linkedPropertiesController('broker')
