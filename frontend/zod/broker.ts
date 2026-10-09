import { z } from 'zod'

const phoneRegex = /^(?:(?:\+91|0)[\s-]?)?[6-9]\d{9}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const brokerFormSchema = z
  .object({
    name: z
      .string({
        required_error: "Please enter the broker's full name.",
        invalid_type_error: "Please enter a valid name.",
      })
      .trim()
      .min(2, "Broker's name must be at least 2 characters.")
      .max(120, "Broker's name cannot exceed 120 characters."),
    phone: z
      .string()
      .trim()
      .refine((val) => !val || phoneRegex.test(val), {
        message: 'Please enter a valid 10-digit mobile number.',
      }),
    email: z
      .string()
      .trim()
      .refine((val) => !val || emailRegex.test(val), {
        message: 'Please enter a valid email address (e.g. broker@example.com).',
      }),
    whatsappNumber: z
      .string()
      .trim()
      .refine((val) => !val || phoneRegex.test(val), {
        message: 'Please enter a valid 10-digit WhatsApp number.',
      }),
    areaOfOperation: z
      .string()
      .trim()
      .max(250, 'Area of operation description is too long (max 250 characters).'),
    primaryContactPartnerId: z
      .string()
      .nullable()
      .optional(),
    minDealValue: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        'Minimum deal value cannot be negative.'
      ),
    maxDealValue: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        'Maximum deal value cannot be negative.'
      ),
    societyExpertise: z
      .array(z.string().trim().min(1, 'Society name cannot be empty.')),
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']),
    notes: z
      .string()
      .trim()
      .max(2000, 'Notes cannot exceed 2000 characters.'),
  })
  .refine(
    (data) => {
      const minVal = data.minDealValue
      const maxVal = data.maxDealValue
      const min = minVal && minVal.trim() !== '' ? Number(minVal) : null
      const max = maxVal && maxVal.trim() !== '' ? Number(maxVal) : null
      if (min !== null && max !== null && !isNaN(min) && !isNaN(max)) {
        return max >= min
      }
      return true
    },
    {
      message: 'Maximum deal value must be greater than or equal to minimum deal value.',
      path: ['maxDealValue'],
    }
  )

export type BrokerFormValues = z.infer<typeof brokerFormSchema>
