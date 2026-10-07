import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { websiteAuthMiddleware } from '../middleware/website-auth'
import { websiteRegisterSchema, websiteLoginSchema } from '../zod/website-user'
import { zodValidationHook } from '../lib/validator'
import {
  websiteRegisterController,
  websiteLoginController,
  websiteGetMeController,
  websiteRefreshTokenController,
  websiteLogoutController,
} from '../controllers/website-auth.controller'

import { createWebsiteEnquirySchema } from '../zod/website-enquiry'
import { createWebsiteEnquiryController } from '../controllers/website-enquiry.controller'

export const userRoutes = new Hono<AppEnv>()

/**
 * Website User Authentication & Enquiry Routes
 * Base path mounted at: /v1/user
 */
userRoutes.post(
  '/enquiry',
  zValidator('json', createWebsiteEnquirySchema, zodValidationHook),
  createWebsiteEnquiryController
)

userRoutes.post(
  '/auth/register',
  zValidator('json', websiteRegisterSchema, zodValidationHook),
  websiteRegisterController
)


userRoutes.post(
  '/auth/login',
  zValidator('json', websiteLoginSchema, zodValidationHook),
  websiteLoginController
)

userRoutes.get('/auth/me', websiteAuthMiddleware, websiteGetMeController)

userRoutes.post('/auth/refresh', websiteRefreshTokenController)

userRoutes.post('/auth/logout', websiteLogoutController)
