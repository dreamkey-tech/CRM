import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission } from '../middleware/auth'
import {
  createRoleSchema,
  updateRoleSchema,
  assignUserRolesSchema,
} from '../zod/roles'
import { zodValidationHook } from '../lib/validator'
import {
  getPermissionsController,
  getRolesController,
  createRoleController,
  updateRoleController,
  assignUserRolesController,
} from '../controllers/roles.controller'

export const roleRoutes = new Hono<AppEnv>()

/**
 * Role & Permission Management Routes
 * Base path mounted at: /v1/admin
 */
// All role management endpoints require authentication
roleRoutes.use('*', authMiddleware)

roleRoutes.get('/permissions', requirePermission('roles:read'), getPermissionsController)
roleRoutes.get('/roles', requirePermission('roles:read'), getRolesController)

roleRoutes.post(
  '/roles',
  requirePermission('roles:create'),
  zValidator('json', createRoleSchema, zodValidationHook),
  createRoleController
)

roleRoutes.put(
  '/roles/:id',
  requirePermission('roles:update'),
  zValidator('json', updateRoleSchema, zodValidationHook),
  updateRoleController
)

roleRoutes.post(
  '/users/:id/roles',
  requirePermission('users:update'),
  zValidator('json', assignUserRolesSchema, zodValidationHook),
  assignUserRolesController
)
