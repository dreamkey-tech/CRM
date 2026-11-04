'use client'

import React, { useState, useEffect } from 'react'
import { X, ArrowDownRight, ArrowUpRight, DollarSign, Calendar, CreditCard, User, FileText, Hash } from 'lucide-react'
import { createTransaction, updateTransaction } from '../../api/finance'
import { listEmployeesApi } from '../../api/organization'
import type { FinanceTransaction, FinanceTransactionType, IncomeCategory, ExpenseCategory, PaymentMode } from '../../types/finance'
import type { Employee } from '../../types/organization'
import { toast } from '../../utils/toast'
import { CustomSelect } from '../ui/CustomSelect'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultType?: FinanceTransactionType
  editingTransaction?: FinanceTransaction | null
}

const INCOME_CATEGORIES: { label: string; value: IncomeCategory }[] = [
  { label: 'Sale Commission', value: 'SALE_COMMISSION' },
  { label: 'Rental Commission', value: 'RENTAL_COMMISSION' },
  { label: 'Brokerage Fee', value: 'BROKERAGE' },
  { label: 'Consultation Fee', value: 'CONSULTATION_FEE' },
  { label: 'Other Revenue', value: 'OTHER_INCOME' },
]

const EXPENSE_CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: 'Office Rent & Space', value: 'OFFICE_RENT' },
  { label: 'Marketing & Ads', value: 'MARKETING' },
  { label: 'Fuel, Travel & Logistics', value: 'TRAVEL_FUEL' },
  { label: 'Salaries & Wages', value: 'SALARY' },
  { label: 'Utilities (Electricity/Net)', value: 'UTILITIES' },
  { label: 'Legal & Professional Fees', value: 'LEGAL_PROFESSIONAL' },
  { label: 'Office Supplies & Software', value: 'OFFICE_SUPPLIES' },
  { label: 'Miscellaneous Costs', value: 'MISCELLANEOUS' },
]

const PAYMENT_MODES: { label: string; value: PaymentMode }[] = [
  { label: 'Bank Transfer (NEFT/RTGS)', value: 'BANK_TRANSFER' },
  { label: 'UPI / Digital Payment', value: 'UPI' },
  { label: 'Cheque / Demand Draft', value: 'CHEQUE' },
  { label: 'Cash Payment', value: 'CASH' },
]

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'INCOME',
  editingTransaction,
}: TransactionModalProps) {
  const [type, setType] = useState<FinanceTransactionType>(defaultType)
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('SALE_COMMISSION')
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('MARKETING')
  const [amount, setAmount] = useState<string>('')
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BANK_TRANSFER')
  const [referenceNumber, setReferenceNumber] = useState<string>('')
  const [partnerId, setPartnerId] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [partners, setPartners] = useState<Employee[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load team partners for attribution
  useEffect(() => {
    if (isOpen) {
      listEmployeesApi({ limit: 100 })
        .then((res) => {
          if (res?.employees) {
            setPartners(res.employees.filter((e) => e.isActive))
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  // Populate fields if editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type)
      if (editingTransaction.incomeCategory) setIncomeCategory(editingTransaction.incomeCategory)
      if (editingTransaction.expenseCategory) setExpenseCategory(editingTransaction.expenseCategory)
      setAmount(String(editingTransaction.amount))
      setTransactionDate(new Date(editingTransaction.transactionDate).toISOString().split('T')[0])
      setPaymentMode(editingTransaction.paymentMode)
      setReferenceNumber(editingTransaction.referenceNumber || '')
      setPartnerId(editingTransaction.partnerId || '')
      setDescription(editingTransaction.description || '')
    } else {
      setType(defaultType)
      setAmount('')
      setTransactionDate(new Date().toISOString().split('T')[0])
      setPaymentMode('BANK_TRANSFER')
      setReferenceNumber('')
      setPartnerId('')
      setDescription('')
      setErrors({})
    }
  }, [editingTransaction, defaultType, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0.'
    }
    if (!transactionDate) {
      newErrors.transactionDate = 'Please select a date.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          incomeCategory: type === 'INCOME' ? incomeCategory : undefined,
          expenseCategory: type === 'EXPENSE' ? expenseCategory : undefined,
          amount: numAmount,
          transactionDate: new Date(transactionDate).toISOString(),
          paymentMode,
          referenceNumber: referenceNumber.trim() || undefined,
          partnerId: partnerId || null,
          description: description.trim() || undefined,
        })
        toast.success('Transaction Updated', 'Financial record has been successfully updated.')
      } else {
        await createTransaction({
          type,
          incomeCategory: type === 'INCOME' ? incomeCategory : undefined,
          expenseCategory: type === 'EXPENSE' ? expenseCategory : undefined,
          amount: numAmount,
          transactionDate: new Date(transactionDate).toISOString(),
          paymentMode,
          referenceNumber: referenceNumber.trim() || undefined,
          partnerId: partnerId || undefined,
          description: description.trim() || undefined,
        })
        toast.success(
          type === 'INCOME' ? 'Income Logged' : 'Expense Recorded',
          `₹${numAmount.toLocaleString('en-IN')} has been added to the company finance ledger.`
        )
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to save transaction.'
      toast.error('Transaction Failed', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isIncome = type === 'INCOME'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-none border border-border bg-surface p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-none border ${
                isIncome
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {editingTransaction
                  ? 'Edit Ledger Transaction'
                  : isIncome
                  ? 'Log Income Entry'
                  : 'Record Expense Entry'}
              </h2>
              <p className="text-xs text-muted-text">
                {isIncome
                  ? 'Record brokerage received, commission, or advisory payout'
                  : 'Track operational costs, rent, marketing, or general overhead'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-none p-1.5 text-muted-text hover:bg-surface-elevated hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Toggle (if not editing) */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-elevated rounded-none border border-border">
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`py-2 text-xs font-semibold rounded-none transition-all flex items-center justify-center gap-1.5 ${
                  isIncome
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-xs border border-emerald-500/30'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Income (+)
              </button>
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`py-2 text-xs font-semibold rounded-none transition-all flex items-center justify-center gap-1.5 ${
                  !isIncome
                    ? 'bg-rose-500/20 text-rose-400 shadow-xs border border-rose-500/30'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Expense (-)
              </button>
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Amount (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-gold">₹</span>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 75,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full rounded-none bg-surface-elevated pl-7 pr-3 py-2 text-sm text-foreground border ${
                    errors.amount ? 'border-rose-500' : 'border-border'
                  } focus:outline-hidden focus:border-gold`}
                  required
                />
              </div>
              {errors.amount && <p className="text-[11px] text-rose-400 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Transaction Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
                  required
                />
              </div>
              {errors.transactionDate && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.transactionDate}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              {isIncome ? 'Income Category' : 'Expense Category'} <span className="text-rose-400">*</span>
            </label>
            <CustomSelect
              value={isIncome ? incomeCategory : expenseCategory}
              onChange={(val) => {
                if (isIncome) {
                  setIncomeCategory(val as IncomeCategory)
                } else {
                  setExpenseCategory(val as ExpenseCategory)
                }
              }}
              options={isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
            />
          </div>

          {/* Payment Mode and Ref Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Payment Mode</label>
              <CustomSelect
                value={paymentMode}
                onChange={(val) => setPaymentMode(val as PaymentMode)}
                options={PAYMENT_MODES}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Reference / UTR / Cheque No.
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-98241098"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
              />
            </div>
          </div>

          {/* Attributed Partner */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              {isIncome ? 'Received by Partner' : 'Paid by Partner'}
            </label>
            <CustomSelect
              value={partnerId}
              onChange={(val) => setPartnerId(val)}
              placeholder="-- Unassigned / Company Account --"
              options={[
                { label: '-- Unassigned / Company Account --', value: '' },
                ...partners.map((p) => ({
                  label: p.name || p.email,
                  value: p.id,
                  subLabel: p.email,
                })),
              ]}
            />
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Notes & Deal Attribution
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 50% commission for South City 3BHK flat closure with client Mr. Roy"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold placeholder:text-muted-text/50"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-none text-muted-text hover:bg-surface-elevated hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-semibold rounded-none text-white transition-all shadow-md cursor-pointer ${
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
              } disabled:opacity-50`}
            >
              {isSubmitting
                ? 'Saving Record...'
                : editingTransaction
                ? 'Save Changes'
                : isIncome
                ? 'Confirm Income'
                : 'Confirm Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
