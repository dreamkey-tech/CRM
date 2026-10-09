'use client'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { Building2, Loader2, Check, Search } from 'lucide-react'
import { clientShortlistFormSchema, clientShortlistUpdateFormSchema, type ClientShortlistFormValues, type ClientShortlistUpdateFormValues } from '../../zod/client'
import { addClientShortlist, updateClientShortlist } from '../../api/clients'
import { clientOptionsKey, useClientStore } from '../../store/useClientStore'
import { useDebounce } from '../../utils/useDebounce'
import { handleFormApiError } from '../../utils/errorHandler'
import type { ClientShortlistedProperty } from '../../types/client'
import { ClientModal, ClientError, ClientLoading, buttonClass, inputClass, labelClass } from './ClientModal'
import type { getClientPropertyOptions } from '../../api/clients'

export function ClientShortlistModal({ clientId, onClose, onAdded }: { clientId: string; onClose: () => void; onAdded: (shortlist: ClientShortlistedProperty) => void }) {
  const [search, setSearch] = useState(''), [page, setPage] = useState(1), [banner, setBanner] = useState<string | null>(null)
  const debounced = useDebounce(search, 300), key = clientOptionsKey(debounced, page)
  const data = useClientStore(state => state.cache[key]?.data as Awaited<ReturnType<typeof getClientPropertyOptions>> | undefined), loading = useClientStore(state => state.loading[key]), error = useClientStore(state => state.errors[key]), load = useClientStore(state => state.loadOptions)
  useEffect(() => { void load(debounced, page).catch(() => {}) }, [load, debounced, page])
  const { register, handleSubmit, setValue, control, setError, formState: { errors, isSubmitting } } = useForm<ClientShortlistFormValues>({ resolver: zodResolver(clientShortlistFormSchema), mode: 'onTouched', defaultValues: { propertyId: '', notes: '' } })
  const selectedPropertyId = useWatch({ control, name: 'propertyId' })
  const submit = async (values: ClientShortlistFormValues) => {
    setBanner(null)
    try { const shortlist = await addClientShortlist(clientId, values.propertyId, values.notes); useClientStore.getState().shortlistChanged(clientId, shortlist); onAdded(shortlist); onClose() }
    catch (error) { handleFormApiError(error, { setError, setBannerError: setBanner, toastTitle: 'Unable to shortlist property' }) }
  }
  return <ClientModal title="Add shortlisted property" onClose={onClose} busy={isSubmitting} footer={<><button disabled={isSubmitting} onClick={onClose} className={buttonClass}>Cancel</button><button form="client-shortlist-form" disabled={isSubmitting} className={`${buttonClass} bg-gold text-background`}>{isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isSubmitting ? 'Adding...' : 'Add to shortlist'}</button></>}>
    <ClientError message={banner || error} retry={error ? () => void load(debounced, page, true).catch(() => {}) : undefined} />
    <div className="relative mb-4"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-text" /><input aria-label="Search properties" className={`${inputClass} pl-10`} placeholder="Search property name, location or city..." value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></div>
    <form id="client-shortlist-form" noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
      {loading && !data ? <ClientLoading text="Finding properties..." /> : <div className="grid gap-3 sm:grid-cols-2">{data?.properties.map(property => <button type="button" key={property.id} aria-pressed={selectedPropertyId === property.id} onClick={() => setValue('propertyId', property.id, { shouldValidate: true })} className={`flex gap-3 border p-3 text-left ${selectedPropertyId === property.id ? 'border-gold' : 'border-border'}`}><div className="relative flex h-20 w-24 shrink-0 items-center justify-center bg-surface-secondary">{property.media.find(item => item.category === 'PHOTOGRAPH') ? <Image unoptimized src={property.media.find(item => item.category === 'PHOTOGRAPH')!.url} alt="" fill sizes="96px" className="object-cover" /> : <Building2 className="h-7 w-7 text-gold" />}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold">{property.societyBuildingName}</p><p className="mt-1 text-[10px] text-muted-text">{property.locationArea}, {property.city}</p><p className="mt-2 text-xs font-bold text-gold">₹{property.askingPrice.toLocaleString('en-IN')}{property.pricingType === 'RENT' ? ' / month' : ''}</p><p className="mt-1 text-[9px] uppercase text-muted-text">{property.availabilityStatus.replaceAll('_', ' ')}</p></div>{selectedPropertyId === property.id && <Check className="h-4 w-4 shrink-0 text-gold" />}</button>)}</div>}
      {!loading && !data?.properties.length && !error && <p className="p-6 text-center text-xs text-muted-text">No published properties match your search.</p>}
      {errors.propertyId && <p role="alert" className="text-[10px] text-red-500">{errors.propertyId.message}</p>}
      {data && <div className="flex items-center justify-between text-[10px] text-muted-text"><span>{data.pagination.total} properties</span><div className="flex gap-2"><button type="button" disabled={page === 1 || loading} className={buttonClass} onClick={() => setPage(page - 1)}>Previous</button><button type="button" disabled={!data.pagination.hasNextPage || loading} className={buttonClass} onClick={() => setPage(page + 1)}>Next</button></div></div>}
      <div><label htmlFor="shortlist-notes" className={labelClass}>Shortlist notes (optional)</label><textarea id="shortlist-notes" {...register('notes')} rows={3} className={`${inputClass} ${errors.notes ? 'border-red-500' : ''}`} />{errors.notes && <p className="text-[10px] text-red-500">{errors.notes.message}</p>}</div>
    </form>
  </ClientModal>
}

export function ClientShortlistEditModal({ clientId, shortlist, onClose }: { clientId: string; shortlist: ClientShortlistedProperty; onClose: () => void }) {
  const [banner, setBanner] = useState<string | null>(null)
  const { register, control, setValue, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ClientShortlistUpdateFormValues>({ resolver: zodResolver(clientShortlistUpdateFormSchema), mode: 'onTouched', defaultValues: { status: shortlist.status, notes: shortlist.notes || '' } })
  const statusValue = useWatch({ control, name: 'status' })
  const submit = async (values: ClientShortlistUpdateFormValues) => {
    setBanner(null)
    try { const updated = await updateClientShortlist(clientId, shortlist.id, values); useClientStore.getState().shortlistChanged(clientId, updated); onClose() }
    catch (error) { handleFormApiError(error, { setError, setBannerError: setBanner, toastTitle: 'Unable to save property feedback' }) }
  }
  return <ClientModal title={`Feedback — ${shortlist.property.societyBuildingName}`} onClose={onClose} busy={isSubmitting} footer={<button disabled={isSubmitting} form="shortlist-edit-form" className={`${buttonClass} bg-gold text-background`}>{isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isSubmitting ? 'Saving...' : 'Save feedback'}</button>}><form id="shortlist-edit-form" noValidate onSubmit={handleSubmit(submit)} className="space-y-4"><ClientError message={banner} /><div><p className={labelClass}>Property status</p><div className="flex flex-wrap gap-2">{(['SHORTLISTED', 'SHARED', 'VISITED', 'INTERESTED', 'NOT_INTERESTED'] as const).map(status => <button type="button" key={status} aria-pressed={statusValue === status} onClick={() => setValue('status', status, { shouldDirty: true })} className={`${buttonClass} ${statusValue === status ? 'bg-foreground text-background' : ''}`}>{status.replaceAll('_', ' ')}</button>)}</div></div><div><label htmlFor="property-feedback" className={labelClass}>Client feedback & notes</label><textarea id="property-feedback" {...register('notes')} rows={4} className={`${inputClass} ${errors.notes ? 'border-red-500' : ''}`} />{errors.notes && <p className="text-[10px] text-red-500">{errors.notes.message}</p>}</div></form></ClientModal>
}
