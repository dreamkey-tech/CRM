'use client'

import { useEffect, useId, useRef } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import type { PropertyMedia } from '../../types/property'

interface Props {
  media: PropertyMedia | null
  isDeleting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteMediaConfirmModal({ media, isDeleting, error, onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (media && !dialog.open) dialog.showModal()
    if (!media && dialog.open) dialog.close()
  }, [media])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={isDeleting}
      onCancel={(event) => { event.preventDefault(); if (!isDeleting) onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget && !isDeleting) onClose() }}
      className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-sm border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-red-400" />
          <h3 id={titleId} className="text-sm font-bold">Delete this file?</h3>
        </div>
        <p id={descriptionId} className="text-xs leading-relaxed text-muted-text">
          Are you sure? This permanently removes the file from this property.
        </p>
        {error && <p role="alert" className="mt-3 text-xs text-red-400">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" autoFocus disabled={isDeleting} onClick={onClose}
            className="border border-border px-3 py-2 text-xs disabled:opacity-50">Cancel</button>
          <button type="button" disabled={isDeleting} onClick={onConfirm}
            className="flex items-center gap-2 bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60">
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete file'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
