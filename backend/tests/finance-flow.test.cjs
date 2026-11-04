const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { randomUUID } = require('node:crypto')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

const root = path.resolve(__dirname, '..')

function loader() {
  const cache = new Map()
  function read(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const req = createRequire(filename)
    new Function(
      'require',
      'module',
      'exports',
      transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code
    )(
      (name) =>
        name.endsWith('.json')
          ? JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), name), 'utf8'))
          : name.startsWith('.')
          ? read(path.resolve(path.dirname(filename), name.endsWith('.ts') ? name : name + '.ts'))
          : req(name),
      module,
      module.exports
    )
    return module.exports
  }
  return (relative) => read(path.resolve(root, 'src', relative))
}

const load = loader()
const {
  createTransactionSchema,
  createSalaryDisbursementSchema,
  createUpcomingFinanceSchema,
  createDueAdvanceSchema,
  settleDueAdvanceSchema,
} = load('zod/finance.ts')
const dbModule = load('db.ts')

test('Finance Zod Validation: validates transaction schemas correctly', () => {
  // 1. Valid income transaction
  const validIncome = {
    type: 'INCOME',
    incomeCategory: 'SALE_COMMISSION',
    amount: 150000,
    transactionDate: new Date().toISOString(),
    paymentMode: 'BANK_TRANSFER',
    referenceNumber: 'TXN-984712',
    description: '50% advance for Salt Lake villa sale',
  }
  const parsedIncome = createTransactionSchema.parse(validIncome)
  assert.equal(parsedIncome.amount, 150000)
  assert.equal(parsedIncome.type, 'INCOME')
  assert.equal(parsedIncome.incomeCategory, 'SALE_COMMISSION')

  // 2. Valid expense transaction
  const validExpense = {
    type: 'EXPENSE',
    expenseCategory: 'OFFICE_RENT',
    amount: 45000,
    transactionDate: new Date().toISOString(),
    paymentMode: 'CHEQUE',
    description: 'November office rent for Sector V',
  }
  const parsedExpense = createTransactionSchema.parse(validExpense)
  assert.equal(parsedExpense.amount, 45000)
  assert.equal(parsedExpense.expenseCategory, 'OFFICE_RENT')

  // 3. Reject negative amount
  assert.throws(() => {
    createTransactionSchema.parse({
      ...validIncome,
      amount: -500,
    })
  })

  // 4. Reject invalid payment mode
  assert.throws(() => {
    createTransactionSchema.parse({
      ...validIncome,
      paymentMode: 'BITCOIN',
    })
  })

  // 5. Reject income without incomeCategory
  assert.throws(() => {
    createTransactionSchema.parse({
      type: 'INCOME',
      amount: 10000,
      transactionDate: new Date().toISOString(),
    })
  })
})

test('Finance Zod Validation: validates salary, upcoming, and dues schemas', () => {
  // Valid salary disbursement
  const validSalary = {
    employeeId: '123e4567-e89b-12d3-a456-426614174000',
    baseSalary: 55000,
    bonusIncentive: 5000,
    deductions: 2000,
    paymentDate: new Date().toISOString(),
    month: 11,
    year: 2026,
    paymentMode: 'BANK_TRANSFER',
    notes: 'November 2026 regular compensation',
  }
  const parsedSalary = createSalaryDisbursementSchema.parse(validSalary)
  assert.equal(parsedSalary.month, 11)
  assert.equal(parsedSalary.year, 2026)
  assert.equal(parsedSalary.baseSalary, 55000)

  // Salary invalid month (13)
  assert.throws(() => {
    createSalaryDisbursementSchema.parse({
      ...validSalary,
      month: 13,
    })
  })

  // Valid upcoming finance item
  const validUpcoming = {
    type: 'INCOME',
    category: 'SALE_COMMISSION',
    title: 'Expected commission from Urbana deal',
    expectedAmount: 250000,
    expectedDate: new Date(Date.now() + 86400000 * 10).toISOString(),
  }
  const parsedUpcoming = createUpcomingFinanceSchema.parse(validUpcoming)
  assert.equal(parsedUpcoming.expectedAmount, 250000)

  // Valid dues record & settlement
  const validDue = {
    type: 'RECEIVABLE',
    partyName: 'Mr. Arvind Gupta',
    partyType: 'CLIENT',
    totalAmount: 100000,
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    notes: 'Pending consultancy fee',
  }
  const parsedDue = createDueAdvanceSchema.parse(validDue)
  assert.equal(parsedDue.totalAmount, 100000)

  const validSettle = {
    settleAmount: 50000,
    paymentMode: 'UPI',
    notes: 'First installment received',
  }
  const parsedSettle = settleDueAdvanceSchema.parse(validSettle)
  assert.equal(parsedSettle.settleAmount, 50000)
})

test('Live DB Integration: complete finance lifecycle test', async () => {
  const envContent = fs.readFileSync(path.resolve(root, '.env'), 'utf8')
  const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)
  if (!dbUrlMatch) {
    console.log('Skipping live DB finance test: DATABASE_URL not found')
    return
  }
  const prisma = dbModule.getPrisma(dbUrlMatch[1])

  // Find an existing partner / user to link transactions
  const partner = await prisma.user.findFirst({
    where: { isActive: true },
  })

  if (!partner) {
    console.log('Skipping live DB finance test: No active user found')
    return
  }

  const tag = `TEST-${randomUUID().slice(0, 8)}`

  let createdIncomeId = null
  let createdExpenseId = null
  let createdSalaryId = null
  let createdSalaryExpenseId = null
  let createdUpcomingId = null
  let createdDueId = null

  try {
    // 1. Create Income Transaction
    const income = await prisma.financeTransaction.create({
      data: {
        type: 'INCOME',
        incomeCategory: 'SALE_COMMISSION',
        amount: 80000,
        transactionDate: new Date(),
        paymentMode: 'BANK_TRANSFER',
        referenceNumber: tag,
        description: `Integration Test Income ${tag}`,
        partnerId: partner.id,
        createdById: partner.id,
      },
    })
    createdIncomeId = income.id
    assert.equal(income.type, 'INCOME')
    assert.equal(income.amount, 80000)

    // 2. Create Expense Transaction
    const expense = await prisma.financeTransaction.create({
      data: {
        type: 'EXPENSE',
        expenseCategory: 'MARKETING',
        amount: 15000,
        transactionDate: new Date(),
        paymentMode: 'UPI',
        referenceNumber: tag,
        description: `Integration Test Marketing ${tag}`,
        partnerId: partner.id,
        createdById: partner.id,
      },
    })
    createdExpenseId = expense.id
    assert.equal(expense.type, 'EXPENSE')
    assert.equal(expense.amount, 15000)

    // 3. Create Salary Disbursement linked to an automated ledger expense
    const salaryExpense = await prisma.financeTransaction.create({
      data: {
        type: 'EXPENSE',
        expenseCategory: 'SALARY',
        amount: 35000,
        transactionDate: new Date(),
        paymentMode: 'BANK_TRANSFER',
        description: `Salary payout for 11/2099 - ${partner.name} (${tag})`,
        partnerId: partner.id,
        createdById: partner.id,
      },
    })
    createdSalaryExpenseId = salaryExpense.id

    const salary = await prisma.salaryDisbursement.create({
      data: {
        employeeId: partner.id,
        baseSalary: 35000,
        bonusIncentive: 0,
        deductions: 0,
        netPaid: 35000,
        paymentDate: new Date(),
        month: 11,
        year: 2099, // Use future year to avoid conflict with actual monthly records
        paymentMode: 'BANK_TRANSFER',
        notes: `Test Salary ${tag}`,
        transactionId: salaryExpense.id,
        disbursedById: partner.id,
      },
    })
    createdSalaryId = salary.id
    assert.equal(salary.netPaid, 35000)
    assert.equal(salary.transactionId, salaryExpense.id)

    // 4. Create Upcoming Finance item & Convert to Transaction
    const upcoming = await prisma.upcomingFinanceItem.create({
      data: {
        type: 'INCOME',
        category: 'SALE_COMMISSION',
        title: `Projected Commission ${tag}`,
        expectedAmount: 120000,
        expectedDate: new Date(Date.now() + 86400000 * 5),
        status: 'PENDING',
        createdById: partner.id,
      },
    })
    createdUpcomingId = upcoming.id
    assert.equal(upcoming.status, 'PENDING')

    // Simulate conversion:
    const convertedTxn = await prisma.financeTransaction.create({
      data: {
        type: 'INCOME',
        incomeCategory: 'SALE_COMMISSION',
        amount: upcoming.expectedAmount,
        transactionDate: new Date(),
        paymentMode: 'BANK_TRANSFER',
        description: `Converted from forecast: ${upcoming.title}`,
        partnerId: partner.id,
        createdById: partner.id,
      },
    })
    await prisma.upcomingFinanceItem.update({
      where: { id: upcoming.id },
      data: {
        status: 'RECEIVED',
      },
    })

    const refreshedUpcoming = await prisma.upcomingFinanceItem.findUnique({
      where: { id: upcoming.id },
    })
    assert.equal(refreshedUpcoming.status, 'RECEIVED')
    // Clean up the converted transaction too
    await prisma.financeTransaction.delete({ where: { id: convertedTxn.id } })

    // 5. Create Due Record & Settle
    const due = await prisma.dueAndAdvanceRecord.create({
      data: {
        type: 'RECEIVABLE',
        partyName: `Client Test ${tag}`,
        partyType: 'CLIENT',
        totalAmount: 50000,
        settledAmount: 0,
        remainingAmount: 50000,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 86400000 * 15),
        notes: `Test receivable ${tag}`,
        createdById: partner.id,
      },
    })
    createdDueId = due.id

    // Partial settlement: 20000
    const partialSettlement = await prisma.dueAndAdvanceRecord.update({
      where: { id: due.id },
      data: {
        settledAmount: 20000,
        remainingAmount: 30000,
        status: 'PARTIALLY_SETTLED',
      },
    })
    assert.equal(partialSettlement.settledAmount, 20000)
    assert.equal(partialSettlement.remainingAmount, 30000)
    assert.equal(partialSettlement.status, 'PARTIALLY_SETTLED')

    // Full settlement: 50000
    const fullSettlement = await prisma.dueAndAdvanceRecord.update({
      where: { id: due.id },
      data: {
        settledAmount: 50000,
        remainingAmount: 0,
        status: 'SETTLED',
      },
    })
    assert.equal(fullSettlement.settledAmount, 50000)
    assert.equal(fullSettlement.remainingAmount, 0)
    assert.equal(fullSettlement.status, 'SETTLED')
  } finally {
    // Teardown / Cleanup test records to leave DB pristine
    if (createdSalaryId) {
      await prisma.salaryDisbursement.delete({ where: { id: createdSalaryId } }).catch(() => {})
    }
    if (createdSalaryExpenseId) {
      await prisma.financeTransaction.delete({ where: { id: createdSalaryExpenseId } }).catch(() => {})
    }
    if (createdIncomeId) {
      await prisma.financeTransaction.delete({ where: { id: createdIncomeId } }).catch(() => {})
    }
    if (createdExpenseId) {
      await prisma.financeTransaction.delete({ where: { id: createdExpenseId } }).catch(() => {})
    }
    if (createdUpcomingId) {
      await prisma.upcomingFinanceItem.delete({ where: { id: createdUpcomingId } }).catch(() => {})
    }
    if (createdDueId) {
      await prisma.dueAndAdvanceRecord.delete({ where: { id: createdDueId } }).catch(() => {})
    }
  }
})
