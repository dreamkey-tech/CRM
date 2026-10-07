import { z } from 'zod'
import { createRoleSchema, updateRoleSchema, assignUserRolesSchema } from '../zod/roles'

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type AssignUserRolesInput = z.infer<typeof assignUserRolesSchema>

export interface PermissionDto {
  id: string
  name: string
  description: string | null
  category: string
}

export interface RoleDto {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  userCount?: number
  permissions: PermissionDto[]
}
