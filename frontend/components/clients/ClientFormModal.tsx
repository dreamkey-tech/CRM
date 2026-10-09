'use client'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Check } from 'lucide-react'
import { clientFormSchema, type ClientFormValues } from '../../zod/client'
import { saveClient } from '../../api/clients'
import { useClientStore } from '../../store/useClientStore'
import { useAuthStore } from '../../store/useAuthStore'
import { handleFormApiError } from '../../utils/errorHandler'
import { toast } from '../../utils/toast'
import type { Client } from '../../types/client'
import type { PrimaryContactPartner } from '../../types/broker'
import { ClientModal, ClientError, buttonClass, inputClass, labelClass } from './ClientModal'

export function ClientFormModal({ client, onClose, onSaved }: { client?: Client; onClose: () => void; onSaved?: (client: Client) => void }) {
  const user = useAuthStore(state => state.user), loadPartners = useClientStore(state => state.loadPartners)
  const partners = useClientStore(state => state.cache.partners?.data as PrimaryContactPartner[] | undefined)
  const partnerError = useClientStore(state => state.errors.partners)
  const [search, setSearch] = useState(''), [banner, setBanner] = useState<string | null>(null)
  useEffect(() => { void loadPartners().catch(() => {}) }, [loadPartners])
  const { register, handleSubmit, control, getValues, setValue, setError, formState: { errors, isSubmitting } } = useForm<ClientFormValues>({ resolver: zodResolver(clientFormSchema), mode: 'onTouched', defaultValues: {
    name: client?.name || '', phone: client?.phone || '', email: client?.email || '', whatsappNumber: client?.whatsappNumber || '', address: client?.address || '', notes: client?.notes || '', status: client?.status || 'ACTIVE', assignedPartnerIds: client ? client.assignedPartners.map(item => item.partnerId) : user ? [user.id] : [],
  } })
  const assigned = useWatch({ control, name: 'assignedPartnerIds' }), statusValue = useWatch({ control, name: 'status' })
  const submit = async (values: ClientFormValues) => {
    setBanner(null)
    try { const saved = await saveClient(client?.id, values); useClientStore.getState().savedClient(saved); onSaved?.(saved); toast.success(client ? 'Client updated' : 'Client added'); onClose() }
    catch (error) { handleFormApiError(error, { setError, setBannerError: setBanner, toastTitle: 'Unable to save client' }) }
  }
  return <ClientModal title={client ? 'Edit client' : 'Add client'} onClose={onClose} busy={isSubmitting} footer={<><button disabled={isSubmitting} onClick={onClose} className={buttonClass}>Cancel</button><button form="client-form" disabled={isSubmitting} className={`${buttonClass} bg-gold text-background`}>{isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isSubmitting ? 'Saving...' : 'Save client'}</button></>}>
    <form id="client-form" noValidate onSubmit={handleSubmit(submit)} className="space-y-5"><ClientError message={banner} /><div className="grid gap-4 sm:grid-cols-2">{(['name', 'phone', 'email', 'whatsappNumber'] as const).map(field => <div key={field}><label htmlFor={`client-${field}`} className={labelClass}>{{ name: 'Full name *', phone: 'Phone *', email: 'Email (optional)', whatsappNumber: 'WhatsApp (optional)' }[field]}</label><input id={`client-${field}`} {...register(field)} type={field === 'email' ? 'email' : field === 'phone' || field === 'whatsappNumber' ? 'tel' : 'text'} className={`${inputClass} ${errors[field] ? 'border-red-500 focus:border-red-500' : ''}`} aria-invalid={!!errors[field]} />{errors[field] && <p className="mt-1 text-[10px] text-red-500">{errors[field]?.message}</p>}</div>)}</div>
      <button type="button" onClick={() => setValue('whatsappNumber', getValues('phone'), { shouldValidate: true, shouldDirty: true })} className="min-h-10 text-[10px] font-bold uppercase text-gold">Use phone for WhatsApp</button>
      <div><p className={labelClass}>Assigned partners</p><p className="mb-2 text-[10px] text-muted-text">Select one or more partners. Each will see this client under My Clients.</p><input aria-label="Search partners" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search partners..." className={`${inputClass} mb-2`} /><ClientError message={partnerError} retry={() => void loadPartners(true).catch(() => {})} /><div className="grid max-h-44 gap-px overflow-y-auto border border-border bg-border sm:grid-cols-2">{(partners || []).filter(item => `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase())).map(partner => <button type="button" key={partner.id} aria-pressed={assigned.includes(partner.id)} onClick={() => setValue('assignedPartnerIds', assigned.includes(partner.id) ? assigned.filter(id => id !== partner.id) : [...assigned, partner.id], { shouldDirty: true, shouldValidate: true })} className="flex min-h-11 items-center justify-between gap-2 bg-surface px-3 py-2 text-left text-xs"><span>{partner.name || partner.email}</span>{assigned.includes(partner.id) && <Check className="h-4 w-4 shrink-0 text-gold" />}</button>)}{!partners && !partnerError && <p className="bg-surface p-3 text-xs text-muted-text">Loading partners...</p>}</div>{errors.assignedPartnerIds && <p className="mt-1 text-[10px] text-red-500">{errors.assignedPartnerIds.message}</p>}</div>
      {(['address', 'notes'] as const).map(field => <div key={field}><label htmlFor={`client-${field}`} className={labelClass}>{field === 'notes' ? 'Client notes' : 'Address (optional)'}</label><textarea id={`client-${field}`} {...register(field)} rows={3} className={`${inputClass} ${errors[field] ? 'border-red-500 focus:border-red-500' : ''}`} />{errors[field] && <p className="mt-1 text-[10px] text-red-500">{errors[field]?.message}</p>}</div>)}
      <div><p className={labelClass}>Status</p><div className="flex gap-2">{(['ACTIVE', 'INACTIVE'] as const).map(status => <button type="button" key={status} aria-pressed={statusValue === status} onClick={() => setValue('status', status, { shouldDirty: true })} className={`${buttonClass} ${statusValue === status ? 'bg-foreground text-background' : ''}`}>{status}</button>)}</div></div>
    </form>
  </ClientModal>
}
