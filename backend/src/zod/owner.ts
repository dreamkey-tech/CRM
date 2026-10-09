import { z } from 'zod'

const phone = z.string().trim().regex(/^(?:(?:\+91|0)[\s-]?)?[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number.')
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional().or(z.literal(''))
export const ownerStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export const createOwnerSchema = z.object({
  name: z.string().trim().min(2, "Owner's name must be at least 2 characters.").max(120),
  phone,
  email: z.string().trim().email('Please enter a valid email address.').nullable().optional().or(z.literal('')),
  whatsappNumber: phone.nullable().optional().or(z.literal('')),
  address: optionalText(500),
  primaryContactPartnerId: z.string().uuid('Please select a valid primary contact partner.').nullable().optional(),
  notes: optionalText(2000),
  status: ownerStatusSchema.default('ACTIVE'),
})
export const updateOwnerSchema = createOwnerSchema.extend({
  status: createOwnerSchema.shape.status.removeDefault(),
}).partial()
export const ownerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).default('ALL'),
  primaryContactPartnerId: z.string().uuid().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>
