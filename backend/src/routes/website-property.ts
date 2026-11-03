import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { websiteAuthMiddleware } from '../middleware/website-auth'
import { zodValidationHook } from '../lib/validator'
import {
  websitePropertyListQuerySchema,
  websitePropertyIdParamSchema,
} from '../zod/website-property'
import {
  listWebsitePropertiesController,
  listBestPropertiesController,
  trackWebsitePropertyClickController,
  getWebsitePropertyDetailController,
} from '../controllers/website-property.controller'

export const websitePropertyRoutes = new Hono<AppEnv>()

/**
 * DreamKey Website Public & Customer Property Endpoints
 * 
 * 1. Public Listing API:
 *    GET /v1/website/properties/list
 *    GET /v1/website/properties
 * 
 * 2. Click / Interest Recording API (Requires Website Login):
 *    POST /v1/website/properties/list/:id/click
 *    POST /v1/website/properties/:id/click
 * 
 * 3. Authenticated Details API (Requires Website Login, sanitized safe details):
 *    GET /v1/website/properties/list/:id
 *    GET /v1/website/properties/:id
 */

// 1. Public Property Listing (with filters, pagination, cover image)
websitePropertyRoutes.get(
  '/list',
  zValidator('query', websitePropertyListQuerySchema, zodValidationHook),
  listWebsitePropertiesController
)
websitePropertyRoutes.get(
  '/',
  zValidator('query', websitePropertyListQuerySchema, zodValidationHook),
  listWebsitePropertiesController
)

// 1.1 Public Best Properties (Showcase, max 3 properties, unauthenticated)
websitePropertyRoutes.get(
  '/best-properties',
  listBestPropertiesController
)

// 2. Track User Property Click (Authenticated via Website Cookies / Token)
websitePropertyRoutes.post(
  '/list/:id/click',
  websiteAuthMiddleware,
  zValidator('param', websitePropertyIdParamSchema, zodValidationHook),
  trackWebsitePropertyClickController
)
websitePropertyRoutes.post(
  '/:id/click',
  websiteAuthMiddleware,
  zValidator('param', websitePropertyIdParamSchema, zodValidationHook),
  trackWebsitePropertyClickController
)

// 3. Authenticated Property Details (Excludes broker/owner contacts, internal notes & sensitive PDFs)
websitePropertyRoutes.get(
  '/list/:id',
  websiteAuthMiddleware,
  zValidator('param', websitePropertyIdParamSchema, zodValidationHook),
  getWebsitePropertyDetailController
)
websitePropertyRoutes.get(
  '/:id',
  websiteAuthMiddleware,
  zValidator('param', websitePropertyIdParamSchema, zodValidationHook),
  getWebsitePropertyDetailController
)
