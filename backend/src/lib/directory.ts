import type { Context } from 'hono'
import type { AppEnv } from '../db'
import { z } from 'zod'
import { AppError } from './errors'

export const directoryIdSchema = z.object({ id: z.string().uuid('Please select a valid record.') })
export const linkedPropertiesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})
export const partnerSelect = { id: true, name: true, email: true } as const
export const directoryInclude = {
  primaryContactPartner: { select: partnerSelect },
  _count: { select: { properties: { where: { isDraft: false } } } },
} as const

export async function validateContactPartner(c: Context<AppEnv>, id: string | null | undefined) {
  if (!id) return
  const partner = await c.get('prisma').user.findFirst({ where: { id, isActive: true }, select: { id: true } })
  if (!partner) throw new AppError('Please select an active primary contact partner.', 400, 'PARTNER_NOT_FOUND', [
    { field: 'primaryContactPartnerId', message: 'Please select an active primary contact partner.' },
  ])
}

export async function getDirectoryPartnersController(c: Context<AppEnv>) {
  const partners = await c.get('prisma').user.findMany({ where: { isActive: true }, select: partnerSelect, orderBy: { name: 'asc' } })
  return c.json({ success: true, partners })
}

export function linkedPropertiesController(kind: 'owner' | 'broker') {
  return async (c: Context<AppEnv>) => {
    const id = c.req.param('id')!
    const prisma = c.get('prisma')
    const record = kind === 'owner' ? await prisma.owner.findUnique({ where: { id } }) : await prisma.broker.findUnique({ where: { id } })
    if (!record) throw new AppError(`${kind === 'owner' ? 'Owner' : 'Broker'} not found.`, 404)
    const { page, limit } = linkedPropertiesQuerySchema.parse(c.req.query())
    const where = { [kind === 'owner' ? 'ownerId' : 'brokerId']: id, isDraft: false }
    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { updatedAt: 'desc' },
        select: { id: true, societyBuildingName: true, locationArea: true, city: true, pricingType: true,
          askingPrice: true, availabilityStatus: true, isArchived: true, carpetAreaSqFt: true,
          media: { where: { category: 'PHOTOGRAPH' }, orderBy: [{ isCover: 'desc' }, { order: 'asc' }], take: 1, select: { url: true } },
        },
      }),
    ])
    return c.json({ success: true, properties, pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), hasNextPage: page * limit < total, hasPrevPage: page > 1 } })
  }
}
