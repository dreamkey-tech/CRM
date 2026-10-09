import { z } from 'zod'
import { getClientDocumentFileErrors } from '../config/media-config'

const phoneRegex = /^(?:(?:\+91|0)[\s-]?)?[6-9]\d{9}$/
export const clientStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export const clientShortlistStatusSchema = z.enum(['SHORTLISTED', 'SHARED', 'VISITED', 'INTERESTED', 'NOT_INTERESTED'])
export const clientShareChannelSchema = z.enum(['WHATSAPP', 'EMAIL', 'LINK'])
export const clientShareStatusSchema = z.enum(['PREPARED', 'COMPOSER_OPENED', 'SENT_CONFIRMED'])
export const clientDocumentCategorySchema = z.enum(['AADHAAR', 'PAYMENT_RECEIPT', 'CLIENT_DOCUMENT', 'PCC_APPLICATION', 'CERTIFICATE', 'KYC'])
export const clientDocumentUploadOptionsSchema = z.object({
  category: clientDocumentCategorySchema,
  title: z.string().trim().max(120, 'Title cannot exceed 120 characters.'),
})
export type ClientDocumentUploadOptions = z.infer<typeof clientDocumentUploadOptionsSchema>

export const clientFormSchema = z.object({
  name: z.string().trim().min(2, "Client's name must be at least 2 characters.").max(120, 'Name cannot exceed 120 characters.'),
  phone: z.string().trim().regex(phoneRegex, 'Please enter a valid 10-digit mobile number.'),
  email: z.string().trim().max(254).email('Please enter a valid email address.').or(z.literal('')),
  whatsappNumber: z.string().trim().refine((value) => !value || phoneRegex.test(value), 'Please enter a valid WhatsApp number.'),
  address: z.string().trim().max(500, 'Address cannot exceed 500 characters.'),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters.'),
  status: clientStatusSchema,
  assignedPartnerIds: z.array(z.string().uuid('Please select a valid partner.')).max(50)
    .refine((ids) => new Set(ids).size === ids.length, 'A partner can only be assigned once.'),
}).strict()

export const clientShortlistFormSchema = z.object({
  propertyId: z.string().uuid('Please select a property.'),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters.'),
}).strict()
export const clientShortlistUpdateFormSchema = z.object({
  status: clientShortlistStatusSchema,
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters.'),
}).strict()
export const clientPropertyShareFormSchema = z.object({
  shortlistedPropertyId: z.string().uuid('Please select a shortlisted property.'),
  channel: clientShareChannelSchema,
  subject: z.string().trim().max(200, 'Subject cannot exceed 200 characters.'),
  message: z.string().trim().min(1, 'Please enter a message.').max(8000, 'Message cannot exceed 8000 characters.'),
  selectedMediaIds: z.array(z.string().uuid('Please select valid property media.')).max(100)
    .refine((ids) => new Set(ids).size === ids.length, 'Select each media file only once.'),
  expiresAt: z.string().datetime('Please enter a valid expiry date and time.').nullable(),
}).strict()

// Validate file metadata before starting an upload; the backend repeats validation.
export const clientDocumentFormSchema = z.object({
  category: clientDocumentCategorySchema,
  title: z.string().trim().max(120, 'Title cannot exceed 120 characters.'),
  originalName: z.string().trim().min(1, 'Filename is required.').max(255, 'Filename cannot exceed 255 characters.'),
  mimeType: z.string().trim().toLowerCase().min(1, 'File type is required.'),
  sizeBytes: z.number().int().positive('Please choose a non-empty file.'),
}).strict().superRefine((file, ctx) => {
  for (const error of getClientDocumentFileErrors(file)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [error.field], message: error.message })
  }
})

export type ClientFormValues = z.infer<typeof clientFormSchema>
export type ClientShortlistFormValues = z.infer<typeof clientShortlistFormSchema>
export type ClientShortlistUpdateFormValues = z.infer<typeof clientShortlistUpdateFormSchema>
export type ClientPropertyShareFormValues = z.infer<typeof clientPropertyShareFormSchema>
export type ClientDocumentFormValues = z.infer<typeof clientDocumentFormSchema>
