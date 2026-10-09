'use client'

import React, { useState } from 'react'
import { Bookmark, BookmarkPlus, Loader2, X } from 'lucide-react'
import { saveFilterPreset } from '../../api/properties'
import { toast } from '../../utils/toast'
import { handleActionApiError } from '../../utils/errorHandler'
import type { PropertyFilterPreset } from '../../types/property'

interface SaveFilterPresetModalProps {
  isOpen: boolean
  onClose: () => void
  currentFilters: Record<string, any>
  onPresetSaved: (preset: PropertyFilterPreset) => void
}

export function SaveFilterPresetModal({
  isOpen,
  onClose,
  currentFilters,
  onPresetSaved,
}: SaveFilterPresetModalProps) {
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  // Clean filters (remove empty keys, page, limit)
  const cleanedFilters: Record<string, any> = {}
  Object.entries(currentFilters).forEach(([key, val]) => {
    if (val !== undefined && val !== '' && val !== null && key !== 'page' && key !== 'limit') {
      cleanedFilters[key] = val
    }
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.warning('Name Required', 'Please enter a name for this filter preset.')
      return
    }

    setIsSaving(true)
    try {
      const preset = await saveFilterPreset(name.trim(), cleanedFilters)
      toast.success('Filter Preset Saved', `"${name}" saved to your quick filter presets.`)
      onPresetSaved(preset)
      setName('')
      onClose()
    } catch (err) {
      handleActionApiError(err, 'Failed to save filter preset')
    } finally {
      setIsSaving(false)
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
          <div className="flex items-center gap-2.5">
            <BookmarkPlus className="w-4 h-4 text-gold shrink-0" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Save Filter Preset
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
              Preset Name <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 3BHK Luxury Flats in Bandra West"
              className="w-full px-3 py-2 bg-background border border-border text-foreground text-xs focus:border-gold focus:outline-hidden transition-colors"
            />
          </div>

          <div className="bg-surface-secondary/60 border border-border p-3 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
              Included Filter Parameters
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {Object.keys(cleanedFilters).length === 0 ? (
                <span className="text-[11px] text-muted-text italic">
                  No specific filters active (All Properties)
                </span>
              ) : (
                Object.entries(cleanedFilters).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center px-2 py-0.5 bg-background border border-border text-[10px] font-mono text-zinc-300"
                  >
                    <span className="text-muted-text mr-1">{k}:</span>
                    <span className="text-gold font-bold">{String(v)}</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Preset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
