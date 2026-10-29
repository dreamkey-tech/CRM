import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import { auditQuerySchema } from '../zod/audit'
import {
  listAuditLogsController,
  getAuditStatsController,
} from '../controllers/audit.controller'

export const auditRoutes = new Hono<AppEnv>()

// All audit routes require authentication and audit:read permission
auditRoutes.use('*', authMiddleware)

auditRoutes.get(
  '/stats',
  requirePermission('audit:read'),
  getAuditStatsController
)

auditRoutes.get(
  '/',
  requirePermission('audit:read'),
  zValidator('query', auditQuerySchema, zodValidationHook),
  listAuditLogsController
)
