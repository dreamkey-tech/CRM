'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, Maximize2, Minimize2, UserRound } from 'lucide-react'
import { ownerFormSchema, type OwnerFormValues } from '../../zod/owner'
import { createOwner, updateOwner } from '../../api/owners'
import { PartnerSelectField } from '../directory/PartnerSelectField'
import { handleFormApiError } from '../../utils/errorHandler'
import { toast } from '../../utils/toast'
import { useAuthStore } from '../../store/useAuthStore'
import type { Owner } from '../../types/owner'

export function OwnerFormModal({ owner, onClose, onSuccess }: { owner?: Owner | null; onClose: () => void; onSuccess: (owner: Owner) => void }) {
  const user = useAuthStore(state => state.user)
  const [maximized, setMaximized] = useState(false)
  const [error, setBanner] = useState<string | null>(null)
  const form = useForm<OwnerFormValues>({ resolver: zodResolver(ownerFormSchema), mode: 'onTouched', defaultValues: {
    name: owner?.name || '', phone: owner?.phone || '', email: owner?.email || '', whatsappNumber: owner?.whatsappNumber || '',
    address: owner?.address || '', notes: owner?.notes || '', status: owner?.status || 'ACTIVE',
    primaryContactPartnerId: owner ? owner.primaryContactPartnerId : user?.id || null,
  } })
  const { register, handleSubmit, setError, setValue, watch, formState: { errors, isSubmitting } } = form
  const submit = async (values: OwnerFormValues) => {
    setBanner(null)
    try {
      const payload = { ...values, email: values.email || null, whatsappNumber: values.whatsappNumber || null, address: values.address || null, notes: values.notes || null }
      const saved = owner ? await updateOwner(owner.id, payload) : await createOwner(payload)
      toast.success(owner ? 'Owner updated' : 'Owner added', 'Owner details have been saved.')
      onSuccess(saved); onClose()
    } catch (error) { handleFormApiError(error, { setError, setBannerError: setBanner, toastTitle: 'Unable to save owner' }) }
  }
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
    <form noValidate role="dialog" aria-modal="true" aria-labelledby="owner-form-title" onSubmit={handleSubmit(submit)} className={`flex w-full flex-col border border-border bg-surface shadow-2xl ${maximized ? 'h-[96vh] sm:max-w-[96vw]' : 'max-h-[92vh] sm:max-w-2xl'}`}>
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4"><h2 id="owner-form-title" className="flex items-center gap-2 text-sm font-bold uppercase"><UserRound className="h-4 w-4 text-gold" />{owner ? 'Edit owner' : 'Add owner'}</h2><div className="flex gap-2"><button type="button" aria-label="Toggle fullscreen" onClick={() => setMaximized(!maximized)} className="border border-border p-2">{maximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button><button type="button" aria-label="Close" disabled={isSubmitting} onClick={onClose} className="border border-border p-2"><X className="h-4 w-4" /></button></div></header>
      <div className="overflow-y-auto p-5 space-y-5">{error && <p role="alert" className="border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">{error}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{(['name', 'phone', 'email', 'whatsappNumber'] as const).map(field => <div key={field}><label htmlFor={`owner-${field}`} className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-text">{{ name: 'Full name *', phone: 'Phone *', email: 'Email (optional)', whatsappNumber: 'WhatsApp (optional)' }[field]}</label><input id={`owner-${field}`} {...register(field)} type={field === 'email' ? 'email' : field === 'phone' || field === 'whatsappNumber' ? 'tel' : 'text'} className={`w-full border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-gold ${errors[field] ? 'border-red-500' : 'border-border'}`} />{errors[field] && <p role="alert" className="mt-1 text-[10px] text-red-500">{errors[field]?.message}</p>}</div>)}</div>
        <button type="button" onClick={() => setValue('whatsappNumber', watch('phone'), { shouldValidate: true, shouldDirty: true })} className="text-[10px] font-bold uppercase text-gold">Use phone for WhatsApp</button>
        <PartnerSelectField value={watch('primaryContactPartnerId')} onChange={value => setValue('primaryContactPartnerId', value, { shouldValidate: true, shouldDirty: true })} error={errors.primaryContactPartnerId?.message} />
        {(['address', 'notes'] as const).map(field => <div key={field}><label htmlFor={`owner-${field}`} className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-text">{field === 'notes' ? 'Owner preferences & notes' : 'Address (optional)'}</label><textarea id={`owner-${field}`} {...register(field)} rows={3} className={`w-full border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-gold ${errors[field] ? 'border-red-500' : 'border-border'}`} />{errors[field] && <p role="alert" className="mt-1 text-[10px] text-red-500">{errors[field]?.message}</p>}</div>)}
        <div><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-text">Status</p><div className="flex gap-1">{(['ACTIVE', 'INACTIVE'] as const).map(status => <button key={status} type="button" onClick={() => setValue('status', status, { shouldDirty: true })} aria-pressed={watch('status') === status} className={`border border-border px-4 py-2 text-[10px] font-bold uppercase ${watch('status') === status ? 'bg-foreground text-background' : 'text-muted-text'}`}>{status}</button>)}</div></div>
      </div><footer className="flex shrink-0 justify-end gap-2 border-t border-border bg-surface-secondary px-5 py-4"><button type="button" disabled={isSubmitting} onClick={onClose} className="border border-border px-4 py-2 text-[10px] font-bold uppercase">Cancel</button><button disabled={isSubmitting} className="flex items-center gap-2 bg-gold px-4 py-2 text-[10px] font-bold uppercase text-background">{isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isSubmitting ? 'Saving...' : 'Save owner'}</button></footer>
    </form>
  </div>
}
