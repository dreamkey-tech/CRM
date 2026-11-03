import { z } from 'zod'
import { propertyTypeSchema, propertyPricingTypeSchema } from './property'

export const websitePropertyIdParamSchema = z.object({
  id: z.string().uuid('Invalid property ID format'),
})

export const websitePropertyListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().trim().optional(),
  locationArea: z.string().trim().optional(),
  city: z.string().trim().optional(),
  propertyType: propertyTypeSchema.optional(),
  pricingType: propertyPricingTypeSchema.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.string().trim().optional(), // single e.g. "3" or comma-separated e.g. "2,3,4"
  sortBy: z
    .enum(['createdAt', 'askingPrice', 'carpetAreaSqFt', 'societyBuildingName'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type WebsitePropertyListQuery = z.infer<typeof websitePropertyListQuerySchema>
