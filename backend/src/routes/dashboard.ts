import { Hono } from 'hono'
import type { AppEnv } from '../db'
import { authMiddleware } from '../middleware/auth'
import { getDashboardOverviewController } from '../controllers/dashboard.controller'

export const dashboardRoutes = new Hono<AppEnv>()

dashboardRoutes.use('*', authMiddleware)

dashboardRoutes.get('/overview', getDashboardOverviewController)
