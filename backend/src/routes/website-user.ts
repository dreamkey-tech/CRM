import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { websiteAuthMiddleware } from '../middleware/website-auth'
import {
  websiteRegisterSchema,
  websiteLoginSchema,
  websiteVerifyLoginOtpSchema,
  websiteForgotPasswordSchema,
  websiteVerifyResetOtpSchema,
  websiteResetPasswordSchema,
  websiteResendOtpSchema,
} from '../zod/website-user'
import { zodValidationHook } from '../lib/validator'
import {
  websiteRegisterController,
  websiteLoginController,
  websiteVerifyLoginOtpController,
  websiteResendOtpController,
  websiteForgotPasswordController,
  websiteVerifyResetOtpController,
  websiteResetPasswordController,
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

// Registration
userRoutes.post(
  '/auth/register',
  zValidator('json', websiteRegisterSchema, zodValidationHook),
  websiteRegisterController
)

// Login Flow: Step 1 (Validate Credentials & Send 4-digit OTP)
userRoutes.post(
  '/auth/login',
  zValidator('json', websiteLoginSchema, zodValidationHook),
  websiteLoginController
)

// Login Flow: Step 2 (Verify 4-digit OTP -> Email Verified -> Session Created)
userRoutes.post(
  '/auth/verify-login-otp',
  zValidator('json', websiteVerifyLoginOtpSchema, zodValidationHook),
  websiteVerifyLoginOtpController
)

// Resend OTP for either Login or Password Reset
userRoutes.post(
  '/auth/resend-otp',
  zValidator('json', websiteResendOtpSchema, zodValidationHook),
  websiteResendOtpController
)

// Password Reset Flow: Step 1 (Request 4-digit OTP to Email)
userRoutes.post(
  '/auth/forgot-password',
  zValidator('json', websiteForgotPasswordSchema, zodValidationHook),
  websiteForgotPasswordController
)

// Password Reset Flow: Step 2 (Optional Pre-check 4-digit OTP)
userRoutes.post(
  '/auth/verify-reset-otp',
  zValidator('json', websiteVerifyResetOtpSchema, zodValidationHook),
  websiteVerifyResetOtpController
)

// Password Reset Flow: Step 3 (Submit OTP + New Password -> Done)
userRoutes.post(
  '/auth/reset-password',
  zValidator('json', websiteResetPasswordSchema, zodValidationHook),
  websiteResetPasswordController
)

// Profile & Session Management
userRoutes.get('/auth/me', websiteAuthMiddleware, websiteGetMeController)
userRoutes.post('/auth/refresh', websiteRefreshTokenController)
userRoutes.post('/auth/logout', websiteLogoutController)

