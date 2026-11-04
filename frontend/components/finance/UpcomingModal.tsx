'use client'

import React, { useState, useEffect } from 'react'
import { X, TrendingUp, Calendar, DollarSign, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { createUpcomingFinance } from '../../api/finance'
import { listEmployeesApi } from '../../api/organization'
import type { FinanceTransactionType } from '../../types/finance'
import type { Employee } from '../../types/organization'
import { toast } from '../../utils/toast'
import { CustomSelect } from '../ui/CustomSelect'

interface UpcomingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultType?: FinanceTransactionType
}

export function UpcomingModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'INCOME',
}: UpcomingModalProps) {
  const [type, setType] = useState<FinanceTransactionType>(defaultType)
  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<string>(
    defaultType === 'INCOME' ? 'SALE_COMMISSION' : 'OFFICE_RENT'
  )
  const [expectedAmount, setExpectedAmount] = useState<string>('')
  const [expectedDate, setExpectedDate] = useState<string>('')
  const [partnerId, setPartnerId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [partners, setPartners] = useState<Employee[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  useEffect(() => {
    setType(defaultType)
    setCategory(defaultType === 'INCOME' ? 'SALE_COMMISSION' : 'OFFICE_RENT')
    setTitle('')
    setExpectedAmount('')
    setExpectedDate('')
    setPartnerId('')
    setNotes('')
    setErrors({})
  }, [defaultType, isOpen])

  if (!isOpen) return null

  const isIncome = type === 'INCOME'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = 'Title is required.'
    const numAmount = parseFloat(expectedAmount)
    if (!expectedAmount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.expectedAmount = 'Please enter a valid amount greater than 0.'
    }
    if (!expectedDate) newErrors.expectedDate = 'Please select an estimated date.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await createUpcomingFinance({
        type,
        category,
        title: title.trim(),
        expectedAmount: numAmount,
        expectedDate: new Date(expectedDate).toISOString(),
        partnerId: partnerId || undefined,
        notes: notes.trim() || undefined,
      })
      toast.success(
        isIncome ? 'Forecast Commission Added' : 'Scheduled Expense Added',
        `₹${numAmount.toLocaleString('en-IN')} pipeline item scheduled for ${expectedDate}.`
      )
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to create forecast item.'
      toast.error('Operation Failed', msg)
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
            <div
              className={`p-2.5 rounded-none border ${
                isIncome
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {isIncome ? 'Add Expected Commission' : 'Schedule Future Expense'}
              </h2>
              <p className="text-xs text-muted-text">
                {isIncome
                  ? 'Track expected brokerage or deal commission closing in upcoming weeks'
                  : 'Schedule known recurring or upcoming vendor liabilities'}
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
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-elevated rounded-none border border-border">
            <button
              type="button"
              onClick={() => {
                setType('INCOME')
                setCategory('SALE_COMMISSION')
              }}
              className={`py-2 text-xs font-semibold rounded-none transition-all flex items-center justify-center gap-1.5 ${
                isIncome
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-xs border border-emerald-500/30'
                  : 'text-muted-text hover:text-foreground'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expected Income (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE')
                setCategory('OFFICE_RENT')
              }}
              className={`py-2 text-xs font-semibold rounded-none transition-all flex items-center justify-center gap-1.5 ${
                !isIncome
                  ? 'bg-rose-500/20 text-rose-400 shadow-xs border border-rose-500/30'
                  : 'text-muted-text hover:text-foreground'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Scheduled Expense (-)
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Pipeline Title / Reference <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder={
                isIncome
                  ? 'e.g. 2% brokerage on Urbana 4BHK registration'
                  : 'e.g. Q1 Google Workspace & CRM Software Renewal'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border ${
                errors.title ? 'border-rose-500' : 'border-border'
              } focus:outline-hidden focus:border-gold`}
              required
            />
            {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title}</p>}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Expected Amount (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-gold">₹</span>
                <input
                  type="number"
                  step="any"
                  placeholder="150000"
                  value={expectedAmount}
                  onChange={(e) => setExpectedAmount(e.target.value)}
                  className={`w-full rounded-none bg-surface-elevated pl-7 pr-3 py-2 text-sm text-foreground border ${
                    errors.expectedAmount ? 'border-rose-500' : 'border-border'
                  } focus:outline-hidden focus:border-gold`}
                  required
                />
              </div>
              {errors.expectedAmount && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.expectedAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Target / Due Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className={`w-full rounded-none bg-surface-elevated px-3 py-2 text-sm text-foreground border ${
                  errors.expectedDate ? 'border-rose-500' : 'border-border'
                } focus:outline-hidden focus:border-gold`}
                required
              />
              {errors.expectedDate && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.expectedDate}</p>
              )}
            </div>
          </div>

          {/* Attributed Partner */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Assigned Partner / Deal Owner
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Forecast Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Agreement signed, deed registration scheduled on target date"
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
              className={`px-5 py-2 text-xs font-semibold rounded-none text-white transition-all shadow-md cursor-pointer ${
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
              } disabled:opacity-50`}
            >
              {isSubmitting ? 'Saving Forecast...' : 'Schedule Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
