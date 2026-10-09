import type { Context } from 'hono'
import type { Prisma } from '@prisma/client'
import type { AppEnv } from '../db'
import { AppError } from '../lib/errors'
import { directoryInclude, partnerSelect, validateContactPartner, linkedPropertiesController } from '../lib/directory'
import { ownerQuerySchema, type CreateOwnerInput, type UpdateOwnerInput } from '../zod/owner'

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
  if (!(await prisma.owner.findUnique({ where: { id } }))) throw new AppError('Owner not found. Please refresh and try again.', 404, 'OWNER_NOT_FOUND')
  const body = cleanOwner(c.req.valid('json' as never) as UpdateOwnerInput)
  await validateContactPartner(c, body.primaryContactPartnerId)
  const owner = await prisma.owner.update({ where: { id }, data: body, include: ownerInclude })
  return c.json({ success: true, message: 'Owner details saved.', owner })
}
export async function deleteOwnerController(c: Context<AppEnv>) {
  const prisma = c.get('prisma'), id = c.req.param('id')!
  if (!(await prisma.owner.findUnique({ where: { id } }))) throw new AppError('Owner not found or already removed.', 404, 'OWNER_NOT_FOUND')
  await prisma.owner.delete({ where: { id } })
  return c.json({ success: true, message: 'Owner removed. Linked properties have been kept and unlinked.' })
}
export async function getOwnerStatsController(c: Context<AppEnv>) {
  const prisma = c.get('prisma'), user = c.get('user')!
  const [totalOwners, activeOwners, inactiveOwners, myOwnersCount] = await Promise.all([
    prisma.owner.count(), prisma.owner.count({ where: { status: 'ACTIVE' } }), prisma.owner.count({ where: { status: 'INACTIVE' } }),
    prisma.owner.count({ where: { primaryContactPartnerId: user.id } }),
  ])
  return c.json({ success: true, stats: { totalOwners, activeOwners, inactiveOwners, myOwnersCount } })
}
export const getOwnerPropertiesController = linkedPropertiesController('owner')
