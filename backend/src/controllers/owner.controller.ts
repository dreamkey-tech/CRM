import type { Context } from 'hono'
import type { Prisma } from '@prisma/client'
import type { AppEnv } from '../db'
import { AppError } from '../lib/errors'
import { directoryInclude, partnerSelect, validateContactPartner, linkedPropertiesController } from '../lib/directory'
import { ownerQuerySchema, type CreateOwnerInput, type UpdateOwnerInput } from '../zod/owner'
import { logAudit, computeEntityDiff } from '../lib/audit'
import { cache } from '../lib/cache'

const ownerInclude = { ...directoryInclude, createdBy: { select: partnerSelect } } as const
const optionalFields = ['email', 'whatsappNumber', 'address', 'notes'] as const
function cleanOwner<T extends CreateOwnerInput | UpdateOwnerInput>(input: T): T {
  const data = { ...input }
  for (const field of optionalFields) if (data[field] === '') data[field] = null
  return data
}

export async function createOwnerController(c: Context<AppEnv>) {
  const user = c.get('user')
  if (!user) throw new AppError('Please sign in before adding an owner.', 401, 'AUTH_REQUIRED')
  const body = cleanOwner(c.req.valid('json' as never) as CreateOwnerInput)
  const partnerId = body.primaryContactPartnerId === undefined ? user.id : body.primaryContactPartnerId
  await validateContactPartner(c, partnerId)
  const owner = await c.get('prisma').owner.create({ data: { ...body, primaryContactPartnerId: partnerId, createdById: user.id }, include: ownerInclude })

  const { diffs, summary } = computeEntityDiff(null, {
    name: owner.name,
    phone: owner.phone,
    email: owner.email,
    address: owner.address,
    status: owner.status,
  })
  await logAudit(c, {
    action: 'CREATE',
    module: 'OWNERS',
    resourceId: owner.id,
    resourceName: owner.name,
    details: `Added new property owner '${owner.name}' (${owner.phone})${summary ? ` | ${summary}` : ''}`,
    changes: diffs,
  })

  await cache.deletePrefix('owners:stats')
  await cache.deletePrefix('dashboard:overview')

  return c.json({ success: true, message: 'Owner added to the directory.', owner }, 201)
}

export async function listOwnersController(c: Context<AppEnv>) {
  const { page, limit, search, status, primaryContactPartnerId, sortBy, sortOrder } = ownerQuerySchema.parse(c.req.query())
  const where: Prisma.OwnerWhereInput = {
    ...(status !== 'ALL' ? { status } : {}),
    ...(primaryContactPartnerId ? { primaryContactPartnerId } : {}),
    ...(search ? { OR: ['name', 'phone', 'email', 'whatsappNumber', 'address'].map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}),
  }
  const prisma = c.get('prisma')
  const [total, owners] = await Promise.all([
    prisma.owner.count({ where }),
    prisma.owner.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sortBy]: sortOrder }, include: ownerInclude }),
  ])
  return c.json({ success: true, owners, pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), hasNextPage: page * limit < total, hasPrevPage: page > 1 } })
}

export async function getOwnerController(c: Context<AppEnv>) {
  const owner = await c.get('prisma').owner.findUnique({ where: { id: c.req.param('id')! }, include: ownerInclude })
  if (!owner) throw new AppError('Owner not found. The record may have been deleted.', 404, 'OWNER_NOT_FOUND')
  return c.json({ success: true, owner })
}

export async function updateOwnerController(c: Context<AppEnv>) {
  const prisma = c.get('prisma'), id = c.req.param('id')!
  const existingOwner = await prisma.owner.findUnique({ where: { id } })
  if (!existingOwner) throw new AppError('Owner not found. Please refresh and try again.', 404, 'OWNER_NOT_FOUND')
  const body = cleanOwner(c.req.valid('json' as never) as UpdateOwnerInput)
  await validateContactPartner(c, body.primaryContactPartnerId)
  const owner = await prisma.owner.update({ where: { id }, data: body, include: ownerInclude })

  const { diffs, summary } = computeEntityDiff(existingOwner, owner)
  if (diffs.length > 0) {
    await logAudit(c, {
      action: 'UPDATE',
      module: 'OWNERS',
      resourceId: owner.id,
      resourceName: owner.name,
      details: `Updated owner '${owner.name}': ${summary}`,
      changes: diffs,
    })
  }

  await cache.deletePrefix('owners:stats')
  await cache.deletePrefix('dashboard:overview')

  return c.json({ success: true, message: 'Owner details saved.', owner })
}

export async function deleteOwnerController(c: Context<AppEnv>) {
  const prisma = c.get('prisma'), id = c.req.param('id')!
  const existingOwner = await prisma.owner.findUnique({ where: { id } })
  if (!existingOwner) throw new AppError('Owner not found or already removed.', 404, 'OWNER_NOT_FOUND')
  await prisma.owner.delete({ where: { id } })

  await logAudit(c, {
    action: 'DELETE',
    module: 'OWNERS',
    resourceId: existingOwner.id,
    resourceName: existingOwner.name,
    details: `Deleted owner '${existingOwner.name}' (${existingOwner.phone})`,
  })

  await cache.deletePrefix('owners:stats')
  await cache.deletePrefix('dashboard:overview')

  return c.json({ success: true, message: 'Owner removed. Linked properties have been kept and unlinked.' })
}

export async function getOwnerStatsController(c: Context<AppEnv>) {
  const prisma = c.get('prisma'), user = c.get('user')!
  const cacheKey = `owners:stats:${user.id}`
  const cached = await cache.get<any>(cacheKey)
  if (cached) {
    c.header?.('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
    return c.json({ success: true, stats: cached })
  }

  let stats = { totalOwners: 0, activeOwners: 0, inactiveOwners: 0, myOwnersCount: 0 }
  try {
    if (typeof (prisma as any).$queryRaw === 'function') {
      const rows: any[] = await (prisma as any).$queryRaw`
        SELECT 
          count(*)::int AS "totalOwners",
          count(*) FILTER (WHERE status = 'ACTIVE')::int AS "activeOwners",
          count(*) FILTER (WHERE status = 'INACTIVE')::int AS "inactiveOwners",
          count(*) FILTER (WHERE "primaryContactPartnerId" = ${user.id})::int AS "myOwnersCount"
        FROM owners
      `
      stats = {
        totalOwners: rows[0]?.totalOwners || 0,
        activeOwners: rows[0]?.activeOwners || 0,
        inactiveOwners: rows[0]?.inactiveOwners || 0,
        myOwnersCount: rows[0]?.myOwnersCount || 0,
      }
    } else {
      const [totalOwners, activeOwners, inactiveOwners, myOwnersCount] = await Promise.all([
        prisma.owner.count(),
        prisma.owner.count({ where: { status: 'ACTIVE' } }),
        prisma.owner.count({ where: { status: 'INACTIVE' } }),
        prisma.owner.count({ where: { primaryContactPartnerId: user.id } }),
      ])
      stats = { totalOwners, activeOwners, inactiveOwners, myOwnersCount }
    }

    await cache.set(cacheKey, stats, 60_000)
    c.header?.('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
    return c.json({ success: true, stats })
  } catch (err: any) {
    console.warn('[getOwnerStatsController] DB query failed, using fallback:', err?.message || err)
    const fallback = cache.getLatest<any>(cacheKey) || stats
    return c.json({ success: true, stats: fallback, isFallback: true })
  }
}

export const getOwnerPropertiesController = linkedPropertiesController('owner')
