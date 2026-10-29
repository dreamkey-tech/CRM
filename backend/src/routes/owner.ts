import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import { createOwnerSchema, updateOwnerSchema, ownerQuerySchema } from '../zod/owner'
import { directoryIdSchema, linkedPropertiesQuerySchema, getDirectoryPartnersController } from '../lib/directory'
import { createOwnerController, listOwnersController, getOwnerController, updateOwnerController, deleteOwnerController, getOwnerStatsController, getOwnerPropertiesController } from '../controllers/owner.controller'

export const ownerRoutes = new Hono<AppEnv>()
ownerRoutes.use('*', authMiddleware)
ownerRoutes.get('/stats', requirePermission('owners:read'), getOwnerStatsController)
ownerRoutes.get('/partners', requirePermission('owners:read'), getDirectoryPartnersController)
ownerRoutes.get('/', requirePermission('owners:read'), zValidator('query', ownerQuerySchema, zodValidationHook), listOwnersController)
ownerRoutes.post('/', requirePermission('owners:create'), zValidator('json', createOwnerSchema, zodValidationHook), createOwnerController)
ownerRoutes.get('/:id/properties', requirePermission('owners:read'), zValidator('param', directoryIdSchema, zodValidationHook), zValidator('query', linkedPropertiesQuerySchema, zodValidationHook), getOwnerPropertiesController)
ownerRoutes.get('/:id', requirePermission('owners:read'), zValidator('param', directoryIdSchema, zodValidationHook), getOwnerController)
ownerRoutes.put('/:id', requirePermission('owners:update'), zValidator('param', directoryIdSchema, zodValidationHook), zValidator('json', updateOwnerSchema, zodValidationHook), updateOwnerController)
ownerRoutes.patch('/:id', requirePermission('owners:update'), zValidator('param', directoryIdSchema, zodValidationHook), zValidator('json', updateOwnerSchema, zodValidationHook), updateOwnerController)
ownerRoutes.delete('/:id', requirePermission('owners:delete'), zValidator('param', directoryIdSchema, zodValidationHook), deleteOwnerController)
