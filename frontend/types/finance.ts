export type FinanceTransactionType = 'INCOME' | 'EXPENSE'

export type IncomeCategory =
  | 'BROKERAGE'
  | 'RENTAL_COMMISSION'
  | 'SALE_COMMISSION'
  | 'CONSULTATION_FEE'
  | 'OTHER_INCOME'

export type ExpenseCategory =
  | 'OFFICE_RENT'
  | 'MARKETING'
  | 'TRAVEL_FUEL'
  | 'SALARY'
  | 'UTILITIES'
  | 'LEGAL_PROFESSIONAL'
  | 'OFFICE_SUPPLIES'
  | 'MISCELLANEOUS'

export type PaymentMode = 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CASH'

export type ForecastStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED'

export type DueAdvanceType = 'RECEIVABLE' | 'PAYABLE' | 'ADVANCE_GIVEN' | 'ADVANCE_RECEIVED'

export type DueAdvanceStatus = 'PENDING' | 'PARTIALLY_SETTLED' | 'SETTLED' | 'WRITTEN_OFF'

export interface FinanceTransaction {
  id: string
  type: FinanceTransactionType
  incomeCategory?: IncomeCategory | null
  expenseCategory?: ExpenseCategory | null
  amount: number
  transactionDate: string
  paymentMode: PaymentMode
  referenceNumber?: string | null
  description?: string | null
  receiptUrl?: string | null
  partnerId?: string | null
  partner?: {
    id: string
    name: string
    email: string
  } | null
  propertyId?: string | null
  property?: {
    id: string
    title: string
    location?: string
  } | null
  clientId?: string | null
  client?: {
    id: string
    name: string
    phone?: string
  } | null
  createdById: string
  createdBy?: {
    id: string
    name: string
  } | null
  salaryDisbursement?: SalaryDisbursement | null
  createdAt: string
  updatedAt: string
}

export interface SalaryDisbursement {
  id: string
  employeeId: string
  employee: {
    id: string
    name: string
    email: string
    role?: string
  }
  month: number
  year: number
  baseSalary: number
  bonusIncentive: number
  deductions: number
  netPaid: number
  paymentDate: string
  paymentMode: PaymentMode
  referenceNumber?: string | null
  notes?: string | null
  transactionId?: string | null
  transaction?: FinanceTransaction | null
  disbursedById: string
  disbursedBy: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface UpcomingFinanceItem {
  id: string
  type: FinanceTransactionType
  category: string
  title: string
  expectedAmount: number
  expectedDate: string
  status: ForecastStatus
  notes?: string | null
  propertyId?: string | null
  property?: {
    id: string
    title: string
  } | null
  clientId?: string | null
  client?: {
    id: string
    name: string
  } | null
  partnerId?: string | null
  partner?: {
    id: string
    name: string
  } | null
  createdById: string
  createdBy?: {
    id: string
    name: string
  } | null
  convertedTransactionId?: string | null
  createdAt: string
  updatedAt: string
}

export interface DueAndAdvanceRecord {
  id: string
  type: DueAdvanceType
  partyName: string
  partyType: string
  totalAmount: number
  settledAmount: number
  remainingAmount: number
  dueDate?: string | null
  status: DueAdvanceStatus
  notes?: string | null
  clientId?: string | null
  client?: {
    id: string
    name: string
  } | null
  brokerId?: string | null
  broker?: {
    id: string
    name: string
  } | null
  ownerId?: string | null
  owner?: {
    id: string
    name: string
  } | null
  employeeId?: string | null
  employee?: {
    id: string
    name: string
  } | null
  createdById: string
  createdBy?: {
    id: string
    name: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface CashflowPoint {
  month: string
  year: number
  income: number
  expense: number
  net: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
}

export interface FinanceSummary {
  kpis: {
    thisMonthIncome: number
    thisMonthExpense: number
    thisMonthNet: number
    thisMonthSavingsRate: number
    allTimeIncome: number
    allTimeExpense: number
    allTimeNet: number
    pendingReceivables: number
    pendingPayables: number
    upcomingIncome: number
    upcomingExpense: number
    netCashflowProjected: number
  }
  cashflowTrend: CashflowPoint[]
  incomeByCategory: CategoryBreakdown[]
  expenseByCategory: CategoryBreakdown[]
  recentTransactions: FinanceTransaction[]
}

export interface ProfitLossStatement {
  period: string
  year: number
  month?: number | null
  generatedAt?: string
  totalIncome?: number
  totalExpense?: number
  netProfit?: number
  operatingMargin?: number
  summary?: {
    totalIncome: number
    totalExpense: number
    netProfit: number
    profitMarginPercentage: number
  }
  incomeBreakdown?: Record<string, number>
  expenseBreakdown?: Record<string, number>
  incomeItems?: Array<{
    category: string
    amount: number
    entryCount?: number
    percentageOfTotal?: number
  }>
  expenseItems?: Array<{
    category: string
    amount: number
    entryCount?: number
    percentageOfTotal?: number
  }>
}

// Payload Types
export interface CreateTransactionPayload {
  type: FinanceTransactionType
  incomeCategory?: IncomeCategory
  expenseCategory?: ExpenseCategory
  amount: number
  transactionDate: string
  paymentMode: PaymentMode
  referenceNumber?: string
  description?: string
  receiptUrl?: string
  partnerId?: string
  propertyId?: string
  clientId?: string
}

export interface UpdateTransactionPayload {
  incomeCategory?: IncomeCategory
  expenseCategory?: ExpenseCategory
  amount?: number
  transactionDate?: string
  paymentMode?: PaymentMode
  referenceNumber?: string
  description?: string
  receiptUrl?: string
  partnerId?: string | null
  propertyId?: string | null
  clientId?: string | null
}

export interface CreateSalaryDisbursementPayload {
  employeeId: string
  month: number
  year: number
  baseSalary: number
  bonusIncentive?: number
  deductions?: number
  paymentDate: string
  paymentMode: PaymentMode
  referenceNumber?: string
  notes?: string
}

export interface CreateUpcomingFinancePayload {
  type: FinanceTransactionType
  category: string
  title: string
  expectedAmount: number
  expectedDate: string
  status?: ForecastStatus
  notes?: string
  propertyId?: string
  clientId?: string
  partnerId?: string
}

export interface CreateDueAdvancePayload {
  type: DueAdvanceType
  partyName: string
  partyType: 'CLIENT' | 'BROKER' | 'OWNER' | 'EMPLOYEE' | 'VENDOR' | 'OTHER'
  totalAmount: number
  dueDate?: string
  clientId?: string
  brokerId?: string
  ownerId?: string
  employeeId?: string
  notes?: string
}

export interface SettleDueAdvancePayload {
  settleAmount: number
  paymentMode: PaymentMode
  referenceNumber?: string
  recordAsTransaction?: boolean
  notes?: string
}

export interface FinanceQueryParams {
  type?: 'ALL' | 'INCOME' | 'EXPENSE'
  category?: string
  partnerId?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}
