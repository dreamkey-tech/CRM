'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  WalletCards,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  RefreshCw,
  TrendingUp,
  Scale,
  Award,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit2,
  AlertCircle,
  FileText,
  Printer,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import {
  getFinanceSummary,
  getTransactions,
  getSalaryDisbursements,
  getUpcomingFinance,
  getDuesAndAdvances,
  getProfitLossStatement,
  deleteTransaction,
  deleteUpcomingFinance,
  deleteDueAdvance,
  convertUpcomingToTransaction,
} from '../../api/finance'
import type {
  FinanceSummary,
  FinanceTransaction,
  SalaryDisbursement,
  UpcomingFinanceItem,
  DueAndAdvanceRecord,
  ProfitLossStatement,
  FinanceTransactionType,
  PaymentMode,
} from '../../types/finance'
import { TransactionModal } from './TransactionModal'
import { SalaryModal } from './SalaryModal'
import { UpcomingModal } from './UpcomingModal'
import { DueAdvanceModal } from './DueAdvanceModal'
import { SettleDueModal } from './SettleDueModal'
import { CustomSelect } from '../ui/CustomSelect'
import { toast } from '../../utils/toast'
import { useAuthStore } from '../../store/useAuthStore'

type TabType = 'overview' | 'ledger' | 'salaries' | 'forecast' | 'dues' | 'profit-loss'

export function FinanceView() {
  const { hasPermission } = useAuthStore()
  const canManage = hasPermission('finance:manage')

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [defaultTxnType, setDefaultTxnType] = useState<FinanceTransactionType>('INCOME')
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null)

  const [salaryModalOpen, setSalaryModalOpen] = useState(false)
  const [upcomingModalOpen, setUpcomingModalOpen] = useState(false)
  const [defaultUpcomingType, setDefaultUpcomingType] = useState<FinanceTransactionType>('INCOME')

  const [dueAdvanceModalOpen, setDueAdvanceModalOpen] = useState(false)
  const [settleModalOpen, setSettleModalOpen] = useState(false)
  const [selectedDueRecord, setSelectedDueRecord] = useState<DueAndAdvanceRecord | null>(null)

  // Ledger Tab State
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [ledgerPage, setLedgerPage] = useState(1)
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1)

  // Salaries Tab State
  const [salaries, setSalaries] = useState<SalaryDisbursement[]>([])
  const [salariesLoading, setSalariesLoading] = useState(false)

  // Forecast Tab State
  const [forecastItems, setForecastItems] = useState<UpcomingFinanceItem[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)

  // Dues Tab State
  const [dueRecords, setDueRecords] = useState<DueAndAdvanceRecord[]>([])
  const [duesLoading, setDuesLoading] = useState(false)

  // P&L Tab State
  const [plStatement, setPlStatement] = useState<ProfitLossStatement | null>(null)
  const [plYear, setPlYear] = useState<number>(new Date().getFullYear())
  const [plMonth, setPlMonth] = useState<number | undefined>(new Date().getMonth() + 1)
  const [plLoading, setPlLoading] = useState(false)

  // Load summary KPIs
  const loadSummaryData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getFinanceSummary()
      setSummary(data)
    } catch (err) {
      console.error('Failed to load finance summary:', err)
      toast.error('Failed to load finance overview data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load transactions
  const loadTransactionsData = useCallback(async () => {
    try {
      setLedgerLoading(true)
      const res = await getTransactions({
        type: ledgerTypeFilter,
        search: ledgerSearch.trim() || undefined,
        page: ledgerPage,
        limit: 15,
      })
      setTransactions(res.transactions)
      setLedgerTotalPages(res.pagination.totalPages)
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLedgerLoading(false)
    }
  }, [ledgerTypeFilter, ledgerSearch, ledgerPage])

  // Load salaries
  const loadSalariesData = useCallback(async () => {
    try {
      setSalariesLoading(true)
      const data = await getSalaryDisbursements()
      setSalaries(data)
    } catch (err) {
      console.error('Failed to load salaries:', err)
    } finally {
      setSalariesLoading(false)
    }
  }, [])

  // Load forecast
  const loadForecastData = useCallback(async () => {
    try {
      setForecastLoading(true)
      const data = await getUpcomingFinance()
      setForecastItems(data)
    } catch (err) {
      console.error('Failed to load forecast items:', err)
    } finally {
      setForecastLoading(false)
    }
  }, [])

  // Load dues
  const loadDuesData = useCallback(async () => {
    try {
      setDuesLoading(true)
      const data = await getDuesAndAdvances()
      setDueRecords(data)
    } catch (err) {
      console.error('Failed to load dues:', err)
    } finally {
      setDuesLoading(false)
    }
  }, [])

  // Load P&L
  const loadPlData = useCallback(async () => {
    try {
      setPlLoading(true)
      const data = await getProfitLossStatement({
        year: plYear,
        month: plMonth,
      })
      setPlStatement(data)
    } catch (err) {
      console.error('Failed to load P&L statement:', err)
    } finally {
      setPlLoading(false)
    }
  }, [plYear, plMonth])

  // Initial load
  useEffect(() => {
    loadSummaryData()
  }, [loadSummaryData])

  // Tab switch effect
  useEffect(() => {
    if (activeTab === 'ledger') loadTransactionsData()
    if (activeTab === 'salaries') loadSalariesData()
    if (activeTab === 'forecast') loadForecastData()
    if (activeTab === 'dues') loadDuesData()
    if (activeTab === 'profit-loss') loadPlData()
  }, [activeTab, loadTransactionsData, loadSalariesData, loadForecastData, loadDuesData, loadPlData])

  // Refresh all current tab data
  const handleRefresh = () => {
    loadSummaryData()
    if (activeTab === 'ledger') loadTransactionsData()
    if (activeTab === 'salaries') loadSalariesData()
    if (activeTab === 'forecast') loadForecastData()
    if (activeTab === 'dues') loadDuesData()
    if (activeTab === 'profit-loss') loadPlData()
  }

  // Delete transaction handler
  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ledger transaction?')) return
    try {
      await deleteTransaction(id)
      toast.success('Transaction Deleted', 'Ledger record has been permanently removed.')
      loadTransactionsData()
      loadSummaryData()
    } catch (err) {
      toast.error('Failed to delete transaction')
    }
  }

  // Convert forecast to transaction
  const handleConvertForecast = async (item: UpcomingFinanceItem) => {
    try {
      await convertUpcomingToTransaction(item.id, {
        paymentMode: 'BANK_TRANSFER',
        recordAsTransaction: true,
      })
      toast.success(
        'Forecast Settled',
        `₹${(item.expectedAmount || 0).toLocaleString('en-IN')} converted to live transaction.`
      )
      loadForecastData()
      loadSummaryData()
    } catch (err) {
      toast.error('Failed to convert forecast item')
    }
  }

  // Delete forecast
  const handleDeleteForecast = async (id: string) => {
    if (!window.confirm('Delete this forecast item?')) return
    try {
      await deleteUpcomingFinance(id)
      toast.success('Forecast Item Deleted')
      loadForecastData()
      loadSummaryData()
    } catch (err) {
      toast.error('Failed to delete forecast')
    }
  }

  // Delete due record
  const handleDeleteDue = async (id: string) => {
    if (!window.confirm('Delete this due / advance record?')) return
    try {
      await deleteDueAdvance(id)
      toast.success('Record Deleted')
      loadDuesData()
      loadSummaryData()
    } catch (err) {
      toast.error('Failed to delete record')
    }
  }

  const kpis = summary?.kpis

  return (
    <div className="space-y-6 print:space-y-0">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5 print:hidden">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-none border border-gold/30 bg-gold/10 text-gold shadow-xs">
            <WalletCards className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Finance & Revenue
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none border border-gold/40 bg-gold/10 text-gold">
                Partner Clearance Only
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-text mt-0.5">
              Brokerage earnings, operational expense ledgers, monthly payroll & profit statements
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-muted-text hover:text-foreground hover:bg-surface-elevated rounded-none border border-border transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {canManage && (
            <>
              <button
                onClick={() => {
                  setDefaultTxnType('EXPENSE')
                  setEditingTransaction(null)
                  setTransactionModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-none border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all shadow-xs cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Record Expense
              </button>

              <button
                onClick={() => {
                  setDefaultTxnType('INCOME')
                  setEditingTransaction(null)
                  setTransactionModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-none text-black bg-gold hover:bg-gold-light transition-all shadow-md shadow-gold/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Income
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── KPI Stat Cards (FR-FN-07) - Seamless Sharp Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden rounded-none print:hidden">
        {/* 1. Revenue This Month */}
        <div className="p-4 sm:p-5 bg-surface flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
              Revenue (This Month)
            </span>
            <div className="p-1 rounded-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-foreground">
            ₹{(kpis?.thisMonthIncome || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-muted-text">
            All-time: ₹{(kpis?.allTimeIncome || 0).toLocaleString('en-IN')}
          </p>
        </div>

        {/* 2. Expenses This Month */}
        <div className="p-4 sm:p-5 bg-surface flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
              Expenses (This Month)
            </span>
            <div className="p-1 rounded-none bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-foreground">
            ₹{(kpis?.thisMonthExpense || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-muted-text">
            All-time: ₹{(kpis?.allTimeExpense || 0).toLocaleString('en-IN')}
          </p>
        </div>

        {/* 3. Net Profit This Month */}
        <div className="p-4 sm:p-5 bg-surface flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
              Net Profit (This Month)
            </span>
            <div className="p-1 rounded-none bg-gold/10 text-gold border border-gold/30">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${
              (kpis?.thisMonthNet || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ₹{(kpis?.thisMonthNet || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-muted-text">
            Margin: {kpis?.thisMonthSavingsRate || 0}% operating margin
          </p>
        </div>

        {/* 4. Pending Receivables */}
        <div className="p-4 sm:p-5 bg-surface flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
              Pending Receivables
            </span>
            <div className="p-1 rounded-none bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-foreground">
            ₹{(kpis?.pendingReceivables || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-muted-text">
            Owed by us: ₹{(kpis?.pendingPayables || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* ── Submodule Navigation Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px print:hidden">
        {[
          { id: 'overview', label: 'Overview & Charts', icon: TrendingUp },
          { id: 'ledger', label: 'Transactions Ledger', icon: FileSpreadsheet },
          { id: 'salaries', label: 'Salary Management', icon: Award },
          { id: 'forecast', label: 'Upcoming Pipeline', icon: Clock },
          { id: 'dues', label: 'Dues & Advances', icon: Scale },
          { id: 'profit-loss', label: 'P&L Statement & PDF', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-gold text-gold font-semibold bg-gold/5'
                  : 'border-transparent text-muted-text hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & CASHFLOW CHART ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 print:hidden">
          {/* 6-Month Cashflow Trend Chart */}
          <div className="p-5 rounded-none border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">6-Month Cashflow Trajectory</h3>
                <p className="text-xs text-muted-text">Comparative income vs operational expenses</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-none bg-emerald-500" /> Income
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-none bg-rose-500" /> Expense
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              {summary?.cashflowTrend && summary.cashflowTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.cashflowTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="month" stroke="#737373" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#737373"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderColor: '#404040',
                        borderRadius: '0px',
                        color: '#ededed',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-text">
                  No cashflow data recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Category Distributions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Breakdown */}
            <div className="p-5 rounded-none border border-border bg-surface space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-emerald-500" />
                Income Distribution by Category
              </h3>
              <div className="space-y-3">
                {summary?.incomeByCategory && summary.incomeByCategory.length > 0 ? (
                  summary.incomeByCategory.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground capitalize">
                          {cat.category.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span className="font-semibold text-foreground">
                          ₹{cat.amount.toLocaleString('en-IN')}{' '}
                          <span className="text-muted-text font-normal">({cat.percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-surface-elevated h-1.5 rounded-none overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-none"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-text py-4 text-center">No income categories logged.</p>
                )}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="p-5 rounded-none border border-border bg-surface space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-rose-500" />
                Expense Distribution by Category
              </h3>
              <div className="space-y-3">
                {summary?.expenseByCategory && summary.expenseByCategory.length > 0 ? (
                  summary.expenseByCategory.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground capitalize">
                          {cat.category.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span className="font-semibold text-foreground">
                          ₹{cat.amount.toLocaleString('en-IN')}{' '}
                          <span className="text-muted-text font-normal">({cat.percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-surface-elevated h-1.5 rounded-none overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-none"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-text py-4 text-center">No expense categories logged.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TRANSACTIONS LEDGER (FR-FN-01, FR-FN-02) ── */}
      {activeTab === 'ledger' && (
        <div className="space-y-4 print:hidden">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-none border border-border bg-surface">
            <div className="flex items-center gap-2">
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setLedgerTypeFilter(t)
                    setLedgerPage(1)
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-all cursor-pointer ${
                    ledgerTypeFilter === t
                      ? 'bg-gold text-black shadow-xs'
                      : 'bg-surface-elevated text-muted-text hover:text-foreground'
                  }`}
                >
                  {t === 'ALL' ? 'All Transactions' : t === 'INCOME' ? 'Income Only' : 'Expenses Only'}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-text" />
              <input
                type="text"
                placeholder="Search ledger notes, ref, partner..."
                value={ledgerSearch}
                onChange={(e) => {
                  setLedgerSearch(e.target.value)
                  setLedgerPage(1)
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-none bg-surface-elevated text-foreground border border-border focus:outline-hidden focus:border-gold"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-none border border-border bg-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated border-b border-border text-muted-text font-medium">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type & Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Partner</th>
                    <th className="py-3 px-4">Payment Mode & Ref</th>
                    <th className="py-3 px-4">Description</th>
                    {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {ledgerLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-text">
                        Loading financial ledger records...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-text">
                        No transactions found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => {
                      const isIncome = txn.type === 'INCOME'
                      const cat = isIncome ? txn.incomeCategory : txn.expenseCategory
                      return (
                        <tr key={txn.id} className="hover:bg-surface-elevated/50 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-foreground font-mono">
                            {new Date(txn.transactionDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
                                  isIncome
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {txn.type}
                              </span>
                              <span className="text-foreground font-medium capitalize">
                                {cat ? cat.replace(/_/g, ' ').toLowerCase() : 'General'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-bold text-sm">
                            <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                              {isIncome ? '+' : '-'}₹{(txn.amount || 0).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-text">
                            {txn.partner?.name || 'Company Account'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-foreground">{txn.paymentMode.replace(/_/g, ' ')}</div>
                            {txn.referenceNumber && (
                              <div className="text-[11px] font-mono text-muted-text">
                                {txn.referenceNumber}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-muted-text" title={txn.description || ''}>
                            {txn.description || '—'}
                          </td>
                          {canManage && (
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingTransaction(txn)
                                    setTransactionModalOpen(true)
                                  }}
                                  className="p-1 text-muted-text hover:text-gold hover:bg-surface-elevated rounded-none transition-colors cursor-pointer"
                                  title="Edit Record"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(txn.id)}
                                  className="p-1 text-muted-text hover:text-rose-400 hover:bg-surface-elevated rounded-none transition-colors cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {ledgerTotalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-border bg-surface-elevated/30">
                <span className="text-xs text-muted-text">
                  Page {ledgerPage} of {ledgerTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={ledgerPage <= 1}
                    onClick={() => setLedgerPage((p) => p - 1)}
                    className="p-1.5 rounded-none border border-border text-muted-text hover:text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={ledgerPage >= ledgerTotalPages}
                    onClick={() => setLedgerPage((p) => p + 1)}
                    className="p-1.5 rounded-none border border-border text-muted-text hover:text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: SALARY MANAGEMENT (FR-FN-03) ── */}
      {activeTab === 'salaries' && (
        <div className="space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Employee Monthly Payroll</h3>
              <p className="text-xs text-muted-text">
                Record staff compensation disbursements with automatic ledger expense sync
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => setSalaryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-none text-black bg-gold hover:bg-gold-light transition-all shadow-md shadow-gold/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Disburse Salary
              </button>
            )}
          </div>

          <div className="rounded-none border border-border bg-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated border-b border-border text-muted-text font-medium">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Base Salary</th>
                    <th className="py-3 px-4">Bonus / Incentive</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Paid</th>
                    <th className="py-3 px-4">Disbursed Date</th>
                    <th className="py-3 px-4">Disbursed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {salariesLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-text">
                        Loading salary disbursement records...
                      </td>
                    </tr>
                  ) : salaries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-text">
                        No salary disbursements recorded yet.
                      </td>
                    </tr>
                  ) : (
                    salaries.map((sal) => (
                      <tr key={sal.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{sal.employee?.name || 'Staff Member'}</div>
                          <div className="text-[11px] text-muted-text">{sal.employee?.email || '—'}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                          {new Date(sal.year, sal.month - 1).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4">₹{(sal.baseSalary || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-emerald-400">
                          {(sal.bonusIncentive || 0) > 0 ? `+₹${(sal.bonusIncentive || 0).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-rose-400">
                          {(sal.deductions || 0) > 0 ? `-₹${(sal.deductions || 0).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground text-sm">
                          ₹{(sal.netPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-muted-text font-mono">
                          {new Date(sal.paymentDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-muted-text">{sal.disbursedBy?.name || 'Partner / Admin'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: UPCOMING PIPELINE & FORECAST (FR-FN-04, FR-FN-05) ── */}
      {activeTab === 'forecast' && (
        <div className="space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Upcoming Commission & Expense Pipeline</h3>
              <p className="text-xs text-muted-text">
                Track expected deal closings and schedule upcoming liabilities with 1-click settlement
              </p>
            </div>
            {canManage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDefaultUpcomingType('EXPENSE')
                    setUpcomingModalOpen(true)
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-none border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  + Scheduled Expense
                </button>
                <button
                  onClick={() => {
                    setDefaultUpcomingType('INCOME')
                    setUpcomingModalOpen(true)
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-none text-black bg-gold hover:bg-gold-light transition-all shadow-md shadow-gold/20 cursor-pointer"
                >
                  + Expected Commission
                </button>
              </div>
            )}
          </div>

          <div className="rounded-none border border-border bg-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated border-b border-border text-muted-text font-medium">
                  <tr>
                    <th className="py-3 px-4">Title & Context</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Expected Amount</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4">Attributed Partner</th>
                    <th className="py-3 px-4">Status</th>
                    {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {forecastLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-text">
                        Loading forecast pipeline...
                      </td>
                    </tr>
                  ) : forecastItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-text">
                        No upcoming forecast items scheduled.
                      </td>
                    </tr>
                  ) : (
                    forecastItems.map((item) => {
                      const isIncome = item.type === 'INCOME'
                      const isPending = item.status === 'PENDING'
                      return (
                        <tr key={item.id} className="hover:bg-surface-elevated/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">{item.title}</div>
                            {item.notes && <div className="text-[11px] text-muted-text">{item.notes}</div>}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
                                isIncome
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-sm text-foreground">
                            ₹{(item.expectedAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-text">
                            {new Date(item.expectedDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-muted-text">{item.partner?.name || 'Company'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-none text-[10px] font-semibold ${
                                item.status === 'RECEIVED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : item.status === 'CANCELLED'
                                  ? 'bg-zinc-700/40 text-zinc-400 border border-zinc-600'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          {canManage && (
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <button
                                    onClick={() => handleConvertForecast(item)}
                                    className="px-2 py-1 text-[11px] font-semibold rounded-none bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors cursor-pointer"
                                  >
                                    Convert to Ledger
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteForecast(item.id)}
                                  className="p-1 text-muted-text hover:text-rose-400 rounded-none transition-colors cursor-pointer"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: DUES & ADVANCES (FR-FN-06) ── */}
      {activeTab === 'dues' && (
        <div className="space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Dues & Advances Tracker</h3>
              <p className="text-xs text-muted-text">
                Track receivables owed to company and advance liabilities with partial settlements
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => setDueAdvanceModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-none text-black bg-gold hover:bg-gold-light transition-all shadow-md shadow-gold/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Track Due / Advance
              </button>
            )}
          </div>

          <div className="rounded-none border border-border bg-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated border-b border-border text-muted-text font-medium">
                  <tr>
                    <th className="py-3 px-4">Party & Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Settled / Remaining</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {duesLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-text">
                        Loading dues and advances...
                      </td>
                    </tr>
                  ) : dueRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-text">
                        No outstanding dues or advances tracked.
                      </td>
                    </tr>
                  ) : (
                    dueRecords.map((due) => {
                      const isSettled = due.status === 'SETTLED'
                      const isReceivable =
                        due.type === 'RECEIVABLE' || due.type === 'ADVANCE_GIVEN'
                      return (
                        <tr key={due.id} className="hover:bg-surface-elevated/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">{due.partyName}</div>
                            <span
                              className={`inline-block px-1.5 py-0.5 mt-0.5 rounded-none text-[10px] font-bold ${
                                isReceivable
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {due.type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-text">{due.partyType}</td>
                          <td className="py-3 px-4 font-bold text-foreground">
                            ₹{(due.totalAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-foreground">
                              ₹{(due.settledAmount || 0).toLocaleString('en-IN')}{' '}
                              <span className="text-muted-text">
                                / ₹{(due.remainingAmount || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="w-24 bg-surface-elevated h-1 rounded-none overflow-hidden mt-1">
                              <div
                                className="bg-gold h-full rounded-none"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (due.settledAmount / (due.totalAmount || 1)) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-text">
                            {due.dueDate ? new Date(due.dueDate).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-none text-[10px] font-semibold ${
                                due.status === 'SETTLED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : due.status === 'PARTIALLY_SETTLED'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-zinc-700/40 text-zinc-300 border border-zinc-600'
                              }`}
                            >
                              {due.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          {canManage && (
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isSettled && (
                                  <button
                                    onClick={() => {
                                      setSelectedDueRecord(due)
                                      setSettleModalOpen(true)
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-none bg-gold/15 text-gold hover:bg-gold/25 border border-gold/30 transition-colors cursor-pointer"
                                  >
                                    Settle
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteDue(due.id)}
                                  className="p-1 text-muted-text hover:text-rose-400 rounded-none transition-colors cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: P&L STATEMENT & PDF EXPORT (FR-FN-08) ── */}
      {activeTab === 'profit-loss' && (
        <div className="space-y-6 print:space-y-0">
          {/* Controls & Export Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-none border border-border bg-surface print:hidden">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-text mb-1">Statement Year</label>
                <input
                  type="number"
                  value={plYear}
                  onChange={(e) => setPlYear(parseInt(e.target.value, 10))}
                  min={2020}
                  max={2050}
                  className="px-3 py-1.5 text-xs rounded-none bg-surface-elevated text-foreground border border-border focus:outline-hidden focus:border-gold w-24"
                />
              </div>

              <div className="w-44">
                <label className="block text-[11px] font-medium text-muted-text mb-1">Month (Optional)</label>
                <CustomSelect
                  value={plMonth ? String(plMonth) : ''}
                  onChange={(val) => setPlMonth(val ? parseInt(val, 10) : undefined)}
                  options={[
                    { label: 'Full Year (Annual)', value: '' },
                    ...[
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December',
                    ].map((m, idx) => ({
                      label: m,
                      value: String(idx + 1),
                    })),
                  ]}
                />
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-none bg-surface-elevated text-foreground border border-border hover:bg-border transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-gold" />
              Print / Export Statement PDF
            </button>
          </div>

          {/* Printable P&L Statement Sheet */}
          <div className="p-6 sm:p-8 rounded-none border border-border bg-surface text-foreground shadow-lg space-y-6 print:p-0 print:border-none print:shadow-none print:bg-white print:text-slate-900 print:w-full print:space-y-4 print-avoid-break">
            {/* ── Corporate Letterhead ── */}
            <div className="border-b-2 border-border print:border-slate-900 pb-5 print:pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-none bg-gold/15 print:bg-slate-900 border border-gold/40 print:border-slate-800 text-gold print:text-amber-400 font-bold font-serif text-lg flex items-center justify-center shrink-0">
                  DK
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground print:text-slate-900 font-serif">
                    DREAMKEY REALTY PARTNERS LLP
                  </h1>
                  <p className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-muted-text print:text-slate-600">
                    Private Real Estate Advisory & Brokerage Services • Finance & Ledger Division
                  </p>
                  <p className="text-[10px] text-muted-text print:text-slate-500 mt-1">
                    Park Street Commercial Hub, Kolkata, WB 700016 • GST / PAN Registered Entity • confidential@dreamkeykol.com
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-none bg-gold/10 text-gold border border-gold/30 print:bg-slate-100 print:text-slate-900 print:border-slate-800">
                  STRICTLY CONFIDENTIAL • AUDIT RECORD
                </span>
                <h2 className="text-xs sm:text-sm font-bold tracking-wider text-foreground print:text-slate-900 mt-1.5 uppercase">
                  STATEMENT OF PROFIT & LOSS
                </h2>
                <p className="text-xs font-semibold text-foreground print:text-slate-800">
                  Period: {plStatement?.period || `FY ${plYear}`}
                </p>
                <p className="text-[10px] text-muted-text print:text-slate-500 font-mono mt-0.5">
                  Currency: INR (₹) • As of: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {plLoading ? (
              <div className="py-12 text-center text-muted-text text-sm">Generating Statement...</div>
            ) : plStatement ? (() => {
              const totalIncome = plStatement.totalIncome ?? plStatement.summary?.totalIncome ?? 0
              const totalExpense = plStatement.totalExpense ?? plStatement.summary?.totalExpense ?? 0
              const netProfit = plStatement.netProfit ?? plStatement.summary?.netProfit ?? (totalIncome - totalExpense)
              const operatingMargin =
                plStatement.operatingMargin ??
                plStatement.summary?.profitMarginPercentage ??
                (totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(1)) : 0)
              const expenseRatio = totalIncome > 0 ? Number(((totalExpense / totalIncome) * 100).toFixed(1)) : 0

              const incomeEntries: [string, number][] =
                plStatement.incomeItems && plStatement.incomeItems.length > 0
                  ? plStatement.incomeItems.map((i) => [i.category, i.amount])
                  : Object.entries(plStatement.incomeBreakdown || {})

              const expenseEntries: [string, number][] =
                plStatement.expenseItems && plStatement.expenseItems.length > 0
                  ? plStatement.expenseItems.map((i) => [i.category, i.amount])
                  : Object.entries(plStatement.expenseBreakdown || {})

              return (
                <div className="space-y-5 print:space-y-4">
                  {/* ── Executive Highlights Grid (3 Columns) ── */}
                  <div className="grid grid-cols-3 gap-px bg-border print:bg-slate-300 border border-border print:border-slate-300 rounded-none overflow-hidden">
                    <div className="p-3 bg-surface print:bg-slate-50 flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-text print:text-slate-600">
                        Gross Operating Revenue
                      </span>
                      <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 print:text-emerald-700 mt-0.5">
                        ₹{totalIncome.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-muted-text print:text-slate-500">100.0% of Inflow</span>
                    </div>

                    <div className="p-3 bg-surface print:bg-slate-50 flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-text print:text-slate-600">
                        Operating Overheads
                      </span>
                      <span className="text-base sm:text-lg font-bold font-mono text-rose-400 print:text-rose-700 mt-0.5">
                        ₹{totalExpense.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-muted-text print:text-slate-500">{expenseRatio}% of Revenue</span>
                    </div>

                    <div className="p-3 bg-surface print:bg-slate-50 flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-text print:text-slate-600">
                        Net Operating Surplus / (Loss)
                      </span>
                      <span
                        className={`text-base sm:text-lg font-bold font-mono mt-0.5 ${
                          netProfit >= 0
                            ? 'text-emerald-400 print:text-emerald-700'
                            : 'text-rose-400 print:text-rose-700'
                        }`}
                      >
                        ₹{netProfit.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-muted-text print:text-slate-500 font-medium">
                        {operatingMargin}% Operating Margin
                      </span>
                    </div>
                  </div>

                  {/* ── Schedule I: Operating Revenue Table ── */}
                  <div className="space-y-1.5 print-avoid-break">
                    <div className="flex items-center justify-between border-b border-border/80 print:border-slate-800 pb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-slate-900">
                        Schedule I — Operating Revenue & Brokerage Receipts
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-muted-text print:text-slate-600">
                        (Amounts in INR)
                      </span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 print:border-slate-300 text-[10px] uppercase font-semibold text-muted-text print:text-slate-600">
                          <th className="py-1.5 pr-4">Revenue Stream / Classification</th>
                          <th className="py-1.5 px-3 text-right">Share (%)</th>
                          <th className="py-1.5 pl-3 text-right">Subtotal Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 print:divide-slate-200">
                        {incomeEntries.length > 0 ? (
                          incomeEntries.map(([cat, amt]) => {
                            const share = totalIncome > 0 ? (((amt || 0) / totalIncome) * 100).toFixed(1) : '0.0'
                            return (
                              <tr key={cat} className="print:text-slate-800">
                                <td className="py-1.5 pr-4 font-medium capitalize">
                                  {cat.replace(/_/g, ' ').toLowerCase()}
                                </td>
                                <td className="py-1.5 px-3 text-right text-muted-text print:text-slate-600 font-mono">
                                  {share}%
                                </td>
                                <td className="py-1.5 pl-3 text-right font-mono font-semibold text-foreground print:text-slate-900">
                                  ₹{(amt || 0).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-2 text-muted-text print:text-slate-500 italic">
                              No operating income records booked for this period.
                            </td>
                          </tr>
                        )}
                        <tr className="border-t-2 border-border print:border-slate-800 font-bold bg-surface-elevated/40 print:bg-slate-100">
                          <td className="py-2 pr-4 text-foreground print:text-slate-900 uppercase">
                            Total Operating Revenue (Schedule I)
                          </td>
                          <td className="py-2 px-3 text-right text-muted-text print:text-slate-700 font-mono">
                            100.0%
                          </td>
                          <td className="py-2 pl-3 text-right font-mono text-emerald-400 print:text-slate-900">
                            ₹{totalIncome.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* ── Schedule II: Operating Expenses Table ── */}
                  <div className="space-y-1.5 print-avoid-break">
                    <div className="flex items-center justify-between border-b border-border/80 print:border-slate-800 pb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-400 print:text-slate-900">
                        Schedule II — Operational Expenses & Overheads
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-muted-text print:text-slate-600">
                        (Amounts in INR)
                      </span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 print:border-slate-300 text-[10px] uppercase font-semibold text-muted-text print:text-slate-600">
                          <th className="py-1.5 pr-4">Overhead Classification / Cost Center</th>
                          <th className="py-1.5 px-3 text-right">Cost Share (%)</th>
                          <th className="py-1.5 pl-3 text-right">Subtotal Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 print:divide-slate-200">
                        {expenseEntries.length > 0 ? (
                          expenseEntries.map(([cat, amt]) => {
                            const share = totalExpense > 0 ? (((amt || 0) / totalExpense) * 100).toFixed(1) : '0.0'
                            return (
                              <tr key={cat} className="print:text-slate-800">
                                <td className="py-1.5 pr-4 font-medium capitalize">
                                  {cat.replace(/_/g, ' ').toLowerCase()}
                                </td>
                                <td className="py-1.5 px-3 text-right text-muted-text print:text-slate-600 font-mono">
                                  {share}%
                                </td>
                                <td className="py-1.5 pl-3 text-right font-mono font-semibold text-foreground print:text-slate-900">
                                  ₹{(amt || 0).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-2 text-muted-text print:text-slate-500 italic">
                              No operating expenses recorded for this period.
                            </td>
                          </tr>
                        )}
                        <tr className="border-t-2 border-border print:border-slate-800 font-bold bg-surface-elevated/40 print:bg-slate-100">
                          <td className="py-2 pr-4 text-foreground print:text-slate-900 uppercase">
                            Total Operating Expenses (Schedule II)
                          </td>
                          <td className="py-2 px-3 text-right text-muted-text print:text-slate-700 font-mono">
                            100.0%
                          </td>
                          <td className="py-2 pl-3 text-right font-mono text-rose-400 print:text-slate-900">
                            ₹{totalExpense.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* ── Section III: Bottom-Line Realization & Reconciliation ── */}
                  <div className="p-4 rounded-none bg-surface-elevated print:bg-slate-50 border border-border print:border-slate-300 space-y-2.5 print-avoid-break">
                    <div className="flex justify-between items-center text-xs text-muted-text print:text-slate-600">
                      <span>Total Operating Inflow (Schedule I)</span>
                      <span className="font-mono font-medium text-foreground print:text-slate-900">
                        ₹{totalIncome.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-text print:text-slate-600">
                      <span>Less Total Operating Overheads (Schedule II)</span>
                      <span className="font-mono font-medium text-rose-400 print:text-slate-900">
                        (₹{totalExpense.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <div className="pt-2 border-t-2 border-border print:border-slate-900 flex justify-between items-center">
                      <div>
                        <span className="text-sm sm:text-base font-black tracking-tight text-foreground print:text-slate-900 uppercase">
                          NET OPERATING SURPLUS / (DEFICIT)
                        </span>
                        <div className="text-[10px] text-muted-text print:text-slate-500">
                          Profit Margin: {operatingMargin}% • Overhead Ratio: {expenseRatio}%
                        </div>
                      </div>
                      <span
                        className={`text-lg sm:text-xl font-black font-mono border-b-4 border-double ${
                          netProfit >= 0
                            ? 'text-emerald-400 print:text-slate-900 border-emerald-400 print:border-slate-900'
                            : 'text-rose-400 print:text-rose-800 border-rose-400 print:border-rose-800'
                        }`}
                      >
                        ₹{netProfit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* ── Accounting Notes & Disclaimer ── */}
                  <div className="text-[10px] text-muted-text print:text-slate-500 space-y-1 border-t border-border/60 print:border-slate-300 pt-3 print-avoid-break">
                    <p className="font-semibold text-foreground print:text-slate-700">Accounting Notes & Methodology:</p>
                    <p>
                      1. This financial report reflects cash-basis revenue recognition reconciled directly from the DreamKey CRM Transaction Ledger, validated against company bank credits and partner disbursements.
                    </p>
                    <p>
                      2. Net operating surplus is allocated to partner drawing accounts in accordance with the DreamKey Realty Partnership Deed. This document is strictly confidential and generated for internal management and tax review.
                    </p>
                  </div>

                  {/* ── Partner Certification & Audit Stamp Section ── */}
                  <div className="pt-6 print:pt-4 border-t-2 border-border print:border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end print-avoid-break">
                    <div className="space-y-6">
                      <div className="border-b border-border/80 print:border-slate-400 h-10 flex items-end">
                        <span className="text-[11px] font-serif italic text-muted-text print:text-slate-600">
                          Verified & Reconciled
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground print:text-slate-900">Finance & Accounts Lead</p>
                        <p className="text-[10px] text-muted-text print:text-slate-500">DreamKey Realty Partners LLP</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="border-b border-border/80 print:border-slate-400 h-10 flex items-end">
                        <span className="text-[11px] font-serif italic text-muted-text print:text-slate-600">
                          Approved for Distribution
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground print:text-slate-900">Managing Partner / Director</p>
                        <p className="text-[10px] text-muted-text print:text-slate-500">DreamKey Realty Partners LLP</p>
                      </div>
                    </div>

                    <div className="flex sm:justify-end">
                      <div className="p-3 border-2 border-dashed border-gold/40 print:border-slate-400 rounded-none text-center w-full sm:w-44 bg-surface print:bg-white">
                        <p className="text-[9px] font-bold tracking-widest text-gold print:text-slate-700 uppercase">
                          DREAMKEY REALTY
                        </p>
                        <p className="text-[8px] tracking-wider text-muted-text print:text-slate-500 uppercase mt-0.5">
                          OFFICIAL CORPORATE SEAL
                        </p>
                        <div className="my-1 border-t border-border print:border-slate-200" />
                        <p className="text-[8px] font-mono text-emerald-400 print:text-slate-600">
                          [ AUDIT VERIFIED ]
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Document Footer ── */}
                  <div className="border-t border-border print:border-slate-300 pt-3 flex justify-between items-center text-[9px] text-muted-text print:text-slate-500 font-mono print-avoid-break">
                    <span>DreamKey Realty Partners • Private & Confidential</span>
                    <span>System Generated • Page 1 of 1</span>
                  </div>
                </div>
              )
            })() : null}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <div className="print:hidden">
        <TransactionModal
          isOpen={transactionModalOpen}
          onClose={() => setTransactionModalOpen(false)}
          onSuccess={() => {
            loadTransactionsData()
            loadSummaryData()
          }}
          defaultType={defaultTxnType}
          editingTransaction={editingTransaction}
        />

        <SalaryModal
          isOpen={salaryModalOpen}
          onClose={() => setSalaryModalOpen(false)}
          onSuccess={() => {
            loadSalariesData()
            loadTransactionsData()
            loadSummaryData()
          }}
        />

        <UpcomingModal
          isOpen={upcomingModalOpen}
          onClose={() => setUpcomingModalOpen(false)}
          onSuccess={() => {
            loadForecastData()
            loadSummaryData()
          }}
          defaultType={defaultUpcomingType}
        />

        <DueAdvanceModal
          isOpen={dueAdvanceModalOpen}
          onClose={() => setDueAdvanceModalOpen(false)}
          onSuccess={() => {
            loadDuesData()
            loadSummaryData()
          }}
        />

        <SettleDueModal
          isOpen={settleModalOpen}
          onClose={() => setSettleModalOpen(false)}
          onSuccess={() => {
            loadDuesData()
            loadTransactionsData()
            loadSummaryData()
          }}
          record={selectedDueRecord}
        />
      </div>
    </div>
  )
}
