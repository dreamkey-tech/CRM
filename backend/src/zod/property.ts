import { z } from 'zod'
import {
  PROPERTY_MEDIA_CONFIG,
  getMediaRuleForCategory,
} from '../config/media-config'

// ==========================================
// ENUM SCHEMAS
// ==========================================

export const propertyTypeSchema = z.enum([
  'FLAT',
  'LAND',
  'WAREHOUSE',
  'COMMERCIAL',
  'OTHER',
])

export const propertyPricingTypeSchema = z.enum(['SALE', 'RENT'])

export const propertyListingStatusSchema = z.enum([
  'AVAILABLE',
  'UNDER_NEGOTIATION',
  'TOKEN_PAID',
  'DEAL_DONE',
  'RENTED_OUT',
  'SOLD',
  'UPCOMING',
])

export const propertyAccessTypeSchema = z.enum(['DIRECT', 'BROKER'])

export const propertyMediaCategorySchema = z.enum([
  'PHOTOGRAPH',
  'VIDEO',
  'FLOOR_PLAN',
  'BROCHURE',
  'OTHER',
])

// Bedroom options: STUDIO (0), 1BHK (1), 2BHK (2), 3BHK (3), 4BHK+ (4+)
export const bedroomTypeSchema = z.enum([
  'STUDIO',
  '1BHK',
  '2BHK',
  '3BHK',
  '4BHK_PLUS',
])

// ==========================================
// MEDIA ATTACH / RECORD SCHEMA
// ==========================================

export const propertyMediaItemSchema = z.object({
  id: z.string().uuid().optional(),
  category: propertyMediaCategorySchema.default('PHOTOGRAPH'),
  title: z.string().max(120).optional().nullable(),
  key: z.string().min(1, 'Storage key is required'),
  url: z.string().url('A valid public URL is required'),
  thumbnailUrl: z.string().url().optional().nullable(),
  mimeType: z.string().min(1, 'MIME type is required'),
  sizeBytes: z.number().int().positive('File size must be greater than 0'),
  order: z.number().int().default(0),
  isCover: z.boolean().default(false),
})

// ==========================================
// MEDIA PRESIGNED URL REQUEST SCHEMA
// ==========================================

export const generateUploadUrlsItemSchema = z
  .object({
    filename: z.string().min(1, 'Filename is required'),
    contentType: z.string().min(1, 'Content-Type / MIME type is required'),
    sizeBytes: z.number().int().positive('Size in bytes is required'),
    category: propertyMediaCategorySchema.default('PHOTOGRAPH'),
    customKey: z.string().optional(), // For brochure or document key identifier
    existingKey: z.string().min(1).optional(), // Re-sign the same object on upload retry
  })
  .superRefine((data, ctx) => {
    const rule = getMediaRuleForCategory(data.category, data.customKey)
    if (!rule) return

    // 1. Validate max size in MB
    const maxSizeBytes = rule.maxMb * 1024 * 1024
    if (data.sizeBytes > maxSizeBytes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sizeBytes'],
        message: `File "${data.filename}" (${(data.sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed size of ${rule.maxMb}MB for ${rule.label}.`,
      })
    }

    // 2. Validate MIME type
    const isMimeAllowed = rule.allowedMimeTypes.some(
      (type) =>
        type.toLowerCase() === data.contentType.toLowerCase() ||
        (type.endsWith('/*') &&
          data.contentType.toLowerCase().startsWith(type.replace('/*', '')))
    )

    if (!isMimeAllowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contentType'],
        message: `File type "${data.contentType}" is not supported for ${rule.label}. Allowed types: ${rule.allowedMimeTypes.join(', ')}`,
      })
    }
  })

export const generateUploadUrlsSchema = z.object({
  propertyId: z.string().uuid().optional(), // Optional: if existing property or draft
  files: z
    .array(generateUploadUrlsItemSchema)
    .min(1, 'Please provide at least one file to upload')
    .max(30, 'Cannot request more than 30 upload URLs at once'),
})

// ==========================================
// CREATE PROPERTY (FULL LISTING) SCHEMA
// ==========================================

export const createPropertyBaseSchema = z.object({
  isDraft: z.boolean().default(false),

  // Mandatory Listing Fields
  propertyType: propertyTypeSchema.default('FLAT'),
  societyBuildingName: z
    .string()
    .trim()
    .min(2, 'Society / Building name must be at least 2 characters')
    .max(150),
  locationArea: z
    .string()
    .trim()
    .min(2, 'Location / Area is required')
    .max(150),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit PIN code'),
  city: z.string().trim().min(2).max(100).default('Mumbai'),

  floorNumber: z.number().int().optional().nullable(),
  totalFloors: z.number().int().nonnegative().optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  balconies: z.number().int().min(0).optional().nullable(),

  carpetAreaSqFt: z
    .number()
    .positive('Carpet area (sq ft) must be greater than 0'),
  superBuiltUpAreaSqFt: z.number().positive().optional().nullable(),

  pricingType: propertyPricingTypeSchema.default('SALE'),
  askingPrice: z
    .number()
    .positive('Asking price/rent must be greater than 0'),

  availabilityStatus: propertyListingStatusSchema.default('AVAILABLE'),
  availabilityDate: z.string().datetime().optional().nullable(),

  // Access Type & Broker link
  accessType: propertyAccessTypeSchema.default('DIRECT'),
  brokerId: z.string().uuid().optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),

  // Society Insights sub-section
  builderName: z.string().trim().max(120).optional().nullable(),
  yearOfConstruction: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .optional()
    .nullable(),
  totalUnits: z.number().int().nonnegative().optional().nullable(),
  amenities: z.array(z.string().trim()).default([]),
  reraNumber: z.string().trim().max(80).optional().nullable(),

  // Additional Notes
  notes: z.string().max(2000).optional().nullable(),

  // Attached Media Records
  media: z.array(propertyMediaItemSchema).optional().default([]),
})

export const createPropertySchema = createPropertyBaseSchema.superRefine((data, ctx) => {
  if (data.ownerId && data.brokerId) ctx.addIssue({ code: 'custom', path: ['ownerId'], message: 'Link either an owner or a broker, not both.' })
  if (data.accessType === 'BROKER' && data.ownerId) ctx.addIssue({ code: 'custom', path: ['ownerId'], message: 'Broker listings cannot link an owner.' })
  if (data.accessType === 'DIRECT' && data.brokerId) ctx.addIssue({ code: 'custom', path: ['brokerId'], message: 'Owner listings cannot link a broker.' })
  if (data.accessType === 'DIRECT' && !data.ownerId && !data.isDraft) ctx.addIssue({ code: 'custom', path: ['ownerId'], message: 'Please link an owner for a direct listing.' })
  // If accessType is BROKER and brokerId is not supplied
  if (data.accessType === 'BROKER' && !data.brokerId && !data.isDraft) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['brokerId'],
      message: 'Please select a broker when Access Type is set to "+1 Broker".',
    })
  }
})

// ==========================================
// CREATE PROPERTY DRAFT (MINIMAL / RELAXED)
// ==========================================

export const createPropertyDraftSchema = z.object({
  id: z.string().uuid().optional(),
  societyBuildingName: z.string().trim().max(150).optional().default('Untitled Draft Property'),
  locationArea: z.string().trim().max(150).optional().default(''),
  pincode: z.string().trim().optional().default('400001'),
  carpetAreaSqFt: z.number().nonnegative().optional().default(0),
  askingPrice: z.number().nonnegative().optional().default(0),
  propertyType: propertyTypeSchema.optional().default('FLAT'),
  pricingType: propertyPricingTypeSchema.optional().default('SALE'),
  availabilityStatus: propertyListingStatusSchema.optional().default('AVAILABLE'),
  accessType: propertyAccessTypeSchema.optional().default('DIRECT'),
  brokerId: z.string().uuid().optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  media: z.array(propertyMediaItemSchema).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.ownerId && data.brokerId) ctx.addIssue({ code: 'custom', path: ['ownerId'], message: 'Choose either an owner or a broker.' })
  if (data.accessType === 'BROKER' && data.ownerId) ctx.addIssue({ code: 'custom', path: ['ownerId'], message: 'Broker listings cannot link an owner.' })
  if (data.accessType === 'DIRECT' && data.brokerId) ctx.addIssue({ code: 'custom', path: ['brokerId'], message: 'Direct listings cannot link a broker.' })
})

// ==========================================
// UPDATE PROPERTY SCHEMA
// ==========================================

export const attachPropertyMediaSchema = z.object({
  media: z.array(propertyMediaItemSchema).min(1).max(30),
})

export const updatePropertySchema = createPropertyBaseSchema.extend({
  isDraft: createPropertyBaseSchema.shape.isDraft.removeDefault(),
  propertyType: createPropertyBaseSchema.shape.propertyType.removeDefault(),
  city: createPropertyBaseSchema.shape.city.removeDefault(),
  pricingType: createPropertyBaseSchema.shape.pricingType.removeDefault(),
  availabilityStatus: createPropertyBaseSchema.shape.availabilityStatus.removeDefault(),
  accessType: createPropertyBaseSchema.shape.accessType.removeDefault(),
  amenities: createPropertyBaseSchema.shape.amenities.removeDefault(),
  media: createPropertyBaseSchema.shape.media.removeDefault(),
}).partial().superRefine((data, ctx) => {
  if (data.ownerId && data.brokerId) ctx.addIssue({ code: 'custom', path: ['ownerId'], message: 'Choose either an owner or a broker.' })
  if (data.accessType === 'BROKER' && data.ownerId) ctx.addIssue({ code: 'custom', path: ['ownerId'], message: 'Broker listings cannot link an owner.' })
  if (data.accessType === 'DIRECT' && data.brokerId) ctx.addIssue({ code: 'custom', path: ['brokerId'], message: 'Direct listings cannot link a broker.' })
})


// ==========================================
// STATUS UPDATE SCHEMA
// ==========================================

export const updatePropertyStatusSchema = z.object({
  availabilityStatus: propertyListingStatusSchema,
  availabilityDate: z.string().datetime().optional().nullable(),
  note: z.string().max(500).optional(),
})

// ==========================================
// REORDER MEDIA SCHEMA
// ==========================================

export const reorderPropertyMediaSchema = z.object({
  mediaOrders: z
    .array(
      z.object({
        id: z.string().uuid(),
        order: z.number().int(),
        isCover: z.boolean().optional(),
      })
    )
    .min(1, 'Please provide media order updates'),
})

// ==========================================
// QUERY / ADVANCED FILTER SCHEMA (FR-SF-01 to FR-SF-08)
// ==========================================

export const propertyFilterQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  
  // FR-SF-08: Full-text search across society name, location, and remarks
  search: z.string().optional(),

  // FR-SF-01: Filter by property type (single or comma-separated e.g. FLAT,COMMERCIAL,OTHER)
  propertyType: z.string().optional(), // supports "FLAT" or "FLAT,LAND,COMMERCIAL"
  
  // Pricing Type (SALE, RENT)
  pricingType: z.string().optional(), // "SALE" or "RENT" or "SALE,RENT"

  // FR-SF-02: Filter by budget range (minimum - maximum price in INR)
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),

  // FR-SF-03: Filter by location / area name / pincode
  locationArea: z.string().optional(), // supports comma-separated locations e.g. "Bandra,Juhu"
  pincode: z.string().optional(),

  // FR-SF-04: Filter by number of bedrooms (e.g. "1,2,3", "STUDIO,1BHK,2BHK,3BHK,4BHK_PLUS")
  bedrooms: z.string().optional(), // "0,1,2,3,4+"
  bedroomTypes: z.string().optional(), // "STUDIO,1BHK,2BHK,3BHK,4BHK_PLUS"
  minBedrooms: z.coerce.number().int().min(0).optional(),
  maxBedrooms: z.coerce.number().int().min(0).optional(),

  // FR-SF-05: Filter by availability status (single or comma-separated)
  availabilityStatus: z.string().optional(), // "AVAILABLE,UNDER_NEGOTIATION"

  // FR-SF-06: Filter by access type: Direct or +1 (BROKER)
  accessType: z.string().optional(), // "DIRECT", "BROKER", "DIRECT,BROKER"

  // FR-SF-07: Filter by source partner
  sourcePartnerId: z.string().optional(), // single UUID or comma-separated

  // Broker filter
  brokerId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),

  // Carpet area range
  minCarpetArea: z.coerce.number().positive().optional(),
  maxCarpetArea: z.coerce.number().positive().optional(),

  // Draft / Archived controls
  isDraft: z
    .enum(['true', 'false', 'all'])
    .optional()
    .transform((val) => {
      if (val === 'true') return true
      if (val === 'false' || val === undefined) return false
      return undefined
    }),
  isArchived: z
    .enum(['true', 'false', 'all'])
    .optional()
    .transform((val) => {
      if (val === 'true') return true
      if (val === 'false') return false
      return false // default: exclude archived
    }),

  // Sorting
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'askingPrice', 'carpetAreaSqFt', 'societyBuildingName'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ==========================================
// FILTER PRESET SCHEMAS (FR-SF-09)
// ==========================================

export const createFilterPresetSchema = z.object({
  name: z.string().trim().min(2, 'Preset name must be at least 2 characters').max(100),
  filters: z.record(z.string(), z.any()),
  isDefault: z.boolean().default(false),
})

export const updateFilterPresetSchema = createFilterPresetSchema.partial()

// ==========================================
// INFERRED TYPES
// ==========================================

export type PropertyType = z.infer<typeof propertyTypeSchema>
export type PropertyPricingType = z.infer<typeof propertyPricingTypeSchema>
export type PropertyListingStatus = z.infer<typeof propertyListingStatusSchema>
export type PropertyAccessType = z.infer<typeof propertyAccessTypeSchema>
export type PropertyMediaCategory = z.infer<typeof propertyMediaCategorySchema>
export type BedroomType = z.infer<typeof bedroomTypeSchema>

export type PropertyMediaItem = z.infer<typeof propertyMediaItemSchema>
export type GenerateUploadUrlsInput = z.infer<typeof generateUploadUrlsSchema>
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type CreatePropertyDraftInput = z.infer<typeof createPropertyDraftSchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type UpdatePropertyStatusInput = z.infer<typeof updatePropertyStatusSchema>
export type ReorderPropertyMediaInput = z.infer<typeof reorderPropertyMediaSchema>
export type PropertyFilterQuery = z.infer<typeof propertyFilterQuerySchema>
export type CreateFilterPresetInput = z.infer<typeof createFilterPresetSchema>
export type UpdateFilterPresetInput = z.infer<typeof updateFilterPresetSchema>

