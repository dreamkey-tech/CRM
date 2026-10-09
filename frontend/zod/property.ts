import { z } from 'zod'

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

const basePropertyFormSchema = z
  .object({
    propertyType: propertyTypeSchema,
    pricingType: propertyPricingTypeSchema,
    societyBuildingName: z
      .string({
        required_error: 'Please enter the society / building name.',
      })
      .trim()
      .min(2, 'Society / building name must be at least 2 characters.')
      .max(150, 'Society / building name cannot exceed 150 characters.'),
    locationArea: z
      .string({
        required_error: 'Please enter the location or area name.',
      })
      .trim()
      .min(2, 'Location / area name is required.')
      .max(150, 'Location area cannot exceed 150 characters.'),
    pincode: z
      .string()
      .trim()
      .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit PIN code.'),
    city: z.string().trim().min(2, 'City is required.').max(100),

    floorNumber: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), 'Floor number must be a valid number.'),
    totalFloors: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        'Total floors must be greater than 0.'
      ),
    bedrooms: z
      .string()
      .optional()
      .refine((val) => val === '' || val === undefined || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: 'Please enter a valid number of bedrooms.',
      }),
    bathrooms: z
      .string()
      .optional()
      .refine((val) => val === '' || val === undefined || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: 'Please enter a valid number of bathrooms.',
      }),
    balconies: z
      .string()
      .optional()
      .refine((val) => val === '' || val === undefined || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: 'Please enter a valid number of balconies.',
      }),

    carpetAreaSqFt: z
      .string({
        required_error: 'Please enter the carpet area (sq ft).',
      })
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        'Carpet area must be a positive number.'
      ),
    superBuiltUpAreaSqFt: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        'Super built-up area cannot be negative.'
      ),

    askingPrice: z
      .string({
        required_error: 'Please enter the asking price / rent.',
      })
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        'Asking price must be a positive number.'
      ),

    availabilityStatus: propertyListingStatusSchema,
    availabilityDate: z.string().optional(),

    accessType: propertyAccessTypeSchema,
    ownerId: z.string().uuid('Please select a valid owner.').nullable().optional(),
    brokerId: z.string().uuid('Please select a valid broker.').nullable().optional(),

    builderName: z.string().trim().max(120).optional(),
    yearOfConstruction: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          (!isNaN(Number(val)) &&
            Number(val) >= 1900 &&
            Number(val) <= new Date().getFullYear() + 10),
        'Please enter a valid 4-digit construction year.'
      ),
    totalUnits: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        'Total units must be greater than 0.'
      ),
    amenities: z.array(z.string()),
    reraNumber: z.string().trim().max(80).optional(),
    notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters.').optional(),
  })
  .refine(
    (data) => {
      if (data.accessType === 'BROKER' && !data.brokerId) {
        return false
      }
      return true
    },
    {
      message: 'Please link a broker when Access Type is set to "+1 Broker".',
      path: ['brokerId'],
    }
  )

export const propertyFormSchema = basePropertyFormSchema.superRefine((data, context) => {
  if (data.accessType === 'DIRECT' && !data.ownerId) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select an owner for this direct listing.', path: ['ownerId'] })
  if (data.ownerId && data.brokerId) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Choose either an owner or a broker.', path: ['ownerId'] })
})

export type PropertyFormValues = z.infer<typeof propertyFormSchema>
