import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import { createOwnerSchema, updateOwnerSchema, ownerQuerySchema } from '../zod/owner'
import { directoryIdSchema, linkedPropertiesQuerySchema, getDirectoryPartnersController } from '../lib/directory'
import { createOwnerController, listOwnersController, getOwnerController, updateOwnerController, deleteOwnerController, getOwnerStatsController, getOwnerPropertiesController } from '../controllers/owner.controller'

export const ownerRoutes = new Hono<AppEnv>()
ownerRoutes.use('*', authMiddleware)
ownerRoutes.get('/stats', getOwnerStatsController)
ownerRoutes.get('/partners', getDirectoryPartnersController)
ownerRoutes.get('/', zValidator('query', ownerQuerySchema, zodValidationHook), listOwnersController)
ownerRoutes.post('/', zValidator('json', createOwnerSchema, zodValidationHook), createOwnerController)
ownerRoutes.get('/:id/properties', zValidator('param', directoryIdSchema, zodValidationHook), zValidator('query', linkedPropertiesQuerySchema, zodValidationHook), getOwnerPropertiesController)
ownerRoutes.get('/:id', zValidator('param', directoryIdSchema, zodValidationHook), getOwnerController)
ownerRoutes.put('/:id', zValidator('param', directoryIdSchema, zodValidationHook), zValidator('json', updateOwnerSchema, zodValidationHook), updateOwnerController)
ownerRoutes.patch('/:id', zValidator('param', directoryIdSchema, zodValidationHook), zValidator('json', updateOwnerSchema, zodValidationHook), updateOwnerController)
ownerRoutes.delete('/:id', zValidator('param', directoryIdSchema, zodValidationHook), deleteOwnerController)
