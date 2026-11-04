import { financeApiClient } from './client'
import type {
  FinanceSummary,
  FinanceTransaction,
  SalaryDisbursement,
  UpcomingFinanceItem,
  DueAndAdvanceRecord,
  ProfitLossStatement,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  CreateSalaryDisbursementPayload,
  CreateUpcomingFinancePayload,
  CreateDueAdvancePayload,
  SettleDueAdvancePayload,
  FinanceQueryParams,
  ForecastStatus,
  DueAdvanceType,
  DueAdvanceStatus,
  PaymentMode,
} from '../types/finance'

export interface TransactionsListResponse {
  success: boolean
  transactions: FinanceTransaction[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// 1. Overview Summary KPIs
export async function getFinanceSummary(): Promise<FinanceSummary> {
  const res = await financeApiClient.get<{ success: boolean; data: FinanceSummary }>('/summary')
  return res.data.data
}

// 2. Transactions (Income & Expenses)
export async function getTransactions(params?: FinanceQueryParams): Promise<TransactionsListResponse> {
  const res = await financeApiClient.get<TransactionsListResponse>('/transactions', { params })
  return res.data
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<FinanceTransaction> {
  const res = await financeApiClient.post<{ success: boolean; transaction: FinanceTransaction }>(
    '/transactions',
    payload
  )
  return res.data.transaction
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload
): Promise<FinanceTransaction> {
  const res = await financeApiClient.patch<{ success: boolean; transaction: FinanceTransaction }>(
    `/transactions/${id}`,
    payload
  )
  return res.data.transaction
}

export async function deleteTransaction(id: string): Promise<void> {
  await financeApiClient.delete(`/transactions/${id}`)
}

// 3. Salary Disbursements
export async function getSalaryDisbursements(params?: {
  month?: number
  year?: number
  employeeId?: string
}): Promise<SalaryDisbursement[]> {
  const res = await financeApiClient.get<{ success: boolean; disbursements: SalaryDisbursement[] }>(
    '/salaries',
    { params }
  )
  return res.data.disbursements || []
}

export async function createSalaryDisbursement(
  payload: CreateSalaryDisbursementPayload
): Promise<SalaryDisbursement> {
  const res = await financeApiClient.post<{ success: boolean; disbursement: SalaryDisbursement }>(
    '/salaries',
    payload
  )
  return res.data.disbursement
}

// 4. Upcoming Forecast Pipeline
export async function getUpcomingFinance(params?: {
  type?: 'ALL' | 'INCOME' | 'EXPENSE'
  status?: ForecastStatus
}): Promise<UpcomingFinanceItem[]> {
  const res = await financeApiClient.get<{ success: boolean; items: UpcomingFinanceItem[] }>('/forecast', {
    params,
  })
  return res.data.items || []
}

export async function createUpcomingFinance(
  payload: CreateUpcomingFinancePayload
): Promise<UpcomingFinanceItem> {
  const res = await financeApiClient.post<{ success: boolean; item: UpcomingFinanceItem }>(
    '/forecast',
    payload
  )
  return res.data.item
}

export async function convertUpcomingToTransaction(
  id: string,
  payload: { paymentMode?: PaymentMode; referenceNumber?: string; recordAsTransaction?: boolean }
): Promise<{ upcoming: UpcomingFinanceItem; transaction?: FinanceTransaction }> {
  const res = await financeApiClient.post<{
    success: boolean
    upcoming: UpcomingFinanceItem
    transaction?: FinanceTransaction
  }>(`/forecast/${id}/convert`, {
    status: 'RECEIVED',
    recordAsTransaction: payload.recordAsTransaction ?? true,
    paymentMode: payload.paymentMode,
    referenceNumber: payload.referenceNumber,
  })
  return res.data
}

export async function deleteUpcomingFinance(id: string): Promise<void> {
  await financeApiClient.delete(`/forecast/${id}`)
}

// 5. Dues & Advances
export async function getDuesAndAdvances(params?: {
  type?: DueAdvanceType
  status?: DueAdvanceStatus
}): Promise<DueAndAdvanceRecord[]> {
  const res = await financeApiClient.get<{ success: boolean; records: DueAndAdvanceRecord[] }>('/dues', {
    params,
  })
  return res.data.records || []
}

export async function createDueAdvance(payload: CreateDueAdvancePayload): Promise<DueAndAdvanceRecord> {
  const res = await financeApiClient.post<{ success: boolean; record: DueAndAdvanceRecord }>('/dues', payload)
  return res.data.record
}

export async function settleDueAdvance(
  id: string,
  payload: SettleDueAdvancePayload
): Promise<DueAndAdvanceRecord> {
  const res = await financeApiClient.post<{ success: boolean; record: DueAndAdvanceRecord }>(
    `/dues/${id}/settle`,
    payload
  )
  return res.data.record
}

export async function deleteDueAdvance(id: string): Promise<void> {
  await financeApiClient.delete(`/dues/${id}`)
}

// 6. Profit & Loss Statement
export async function getProfitLossStatement(params: {
  year: number
  month?: number
}): Promise<ProfitLossStatement> {
  const res = await financeApiClient.get<{ success: boolean; statement: ProfitLossStatement }>(
    '/profit-loss',
    { params }
  )
  return res.data.statement
}
