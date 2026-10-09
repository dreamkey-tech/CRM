'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { getDirectoryPartners } from '../../api/directory'
import { getApiErrorMessage } from '../../utils/errorHandler'
import type { PrimaryContactPartner } from '../../types/broker'

interface Props { value: string | null | undefined; onChange: (value: string | null) => void; error?: string }
export function PartnerSelectField({ value, onChange, error }: Props) {
  const [partners, setPartners] = useState<PrimaryContactPartner[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [open])
  useEffect(() => {
    let active = true
    getDirectoryPartners().then((result) => { if (active) { setPartners(result); setLoadError(null) } })
      .catch((error) => { if (active) setLoadError(getApiErrorMessage(error)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])
  const selected = partners.find((partner) => partner.id === value)
  return <div ref={root} className="relative">
    <label id={id} className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-text">Primary Contact Partner</label>
    <button type="button" aria-labelledby={id} aria-expanded={open} aria-haspopup="listbox" disabled={loading}
      onClick={() => setOpen(!open)} className={`flex w-full items-center justify-between border px-3.5 py-2.5 bg-background text-xs text-foreground ${error ? 'border-red-500' : 'border-border'}`}>
      {loading ? <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Loading partners...</span> : selected ? selected.name || selected.email : value ? 'Previously assigned partner' : 'Unassigned'}
      <ChevronDown className="h-3 w-3" />
    </button>
    {open && <div role="listbox" aria-labelledby={id} className="absolute top-full z-30 max-h-48 w-full overflow-y-auto border border-border bg-surface shadow-lg">
      {[{ id: '', name: 'Unassigned', email: '' }, ...partners].map((partner) => <button key={partner.id} type="button" role="option" aria-selected={value === partner.id || (!value && !partner.id)}
        onClick={() => { onChange(partner.id || null); setOpen(false) }} className="block w-full px-3.5 py-2.5 text-left text-xs text-foreground hover:bg-surface-secondary">
        {partner.name || partner.email}{partner.email && <span className="ml-2 text-[10px] text-muted-text">{partner.email}</span>}
      </button>)}
    </div>}
    {error && <p role="alert" className="mt-1 text-[10px] text-red-500">{error}</p>}
    {loadError && <p role="alert" className="mt-1 text-[10px] text-red-500">{loadError} <button type="button" className="underline" onClick={() => { setLoading(true); setAttempt(attempt + 1) }}>Retry</button></p>}
  </div>
}
