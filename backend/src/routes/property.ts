import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission } from '../middleware/auth'
import { directoryIdSchema } from '../lib/directory'
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
  listDistinctSocietiesController,
} from '../controllers/property.controller'

export const propertyRoutes = new Hono<AppEnv>()

// Property records and uploads require a signed-in CRM user.
propertyRoutes.use('*', authMiddleware)

/**
 * 0. GET /v1/properties/stats
 * Returns high-level aggregated property statistics
 */
propertyRoutes.get('/stats', requirePermission('properties:read'), getPropertyStatsController)

/**
 * 1. GET /v1/properties/config/media-limits
 * Returns dynamic media upload limits (maxMB, maxCount, allowed mime types)
 */
propertyRoutes.get('/config/media-limits', requirePermission('properties:read'), getPropertyMediaConfigController)

/**
 * 2. POST /v1/properties/media/upload-urls
 * Generates short-lived S3 Presigned PUT URLs for direct client-to-R2 upload
 */
propertyRoutes.post(
  '/media/upload-urls',
  requirePermission('properties:create'),
  zValidator('json', generateUploadUrlsSchema, zodValidationHook),
  generatePropertyUploadUrlsController
)

/**
 * 3. Filter Presets (FR-SF-09)
 */
propertyRoutes.get('/filters/presets', requirePermission('properties:read'), listPropertyFilterPresetsController)
propertyRoutes.post('/filters/presets', requirePermission('properties:create'), createPropertyFilterPresetController)
propertyRoutes.delete('/filters/presets/:presetId', requirePermission('properties:delete'), deletePropertyFilterPresetController)

/**
 * 4. POST /v1/properties/draft
 * Creates a lightweight draft property for immediate background file uploads
 */
propertyRoutes.post(
  '/draft',
  requirePermission('properties:create'),
  zValidator('json', createPropertyDraftSchema, zodValidationHook),
  createPropertyDraftController
)

/**
 * 5. GET /v1/properties
 * List all properties with search, filters (FR-SF-01 to FR-SF-08), sorting, and pagination
 */
propertyRoutes.get(
  '/',
  requirePermission('properties:read'),
  zValidator('query', propertyFilterQuerySchema, zodValidationHook),
  listPropertiesController
)

/**
 * 6. POST /v1/properties
 * Creates a full property listing
 */
propertyRoutes.post(
  '/',
  requirePermission('properties:create'),
  zValidator('json', createPropertySchema, zodValidationHook),
  createPropertyController
)

/**
 * 6.1 GET /v1/properties/societies/profiles
 * Retrieve distinct societies/buildings with their shared metadata for quick pre-fill
 */
propertyRoutes.get(
  '/societies/profiles',
  requirePermission('properties:read'),
  listDistinctSocietiesController
)

/**
 * 7. GET /v1/properties/:id
 * Retrieve full property details by ID (with media, broker, partner, audit logs)
 */
propertyRoutes.get('/:id', requirePermission('properties:read'), zValidator('param', directoryIdSchema, zodValidationHook), getPropertyByIdController)

/**
 * 8. PUT /v1/properties/:id
 * Update property details (and record audit log)
 */
propertyRoutes.put(
  '/:id',
  requirePermission('properties:update'),
  zValidator('param', directoryIdSchema, zodValidationHook),
  zValidator('json', updatePropertySchema, zodValidationHook),
  updatePropertyController
)

/**
 * 9. PATCH /v1/properties/:id/status
 * Quick update for listing availability status
 */
propertyRoutes.patch(
  '/:id/status',
  requirePermission('properties:update'),
  zValidator('json', updatePropertyStatusSchema, zodValidationHook),
  updatePropertyStatusController
)

/**
 * 10. POST /v1/properties/:id/media
 * Attach newly completed background media uploads to an existing property/draft
 */
propertyRoutes.post('/:id/media/discard-upload', requirePermission('properties:update'), discardPropertyUploadController)

propertyRoutes.post('/:id/media', requirePermission('properties:update'), zValidator('json', attachPropertyMediaSchema, zodValidationHook), attachPropertyMediaController)

/**
 * 11. PUT /v1/properties/:id/media/reorder
 * Reorder media items and set primary cover image
 */
propertyRoutes.put(
  '/:id/media/reorder',
  requirePermission('properties:update'),
  zValidator('json', reorderPropertyMediaSchema, zodValidationHook),
  reorderPropertyMediaController
)

/**
 * 12. DELETE /v1/properties/:id/media/:mediaId
 * Deletes a single media item from DB and deletes the object from Cloudflare R2
 */
propertyRoutes.delete('/:id/media/:mediaId', requirePermission('properties:delete'), deletePropertyMediaController)

/**
 * 13. PATCH /v1/properties/:id/archive
 * Toggle archive/restore state without deleting listing history
 */
propertyRoutes.patch('/:id/archive', requirePermission('properties:update'), toggleArchivePropertyController)

/**
 * 14. DELETE /v1/properties/:id
 * Permanently delete property from DB and batch-purge all associated media from R2
 */
propertyRoutes.delete('/:id', requirePermission('properties:delete'), zValidator('param', directoryIdSchema, zodValidationHook), deletePropertyController)
