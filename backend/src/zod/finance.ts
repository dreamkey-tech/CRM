import { z } from 'zod'

export const transactionTypeEnum = z.enum(['INCOME', 'EXPENSE'])

export const incomeCategoryEnum = z.enum([
  'BROKERAGE_RECEIVED',
  'RENTAL_COMMISSION',
  'SALE_COMMISSION',
  'CONSULTATION_FEES',
  'OTHER_INCOME',
])

export const expenseCategoryEnum = z.enum([
  'OFFICE_RENT',
  'MARKETING',
  'TRAVEL_FUEL',
  'SALARY',
  'UTILITIES',
  'LEGAL_PROFESSIONAL',
  'OFFICE_SUPPLIES',
  'MISCELLANEOUS',
])

export const paymentModeEnum = z.enum([
  'BANK_TRANSFER',
  'UPI',
  'CHEQUE',
  'CASH',
  'DEMAND_DRAFT',
  'OTHER',
])

export const forecastStatusEnum = z.enum([
  'PENDING',
  'RECEIVED',
  'PAID',
  'CANCELLED',
])

export const dueAdvanceTypeEnum = z.enum([
  'RECEIVABLE',
  'PAYABLE',
  'ADVANCE_GIVEN',
  'ADVANCE_RECEIVED',
])

export const dueAdvanceStatusEnum = z.enum([
  'PENDING',
  'PARTIALLY_SETTLED',
  'SETTLED',
  'WRITTEN_OFF',
])

// 1. Transaction Schemas
export const createTransactionSchema = z
  .object({
    type: transactionTypeEnum,
    incomeCategory: incomeCategoryEnum.optional(),
    expenseCategory: expenseCategoryEnum.optional(),
    amount: z.coerce.number().positive('Transaction amount must be greater than zero.'),
    transactionDate: z.string().datetime().or(z.string().min(1)),
    paymentMode: paymentModeEnum.default('BANK_TRANSFER'),
    referenceNumber: z.string().trim().max(100).optional(),
    description: z.string().trim().max(500).optional(),
    receiptUrl: z.string().trim().max(1000).optional(),
    partnerId: z.string().trim().optional(),
    propertyId: z.string().trim().optional(),
    clientId: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'INCOME') return Boolean(data.incomeCategory)
      if (data.type === 'EXPENSE') return Boolean(data.expenseCategory)
      return true
    },
    {
      message: 'Please select an appropriate category for this income or expense transaction.',
      path: ['incomeCategory'],
    }
  )

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

export const updateTransactionSchema = z.object({
  incomeCategory: incomeCategoryEnum.optional(),
  expenseCategory: expenseCategoryEnum.optional(),
  amount: z.coerce.number().positive().optional(),
  transactionDate: z.string().datetime().or(z.string().min(1)).optional(),
  paymentMode: paymentModeEnum.optional(),
  referenceNumber: z.string().trim().max(100).optional(),
  description: z.string().trim().max(500).optional(),
  receiptUrl: z.string().trim().max(1000).optional(),
  partnerId: z.string().trim().optional().nullable(),
  propertyId: z.string().trim().optional().nullable(),
  clientId: z.string().trim().optional().nullable(),
})

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>

// 2. Salary Disbursement Schema
export const createSalaryDisbursementSchema = z.object({
  employeeId: z.string().min(1, 'Please select an employee.'),
  month: z.coerce.number().int().min(1).max(12, 'Month must be between 1 and 12.'),
  year: z.coerce.number().int().min(2020).max(2100),
  baseSalary: z.coerce.number().nonnegative('Base salary cannot be negative.'),
  bonusIncentive: z.coerce.number().nonnegative().default(0),
  deductions: z.coerce.number().nonnegative().default(0),
  paymentDate: z.string().datetime().or(z.string().min(1)),
  paymentMode: paymentModeEnum.default('BANK_TRANSFER'),
  referenceNumber: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
})

export type CreateSalaryDisbursementInput = z.infer<typeof createSalaryDisbursementSchema>

// 3. Upcoming Forecast Schema
export const createUpcomingFinanceSchema = z.object({
  type: transactionTypeEnum,
  category: z.string().min(1, 'Category is required.'),
  title: z.string().trim().min(1, 'Title is required.').max(200),
  expectedAmount: z.coerce.number().positive('Expected amount must be greater than zero.'),
  expectedDate: z.string().datetime().or(z.string().min(1)),
  status: forecastStatusEnum.default('PENDING'),
  notes: z.string().trim().max(500).optional(),
  propertyId: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
  partnerId: z.string().trim().optional(),
})

export type CreateUpcomingFinanceInput = z.infer<typeof createUpcomingFinanceSchema>

export const updateUpcomingStatusSchema = z.object({
  status: forecastStatusEnum,
  recordAsTransaction: z.boolean().default(false),
  paymentMode: paymentModeEnum.optional(),
  referenceNumber: z.string().trim().max(100).optional(),
})

export type UpdateUpcomingStatusInput = z.infer<typeof updateUpcomingStatusSchema>

// 4. Dues and Advances Schema
export const createDueAdvanceSchema = z.object({
  type: dueAdvanceTypeEnum,
  partyName: z.string().trim().min(1, 'Party name is required.').max(150),
  partyType: z.enum(['CLIENT', 'BROKER', 'OWNER', 'EMPLOYEE', 'VENDOR', 'OTHER']).default('CLIENT'),
  totalAmount: z.coerce.number().positive('Amount must be positive.'),
  dueDate: z.string().datetime().or(z.string().min(1)).optional(),
  clientId: z.string().trim().optional(),
  brokerId: z.string().trim().optional(),
  ownerId: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional(),
})

export type CreateDueAdvanceInput = z.infer<typeof createDueAdvanceSchema>

export const settleDueAdvanceSchema = z.object({
  settleAmount: z.coerce.number().positive('Settlement amount must be greater than zero.'),
  paymentMode: paymentModeEnum.default('BANK_TRANSFER'),
  referenceNumber: z.string().trim().max(100).optional(),
  recordAsTransaction: z.boolean().default(true),
  notes: z.string().trim().max(500).optional(),
})

export type SettleDueAdvanceInput = z.infer<typeof settleDueAdvanceSchema>

// 5. Query Filters
export const financeQuerySchema = z.object({
  type: z.enum(['ALL', 'INCOME', 'EXPENSE']).default('ALL'),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  partnerId: z.string().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
})

export type FinanceQueryInput = z.infer<typeof financeQuerySchema>

export const profitLossQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).default(() => new Date().getFullYear()),
  month: z.coerce.number().int().min(1).max(12).optional(),
})

export type ProfitLossQueryInput = z.infer<typeof profitLossQuerySchema>
