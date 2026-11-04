'use client'

import React, { useState, useEffect } from 'react'
import { X, Award, DollarSign, Calendar, CreditCard, User, AlertCircle } from 'lucide-react'
import { createSalaryDisbursement } from '../../api/finance'
import { listEmployeesApi } from '../../api/organization'
import type { PaymentMode } from '../../types/finance'
import type { Employee } from '../../types/organization'
import { toast } from '../../utils/toast'
import { CustomSelect } from '../ui/CustomSelect'

interface SalaryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PAYMENT_MODES: { label: string; value: PaymentMode }[] = [
  { label: 'Bank Transfer (NEFT/RTGS)', value: 'BANK_TRANSFER' },
  { label: 'UPI / Digital Transfer', value: 'UPI' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Cash Payment', value: 'CASH' },
]

export function SalaryModal({ isOpen, onClose, onSuccess }: SalaryModalProps) {
  const now = new Date()
  const [employeeId, setEmployeeId] = useState<string>('')
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [year, setYear] = useState<number>(now.getFullYear())
  const [baseSalary, setBaseSalary] = useState<string>('')
  const [bonusIncentive, setBonusIncentive] = useState<string>('0')
  const [deductions, setDeductions] = useState<string>('0')
  const [paymentDate, setPaymentDate] = useState<string>(now.toISOString().split('T')[0])
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BANK_TRANSFER')
  const [referenceNumber, setReferenceNumber] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      listEmployeesApi({ limit: 100 })
        .then((res) => {
          if (res?.employees) {
            setEmployees(res.employees.filter((e) => e.isActive))
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

  const base = parseFloat(baseSalary) || 0
  const bonus = parseFloat(bonusIncentive) || 0
  const deduct = parseFloat(deductions) || 0
  const netPayable = Math.max(0, base + bonus - deduct)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!employeeId) {
      newErrors.employeeId = 'Please select an employee.'
    }
    if (!baseSalary || base <= 0) {
      newErrors.baseSalary = 'Please enter a valid base salary.'
    }
    if (!paymentDate) {
      newErrors.paymentDate = 'Please select a disbursement date.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await createSalaryDisbursement({
        employeeId,
        month,
        year,
        baseSalary: base,
        bonusIncentive: bonus,
        deductions: deduct,
        paymentDate: new Date(paymentDate).toISOString(),
        paymentMode,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      toast.success(
        'Salary Disbursed',
        `₹${netPayable.toLocaleString('en-IN')} payout recorded and added as an expense to the ledger.`
      )
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to record salary payout.'
      toast.error('Disbursement Failed', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-none border border-border bg-surface p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none border bg-amber-500/10 border-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Disburse Staff Salary</h2>
              <p className="text-xs text-muted-text">
                Record monthly staff salary & automatically generate expense ledger entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-none p-1.5 text-muted-text hover:bg-surface-elevated hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Select Staff / Employee <span className="text-rose-400">*</span>
            </label>
            <CustomSelect
              value={employeeId}
              onChange={(val) => setEmployeeId(val)}
              placeholder="-- Choose team member --"
              error={Boolean(errors.employeeId)}
              options={employees.map((emp) => ({
                label: emp.name || emp.email,
                value: emp.id,
                subLabel: `${emp.email} · ${emp.roles?.[0] || 'Staff'}`,
              }))}
            />
            {errors.employeeId && <p className="text-[11px] text-rose-400 mt-1">{errors.employeeId}</p>}
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Salary Month</label>
              <CustomSelect
                value={String(month)}
                onChange={(val) => setMonth(parseInt(val, 10))}
                options={MONTHS.map((m, idx) => ({
                  label: m,
                  value: String(idx + 1),
                }))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                min={2020}
                max={2050}
                className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
                required
              />
            </div>
          </div>

          {/* Financials: Base, Bonus, Deductions */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Base Salary (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="45000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className={`w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border ${
                  errors.baseSalary ? 'border-rose-500' : 'border-border'
                } focus:outline-hidden focus:border-gold`}
                required
              />
              {errors.baseSalary && <p className="text-[11px] text-rose-400 mt-1">{errors.baseSalary}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Bonus / Incentive (₹)</label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={bonusIncentive}
                onChange={(e) => setBonusIncentive(e.target.value)}
                className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Deductions (₹)</label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
              />
            </div>
          </div>

          {/* Net Calculation Callout */}
          <div className="p-3 rounded-none bg-gold/10 border border-gold/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-gold font-medium">Net Disbursed Amount</p>
              <p className="text-[11px] text-muted-text">Base + Bonus - Deductions</p>
            </div>
            <p className="text-lg font-bold text-foreground">₹{netPayable.toLocaleString('en-IN')}</p>
          </div>

          {/* Payment Date & Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Payment Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Payment Mode</label>
              <CustomSelect
                value={paymentMode}
                onChange={(val) => setPaymentMode(val as PaymentMode)}
                options={PAYMENT_MODES}
              />
            </div>
          </div>

          {/* Reference & Notes */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Reference / Bank Transaction ID
            </label>
            <input
              type="text"
              placeholder="e.g. NEFT-20261104-129840"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
            <input
              type="text"
              placeholder="e.g. Monthly salary with closing deal bonus"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
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
              className="px-5 py-2 text-xs font-semibold rounded-none text-black bg-gold hover:bg-gold-light transition-all shadow-md shadow-gold/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Recording Payout...' : 'Confirm Disbursement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
