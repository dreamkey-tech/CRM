import { z } from 'zod'
import { getClientDocumentFileErrors } from '../config/media-config'
import { propertyTypeSchema, propertyPricingTypeSchema, propertyMediaCategorySchema } from './property'

const phone = z.string().trim().regex(/^(?:(?:\+91|0)[\s-]?)?[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number.')
const optionalText = (max: number) => z.string().trim().max(max, `Cannot exceed ${max} characters.`).nullable().optional()
const partnerIds = z.array(z.string().uuid('Please select a valid partner.')).max(50)
  .refine((ids) => new Set(ids).size === ids.length, 'A partner can only be assigned once.')

export const clientStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export const clientShortlistStatusSchema = z.enum(['SHORTLISTED', 'SHARED', 'VISITED', 'INTERESTED', 'NOT_INTERESTED'])
export const clientShareChannelSchema = z.enum(['WHATSAPP', 'EMAIL', 'LINK'])
export const clientShareStatusSchema = z.enum(['PREPARED', 'COMPOSER_OPENED', 'SENT_CONFIRMED'])
export const clientDocumentCategorySchema = z.enum(['AADHAAR', 'PAYMENT_RECEIPT', 'CLIENT_DOCUMENT', 'PCC_APPLICATION', 'CERTIFICATE', 'KYC'])

const clientFieldsSchema = z.object({
  name: z.string().trim().min(2, "Client's name must be at least 2 characters.").max(120, 'Name cannot exceed 120 characters.'),
  phone,
  email: z.string().trim().max(254).email('Please enter a valid email address.').nullable().optional().or(z.literal('')),
  whatsappNumber: phone.nullable().optional().or(z.literal('')),
  address: optionalText(500),
  notes: optionalText(2000),
  status: clientStatusSchema,
  assignedPartnerIds: partnerIds,
}).strict()

// Creator/assignment attribution comes from auth.user in the future controller.
export const createClientSchema = clientFieldsSchema.extend({
  status: clientStatusSchema.default('ACTIVE'),
  assignedPartnerIds: partnerIds.default([]),
})
// Use fields without creation defaults so a PATCH never resets omitted fields.
export const updateClientSchema = clientFieldsSchema.partial()
export const assignClientPartnersSchema = z.object({ assignedPartnerIds: partnerIds }).strict()
export const clientQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().max(200).optional(),
  scope: z.enum(['ALL', 'MINE']).default('ALL'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).default('ALL'),
  partnerId: z.string().uuid().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).strict()

export const addClientShortlistSchema = z.object({
  propertyId: z.string().uuid('Please select a valid property.'),
  notes: optionalText(2000),
}).strict()
export const updateClientShortlistSchema = z.object({
  status: clientShortlistStatusSchema.optional(),
  notes: optionalText(2000),
}).strict()

export const createClientPropertyShareSchema = z.object({
  shortlistedPropertyId: z.string().uuid('Please select a shortlisted property.'),
  channel: clientShareChannelSchema,
  subject: optionalText(200),
  message: z.string().trim().min(1, 'Please enter a message.').max(8000, 'Message cannot exceed 8000 characters.'),
  selectedMediaIds: z.array(z.string().uuid('Please select valid property media.')).max(100)
    .refine((ids) => new Set(ids).size === ids.length, 'Select each media file only once.').default([]),
  expiresAt: z.string().datetime('Please enter a valid expiry date and time.').nullable().optional(),
}).strict()
// Recipient, token, public snapshot, and creator are resolved/generated server-side.
export const updateClientShareStatusSchema = z.object({
  status: z.enum(['COMPOSER_OPENED', 'SENT_CONFIRMED']),
}).strict()

// Construct this explicitly from listing fields before persisting or returning a share.
export const publicPropertySnapshotSchema = z.object({
  societyBuildingName: z.string().trim().min(2).max(150),
  propertyType: propertyTypeSchema,
  locationArea: z.string().trim().min(2).max(150),
  city: z.string().trim().min(2).max(100),
  pricingType: propertyPricingTypeSchema,
  askingPrice: z.number().positive(),
  carpetAreaSqFt: z.number().positive(),
  superBuiltUpAreaSqFt: z.number().positive().nullable(),
  bedrooms: z.number().int().nonnegative().nullable(),
  bathrooms: z.number().int().nonnegative().nullable(),
  balconies: z.number().int().nonnegative().nullable(),
  floorNumber: z.number().int().nullable(),
  totalFloors: z.number().int().nonnegative().nullable(),
  amenities: z.array(z.string().trim()),
}).strict()

// Retain what was selected even if its live property media is deleted later.
export const selectedPropertyMediaSnapshotSchema = z.array(z.object({
  propertyMediaId: z.string().uuid(),
  category: propertyMediaCategorySchema,
  title: z.string().max(120).nullable(),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  order: z.number().int().nonnegative(),
}).strict()).max(100)

const clientDocumentFieldsSchema = z.object({
  category: clientDocumentCategorySchema,
  title: optionalText(120),
  originalName: z.string().trim().min(1, 'Filename is required.').max(255, 'Filename cannot exceed 255 characters.'),
  mimeType: z.string().trim().toLowerCase().min(1, 'File type is required.'),
  sizeBytes: z.number().int().positive('Please choose a non-empty file.'),
}).strict()
export const clientDocumentMetadataSchema = clientDocumentFieldsSchema.superRefine((file, ctx) => {
  for (const error of getClientDocumentFileErrors(file)) {
    ctx.addIssue({ code: 'custom', path: [error.field], message: error.message })
  }
})
export const generateClientDocumentUploadUrlsSchema = z.object({
  clientId: z.string().uuid('Please save the client before uploading documents.'),
  files: z.array(clientDocumentMetadataSchema).min(1, 'Please select at least one document.').max(30, 'Upload up to 30 documents at once.'),
}).strict()
export const attachClientDocumentSchema = clientDocumentFieldsSchema.extend({
  key: z.string().trim().min(1, 'Storage key is required.').max(1024),
}).superRefine((file, ctx) => {
  for (const error of getClientDocumentFileErrors(file)) {
    ctx.addIssue({ code: 'custom', path: [error.field], message: error.message })
  }
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type AssignClientPartnersInput = z.infer<typeof assignClientPartnersSchema>
export type ClientQuery = z.infer<typeof clientQuerySchema>
export type AddClientShortlistInput = z.infer<typeof addClientShortlistSchema>
export type UpdateClientShortlistInput = z.infer<typeof updateClientShortlistSchema>
export type CreateClientPropertyShareInput = z.infer<typeof createClientPropertyShareSchema>
export type UpdateClientShareStatusInput = z.infer<typeof updateClientShareStatusSchema>
export type PublicPropertySnapshot = z.infer<typeof publicPropertySnapshotSchema>
export type SelectedPropertyMediaSnapshot = z.infer<typeof selectedPropertyMediaSnapshotSchema>
export type GenerateClientDocumentUploadUrlsInput = z.infer<typeof generateClientDocumentUploadUrlsSchema>
export type AttachClientDocumentInput = z.infer<typeof attachClientDocumentSchema>
