import type { Context } from 'hono'
import type { AppEnv } from '../db'
import { logAudit } from '../lib/audit'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateSalaryDisbursementInput,
  CreateUpcomingFinanceInput,
  UpdateUpcomingStatusInput,
  CreateDueAdvanceInput,
  SettleDueAdvanceInput,
  FinanceQueryInput,
  ProfitLossQueryInput,
} from '../zod/finance'

/**
 * 1. Finance Overview & Summary KPIs
 * Endpoint: GET /v1/finance/summary
 */
export const getFinanceSummaryController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  // 1. Parallel aggregates for current month and overall dues
  const [
    thisMonthIncomeResult,
    thisMonthExpenseResult,
    allTimeIncomeResult,
    allTimeExpenseResult,
    pendingReceivablesResult,
    pendingPayablesResult,
    upcomingIncomeResult,
    upcomingExpenseResult,
    recentTransactions,
  ] = await Promise.all([
    // Current month income
    prisma.financeTransaction.aggregate({
      where: {
        type: 'INCOME',
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Current month expenses
    prisma.financeTransaction.aggregate({
      where: {
        type: 'EXPENSE',
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // All-time income
    prisma.financeTransaction.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true },
    }),
    // All-time expenses
    prisma.financeTransaction.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true },
    }),
    // Pending receivables (uncollected dues)
    prisma.dueAndAdvanceRecord.aggregate({
      where: {
        type: 'RECEIVABLE',
        status: { in: ['PENDING', 'PARTIALLY_SETTLED'] },
      },
      _sum: { remainingAmount: true },
      _count: true,
    }),
    // Pending payables (company liabilities)
    prisma.dueAndAdvanceRecord.aggregate({
      where: {
        type: 'PAYABLE',
        status: { in: ['PENDING', 'PARTIALLY_SETTLED'] },
      },
      _sum: { remainingAmount: true },
      _count: true,
    }),
    // Upcoming expected income
    prisma.upcomingFinanceItem.aggregate({
      where: {
        type: 'INCOME',
        status: 'PENDING',
      },
      _sum: { expectedAmount: true },
      _count: true,
    }),
    // Upcoming scheduled expenses
    prisma.upcomingFinanceItem.aggregate({
      where: {
        type: 'EXPENSE',
        status: 'PENDING',
      },
      _sum: { expectedAmount: true },
      _count: true,
    }),
    // Last 6 recent transactions
    prisma.financeTransaction.findMany({
      orderBy: { transactionDate: 'desc' },
      take: 6,
      include: {
        partner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, societyBuildingName: true, locationArea: true } },
        client: { select: { id: true, name: true, phone: true } },
      },
    }),
  ])

  const thisMonthIncome = thisMonthIncomeResult._sum.amount || 0
  const thisMonthExpense = thisMonthExpenseResult._sum.amount || 0
  const thisMonthNet = thisMonthIncome - thisMonthExpense
  const profitMargin = thisMonthIncome > 0 ? (thisMonthNet / thisMonthIncome) * 100 : 0

  // 2. Build 6-Month Trend Data
  const trendMonths: { month: string; year: number; startDate: Date; endDate: Date }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = d.toLocaleString('en-US', { month: 'short' })
    const year = d.getFullYear()
    const startDate = new Date(year, d.getMonth(), 1)
    const endDate = new Date(year, d.getMonth() + 1, 0, 23, 59, 59, 999)
    trendMonths.push({ month: monthName, year, startDate, endDate })
  }

  const cashflowTrend = await Promise.all(
    trendMonths.map(async (m) => {
      const [inc, exp] = await Promise.all([
        prisma.financeTransaction.aggregate({
          where: {
            type: 'INCOME',
            transactionDate: { gte: m.startDate, lte: m.endDate },
          },
          _sum: { amount: true },
        }),
        prisma.financeTransaction.aggregate({
          where: {
            type: 'EXPENSE',
            transactionDate: { gte: m.startDate, lte: m.endDate },
          },
          _sum: { amount: true },
        }),
      ])
      const income = inc._sum.amount || 0
      const expense = exp._sum.amount || 0
      return {
        month: `${m.month} ${m.year}`,
        income,
        expense,
        net: income - expense,
      }
    })
  )

  // 3. Category Breakdown for current month
  const [incomeByCat, expenseByCat] = await Promise.all([
    prisma.financeTransaction.groupBy({
      by: ['incomeCategory'],
      where: {
        type: 'INCOME',
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
        incomeCategory: { not: null },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financeTransaction.groupBy({
      by: ['expenseCategory'],
      where: {
        type: 'EXPENSE',
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
        expenseCategory: { not: null },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  return c.json({
    success: true,
    summary: {
      thisMonthIncome,
      thisMonthExpense,
      thisMonthNet,
      profitMarginPercentage: Number(profitMargin.toFixed(1)),
      allTimeIncome: allTimeIncomeResult._sum.amount || 0,
      allTimeExpense: allTimeExpenseResult._sum.amount || 0,
      pendingReceivables: pendingReceivablesResult._sum.remainingAmount || 0,
      pendingReceivablesCount: pendingReceivablesResult._count,
      pendingPayables: pendingPayablesResult._sum.remainingAmount || 0,
      pendingPayablesCount: pendingPayablesResult._count,
      upcomingIncome: upcomingIncomeResult._sum.expectedAmount || 0,
      upcomingIncomeCount: upcomingIncomeResult._count,
      upcomingExpense: upcomingExpenseResult._sum.expectedAmount || 0,
      upcomingExpenseCount: upcomingExpenseResult._count,
      cashflowTrend,
      incomeCategoryBreakdown: incomeByCat.map((item) => ({
        category: item.incomeCategory,
        total: item._sum.amount || 0,
        count: item._count,
      })),
      expenseCategoryBreakdown: expenseByCat.map((item) => ({
        category: item.expenseCategory,
        total: item._sum.amount || 0,
        count: item._count,
      })),
      recentTransactions,
    },
  })
}

/**
 * 2. List Transactions with pagination, type, category, date filters
 * Endpoint: GET /v1/finance/transactions
 */
export const listTransactionsController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const query = c.req.valid('query' as never) as FinanceQueryInput

  const whereClause: any = {}

  if (query.type && query.type !== 'ALL') {
    whereClause.type = query.type
  }

  if (query.category) {
    whereClause.OR = [
      { incomeCategory: query.category },
      { expenseCategory: query.category },
    ]
  }

  if (query.partnerId) {
    whereClause.partnerId = query.partnerId
  }

  if (query.startDate || query.endDate) {
    whereClause.transactionDate = {}
    if (query.startDate) whereClause.transactionDate.gte = new Date(query.startDate)
    if (query.endDate) whereClause.transactionDate.lte = new Date(query.endDate)
  }

  if (query.search) {
    whereClause.OR = [
      { description: { contains: query.search, mode: 'insensitive' } },
      { referenceNumber: { contains: query.search, mode: 'insensitive' } },
      { partner: { name: { contains: query.search, mode: 'insensitive' } } },
      { client: { name: { contains: query.search, mode: 'insensitive' } } },
      { property: { societyBuildingName: { contains: query.search, mode: 'insensitive' } } },
    ]
  }

  const [total, transactions] = await Promise.all([
    prisma.financeTransaction.count({ where: whereClause }),
    prisma.financeTransaction.findMany({
      where: whereClause,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { transactionDate: 'desc' },
      include: {
        partner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, societyBuildingName: true, locationArea: true } },
        client: { select: { id: true, name: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ])

  return c.json({
    success: true,
    transactions,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  })
}

/**
 * 3. Log a new Income or Expense transaction
 * Endpoint: POST /v1/finance/transactions
 */
export const createTransactionController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const body = c.req.valid('json' as never) as CreateTransactionInput

  const transaction = await prisma.financeTransaction.create({
    data: {
      type: body.type,
      incomeCategory: body.type === 'INCOME' ? body.incomeCategory : null,
      expenseCategory: body.type === 'EXPENSE' ? body.expenseCategory : null,
      amount: body.amount,
      transactionDate: new Date(body.transactionDate),
      paymentMode: body.paymentMode,
      referenceNumber: body.referenceNumber?.trim() || null,
      description: body.description?.trim() || null,
      receiptUrl: body.receiptUrl?.trim() || null,
      partnerId: body.partnerId || null,
      propertyId: body.propertyId || null,
      clientId: body.clientId || null,
      createdById: user.id,
    },
    include: {
      partner: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, societyBuildingName: true } },
      client: { select: { id: true, name: true } },
    },
  })

  await logAudit(c, {
    action: 'CREATE_TRANSACTION',
    module: 'FINANCE',
    resourceId: transaction.id,
    resourceName: `${transaction.type} — ₹${transaction.amount.toLocaleString('en-IN')}`,
    details: `Logged ${transaction.type} of ₹${transaction.amount} under ${transaction.incomeCategory || transaction.expenseCategory}`,
    status: 'SUCCESS',
  })

  return c.json(
    {
      success: true,
      message: `${body.type === 'INCOME' ? 'Income' : 'Expense'} of ₹${body.amount.toLocaleString('en-IN')} logged successfully.`,
      transaction,
    },
    201
  )
}

/**
 * 4. Update an existing transaction
 * Endpoint: PATCH /v1/finance/transactions/:id
 */
export const updateTransactionController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  const body = c.req.valid('json' as never) as UpdateTransactionInput

  const existing = await prisma.financeTransaction.findUnique({ where: { id } })
  if (!existing) {
    return c.json({ success: false, error: 'Transaction record not found.', code: 'NOT_FOUND' }, 404)
  }

  const updated = await prisma.financeTransaction.update({
    where: { id },
    data: {
      incomeCategory: body.incomeCategory !== undefined ? body.incomeCategory : undefined,
      expenseCategory: body.expenseCategory !== undefined ? body.expenseCategory : undefined,
      amount: body.amount !== undefined ? body.amount : undefined,
      transactionDate: body.transactionDate ? new Date(body.transactionDate) : undefined,
      paymentMode: body.paymentMode !== undefined ? body.paymentMode : undefined,
      referenceNumber: body.referenceNumber !== undefined ? body.referenceNumber : undefined,
      description: body.description !== undefined ? body.description : undefined,
      receiptUrl: body.receiptUrl !== undefined ? body.receiptUrl : undefined,
      partnerId: body.partnerId !== undefined ? body.partnerId : undefined,
      propertyId: body.propertyId !== undefined ? body.propertyId : undefined,
      clientId: body.clientId !== undefined ? body.clientId : undefined,
    },
    include: {
      partner: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, societyBuildingName: true } },
      client: { select: { id: true, name: true } },
    },
  })

  await logAudit(c, {
    action: 'UPDATE_TRANSACTION',
    module: 'FINANCE',
    resourceId: id,
    resourceName: `${updated.type} — ₹${updated.amount.toLocaleString('en-IN')}`,
    details: `Updated finance transaction ${id}`,
    status: 'SUCCESS',
  })

  return c.json({
    success: true,
    message: 'Transaction updated successfully.',
    transaction: updated,
  })
}

/**
 * 5. Delete a transaction
 * Endpoint: DELETE /v1/finance/transactions/:id
 */
export const deleteTransactionController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')

  const existing = await prisma.financeTransaction.findUnique({ where: { id } })
  if (!existing) {
    return c.json({ success: false, error: 'Transaction record not found.', code: 'NOT_FOUND' }, 404)
  }

  await prisma.financeTransaction.delete({ where: { id } })

  await logAudit(c, {
    action: 'DELETE_TRANSACTION',
    module: 'FINANCE',
    resourceId: id,
    resourceName: `${existing.type} — ₹${existing.amount}`,
    details: `Deleted ${existing.type} record ${id}`,
    status: 'SUCCESS',
  })

  return c.json({
    success: true,
    message: 'Transaction deleted successfully.',
  })
}

/**
 * 6. List Monthly Salary Disbursements
 * Endpoint: GET /v1/finance/salaries
 */
export const listSalaryDisbursementsController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const year = parseInt(c.req.query('year') || String(new Date().getFullYear()), 10)
  const month = c.req.query('month') ? parseInt(c.req.query('month')!, 10) : undefined

  const whereClause: any = { year }
  if (month) whereClause.month = month

  const disbursements = await prisma.salaryDisbursement.findMany({
    where: whereClause,
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { paymentDate: 'desc' }],
    include: {
      employee: { select: { id: true, name: true, email: true } },
      disbursedBy: { select: { id: true, name: true } },
      transaction: { select: { id: true, amount: true, paymentMode: true } },
    },
  })

  return c.json({
    success: true,
    disbursements,
  })
}

/**
 * 7. Record Monthly Salary Disbursement (Auto-creates ledger EXPENSE)
 * Endpoint: POST /v1/finance/salaries
 */
export const createSalaryDisbursementController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const body = c.req.valid('json' as never) as CreateSalaryDisbursementInput

  // Check if salary already disbursed for this employee in the specified month/year
  const existing = await prisma.salaryDisbursement.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: body.employeeId,
        month: body.month,
        year: body.year,
      },
    },
  })

  if (existing) {
    return c.json(
      {
        success: false,
        error: `Salary for ${body.month}/${body.year} has already been recorded for this employee.`,
        code: 'SALARY_ALREADY_DISBURSED',
      },
      400
    )
  }

  const employee = await prisma.user.findUnique({
    where: { id: body.employeeId },
    select: { id: true, name: true, email: true },
  })

  if (!employee) {
    return c.json({ success: false, error: 'Employee not found.', code: 'NOT_FOUND' }, 404)
  }

  const netPaid = Number((body.baseSalary + (body.bonusIncentive || 0) - (body.deductions || 0)).toFixed(2))

  // Execute in transaction: Create general ledger expense AND salary disbursement record
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create matching EXPENSE transaction
    const expenseTx = await tx.financeTransaction.create({
      data: {
        type: 'EXPENSE',
        expenseCategory: 'SALARY',
        amount: netPaid,
        transactionDate: new Date(body.paymentDate),
        paymentMode: body.paymentMode,
        referenceNumber: body.referenceNumber || null,
        description: `Salary disbursement for ${employee.name || employee.email} (${body.month}/${body.year})`,
        createdById: user.id,
      },
    })

    // 2. Create SalaryDisbursement record linked to transaction
    const salaryRecord = await tx.salaryDisbursement.create({
      data: {
        employeeId: body.employeeId,
        month: body.month,
        year: body.year,
        baseSalary: body.baseSalary,
        bonusIncentive: body.bonusIncentive || 0,
        deductions: body.deductions || 0,
        netPaid,
        paymentDate: new Date(body.paymentDate),
        paymentMode: body.paymentMode,
        referenceNumber: body.referenceNumber || null,
        notes: body.notes?.trim() || null,
        transactionId: expenseTx.id,
        disbursedById: user.id,
      },
      include: {
        employee: { select: { id: true, name: true, email: true } },
      },
    })

    return salaryRecord
  })

  await logAudit(c, {
    action: 'DISBURSE_SALARY',
    module: 'FINANCE',
    resourceId: result.id,
    resourceName: `${employee.name || employee.email} — ₹${netPaid.toLocaleString('en-IN')}`,
    details: `Disbursed salary of ₹${netPaid} to ${employee.email} for ${body.month}/${body.year}`,
    status: 'SUCCESS',
  })

  return c.json(
    {
      success: true,
      message: `Salary of ₹${netPaid.toLocaleString('en-IN')} recorded for ${employee.name || employee.email}.`,
      disbursement: result,
    },
    201
  )
}

/**
 * 8. List Upcoming Finance Forecast Items
 * Endpoint: GET /v1/finance/forecast
 */
export const listUpcomingFinanceController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const type = c.req.query('type') // 'INCOME' | 'EXPENSE'
  const status = c.req.query('status') || 'PENDING'

  const whereClause: any = {}
  if (type) whereClause.type = type
  if (status !== 'ALL') whereClause.status = status

  const items = await prisma.upcomingFinanceItem.findMany({
    where: whereClause,
    orderBy: { expectedDate: 'asc' },
    include: {
      partner: { select: { id: true, name: true } },
      property: { select: { id: true, societyBuildingName: true } },
      client: { select: { id: true, name: true } },
    },
  })

  return c.json({
    success: true,
    forecastItems: items,
  })
}

/**
 * 9. Create an Upcoming Finance Item
 * Endpoint: POST /v1/finance/forecast
 */
export const createUpcomingFinanceController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const body = c.req.valid('json' as never) as CreateUpcomingFinanceInput

  const item = await prisma.upcomingFinanceItem.create({
    data: {
      type: body.type,
      category: body.category,
      title: body.title.trim(),
      expectedAmount: body.expectedAmount,
      expectedDate: new Date(body.expectedDate),
      status: body.status || 'PENDING',
      notes: body.notes?.trim() || null,
      propertyId: body.propertyId || null,
      clientId: body.clientId || null,
      partnerId: body.partnerId || null,
      createdById: user.id,
    },
    include: {
      partner: { select: { id: true, name: true } },
      property: { select: { id: true, societyBuildingName: true } },
      client: { select: { id: true, name: true } },
    },
  })

  return c.json(
    {
      success: true,
      message: `Upcoming ${body.type === 'INCOME' ? 'commission' : 'expense'} scheduled.`,
      item,
    },
    201
  )
}

/**
 * 10. Convert Upcoming Forecast into Finalized Transaction
 * Endpoint: POST /v1/finance/forecast/:id/convert
 */
export const convertUpcomingToTransactionController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const id = c.req.param('id')
  const body = c.req.valid('json' as never) as UpdateUpcomingStatusInput

  const item = await prisma.upcomingFinanceItem.findUnique({ where: { id } })
  if (!item) {
    return c.json({ success: false, error: 'Forecast item not found.', code: 'NOT_FOUND' }, 404)
  }

  const result = await prisma.$transaction(async (tx) => {
    let createdTx = null
    if (body.recordAsTransaction) {
      createdTx = await tx.financeTransaction.create({
        data: {
          type: item.type,
          incomeCategory: item.type === 'INCOME' ? (item.category as any) : null,
          expenseCategory: item.type === 'EXPENSE' ? (item.category as any) : null,
          amount: item.expectedAmount,
          transactionDate: new Date(),
          paymentMode: body.paymentMode || 'BANK_TRANSFER',
          referenceNumber: body.referenceNumber || null,
          description: `Converted from forecast: ${item.title}`,
          partnerId: item.partnerId,
          propertyId: item.propertyId,
          clientId: item.clientId,
          createdById: user.id,
        },
      })
    }

    const updated = await tx.upcomingFinanceItem.update({
      where: { id },
      data: {
        status: body.status,
      },
    })

    return { updated, createdTx }
  })

  return c.json({
    success: true,
    message: `Forecast item marked as ${body.status}.${result.createdTx ? ' Ledger transaction recorded.' : ''}`,
    item: result.updated,
    transaction: result.createdTx,
  })
}

/**
 * 11. Delete Forecast Item
 * Endpoint: DELETE /v1/finance/forecast/:id
 */
export const deleteUpcomingFinanceController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  await prisma.upcomingFinanceItem.delete({ where: { id } })
  return c.json({ success: true, message: 'Forecast item removed.' })
}

/**
 * 12. List Dues and Advances
 * Endpoint: GET /v1/finance/dues
 */
export const listDuesAndAdvancesController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const type = c.req.query('type') // 'RECEIVABLE' | 'PAYABLE' | 'ADVANCE_GIVEN' | 'ADVANCE_RECEIVED'
  const status = c.req.query('status')

  const whereClause: any = {}
  if (type && type !== 'ALL') whereClause.type = type
  if (status && status !== 'ALL') whereClause.status = status

  const records = await prisma.dueAndAdvanceRecord.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      broker: { select: { id: true, name: true, phone: true } },
      owner: { select: { id: true, name: true, phone: true } },
      employee: { select: { id: true, name: true, email: true } },
    },
  })

  return c.json({
    success: true,
    records,
  })
}

/**
 * 13. Create a Due or Advance record
 * Endpoint: POST /v1/finance/dues
 */
export const createDueAdvanceController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const body = c.req.valid('json' as never) as CreateDueAdvanceInput

  const record = await prisma.dueAndAdvanceRecord.create({
    data: {
      type: body.type,
      partyName: body.partyName.trim(),
      partyType: body.partyType,
      totalAmount: body.totalAmount,
      settledAmount: 0,
      remainingAmount: body.totalAmount,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: 'PENDING',
      notes: body.notes?.trim() || null,
      clientId: body.clientId || null,
      brokerId: body.brokerId || null,
      ownerId: body.ownerId || null,
      employeeId: body.employeeId || null,
      createdById: user.id,
    },
  })

  return c.json(
    {
      success: true,
      message: `${body.type} of ₹${body.totalAmount.toLocaleString('en-IN')} recorded for ${body.partyName}.`,
      record,
    },
    201
  )
}

/**
 * 14. Settle / Pay a Due or Advance (Partially or Fully)
 * Endpoint: POST /v1/finance/dues/:id/settle
 */
export const settleDueAdvanceController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const id = c.req.param('id')
  const body = c.req.valid('json' as never) as SettleDueAdvanceInput

  const due = await prisma.dueAndAdvanceRecord.findUnique({ where: { id } })
  if (!due) {
    return c.json({ success: false, error: 'Due or advance record not found.', code: 'NOT_FOUND' }, 404)
  }

  const newSettledAmount = due.settledAmount + body.settleAmount
  const newRemaining = Math.max(0, due.totalAmount - newSettledAmount)
  const newStatus = newRemaining <= 0 ? 'SETTLED' : 'PARTIALLY_SETTLED'

  const result = await prisma.$transaction(async (tx) => {
    let transactionRecord = null

    // Optionally create general ledger transaction automatically
    if (body.recordAsTransaction) {
      const isIncome = due.type === 'RECEIVABLE' || due.type === 'ADVANCE_RECEIVED'
      transactionRecord = await tx.financeTransaction.create({
        data: {
          type: isIncome ? 'INCOME' : 'EXPENSE',
          incomeCategory: isIncome ? 'BROKERAGE_RECEIVED' : null,
          expenseCategory: !isIncome ? 'MISCELLANEOUS' : null,
          amount: body.settleAmount,
          transactionDate: new Date(),
          paymentMode: body.paymentMode,
          referenceNumber: body.referenceNumber || null,
          description: `Settlement for ${due.type} (${due.partyName}): ${body.notes || 'No notes'}`,
          clientId: due.clientId,
          createdById: user.id,
        },
      })
    }

    const updatedDue = await tx.dueAndAdvanceRecord.update({
      where: { id },
      data: {
        settledAmount: newSettledAmount,
        remainingAmount: newRemaining,
        status: newStatus,
        notes: body.notes
          ? `${due.notes ? due.notes + ' | ' : ''}Settled ₹${body.settleAmount}: ${body.notes}`
          : due.notes,
      },
    })

    return { updatedDue, transactionRecord }
  })

  await logAudit(c, {
    action: 'SETTLE_DUE',
    module: 'FINANCE',
    resourceId: id,
    resourceName: `${due.partyName} — Settled ₹${body.settleAmount}`,
    details: `Recorded settlement of ₹${body.settleAmount} against ${due.type}. Remaining: ₹${newRemaining}`,
    status: 'SUCCESS',
  })

  return c.json({
    success: true,
    message: `Payment of ₹${body.settleAmount.toLocaleString('en-IN')} recorded. Status: ${newStatus}.`,
    record: result.updatedDue,
    transaction: result.transactionRecord,
  })
}

/**
 * 15. Delete Due or Advance record
 * Endpoint: DELETE /v1/finance/dues/:id
 */
export const deleteDueAdvanceController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  await prisma.dueAndAdvanceRecord.delete({ where: { id } })
  return c.json({ success: true, message: 'Record deleted successfully.' })
}

/**
 * 16. Monthly and Annual P&L Statement Engine
 * Endpoint: GET /v1/finance/profit-loss
 */
export const getProfitLossStatementController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const query = c.req.valid('query' as never) as ProfitLossQueryInput

  let startDate: Date
  let endDate: Date
  let periodLabel: string

  if (query.month) {
    startDate = new Date(query.year, query.month - 1, 1)
    endDate = new Date(query.year, query.month, 0, 23, 59, 59, 999)
    const monthName = startDate.toLocaleString('en-US', { month: 'long' })
    periodLabel = `${monthName} ${query.year}`
  } else {
    startDate = new Date(query.year, 0, 1)
    endDate = new Date(query.year, 11, 31, 23, 59, 59, 999)
    periodLabel = `Full Financial Year ${query.year}`
  }

  // 1. Fetch itemized aggregates grouped by category
  const [incomeGroups, expenseGroups] = await Promise.all([
    prisma.financeTransaction.groupBy({
      by: ['incomeCategory'],
      where: {
        type: 'INCOME',
        transactionDate: { gte: startDate, lte: endDate },
        incomeCategory: { not: null },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financeTransaction.groupBy({
      by: ['expenseCategory'],
      where: {
        type: 'EXPENSE',
        transactionDate: { gte: startDate, lte: endDate },
        expenseCategory: { not: null },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  const totalIncome = incomeGroups.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0)
  const totalExpense = expenseGroups.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0)
  const netProfit = totalIncome - totalExpense
  const profitMarginPercentage = totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(1)) : 0

  const incomeBreakdown: Record<string, number> = {}
  for (const g of incomeGroups) {
    if (g.incomeCategory) {
      incomeBreakdown[g.incomeCategory] = g._sum.amount || 0
    }
  }

  const expenseBreakdown: Record<string, number> = {}
  for (const g of expenseGroups) {
    if (g.expenseCategory) {
      expenseBreakdown[g.expenseCategory] = g._sum.amount || 0
    }
  }

  return c.json({
    success: true,
    statement: {
      period: periodLabel,
      year: query.year,
      month: query.month || null,
      generatedAt: new Date().toISOString(),
      totalIncome,
      totalExpense,
      netProfit,
      operatingMargin: profitMarginPercentage,
      incomeBreakdown,
      expenseBreakdown,
      summary: {
        totalIncome,
        totalExpense,
        netProfit,
        profitMarginPercentage,
      },
      incomeItems: incomeGroups.map((g) => ({
        category: g.incomeCategory,
        amount: g._sum.amount || 0,
        entryCount: g._count,
        percentageOfTotal: totalIncome > 0 ? Number((((g._sum.amount || 0) / totalIncome) * 100).toFixed(1)) : 0,
      })),
      expenseItems: expenseGroups.map((g) => ({
        category: g.expenseCategory,
        amount: g._sum.amount || 0,
        entryCount: g._count,
        percentageOfTotal: totalExpense > 0 ? Number((((g._sum.amount || 0) / totalExpense) * 100).toFixed(1)) : 0,
      })),
    },
  })
}
