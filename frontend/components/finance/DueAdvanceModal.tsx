'use client'

import React, { useState } from 'react'
import { X, Scale, DollarSign, Calendar, UserCheck } from 'lucide-react'
import { createDueAdvance } from '../../api/finance'
import type { DueAdvanceType } from '../../types/finance'
import { toast } from '../../utils/toast'
import { CustomSelect } from '../ui/CustomSelect'

interface DueAdvanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultType?: DueAdvanceType
}

const TYPE_OPTIONS: { label: string; value: DueAdvanceType; desc: string }[] = [
  {
    label: 'Receivable (Owed to Us)',
    value: 'RECEIVABLE',
    desc: 'Money owed to DreamKey by clients, co-brokers or buyers',
  },
  {
    label: 'Payable (Owed by Us)',
    value: 'PAYABLE',
    desc: 'Outstanding balance payable to vendors, lawyers or contractors',
  },
  {
    label: 'Advance Given',
    value: 'ADVANCE_GIVEN',
    desc: 'Upfront cash/advance paid to staff, partners, or vendors',
  },
  {
    label: 'Advance Received',
    value: 'ADVANCE_RECEIVED',
    desc: 'Advance deposit held from a client or deal counterparty',
  },
]

const PARTY_TYPES: { label: string; value: 'CLIENT' | 'BROKER' | 'OWNER' | 'EMPLOYEE' | 'VENDOR' | 'OTHER' }[] = [
  { label: 'Client / Buyer', value: 'CLIENT' },
  { label: 'External Broker', value: 'BROKER' },
  { label: 'Property Owner', value: 'OWNER' },
  { label: 'Staff / Employee', value: 'EMPLOYEE' },
  { label: 'Vendor / Service Provider', value: 'VENDOR' },
  { label: 'Other Party', value: 'OTHER' },
]

export function DueAdvanceModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'RECEIVABLE',
}: DueAdvanceModalProps) {
  const [type, setType] = useState<DueAdvanceType>(defaultType)
  const [partyName, setPartyName] = useState<string>('')
  const [partyType, setPartyType] = useState<'CLIENT' | 'BROKER' | 'OWNER' | 'EMPLOYEE' | 'VENDOR' | 'OTHER'>('CLIENT')
  const [totalAmount, setTotalAmount] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!partyName.trim()) newErrors.partyName = 'Party name is required.'
    const numAmount = parseFloat(totalAmount)
    if (!totalAmount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.totalAmount = 'Please enter a valid amount greater than 0.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await createDueAdvance({
        type,
        partyName: partyName.trim(),
        partyType,
        totalAmount: numAmount,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
      })
      toast.success(
        'Due Record Created',
        `₹${numAmount.toLocaleString('en-IN')} record for ${partyName.trim()} tracked.`
      )
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to create due/advance record.'
      toast.error('Record Failed', msg)
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
            <div className="p-2.5 rounded-none border bg-gold/10 border-gold/30 text-gold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Track Due or Advance</h2>
              <p className="text-xs text-muted-text">
                Record receivables owed to company, or payables & advances
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
          {/* Due Type */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Record Type</label>
            <CustomSelect
              value={type}
              onChange={(val) => setType(val as DueAdvanceType)}
              options={TYPE_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
            />
            <p className="text-[11px] text-muted-text mt-1">
              {TYPE_OPTIONS.find((t) => t.value === type)?.desc}
            </p>
          </div>

          {/* Party Name & Party Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Party / Person Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mr. Rajesh Singhania"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className={`w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border ${
                  errors.partyName ? 'border-rose-500' : 'border-border'
                } focus:outline-hidden focus:border-gold`}
                required
              />
              {errors.partyName && <p className="text-[11px] text-rose-400 mt-1">{errors.partyName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Party Category</label>
              <CustomSelect
                value={partyType}
                onChange={(val) =>
                  setPartyType(val as 'CLIENT' | 'BROKER' | 'OWNER' | 'EMPLOYEE' | 'VENDOR' | 'OTHER')
                }
                options={PARTY_TYPES}
              />
            </div>
          </div>

          {/* Total Amount & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Total Amount (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-gold">₹</span>
                <input
                  type="number"
                  step="any"
                  placeholder="85000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className={`w-full rounded-none bg-surface-elevated pl-7 pr-3 py-2 text-sm text-foreground border ${
                    errors.totalAmount ? 'border-rose-500' : 'border-border'
                  } focus:outline-hidden focus:border-gold`}
                  required
                />
              </div>
              {errors.totalAmount && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.totalAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Target Settlement Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border border-border focus:outline-hidden focus:border-gold"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Context & Agreement Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Balance brokerage fee pending bank loan sanction for Alipore project"
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
              {isSubmitting ? 'Recording...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
