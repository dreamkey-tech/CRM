'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, DollarSign, CreditCard } from 'lucide-react'
import { settleDueAdvance } from '../../api/finance'
import type { DueAndAdvanceRecord, PaymentMode } from '../../types/finance'
import { toast } from '../../utils/toast'
import { CustomSelect } from '../ui/CustomSelect'

interface SettleDueModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  record: DueAndAdvanceRecord | null
}

const PAYMENT_MODES: { label: string; value: PaymentMode }[] = [
  { label: 'Bank Transfer (NEFT/RTGS)', value: 'BANK_TRANSFER' },
  { label: 'UPI / Digital Payment', value: 'UPI' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Cash Payment', value: 'CASH' },
]

export function SettleDueModal({ isOpen, onClose, onSuccess, record }: SettleDueModalProps) {
  const [settleAmount, setSettleAmount] = useState<string>('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BANK_TRANSFER')
  const [referenceNumber, setReferenceNumber] = useState<string>('')
  const [recordAsTransaction, setRecordAsTransaction] = useState<boolean>(true)
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (record) {
      setSettleAmount(String(record.remainingAmount))
      setPaymentMode('BANK_TRANSFER')
      setReferenceNumber('')
      setRecordAsTransaction(true)
      setNotes('')
      setErrors({})
    }
  }, [record, isOpen])

  if (!isOpen || !record) return null

  const isReceivable = record.type === 'RECEIVABLE' || record.type === 'ADVANCE_GIVEN'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(settleAmount)
    if (!settleAmount || isNaN(numAmount) || numAmount <= 0) {
      setErrors({ settleAmount: 'Please enter a valid settlement amount.' })
      return
    }

    if (numAmount > record.remainingAmount) {
      setErrors({
        settleAmount: `Settlement amount cannot exceed remaining balance of ₹${record.remainingAmount.toLocaleString(
          'en-IN'
        )}.`,
      })
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await settleDueAdvance(record.id, {
        settleAmount: numAmount,
        paymentMode,
        referenceNumber: referenceNumber.trim() || undefined,
        recordAsTransaction,
        notes: notes.trim() || undefined,
      })
      toast.success(
        'Settlement Processed',
        `₹${numAmount.toLocaleString('en-IN')} payment recorded for ${record.partyName}.`
      )
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to process settlement.'
      toast.error('Settlement Failed', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-none border border-border bg-surface p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Record Settlement</h2>
              <p className="text-xs text-muted-text">Process partial or complete payment settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-none p-1.5 text-muted-text hover:bg-surface-elevated hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Due Summary Card */}
        <div className="mt-4 p-3 rounded-none bg-surface-elevated border border-border space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-text">Party:</span>
            <span className="font-semibold text-foreground">{record.partyName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-text">Total Recorded:</span>
            <span className="text-muted-text">₹{record.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-text">Already Settled:</span>
            <span className="text-emerald-400 font-medium">₹{record.settledAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/60">
            <span className="font-medium text-foreground">Remaining Balance:</span>
            <span className="font-bold text-gold text-sm">₹{record.remainingAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Settlement Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Settlement Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-gold">₹</span>
              <input
                type="number"
                step="any"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className={`w-full rounded-none bg-surface-elevated pl-7 pr-3 py-2 text-sm text-foreground border ${
                  errors.settleAmount ? 'border-rose-500' : 'border-border'
                } focus:outline-hidden focus:border-gold`}
                required
              />
            </div>
            {errors.settleAmount && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.settleAmount}</p>
            )}
          </div>

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
              UTR / Transaction Ref No.
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-98234871"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
            />
          </div>

          {/* Auto transaction checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="recordAsTxn"
              checked={recordAsTransaction}
              onChange={(e) => setRecordAsTransaction(e.target.checked)}
              className="w-4 h-4 rounded-none border-border bg-surface-elevated text-gold focus:ring-gold"
            />
            <label htmlFor="recordAsTxn" className="text-xs text-foreground select-none cursor-pointer">
              Auto-record as {isReceivable ? 'income' : 'expense'} in company ledger
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
            <input
              type="text"
              placeholder="e.g. Cheque cleared, full and final settlement"
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
              className="px-5 py-2 text-xs font-semibold rounded-none text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
