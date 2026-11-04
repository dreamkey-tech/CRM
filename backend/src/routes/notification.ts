import { Hono } from 'hono'
import type { AppEnv } from '../db'
import { authMiddleware } from '../middleware/auth'
import {
  listNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
} from '../controllers/notification.controller'

export const notificationRoutes = new Hono<AppEnv>()

notificationRoutes.use('*', authMiddleware)

notificationRoutes.get('/', listNotificationsController)
notificationRoutes.patch('/read-all', markAllNotificationsReadController)
notificationRoutes.patch('/:id/read', markNotificationReadController)
