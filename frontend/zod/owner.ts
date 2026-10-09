import { z } from 'zod'
const phoneRegex = /^(?:(?:\+91|0)[\s-]?)?[6-9]\d{9}$/
export const ownerFormSchema = z.object({
  name: z.string().trim().min(2, "Owner's name must be at least 2 characters.").max(120),
  phone: z.string().trim().regex(phoneRegex, 'Please enter a valid 10-digit mobile number.'),
  email: z.string().trim().email('Please enter a valid email address.').or(z.literal('')),
  whatsappNumber: z.string().trim().refine((value) => !value || phoneRegex.test(value), 'Please enter a valid WhatsApp number.'),
  address: z.string().trim().max(500, 'Address cannot exceed 500 characters.'),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters.'),
  primaryContactPartnerId: z.string().uuid('Please select a primary contact partner.').nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
export type OwnerFormValues = z.infer<typeof ownerFormSchema>
