import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware } from '../middleware/auth'
import { registerSchema, loginSchema } from '../zod/auth'
import { zodValidationHook } from '../lib/validator'
import {
  registerController,
  loginController,
  getMeController,
  logoutController,
} from '../controllers/auth.controller'

export const authRoutes = new Hono<AppEnv>()

/**
 * Auth Routes
 * Base path mounted at: /v1/auth
 */
authRoutes.post('/register', zValidator('json', registerSchema, zodValidationHook), registerController)
authRoutes.post('/login', zValidator('json', loginSchema, zodValidationHook), loginController)
authRoutes.get('/me', authMiddleware, getMeController)
authRoutes.post('/logout', logoutController)
