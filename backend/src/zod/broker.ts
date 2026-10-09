import { z } from 'zod'

const phone = z.string().trim().regex(/^(?:(?:\+91|0)[\s-]?)?[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number.')
export const brokerStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
export const createBrokerSchema = z.object({
  name: z.string().trim().min(2, "Broker's name must be at least 2 characters.").max(120),
  phone: phone.optional().nullable().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email address.').optional().nullable().or(z.literal('')),
  whatsappNumber: phone.optional().nullable().or(z.literal('')),
  areaOfOperation: z.string().trim().max(250).optional().nullable().or(z.literal('')),
  primaryContactPartnerId: z.string().uuid('Please select a valid partner.').optional().nullable(),
  minDealValue: z.coerce.number().min(0, 'Minimum deal value cannot be negative.').optional().nullable(),
  societyExpertise: z.array(z.string().trim().min(1)).default([]),
  status: brokerStatusEnum.default('ACTIVE'),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters.').optional().nullable().or(z.literal('')),
})
export const updateBrokerSchema = createBrokerSchema.extend({
  societyExpertise: createBrokerSchema.shape.societyExpertise.removeDefault(),
  status: createBrokerSchema.shape.status.removeDefault(),
}).partial()
export const brokerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'ALL']).default('ALL'),
  primaryContactPartnerId: z.string().uuid().optional(),
  areaOfOperation: z.string().trim().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'minDealValue', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})
export type CreateBrokerInput = z.infer<typeof createBrokerSchema>
export type UpdateBrokerInput = z.infer<typeof updateBrokerSchema>
export type BrokerQueryInput = z.infer<typeof brokerQuerySchema>
