'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react'
import { getLinkedProperties } from '../../api/directory'
import { getApiErrorMessage } from '../../utils/errorHandler'
import { formatIndianCurrency } from '../../utils/formatters'
import type { LinkedPropertiesResponse } from '../../types/directory'

export function LinkedPropertiesList({ kind, id }: { kind: 'owner' | 'broker'; id: string }) {
  const [data, setData] = useState<LinkedPropertiesResponse | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    getLinkedProperties(kind, id, page).then((result) => { if (active) { setData(result); setError(null) } })
      .catch((error) => { if (active) setError(getApiErrorMessage(error)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [kind, id, page, attempt])
  return <section className="px-4 py-4">
    <h4 className="mb-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text"><Building2 className="h-3 w-3 text-gold" />Linked Properties {data ? `(${data.pagination.total})` : ''}</h4>
    {loading ? <div role="status" className="flex items-center gap-2 py-4 text-xs text-muted-text"><Loader2 className="h-4 w-4 animate-spin text-gold" />Loading properties...</div>
      : error ? <p role="alert" className="text-xs text-red-500">{error} <button type="button" className="underline" onClick={() => { setLoading(true); setAttempt(attempt + 1) }}>Retry</button></p>
      : !data?.properties.length ? <p className="text-xs text-muted-text">No listed properties linked yet. Link this {kind} when adding or editing a property.</p>
      : <div className="divide-y divide-border border border-border">
        {data.properties.map((property) => <Link key={property.id} href={`/dashboard/properties?propertyId=${encodeURIComponent(property.id)}`}
          className="group flex items-center gap-3 p-3 hover:bg-surface-secondary">
          <div className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden border border-border bg-surface-secondary">
            {property.media[0]?.url ? <img src={property.media[0].url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-4 w-4 text-gold" />}
          </div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-foreground group-hover:text-gold">{property.societyBuildingName}</p>
            <p className="text-[10px] text-muted-text">{property.locationArea} · {property.pricingType === 'RENT' ? 'Rent' : 'Sale'} · {formatIndianCurrency(property.askingPrice)}</p>
            <p className="text-[9px] text-muted-text">{property.isArchived ? 'Archived · ' : ''}{property.availabilityStatus.replaceAll('_', ' ')}</p>
          </div><ExternalLink className="h-3.5 w-3.5 text-muted-text group-hover:text-gold" />
        </Link>)}
      </div>}
    {data && data.pagination.totalPages > 1 && <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-text">
      <button type="button" aria-label="Previous properties" disabled={!data.pagination.hasPrevPage || loading} onClick={() => { setLoading(true); setPage(page - 1) }} className="border border-border p-1.5 disabled:opacity-30"><ChevronLeft className="h-3 w-3" /></button>
      {data.pagination.page} / {data.pagination.totalPages}
      <button type="button" aria-label="Next properties" disabled={!data.pagination.hasNextPage || loading} onClick={() => { setLoading(true); setPage(page + 1) }} className="border border-border p-1.5 disabled:opacity-30"><ChevronRight className="h-3 w-3" /></button>
    </div>}
  </section>
}
