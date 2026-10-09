'use client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { PropertyListingStatus } from '../../types/property'

const options: { value: PropertyListingStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'UNDER_NEGOTIATION', label: 'Under Negotiation' },
  { value: 'TOKEN_PAID', label: 'Token Paid' },
  { value: 'DEAL_DONE', label: 'Deal Done' },
  { value: 'RENTED_OUT', label: 'Rented Out' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'UPCOMING', label: 'Upcoming' },
]

export function PropertyStatusSelect({ value, onChange, disabled, upwards = false }: {
  value: PropertyListingStatus
  onChange: (value: PropertyListingStatus) => void
  disabled?: boolean
  upwards?: boolean
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); trigger.current?.focus() } }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [open])
  return <div ref={root} className="relative w-full min-w-40">
    <button ref={trigger} type="button" disabled={disabled} aria-label="Availability status" aria-haspopup="listbox" aria-expanded={open}
      onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:border-gold disabled:opacity-50">
      {options.find(option => option.value === value)?.label}<ChevronDown className="h-3 w-3" />
    </button>
    {open && <div role="listbox" aria-label="Availability status options" className={`absolute z-30 max-h-64 w-full min-w-48 overflow-y-auto border border-border bg-surface shadow-xl ${upwards ? 'bottom-full mb-px' : 'top-full mt-px'}`}>
      {options.map(option => <button type="button" key={option.value} role="option" aria-selected={value === option.value}
        onClick={() => { onChange(option.value); setOpen(false); trigger.current?.focus() }}
        className={`block w-full px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-surface-secondary ${value === option.value ? 'text-gold' : 'text-muted-text'}`}>{option.label}</button>)}
    </div>}
  </div>
}
