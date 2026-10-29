'use client'

import React, { useState } from 'react'
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from '../../utils/toast'
import { deleteEmployeeApi } from '../../api/organization'
import type { Employee } from '../../types/organization'

interface DeleteEmployeeModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteEmployeeModal({
  employee,
  isOpen,
  onClose,
  onSuccess,
}: DeleteEmployeeModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')

  if (!isOpen || !employee) return null

  const targetEmail = employee.email.toLowerCase().trim()
  const isConfirmed = confirmationInput.trim().toLowerCase() === targetEmail

  const handleDelete = async () => {
    if (!isConfirmed) {
      toast.error('Confirmation Mismatch', `Please type "${targetEmail}" to confirm deletion.`)
      return
    }

    try {
      setSubmitting(true)
      const res = await deleteEmployeeApi(employee.id)
      toast.success('Employee Deleted', res.message || `Employee "${employee.name || employee.email}" has been permanently removed.`)
      setConfirmationInput('')
      onClose()
      onSuccess()
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete employee.'
      toast.error('Deletion Failed', msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    setConfirmationInput('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-surface border border-red-500/40 shadow-2xl relative rounded-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-red-950/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 border border-red-500/30 bg-red-500/10 text-red-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                Delete Employee Account
              </h3>
              <p className="text-[10px] text-muted-text">Irreversible Administrative Action</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-1 text-muted-text hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Warning Banner */}
          <div className="p-3 border border-red-500/30 bg-red-500/5 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-muted-text leading-relaxed">
              You are about to permanently remove{' '}
              <strong className="text-foreground font-mono">{employee.name || employee.email}</strong>{' '}
              (<span className="text-foreground font-mono">{employee.email}</span>).
              This employee will immediately lose all login access and session tokens will be revoked.
            </div>
          </div>

          {/* Safety Reassurance Notice */}
          <div className="p-2.5 border border-border bg-surface-secondary text-[10px] text-muted-text leading-relaxed">
            <span className="text-foreground font-semibold">Attribution Safety Guarantee:</span> All historical properties, clients, documents, and audit logs authored by this employee are preserved and automatically reassigned to Super Admin.
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
              Type <span className="text-red-400 font-mono lowercase select-all">{targetEmail}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={targetEmail}
              disabled={submitting}
              autoFocus
              className="w-full px-3 py-2 text-xs bg-surface-secondary border border-border text-foreground font-mono rounded-none focus:outline-hidden focus:border-red-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-surface-secondary">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider border border-border bg-surface text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors rounded-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || submitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition-colors rounded-none disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
