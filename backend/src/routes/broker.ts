import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { optionalAuthMiddleware } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import {
  createBrokerSchema,
  updateBrokerSchema,
} from '../zod/broker'
import {
  createBrokerController,
  getBrokerStatsController,
  getBrokersListController,
  getBrokerByIdController,
  updateBrokerController,
  deleteBrokerController,
} from '../controllers/broker.controller'

export const brokerRoutes = new Hono<AppEnv>()

// Optional auth to attach user info (e.g. for primary contact partner default)
brokerRoutes.use('*', optionalAuthMiddleware)

/**
 * 1. GET /v1/brokers/stats - Aggregate broker stats (total, active, new this week/month, top areas)
 */
brokerRoutes.get('/stats', getBrokerStatsController)

/**
 * 2. GET /v1/brokers - List brokers with pagination, search, and filtering
 */
brokerRoutes.get('/', getBrokersListController)

/**
 * 3. GET /v1/brokers/:id - Get a single broker by ID
 */
brokerRoutes.get('/:id', getBrokerByIdController)

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
  zValidator('json', updateBrokerSchema, zodValidationHook),
  updateBrokerController
)

/**
 * 5. PATCH /v1/brokers/:id - Partial update for broker
 */
brokerRoutes.patch(
  '/:id',
  zValidator('json', updateBrokerSchema, zodValidationHook),
  updateBrokerController
)

/**
 * 6. DELETE /v1/brokers/:id - Delete a broker
 */
brokerRoutes.delete('/:id', deleteBrokerController)
