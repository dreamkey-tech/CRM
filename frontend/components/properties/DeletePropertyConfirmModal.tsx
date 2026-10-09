'use client'

import React, { useState } from 'react'
import { AlertTriangle, Loader2, X, Trash2, HardDrive } from 'lucide-react'
import { deleteProperty } from '../../api/properties'
import { toast } from '../../utils/toast'
import { handleActionApiError } from '../../utils/errorHandler'
import type { Property } from '../../types/property'

interface DeletePropertyConfirmModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (deletedId: string) => void
}

export function DeletePropertyConfirmModal({
  property,
  isOpen,
  onClose,
  onSuccess,
}: DeletePropertyConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen || !property) return null

  const mediaCount = property.media?.length || 0

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProperty(property.id)
      toast.success(
        'Property Deleted',
        `${property.societyBuildingName} and all associated R2 cloud media files were permanently removed.`
      )
      onSuccess(property.id)
      onClose()
    } catch (err) {
      handleActionApiError(err, 'Failed to delete property')
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
              Delete Property Listing
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
        <div className="px-5 py-5 space-y-3">
          <p className="text-xs text-muted-text leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-foreground font-bold">{property.societyBuildingName}</strong> (
            {property.locationArea})?
          </p>

          <div className="p-3 bg-red-950/20 border border-red-900/30 flex items-start gap-2.5">
            <HardDrive className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-red-300 leading-tight">
              <span className="font-bold uppercase tracking-wider block mb-0.5">
                Cloud Storage Purge Notice
              </span>
              This action will permanently delete the property record, transaction audit logs, and
              automatically purge all{' '}
              <strong className="font-bold text-white">{mediaCount} uploaded files</strong> (photos,
              walkthrough videos, brochures) from Cloudflare R2 storage.
            </div>
          </div>
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
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Delete Property
          </button>
        </div>
      </div>
    </div>
  )
}
