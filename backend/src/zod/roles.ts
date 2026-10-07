import { z } from 'zod'

/**
 * Zod validation schema for creating a new custom role
 */
export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name must be at least 2 characters long'),
  description: z
    .string()
    .trim()
    .optional(),
  permissionIds: z
    .array(z.string().min(1, 'Invalid permission ID'))
    .default([]),
})

/**
 * Zod validation schema for updating role permissions and metadata
 */
export const updateRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name must be at least 2 characters long')
    .optional(),
  description: z
    .string()
    .trim()
    .optional(),
  permissionIds: z
    .array(z.string().min(1, 'Invalid permission ID'))
    .optional(),
})

/**
 * Zod validation schema for assigning roles to a user
 */
export const assignUserRolesSchema = z.object({
  roleIds: z
    .array(z.string().min(1, 'Invalid role ID'))
    .min(1, 'At least one role ID is required'),
})
