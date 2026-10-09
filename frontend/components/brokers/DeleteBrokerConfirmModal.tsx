'use client'

import React, { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { deleteBroker } from '../../api/brokers'
import { toast } from '../../utils/toast'
import { handleActionApiError } from '../../utils/errorHandler'
import type { Broker } from '../../types/broker'

interface DeleteBrokerConfirmModalProps {
  broker: Broker | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (deletedId: string) => void
  isDark?: boolean
}

export function DeleteBrokerConfirmModal({
  broker,
  isOpen,
  onClose,
  onSuccess,
}: DeleteBrokerConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen || !broker) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteBroker(broker.id)
      toast.success('Broker removed', `${broker.name} has been deleted from the directory.`)
      onSuccess(broker.id)
      onClose()
    } catch (err) {
      handleActionApiError(err, 'Failed to delete broker')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-surface border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Delete Broker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-xs text-muted-text leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-foreground font-bold">{broker.name}</strong> from your channel
            partner directory? This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-3 bg-surface-secondary">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete Broker
          </button>
        </div>
      </div>
    </div>
  )
}
