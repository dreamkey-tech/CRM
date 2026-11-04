import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
} from '../zod/task'
import {
  listTasksController,
  getCalendarTasksController,
  getTaskStatsController,
  getTaskHistoryController,
  getTaskByIdController,
  createTaskController,
  updateTaskController,
  updateTaskStatusController,
  deleteTaskController,
  runTaskRemindersController,
  getCalendarSyncStatusController,
  initiateGoogleCalendarAuthController,
  disconnectGoogleCalendarController,
  getIcalFeedController,
} from '../controllers/task.controller'

export const taskRoutes = new Hono<AppEnv>()

// Public / token-authenticated iCal subscription feed (for Google Calendar & Apple Calendar)
taskRoutes.get('/feed/:feedToken', getIcalFeedController)

// All CRM partner task management routes require authentication
taskRoutes.use('*', authMiddleware)

// 1. Task Lists, Calendar, Stats & History
taskRoutes.get('/', zValidator('query', taskQuerySchema, zodValidationHook), listTasksController)
taskRoutes.get('/calendar', getCalendarTasksController)
taskRoutes.get('/stats', getTaskStatsController)
taskRoutes.get('/history', getTaskHistoryController)
taskRoutes.get('/calendar-sync/status', getCalendarSyncStatusController)
taskRoutes.post('/calendar-sync/connect', initiateGoogleCalendarAuthController)
taskRoutes.post('/calendar-sync/disconnect', disconnectGoogleCalendarController)

// 2. Cron Trigger for Reminders & Digests
taskRoutes.post('/cron/reminders', runTaskRemindersController)

// 3. Task by ID & Operations
taskRoutes.get('/:id', getTaskByIdController)
taskRoutes.post('/', zValidator('json', createTaskSchema, zodValidationHook), createTaskController)
taskRoutes.patch('/:id', zValidator('json', updateTaskSchema, zodValidationHook), updateTaskController)
taskRoutes.patch(
  '/:id/status',
  zValidator('json', updateTaskStatusSchema, zodValidationHook),
  updateTaskStatusController
)
taskRoutes.delete('/:id', deleteTaskController)
