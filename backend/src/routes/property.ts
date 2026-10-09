import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { optionalAuthMiddleware } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import {
  generateUploadUrlsSchema,
  attachPropertyMediaSchema,
  createPropertySchema,
  createPropertyDraftSchema,
  updatePropertySchema,
  updatePropertyStatusSchema,
  reorderPropertyMediaSchema,
  propertyFilterQuerySchema,
} from '../zod/property'
import {
  getPropertyMediaConfigController,
  discardPropertyUploadController,
  generatePropertyUploadUrlsController,
  createPropertyDraftController,
  createPropertyController,
  listPropertiesController,
  getPropertyByIdController,
  updatePropertyController,
  updatePropertyStatusController,
  attachPropertyMediaController,
  deletePropertyMediaController,
  reorderPropertyMediaController,
  toggleArchivePropertyController,
  deletePropertyController,
  listPropertyFilterPresetsController,
  createPropertyFilterPresetController,
  deletePropertyFilterPresetController,
  getPropertyStatsController,
} from '../controllers/property.controller'

export const propertyRoutes = new Hono<AppEnv>()

// Optional auth middleware attaches authenticated CRM user if session exists
propertyRoutes.use('*', optionalAuthMiddleware)

/**
 * 0. GET /v1/properties/stats
 * Returns high-level aggregated property statistics
 */
propertyRoutes.get('/stats', getPropertyStatsController)

/**
 * 1. GET /v1/properties/config/media-limits
 * Returns dynamic media upload limits (maxMB, maxCount, allowed mime types)
 */
propertyRoutes.get('/config/media-limits', getPropertyMediaConfigController)

/**
 * 2. POST /v1/properties/media/upload-urls
 * Generates short-lived S3 Presigned PUT URLs for direct client-to-R2 upload
 */
propertyRoutes.post(
  '/media/upload-urls',
  zValidator('json', generateUploadUrlsSchema, zodValidationHook),
  generatePropertyUploadUrlsController
)

/**
 * 3. Filter Presets (FR-SF-09)
 * GET /v1/properties/filters/presets - List saved presets
 * POST /v1/properties/filters/presets - Save a new preset
 * DELETE /v1/properties/filters/presets/:presetId - Delete preset
 */
propertyRoutes.get('/filters/presets', listPropertyFilterPresetsController)
propertyRoutes.post('/filters/presets', createPropertyFilterPresetController)
propertyRoutes.delete('/filters/presets/:presetId', deletePropertyFilterPresetController)

/**
 * 4. POST /v1/properties/draft
 * Creates a lightweight draft property for immediate background file uploads
 */
propertyRoutes.post(
  '/draft',
  zValidator('json', createPropertyDraftSchema, zodValidationHook),
  createPropertyDraftController
)

/**
 * 5. GET /v1/properties
 * List all properties with search, filters (FR-SF-01 to FR-SF-08), sorting, and pagination
 */
propertyRoutes.get(
  '/',
  zValidator('query', propertyFilterQuerySchema, zodValidationHook),
  listPropertiesController
)

/**
 * 6. POST /v1/properties
 * Creates a full property listing
 */
propertyRoutes.post(
  '/',
  zValidator('json', createPropertySchema, zodValidationHook),
  createPropertyController
)

/**
 * 7. GET /v1/properties/:id
 * Retrieve full property details by ID (with media, broker, partner, audit logs)
 */
propertyRoutes.get('/:id', getPropertyByIdController)

/**
 * 8. PUT /v1/properties/:id
 * Update property details (and record audit log)
 */
propertyRoutes.put(
  '/:id',
  zValidator('json', updatePropertySchema, zodValidationHook),
  updatePropertyController
)

/**
 * 9. PATCH /v1/properties/:id/status
 * Quick update for listing availability status (Available, Under Negotiation, Token Paid, Sold, etc.)
 */
propertyRoutes.patch(
  '/:id/status',
  zValidator('json', updatePropertyStatusSchema, zodValidationHook),
  updatePropertyStatusController
)

/**
 * 10. POST /v1/properties/:id/media
 * Attach newly completed background media uploads to an existing property/draft
 */
propertyRoutes.post('/:id/media/discard-upload', discardPropertyUploadController)

propertyRoutes.post('/:id/media', zValidator('json', attachPropertyMediaSchema, zodValidationHook), attachPropertyMediaController)

/**
 * 11. PUT /v1/properties/:id/media/reorder
 * Reorder media items and set primary cover image
 */
propertyRoutes.put(
  '/:id/media/reorder',
  zValidator('json', reorderPropertyMediaSchema, zodValidationHook),
  reorderPropertyMediaController
)

/**
 * 12. DELETE /v1/properties/:id/media/:mediaId
 * Deletes a single media item from DB and deletes the object from Cloudflare R2
 */
propertyRoutes.delete('/:id/media/:mediaId', deletePropertyMediaController)

/**
 * 13. PATCH /v1/properties/:id/archive
 * Toggle archive/restore state without deleting listing history
 */
propertyRoutes.patch('/:id/archive', toggleArchivePropertyController)

/**
 * 14. DELETE /v1/properties/:id
 * Permanently delete property from DB and batch-purge all associated media from R2
 */
propertyRoutes.delete('/:id', deletePropertyController)
