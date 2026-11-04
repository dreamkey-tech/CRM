import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import {
  createTransactionSchema,
  updateTransactionSchema,
  createSalaryDisbursementSchema,
  createUpcomingFinanceSchema,
  updateUpcomingStatusSchema,
  createDueAdvanceSchema,
  settleDueAdvanceSchema,
  financeQuerySchema,
  profitLossQuerySchema,
} from '../zod/finance'
import {
  getFinanceSummaryController,
  listTransactionsController,
  createTransactionController,
  updateTransactionController,
  deleteTransactionController,
  listSalaryDisbursementsController,
  createSalaryDisbursementController,
  listUpcomingFinanceController,
  createUpcomingFinanceController,
  convertUpcomingToTransactionController,
  deleteUpcomingFinanceController,
  listDuesAndAdvancesController,
  createDueAdvanceController,
  settleDueAdvanceController,
  deleteDueAdvanceController,
  getProfitLossStatementController,
} from '../controllers/finance.controller'

export const financeRoutes = new Hono<AppEnv>()

// All finance routes require active authenticated session
financeRoutes.use('*', authMiddleware)

/**
 * 1. Overview & Summary KPIs (FR-FN-07)
 */
financeRoutes.get('/summary', requirePermission('finance:read'), getFinanceSummaryController)

/**
 * 2. Transactions & Cashbook (FR-FN-01, FR-FN-02)
 */
financeRoutes.get(
  '/transactions',
  requirePermission('finance:read'),
  zValidator('query', financeQuerySchema, zodValidationHook),
  listTransactionsController
)
financeRoutes.post(
  '/transactions',
  requirePermission('finance:manage'),
  zValidator('json', createTransactionSchema, zodValidationHook),
  createTransactionController
)
financeRoutes.patch(
  '/transactions/:id',
  requirePermission('finance:manage'),
  zValidator('json', updateTransactionSchema, zodValidationHook),
  updateTransactionController
)
financeRoutes.delete('/transactions/:id', requirePermission('finance:manage'), deleteTransactionController)

/**
 * 3. Salary & Payroll Disbursements (FR-FN-03)
 */
financeRoutes.get('/salaries', requirePermission('finance:read'), listSalaryDisbursementsController)
financeRoutes.post(
  '/salaries',
  requirePermission('finance:manage'),
  zValidator('json', createSalaryDisbursementSchema, zodValidationHook),
  createSalaryDisbursementController
)

/**
 * 4. Upcoming Pipeline & Forecast (FR-FN-04, FR-FN-05)
 */
financeRoutes.get('/forecast', requirePermission('finance:read'), listUpcomingFinanceController)
financeRoutes.post(
  '/forecast',
  requirePermission('finance:manage'),
  zValidator('json', createUpcomingFinanceSchema, zodValidationHook),
  createUpcomingFinanceController
)
financeRoutes.post(
  '/forecast/:id/convert',
  requirePermission('finance:manage'),
  zValidator('json', updateUpcomingStatusSchema, zodValidationHook),
  convertUpcomingToTransactionController
)
financeRoutes.delete('/forecast/:id', requirePermission('finance:manage'), deleteUpcomingFinanceController)

/**
 * 5. Dues & Advances (FR-FN-06)
 */
financeRoutes.get('/dues', requirePermission('finance:read'), listDuesAndAdvancesController)
financeRoutes.post(
  '/dues',
  requirePermission('finance:manage'),
  zValidator('json', createDueAdvanceSchema, zodValidationHook),
  createDueAdvanceController
)
financeRoutes.post(
  '/dues/:id/settle',
  requirePermission('finance:manage'),
  zValidator('json', settleDueAdvanceSchema, zodValidationHook),
  settleDueAdvanceController
)
financeRoutes.delete('/dues/:id', requirePermission('finance:manage'), deleteDueAdvanceController)

/**
 * 6. Profit & Loss Statement (FR-FN-08)
 */
financeRoutes.get(
  '/profit-loss',
  requirePermission('finance:read'),
  zValidator('query', profitLossQuerySchema, zodValidationHook),
  getProfitLossStatementController
)
