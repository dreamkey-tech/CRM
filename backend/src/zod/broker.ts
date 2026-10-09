import { z } from 'zod'

const phoneRegex = /^(?:(?:\+91|0)[\s-]?)?[6-9]\d{9}$/
const generalPhoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/

export const brokerStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'], {
  message: 'Status must be one of: ACTIVE, INACTIVE, or BLOCKED',
})

export const createBrokerSchema = z
  .object({
    name: z
      .string({
        message: "Please enter the broker's name.",
      })
      .trim()
      .min(2, "Broker's name must be at least 2 characters.")
      .max(120, "Broker's name cannot exceed 120 characters."),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a valid phone number.')
      .optional()
      .nullable()
      .or(z.literal('')),
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address (e.g. broker@example.com).')
      .optional()
      .nullable()
      .or(z.literal('')),
    whatsappNumber: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a valid WhatsApp number.')
      .optional()
      .nullable()
      .or(z.literal('')),
    areaOfOperation: z
      .string()
      .trim()
      .max(250, 'Area of operation description is too long (max 250 characters).')
      .optional()
      .nullable()
      .or(z.literal('')),
    primaryContactPartnerId: z
      .string()
      .uuid('Please select a valid partner user.')
      .optional()
      .nullable()
      .or(z.literal('')),
    minDealValue: z
      .coerce
      .number({
        message: 'Minimum deal value must be a valid number.',
      })
      .min(0, 'Minimum deal value cannot be negative.')
      .optional()
      .nullable(),
    maxDealValue: z
      .coerce
      .number({
        message: 'Maximum deal value must be a valid number.',
      })
      .min(0, 'Maximum deal value cannot be negative.')
      .optional()
      .nullable(),
    societyExpertise: z
      .array(z.string().trim().min(1, 'Society name cannot be empty'))
      .optional()
      .default([]),
    status: brokerStatusEnum.default('ACTIVE'),
    notes: z
      .string()
      .trim()
      .max(2000, 'Notes cannot exceed 2000 characters.')
      .optional()
      .nullable()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (
        data.minDealValue !== undefined &&
        data.minDealValue !== null &&
        data.maxDealValue !== undefined &&
        data.maxDealValue !== null
      ) {
        return data.maxDealValue >= data.minDealValue
      }
      return true
    },
    {
      message: 'Maximum deal value must be greater than or equal to minimum deal value.',
      path: ['maxDealValue'],
    }
  )

export const updateBrokerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Broker's name must be at least 2 characters.")
      .max(120, "Broker's name cannot exceed 120 characters.")
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a valid phone number.')
      .optional()
      .nullable()
      .or(z.literal('')),
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address (e.g. broker@example.com).')
      .optional()
      .nullable()
      .or(z.literal('')),
    whatsappNumber: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a valid WhatsApp number.')
      .optional()
      .nullable()
      .or(z.literal('')),
    areaOfOperation: z
      .string()
      .trim()
      .max(250, 'Area of operation description is too long (max 250 characters).')
      .optional()
      .nullable()
      .or(z.literal('')),
    primaryContactPartnerId: z
      .string()
      .uuid('Please select a valid partner user.')
      .optional()
      .nullable()
      .or(z.literal('')),
    minDealValue: z
      .coerce
      .number({
        message: 'Minimum deal value must be a valid number.',
      })
      .min(0, 'Minimum deal value cannot be negative.')
      .optional()
      .nullable(),
    maxDealValue: z
      .coerce
      .number({
        message: 'Maximum deal value must be a valid number.',
      })
      .min(0, 'Maximum deal value cannot be negative.')
      .optional()
      .nullable(),
    societyExpertise: z
      .array(z.string().trim().min(1, 'Society name cannot be empty'))
      .optional(),
    status: brokerStatusEnum.optional(),
    notes: z
      .string()
      .trim()
      .max(2000, 'Notes cannot exceed 2000 characters.')
      .optional()
      .nullable()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (
        data.minDealValue !== undefined &&
        data.minDealValue !== null &&
        data.maxDealValue !== undefined &&
        data.maxDealValue !== null
      ) {
        return data.maxDealValue >= data.minDealValue
      }
      return true
    },
    {
      message: 'Maximum deal value must be greater than or equal to minimum deal value.',
      path: ['maxDealValue'],
    }
  )

export const brokerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'ALL']).optional().default('ALL'),
  primaryContactPartnerId: z.string().uuid().optional(),
  areaOfOperation: z.string().trim().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'minDealValue', 'maxDealValue']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateBrokerInput = z.infer<typeof createBrokerSchema>
export type UpdateBrokerInput = z.infer<typeof updateBrokerSchema>
export type BrokerQueryInput = z.infer<typeof brokerQuerySchema>
