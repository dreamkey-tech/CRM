import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import {
  createBrokerSchema,
  updateBrokerSchema,
  brokerQuerySchema,
} from '../zod/broker'
import {
  createBrokerController,
  getBrokerPropertiesController,
  getBrokerStatsController,
  getBrokersListController,
  getBrokerByIdController,
  updateBrokerController,
  deleteBrokerController,
} from '../controllers/broker.controller'

import { directoryIdSchema, linkedPropertiesQuerySchema, getDirectoryPartnersController } from '../lib/directory'

export const brokerRoutes = new Hono<AppEnv>()

// The authenticated user is the default primary contact partner.
brokerRoutes.use('*', authMiddleware)

/**
 * 1. GET /v1/brokers/stats - Aggregate broker stats (total, active, new this week/month, top areas)
 */
brokerRoutes.get('/stats', getBrokerStatsController)

/**
 * 2. GET /v1/brokers - List brokers with pagination, search, and filtering
 */
brokerRoutes.get('/', zValidator('query', brokerQuerySchema, zodValidationHook), getBrokersListController)

/**
 * 3. GET /v1/brokers/:id - Get a single broker by ID
 */
brokerRoutes.get('/partners', getDirectoryPartnersController)
brokerRoutes.get('/:id/properties', zValidator('param', directoryIdSchema, zodValidationHook), zValidator('query', linkedPropertiesQuerySchema, zodValidationHook), getBrokerPropertiesController)
brokerRoutes.get('/:id', zValidator('param', directoryIdSchema, zodValidationHook), getBrokerByIdController)

/**
 * 3. POST /v1/brokers - Create a new broker
 */
brokerRoutes.post(
  '/',
  zValidator('json', createBrokerSchema, zodValidationHook),
  createBrokerController
)

/**
 * 4. PUT /v1/brokers/:id - Update an existing broker
 */
brokerRoutes.put(
  '/:id',
  zValidator('param', directoryIdSchema, zodValidationHook),
  zValidator('json', updateBrokerSchema, zodValidationHook),
  updateBrokerController
)

/**
 * 5. PATCH /v1/brokers/:id - Partial update for broker
 */
brokerRoutes.patch(
  '/:id',
  zValidator('param', directoryIdSchema, zodValidationHook),
  zValidator('json', updateBrokerSchema, zodValidationHook),
  updateBrokerController
)

/**
 * 6. DELETE /v1/brokers/:id - Delete a broker
 */
brokerRoutes.delete('/:id', zValidator('param', directoryIdSchema, zodValidationHook), deleteBrokerController)
