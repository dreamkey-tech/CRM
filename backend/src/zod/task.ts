import { z } from 'zod'

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])
export const taskCategoryEnum = z.enum([
  'CLIENT_MEETING',
  'SITE_VISIT',
  'DOCUMENT_WORK',
  'ADMIN',
  'OTHER',
])
export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'])

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(200, 'Title must not exceed 200 characters.'),
  description: z.string().trim().max(5000).optional().nullable(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date format.' }),
  priority: taskPriorityEnum.default('MEDIUM'),
  category: taskCategoryEnum.default('OTHER'),
  assigneeIds: z
    .array(z.string().uuid('Invalid partner ID format.'))
    .min(1, 'Please assign at least one partner.'),
  clientId: z.string().uuid('Invalid client ID format.').optional().nullable(),
  propertyId: z.string().uuid('Invalid property ID format.').optional().nullable(),
})

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(200, 'Title must not exceed 200 characters.')
    .optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date format.' })
    .optional(),
  priority: taskPriorityEnum.optional(),
  category: taskCategoryEnum.optional(),
  status: taskStatusEnum.optional(),
  assigneeIds: z
    .array(z.string().uuid('Invalid partner ID format.'))
    .min(1, 'Please assign at least one partner.')
    .optional(),
  clientId: z.string().uuid().optional().nullable(),
  propertyId: z.string().uuid().optional().nullable(),
})

export const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
})

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(15),
  search: z.string().trim().optional(),
  status: z.union([taskStatusEnum, z.literal('ALL')]).default('ALL'),
  priority: z.union([taskPriorityEnum, z.literal('ALL')]).default('ALL'),
  category: z.union([taskCategoryEnum, z.literal('ALL')]).default('ALL'),
  partnerId: z.string().optional(),
  scope: z.enum(['ALL', 'MINE']).default('ALL'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>
export type TaskQueryInput = z.infer<typeof taskQuerySchema>
