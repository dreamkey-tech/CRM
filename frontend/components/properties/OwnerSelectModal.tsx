'use client'
import { useEffect, useState } from 'react'
import { X, Search, Loader2, Plus, UserRound } from 'lucide-react'
import { getOwnersList } from '../../api/owners'
import { getApiErrorMessage } from '../../utils/errorHandler'
import { useDebounce } from '../../utils/useDebounce'
import { OwnerFormModal } from '../owners/OwnerFormModal'
import type { Owner } from '../../types/owner'

export function OwnerSelectModal({ onClose, onSelect }: { onClose: () => void; onSelect: (owner: Owner) => void }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 250)
  const [owners, setOwners] = useState<Owner[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [creating, setCreating] = useState(false)
  useEffect(() => {
    let active = true
    getOwnersList({ search: debouncedSearch, status: 'ACTIVE', page, limit: 20 }).then(result => { if (active) { setOwners(result.owners); setHasNext(result.pagination.hasNextPage); setError(null) } })
      .catch(error => { if (active) setError(getApiErrorMessage(error)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [debouncedSearch, page, attempt])
  return <><div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="owner-picker-title" className="flex max-h-[85vh] w-full max-w-lg flex-col border border-border bg-surface"><header className="flex items-center justify-between border-b border-border px-5 py-4"><h3 id="owner-picker-title" className="text-sm font-bold uppercase">Select owner</h3><button type="button" aria-label="Close owner selection" onClick={onClose}><X className="h-4 w-4" /></button></header><div className="flex items-center gap-2 border-b border-border px-4 py-3"><Search className="h-4 w-4 text-muted-text" /><input autoFocus aria-label="Search owners" value={search} onChange={event => { setSearch(event.target.value); setPage(1); setLoading(true) }} placeholder="Search name, phone or email" className="flex-1 bg-transparent text-xs outline-none" /></div><div className="min-h-40 overflow-y-auto divide-y divide-border">{loading ? <div role="status" className="flex justify-center gap-2 p-8 text-xs"><Loader2 className="h-4 w-4 animate-spin text-gold" />Loading owners...</div> : error ? <p role="alert" className="p-5 text-xs text-red-500">{error}<button type="button" onClick={() => { setLoading(true); setAttempt(attempt + 1) }} className="ml-2 underline">Retry</button></p> : !owners.length ? <p className="p-8 text-center text-xs text-muted-text">No active owners found. Add an owner to continue.</p> : owners.map(owner => <button type="button" key={owner.id} onClick={() => { onSelect(owner); onClose() }} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface-secondary"><UserRound className="h-4 w-4 text-gold" /><div><p className="text-xs font-bold">{owner.name}</p><p className="text-[10px] text-muted-text">{owner.phone} · {owner.address || 'No address recorded'}</p></div></button>)}</div><footer className="flex items-center justify-between gap-2 border-t border-border px-4 py-3"><button type="button" onClick={() => setCreating(true)} className="flex items-center gap-1 bg-gold px-3 py-2 text-[10px] font-bold uppercase text-background"><Plus className="h-3 w-3" />Add owner</button><div className="flex items-center gap-2 text-[10px]"><button type="button" disabled={page === 1 || loading} onClick={() => { setPage(page - 1); setLoading(true) }} className="border border-border p-2 disabled:opacity-30">Previous</button>{page}<button type="button" disabled={!hasNext || loading} onClick={() => { setPage(page + 1); setLoading(true) }} className="border border-border p-2 disabled:opacity-30">Next</button></div></footer></div></div>{creating && <OwnerFormModal onClose={() => setCreating(false)} onSuccess={owner => { onSelect(owner); onClose() }} />}</>
}
