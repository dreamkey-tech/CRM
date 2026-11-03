'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useNavLoader } from '../../context/NavigationLoaderContext'
import { toast } from '../../utils/toast'
import { updatePropertyWebsiteSettings } from '../../api/properties'
import { formatBHK } from '../../utils/formatters'
import type { Property } from '../../types/property'

interface PropertyWebsiteModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property | null
  bestPropertiesCount: number
  onUpdated: (updatedProperty: Property, newBestCount: number) => void
}

export function PropertyWebsiteModal({
  isOpen,
  onClose,
  property,
  bestPropertiesCount,
  onUpdated,
}: PropertyWebsiteModalProps) {
  const { startLoading, stopLoading } = useNavLoader()
  const [updatingField, setUpdatingField] = useState<'showInWebsite' | 'isBestProperty' | null>(null)

  useEffect(() => {
    return () => {
      stopLoading()
    }
  }, [stopLoading])

  if (!isOpen || !property) return null

  const isBest = Boolean(property.isBestProperty)
  const isWebsite = Boolean(property.showInWebsite)
  const isBestLimitReached = bestPropertiesCount >= 3 && !isBest

  const handleToggleWebsite = async () => {
    if (updatingField) return
    const nextValue = !isWebsite
    setUpdatingField('showInWebsite')
    startLoading()

    try {
      const res = await updatePropertyWebsiteSettings(property.id, {
        showInWebsite: nextValue,
      })

      const newBestCount =
        res.bestPropertiesCount !== undefined
          ? res.bestPropertiesCount
          : nextValue === false && isBest
          ? Math.max(0, bestPropertiesCount - 1)
          : bestPropertiesCount

      onUpdated(res.property, newBestCount)
      toast.success(
        nextValue ? 'Published to Website' : 'Removed from Website',
        nextValue
          ? 'Listing is now visible on the website.'
          : 'Listing is now hidden from the website.'
      )
    } catch (err: any) {
      toast.error(
        'Action Failed',
        err?.message || 'Unable to update website visibility.'
      )
    } finally {
      stopLoading()
      setUpdatingField(null)
    }
  }

  const handleToggleBest = async () => {
    if (updatingField) return
    if (isBestLimitReached) {
      toast.error(
        'Quota Reached (3/3)',
        'Maximum 3 properties can be featured. Please unmark another property first.'
      )
      return
    }

    const nextValue = !isBest
    setUpdatingField('isBestProperty')
    startLoading()

    try {
      const res = await updatePropertyWebsiteSettings(property.id, {
        isBestProperty: nextValue,
      })

      const newBestCount =
        res.bestPropertiesCount !== undefined
          ? res.bestPropertiesCount
          : nextValue
          ? Math.min(3, bestPropertiesCount + 1)
          : Math.max(0, bestPropertiesCount - 1)

      onUpdated(res.property, newBestCount)
      toast.success(
        nextValue ? 'Added to Best Properties' : 'Removed from Best Properties',
        nextValue
          ? `Property featured in Best Properties (${newBestCount}/3).`
          : `Property removed from Best Properties (${newBestCount}/3).`
      )
    } catch (err: any) {
      toast.error(
        'Action Failed',
        err?.message || 'Unable to update Best Property setting.'
      )
    } finally {
      stopLoading()
      setUpdatingField(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-surface border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="website-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/30 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h2
              id="website-modal-title"
              className="text-sm font-bold uppercase tracking-wider text-foreground"
            >
              Website & Showcase Settings
            </h2>
            <p className="text-xs text-muted-text truncate mt-0.5">
              {property.societyBuildingName} • {formatBHK(property.bedrooms)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-text hover:text-foreground border border-transparent hover:border-border transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {/* Option 1: Show on Listing */}
          <div className="flex items-center justify-between gap-4 p-3.5 border border-border bg-surface-secondary/20">
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Show on Listing
              </span>
              <p className="text-[11px] text-muted-text mt-0.5">
                Display this property on the website
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isWebsite}
              disabled={Boolean(updatingField)}
              onClick={handleToggleWebsite}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ease-in-out focus:outline-hidden ${
                updatingField ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isWebsite ? 'bg-gold border-transparent' : 'bg-surface-secondary border-border'
              }`}
              title={isWebsite ? 'Hide from website' : 'Show on website'}
            >
              <span className="sr-only">Toggle Show on Listing</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isWebsite ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Option 2: Show in Best Properties */}
          <div className="flex items-center justify-between gap-4 p-3.5 border border-border bg-surface-secondary/20">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Show in Best Properties
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 border border-border bg-surface text-muted-text">
                  {bestPropertiesCount}/3
                </span>
              </div>
              <p className="text-[11px] text-muted-text mt-0.5">
                {isBestLimitReached ? (
                  <span className="text-amber-400">Limit reached (max 3 allowed)</span>
                ) : (
                  'Feature in top properties showcase'
                )}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isBest}
              disabled={Boolean(updatingField) || (isBestLimitReached && !isBest)}
              onClick={handleToggleBest}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ease-in-out focus:outline-hidden ${
                updatingField || (isBestLimitReached && !isBest)
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer'
              } ${
                isBest ? 'bg-gold border-transparent' : 'bg-surface-secondary border-border'
              }`}
              title={
                isBest
                  ? 'Remove from Best Properties'
                  : isBestLimitReached
                  ? 'Limit reached (3/3)'
                  : 'Add to Best Properties'
              }
            >
              <span className="sr-only">Toggle Best Properties</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isBest ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-secondary/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gold text-background font-bold text-xs uppercase tracking-wider hover:bg-gold-hover transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
