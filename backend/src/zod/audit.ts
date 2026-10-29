import { z } from 'zod'

export const auditQuerySchema = z.object({
  module: z.string().trim().optional(),
  action: z.string().trim().optional(),
  status: z.enum(['ALL', 'SUCCESS', 'DENIED']).default('ALL'),
  userId: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
})

export type AuditQueryInput = z.infer<typeof auditQuerySchema>
