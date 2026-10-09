'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, Handshake, MapPin, Phone, Check, Loader2 } from 'lucide-react'
import { getApiErrorMessage } from '../../utils/errorHandler'
import { getBrokersList } from '../../api/brokers'
import type { Broker } from '../../types/broker'

interface BrokerSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectBroker: (broker: Broker) => void
  selectedBrokerId?: string | null
}

export function BrokerSelectModal({
  isOpen,
  onClose,
  onSelectBroker,
  selectedBrokerId,
}: BrokerSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    let active = true
    // Synchronize loading when the picker opens or its query changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const timeout = setTimeout(() => {
      getBrokersList({ search: searchTerm, limit: 30, status: 'ACTIVE' })
        .then((res) => {
          if (active) { setBrokers(res.brokers || []); setError(null) }
        })
        .catch((err) => {
          if (active) setError(getApiErrorMessage(err))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 250)

    return () => { active = false; clearTimeout(timeout) }
  }, [isOpen, searchTerm, attempt])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full sm:max-w-lg bg-surface border border-border shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-surface-secondary">
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-gold shrink-0" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Link Channel Partner (+1 Broker)
              </h3>
              <p className="text-[10px] text-muted-text">
                Select the broker who brought this property inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-foreground border border-border hover:bg-surface transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border bg-surface shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by broker name, phone, area..."
              className="w-full pl-9 pr-3 py-2 bg-surface-secondary border border-border text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none focus:border-gold transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Broker List */}
        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {error && !loading ? <p role="alert" className="p-5 text-xs text-red-500">{error} <button type="button" className="underline" onClick={() => setAttempt(attempt + 1)}>Retry</button></p> : loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-text">
              <Loader2 className="w-5 h-5 animate-spin text-gold mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Searching Brokers...
              </span>
            </div>
          ) : brokers.length === 0 ? (
            <div className="py-12 text-center text-muted-text px-4">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                No Brokers Found
              </p>
              <p className="text-[10px]">
                Try adjusting your search or add a new broker in the Brokers section.
              </p>
            </div>
          ) : (
            brokers.map((broker) => {
              const isSelected = selectedBrokerId === broker.id
              return (
                <div
                  key={broker.id}
                  onClick={() => {
                    onSelectBroker(broker)
                    onClose()
                  }}
                  className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-gold/10 border-l-2 border-gold'
                      : 'hover:bg-surface-secondary'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-bold text-foreground hover:text-gold transition-colors truncate">
                        {broker.name}
                      </h4>
                      {broker.status === 'ACTIVE' && (
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-text">
                      {broker.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-text/60" />
                          {broker.phone}
                        </span>
                      )}
                      {broker.areaOfOperation && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-gold/80" />
                          {broker.areaOfOperation}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="px-2 py-1 bg-gold text-background text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-2.5 py-1 border border-border text-[9px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground transition-colors"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between shrink-0 bg-surface-secondary text-[10px] text-muted-text">
          <span>{brokers.length} Partners Available</span>
          <button
            onClick={onClose}
            className="px-3 py-1 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
