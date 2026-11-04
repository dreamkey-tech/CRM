'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, Building2, MapPin, Check, Loader2, Sparkles, Layers, ShieldCheck, Calendar, Hammer } from 'lucide-react'
import { getApiErrorMessage } from '../../utils/errorHandler'
import { getSocietyProfiles } from '../../api/properties'
import type { SocietyProfile } from '../../types/property'

interface SocietySelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSociety: (society: SocietyProfile) => void
  currentSocietyName?: string | null
}

export function SocietySelectModal({
  isOpen,
  onClose,
  onSelectSociety,
  currentSocietyName,
}: SocietySelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [societies, setSocieties] = useState<SocietyProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    let active = true
    setLoading(true)
    const timeout = setTimeout(() => {
      getSocietyProfiles(searchTerm.trim())
        .then((items) => {
          if (active) {
            setSocieties(items)
            setError(null)
          }
        })
        .catch((err) => {
          if (active) setError(getApiErrorMessage(err))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 200)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [isOpen, searchTerm, attempt])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full sm:max-w-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-surface-secondary">
          <div className="flex items-center gap-2.5">
        
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                Pre-Fill From Existing Society
              
              </h3>
              <p className="text-[10px] text-muted-text">
                Select an existing building/project to auto-populate repeated society info
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-foreground border border-border hover:bg-surface transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b border-border bg-surface shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by society name, builder, locality, or city (e.g. Merlin, Oberoi, Bandra)..."
              className="w-full pl-9 pr-8 py-2.5 bg-surface-secondary border border-border text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none focus:border-gold transition-colors"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-foreground p-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2 bg-gold/5 border-b border-gold/15 flex items-center justify-between text-[10px] text-muted-text shrink-0">
          <span>
            Populates: <strong className="text-foreground">Building Name, Locality, City, PIN, Builder, Floors, Units, Year, RERA & Amenities</strong>
          </span>
          <span className="font-mono text-[9px] text-gold font-bold">
            {societies.length} {societies.length === 1 ? 'society' : 'societies'} available
          </span>
        </div>

        {/* Society List */}
        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {error && !loading ? (
            <div role="alert" className="p-6 text-center text-xs text-red-400">
              <p className="leading-relaxed mb-3">{error}</p>
              <button
                type="button"
                className="px-3.5 py-1.5 text-[10px] uppercase font-bold border border-border bg-surface-secondary text-foreground hover:bg-surface transition-colors cursor-pointer"
                onClick={() => setAttempt((a) => a + 1)}
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="py-14 flex flex-col items-center justify-center text-muted-text">
              <Loader2 className="w-5 h-5 animate-spin text-gold mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Loading saved society profiles...
              </span>
            </div>
          ) : societies.length === 0 ? (
            <div className="py-14 text-center text-muted-text px-6">
              <Building2 className="w-8 h-8 mx-auto text-muted-text/40 mb-2" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                {searchTerm ? 'No Matching Societies' : 'No Societies Saved Yet'}
              </p>
              <p className="text-[11px] max-w-sm mx-auto leading-relaxed">
                {searchTerm
                  ? `No society matches "${searchTerm}". Try another search keyword.`
                  : 'As you save properties in the CRM, their building names and society specs will automatically be saved here for instant re-use.'}
              </p>
            </div>
          ) : (
            societies.map((item) => {
              const isCurrent =
                currentSocietyName &&
                currentSocietyName.trim().toLowerCase() ===
                  item.societyBuildingName.trim().toLowerCase()

              return (
                <div
                  key={item.societyBuildingName}
                  onClick={() => {
                    onSelectSociety(item)
                    onClose()
                  }}
                  className={`p-4 hover:bg-surface-secondary transition-colors cursor-pointer flex flex-col gap-2.5 group ${
                    isCurrent ? 'bg-gold/5 border-l-2 border-l-gold' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xs bg-surface-secondary border border-border flex items-center justify-center shrink-0 group-hover:border-gold/50 group-hover:text-gold transition-colors">
                        <Building2 className="w-4 h-4 text-foreground/80 group-hover:text-gold" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-gold transition-colors">
                            {item.societyBuildingName}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-gold text-black">
                              Currently Active
                            </span>
                          )}
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-surface-secondary border border-border text-muted-text">
                            {item.propertyCount} {item.propertyCount === 1 ? 'unit' : 'units'} in CRM
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-muted-text mt-1">
                          <MapPin className="w-3 h-3 text-gold shrink-0" />
                          <span className="truncate">
                            {item.locationArea}, {item.city} — PIN {item.pincode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectSociety(item)
                        onClose()
                      }}
                      className="px-3 py-1.5 shrink-0 bg-gold/10 hover:bg-gold hover:text-black border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Pre-fill
                    </button>
                  </div>

                  {/* Society Specs Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-[9px] text-muted-text pl-12">
                    {item.builderName && (
                      <span className="flex items-center gap-1 bg-surface border border-border px-1.5 py-0.5">
                        <Hammer className="w-2.5 h-2.5 text-muted-text" />
                        <strong className="text-foreground font-medium">{item.builderName}</strong>
                      </span>
                    )}

                    {item.totalFloors && (
                      <span className="flex items-center gap-1 bg-surface border border-border px-1.5 py-0.5">
                        <Layers className="w-2.5 h-2.5 text-muted-text" />
                        {item.totalFloors} Floors
                      </span>
                    )}

                    {item.yearOfConstruction && (
                      <span className="flex items-center gap-1 bg-surface border border-border px-1.5 py-0.5">
                        <Calendar className="w-2.5 h-2.5 text-muted-text" />
                        Built {item.yearOfConstruction}
                      </span>
                    )}

                    {item.totalUnits && (
                      <span className="bg-surface border border-border px-1.5 py-0.5">
                        {item.totalUnits} Units
                      </span>
                    )}

                    {item.reraNumber && (
                      <span className="flex items-center gap-1 bg-surface border border-border px-1.5 py-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        RERA: {item.reraNumber}
                      </span>
                    )}

                    {item.amenities && item.amenities.length > 0 && (
                      <span className="text-gold/90 font-mono">
                        +{item.amenities.length} amenities
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-surface-secondary/70 flex items-end justify-end text-muted-text shrink-0">
       
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-border bg-surface text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
