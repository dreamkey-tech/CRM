import { z } from 'zod'

export const createWebsiteEnquirySchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  mobileNo: z
    .string()
    .trim()
    .regex(
      /^(?:(?:\+91|0)[\s-]?)?[6-9]\d{9}$/,
      'Please provide a valid 10-digit Indian mobile number (e.g. +91 9876543210 or 9876543210)'
    ),
  email: z.string().email('Invalid email address'),
  propertyType: z.string().min(1, 'Property type is required'),
  preferredLocation: z.string().min(1, 'Preferred location is required'),
  estimatedBudgetBand: z.string().min(1, 'Estimated budget band is required'),
  specificRequirements: z.string().optional().nullable(),
})

export type CreateWebsiteEnquiryInput = z.infer<typeof createWebsiteEnquirySchema>
