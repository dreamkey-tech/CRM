import { z } from 'zod'

export const moduleAccessSchema = z.object({
  properties: z.enum(['NONE', 'VIEW', 'FULL']).default('VIEW'),
  clients: z.enum(['NONE', 'VIEW', 'FULL']).default('VIEW'),
  brokers: z.enum(['NONE', 'VIEW', 'FULL']).default('VIEW'),
  owners: z.enum(['NONE', 'VIEW', 'FULL']).default('VIEW'),
  finance: z.enum(['NONE', 'VIEW', 'FULL']).default('NONE'),
  canViewSensitiveDocs: z.boolean().default(false),
})

export type ModuleAccessInput = z.infer<typeof moduleAccessSchema>

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(1, 'Please enter the employee name.').max(100),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.').max(128),
  roleName: z.string().trim().optional(),
  moduleAccess: moduleAccessSchema.optional(),
  customPermissions: z.array(z.string()).optional(),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>

export const updateEmployeeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  roleName: z.string().trim().optional(),
  moduleAccess: moduleAccessSchema.optional(),
  customPermissions: z.array(z.string()).optional(),
})

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

export const resetEmployeePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long.').max(128),
})

export type ResetEmployeePasswordInput = z.infer<typeof resetEmployeePasswordSchema>

export const employeeQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(['ALL', 'ACTIVE', 'INACTIVE']).default('ALL'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>
