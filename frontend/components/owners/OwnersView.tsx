'use client'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Users, Plus, Search, RefreshCw, Loader2, X, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getOwnersList, getOwnerStats, getOwnerById, deleteOwner } from '../../api/owners'
import { getApiErrorMessage } from '../../utils/errorHandler'
import { toast } from '../../utils/toast'
import { useDebounce } from '../../utils/useDebounce'
import { Breadcrumb } from '../ui/Breadcrumb'
import { LinkedPropertiesList } from '../directory/LinkedPropertiesList'
import { OwnerFormModal } from './OwnerFormModal'
import type { Owner, OwnerStatus, OwnerStats, OwnersListResponse } from '../../types/owner'

export function OwnersView() {
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState<OwnerStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<OwnersListResponse | null>(null)
  const [stats, setStats] = useState<OwnerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<{ owner?: Owner } | null>(null)
  const [detail, setDetail] = useState<Owner | null>(null)
  const [deleting, setDeleting] = useState<Owner | null>(null)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const ownerId = params.get('ownerId')
  useEffect(() => {
    if (!ownerId) return
    let active = true
    getOwnerById(ownerId).then(owner => { if (active) setDetail(owner) }).catch(error => { if (active) toast.error('Unable to open owner', getApiErrorMessage(error)) })
    return () => { active = false }
  }, [ownerId])
  const refreshStats = useCallback(() => { getOwnerStats().then(setStats).catch(error => toast.error('Unable to load owner statistics', getApiErrorMessage(error))) }, [])
  useEffect(() => { refreshStats() }, [refreshStats])
  useEffect(() => {
    let active = true
    getOwnersList({ page, limit: 15, search: debouncedSearch, status }).then(result => {
      if (!active) return
      if (page > Math.max(1, result.pagination.totalPages)) { setPage(Math.max(1, result.pagination.totalPages)); return }
      setData(result); setError(null)
    }).catch(error => { if (active) setError(getApiErrorMessage(error)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, debouncedSearch, status, attempt])
  const reload = () => { setLoading(true); setAttempt(value => value + 1); refreshStats() }
  const openDetail = async (owner: Owner) => {
    setDetail(owner)
    try { const fresh = await getOwnerById(owner.id); setDetail(current => current?.id === owner.id ? fresh : current) }
    catch (error) { toast.error('Unable to refresh owner', getApiErrorMessage(error)) }
  }
  const remove = async () => {
    if (!deleting || busy) return
    setBusy(true); setDeleteError(null)
    try {
      await deleteOwner(deleting.id)
      setDetail(current => current?.id === deleting.id ? null : current); setDeleting(null); reload()
      toast.success('Owner deleted', 'Listed properties have been kept; their owner link has been cleared.')
    } catch (error) { setDeleteError(getApiErrorMessage(error)) } finally { setBusy(false) }
  }
  const badge = (value: OwnerStatus) => <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${value === 'ACTIVE' ? 'text-foreground' : 'text-muted-text'}`}><span className={`h-1.5 w-1.5 ${value === 'ACTIVE' ? 'bg-foreground' : 'bg-muted-text'}`} />{value}</span>
  return <>
    <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Owners' }]} />
    <div className="my-5 flex items-center justify-between gap-3"><div><h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight"><Users className="h-5 w-5 text-gold" />Owner Directory</h1><p className="mt-1 text-xs text-muted-text">Manage owners, preferences, and their listed properties.</p></div><button onClick={() => setForm({})} className="flex items-center gap-2 bg-gold px-4 py-2.5 text-[10px] font-bold uppercase text-background"><Plus className="h-3.5 w-3.5" />Add owner</button></div>
    <div className="mb-5 grid grid-cols-2 border border-border bg-surface sm:grid-cols-4">{[['Total owners', stats?.totalOwners], ['Active', stats?.activeOwners], ['Inactive', stats?.inactiveOwners], ['My owners', stats?.myOwnersCount]].map(([label, value]) => <div key={label} className="border-r border-border px-4 py-4 last:border-r-0"><p className="text-[9px] font-bold uppercase tracking-wider text-muted-text">{label}</p><p className="mt-1 text-2xl font-black tabular-nums">{value ?? '—'}</p></div>)}</div>
    <div className="mb-4 border border-border bg-surface"><div className="flex border-b border-border"><div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-text" /><input aria-label="Search owners" value={search} onChange={event => { setSearch(event.target.value); setPage(1); setLoading(true) }} placeholder="Search name, phone, email or address..." className="w-full bg-transparent py-3 pl-10 pr-3 text-xs outline-none" /></div><button onClick={reload} className="flex items-center gap-2 border-l border-border px-4 text-[10px] font-bold uppercase text-muted-text"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div><div className="flex gap-1 p-2">{(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(value => <button key={value} aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); setLoading(true) }} className={`px-3 py-1 text-[10px] font-bold uppercase ${status === value ? 'bg-foreground text-background' : 'text-muted-text'}`}>{value}</button>)}</div></div>
    <div className="overflow-hidden border border-border bg-surface">{loading ? <div role="status" className="flex min-h-64 items-center justify-center gap-2 text-xs text-muted-text"><Loader2 className="h-5 w-5 animate-spin text-gold" />Loading owners...</div> : error ? <div role="alert" className="p-8 text-center text-xs text-red-500">{error}<button onClick={reload} className="ml-2 underline">Retry</button></div> : !data?.owners.length ? <div className="p-12 text-center"><Users className="mx-auto mb-3 h-6 w-6 text-gold" /><h3 className="text-sm font-bold uppercase">No owners found</h3><p className="mt-1 text-xs text-muted-text">Add an owner or adjust your search.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left"><thead className="border-b border-border bg-surface-secondary"><tr>{['Owner', 'Contact', 'Primary partner', 'Properties', 'Status', 'Actions'].map(title => <th key={title} className="whitespace-nowrap px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-muted-text">{title}</th>)}</tr></thead><tbody className="divide-y divide-border">{data.owners.map(owner => <tr
              key={owner.id}
              tabIndex={0}
              aria-label={`View owner ${owner.name}`}
              onClick={event => {
                if ((event.target as HTMLElement).closest('a, button')) return
                void openDetail(owner)
              }}
              onKeyDown={event => {
                if (event.target !== event.currentTarget) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  void openDetail(owner)
                }
              }}
              className="group cursor-pointer hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-gold focus-visible:-outline-offset-2"
            ><td className="px-4 py-3.5"><button onClick={() => void openDetail(owner)} className="text-left text-xs font-bold group-hover:text-gold">{owner.name}</button><p className="mt-1 text-[10px] text-muted-text">{owner.address || 'No address recorded'}</p></td><td className="px-4 py-3.5 text-xs"><a href={`tel:${owner.phone}`} className="hover:text-gold">{owner.phone}</a><p className="text-[10px] text-muted-text">{owner.email || '—'}</p></td><td className="px-4 py-3.5 text-xs">{owner.primaryContactPartner?.name || owner.primaryContactPartner?.email || 'Unassigned'}</td><td className="px-4 py-3.5"><button onClick={() => void openDetail(owner)} className="text-xs font-bold text-gold">{owner._count?.properties ?? 0}</button></td><td className="px-4 py-3.5">{badge(owner.status)}</td><td className="px-4 py-3.5"><div className="flex gap-2"><button aria-label={`Edit ${owner.name}`} onClick={() => setForm({ owner })} className="p-1 text-muted-text hover:text-gold"><Edit2 className="h-3.5 w-3.5" /></button><button aria-label={`Delete ${owner.name}`} onClick={() => { setDeleting(owner); setDeleteError(null) }} className="p-1 text-muted-text hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table></div>}
    {data && <div className="flex items-center justify-between border-t border-border bg-surface-secondary px-4 py-3 text-[10px] text-muted-text"><span>{data.pagination.total} owners</span><div className="flex items-center gap-3"><button aria-label="Previous page" disabled={page === 1 || loading} onClick={() => { setPage(page - 1); setLoading(true) }} className="border border-border p-1.5 disabled:opacity-30"><ChevronLeft className="h-3 w-3" /></button>{page} / {Math.max(1, data.pagination.totalPages)}<button aria-label="Next page" disabled={!data.pagination.hasNextPage || loading} onClick={() => { setPage(page + 1); setLoading(true) }} className="border border-border p-1.5 disabled:opacity-30"><ChevronRight className="h-3 w-3" /></button></div></div>}</div>
    {detail && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"><div role="dialog" aria-modal="true" aria-labelledby="owner-detail-title" className="flex max-h-[92vh] w-full flex-col border border-border bg-surface sm:max-w-2xl"><header className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 id="owner-detail-title" className="text-sm font-bold">{detail.name}</h2>{badge(detail.status)}</div><button aria-label="Close owner details" onClick={() => setDetail(null)} className="p-2"><X className="h-4 w-4" /></button></header><div className="divide-y divide-border overflow-y-auto"><div className="grid gap-4 p-5 sm:grid-cols-2">{[['Phone', detail.phone], ['Email', detail.email], ['WhatsApp', detail.whatsappNumber], ['Address', detail.address], ['Primary Contact Partner', detail.primaryContactPartner?.name || detail.primaryContactPartner?.email], ['Created by', detail.createdBy?.name || detail.createdBy?.email]].map(([label, value]) => <div key={label}><p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-muted-text">{label}</p><p className="whitespace-pre-wrap text-xs">{value || '—'}</p></div>)}</div><LinkedPropertiesList key={detail.id} kind="owner" id={detail.id} /><div className="p-5"><p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-muted-text">Owner preferences & notes</p><p className="whitespace-pre-wrap text-xs">{detail.notes || 'No preferences recorded.'}</p></div></div><footer className="flex justify-between border-t border-border bg-surface-secondary px-5 py-4"><button onClick={() => { setDeleting(detail); setDeleteError(null) }} className="text-[10px] font-bold uppercase text-red-500">Delete owner</button><button onClick={() => setForm({ owner: detail })} className="bg-gold px-4 py-2 text-[10px] font-bold uppercase text-background">Edit owner</button></footer></div></div>}
    {form && <OwnerFormModal key={form.owner?.id || 'new'} owner={form.owner} onClose={() => setForm(null)} onSuccess={owner => { setDetail(current => current?.id === owner.id ? owner : current); reload() }} />}
    {deleting && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"><div role="alertdialog" aria-modal="true" aria-labelledby="delete-owner-title" className="w-full max-w-sm border border-border bg-surface p-5"><h3 id="delete-owner-title" className="text-sm font-bold">Delete {deleting.name}?</h3><p className="mt-2 text-xs text-muted-text">Their properties will be kept, but the owner links will be removed.</p>{deleteError && <p role="alert" className="mt-3 text-xs text-red-500">{deleteError}</p>}<div className="mt-5 flex justify-end gap-2"><button disabled={busy} onClick={() => setDeleting(null)} className="border border-border px-4 py-2 text-[10px] font-bold uppercase">Cancel</button><button disabled={busy} onClick={() => void remove()} className="flex items-center gap-2 bg-red-500 px-4 py-2 text-[10px] font-bold uppercase text-white">{busy && <Loader2 className="h-3 w-3 animate-spin" />}{busy ? 'Deleting...' : 'Delete'}</button></div></div></div>}
  </>
}
