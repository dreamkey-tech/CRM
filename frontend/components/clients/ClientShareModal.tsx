'use client'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { Loader2, Film, Check, Copy, ExternalLink } from 'lucide-react'
import { clientPropertyShareFormSchema, type ClientPropertyShareFormValues } from '../../zod/client'
import { buildClientPropertyMessage, propertyComposerUrl } from '../../templates/client-property-message'
import { createClientShare, updateClientShare } from '../../api/clients'
import { useClientStore } from '../../store/useClientStore'
import { useAuthStore } from '../../store/useAuthStore'
import { handleFormApiError, getApiErrorMessage } from '../../utils/errorHandler'
import { toast } from '../../utils/toast'
import type { ClientDetail, ClientShortlistedProperty, ClientPropertyShare } from '../../types/client'
import { ClientModal, ClientError, inputClass, labelClass, buttonClass } from './ClientModal'

export function ClientShareModal({ client, shortlist, onClose }: { client: ClientDetail; shortlist: ClientShortlistedProperty; onClose: () => void }) {
  const partner = useAuthStore(state => state.user?.name || 'DreamKey')
  const [share, setShare] = useState<ClientPropertyShare | null>(null), [banner, setBanner] = useState<string | null>(null), [busy, setBusy] = useState(false)
  const media = shortlist.property.media.filter(item => item.category === 'PHOTOGRAPH' || item.category === 'VIDEO')
  const { register, control, getValues, setValue, setError, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientPropertyShareFormValues>({ resolver: zodResolver(clientPropertyShareFormSchema), mode: 'onTouched', defaultValues: {
    shortlistedPropertyId: shortlist.id, channel: 'WHATSAPP', subject: `${shortlist.property.societyBuildingName} — Property details from DreamKey`,
    message: buildClientPropertyMessage(client.name, shortlist.property, partner, 'WHATSAPP'), selectedMediaIds: media.filter(item => item.category === 'PHOTOGRAPH').slice(0, 5).map(item => item.id), expiresAt: null,
  } })
  const channel = useWatch({ control, name: 'channel' }), selected = useWatch({ control, name: 'selectedMediaIds' })
  const submit = async (values: ClientPropertyShareFormValues) => {
    setBanner(null)
    try { const created = await createClientShare(client.id, values); setShare(created); useClientStore.getState().shareChanged(client.id, created); toast.success('Property link created') }
    catch (error) { handleFormApiError(error, { setError, setBannerError: setBanner, toastTitle: 'Unable to share property' }) }
  }
  const recordOpened = async () => {
    if (!share) return
    try { const updated = await updateClientShare(client.id, share.id, 'COMPOSER_OPENED'); setShare(updated); useClientStore.getState().shareChanged(client.id, updated) }
    catch (error) { toast.error('Could not update sharing history', getApiErrorMessage(error)) }
  }
  const confirmSent = async () => {
    if (!share) return
    setBusy(true); setBanner(null)
    try { const updated = await updateClientShare(client.id, share.id, 'SENT_CONFIRMED'); setShare(updated); useClientStore.getState().shareChanged(client.id, updated); toast.success('Marked as sent') }
    catch (error) { setBanner(getApiErrorMessage(error)) } finally { setBusy(false) }
  }
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [copiedDraftMessage, setCopiedDraftMessage] = useState(false)

  const copy = async () => {
    if (!share) return
    try {
      await navigator.clipboard.writeText(share.publicUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
      toast.success('Property link copied')
    } catch {
      setBanner('Your browser could not copy the link. Select and copy it from the field below.')
    }
  }

  const copyMessage = async () => {
    if (!share) return
    try {
      await navigator.clipboard.writeText(share.message)
      setCopiedMessage(true)
      setTimeout(() => setCopiedMessage(false), 2000)
      toast.success('Message copied to clipboard')
    } catch {
      setBanner('Your browser could not copy the message. Please select and copy the text directly.')
    }
  }

  const copyDraftMessage = async () => {
    const text = getValues('message')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedDraftMessage(true)
      setTimeout(() => setCopiedDraftMessage(false), 2000)
      toast.success('Message copied to clipboard')
    } catch {
      setBanner('Your browser could not copy the message. Please select and copy the text directly.')
    }
  }

  const composer = share ? propertyComposerUrl(share) : null
  return <ClientModal title={`Share property with ${client.name}`} onClose={onClose} busy={isSubmitting || busy} footer={share ? <>
    <button onClick={() => void copy()} className={buttonClass}>
      {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedLink ? 'Link copied' : 'Copy link'}
    </button>
    <button onClick={() => void copyMessage()} className={buttonClass}>
      {copiedMessage ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedMessage ? 'Message copied' : 'Copy message'}
    </button>
    {composer && <a href={composer} target={share.channel === 'WHATSAPP' ? '_blank' : undefined} rel="noopener noreferrer" onClick={() => void recordOpened()} className={`${buttonClass} bg-gold text-background`}><ExternalLink className="h-3.5 w-3.5" />Open {share.channel === 'WHATSAPP' ? 'WhatsApp' : 'email'}</a>}
    {share.channel !== 'LINK' && <button disabled={busy || share.status === 'SENT_CONFIRMED'} onClick={() => void confirmSent()} className={buttonClass}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}{share.status === 'SENT_CONFIRMED' ? 'Sent confirmed' : 'Mark as sent'}</button>}
  </> : <><button disabled={isSubmitting} onClick={onClose} className={buttonClass}>Cancel</button><button form="client-share-form" disabled={isSubmitting || (channel === 'EMAIL' && !client.email)} className={`${buttonClass} bg-gold text-background`}>{isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isSubmitting ? 'Creating link...' : 'Create property link'}</button></>}>
    <ClientError message={banner} />
    <div className="mb-5 border border-border bg-surface-secondary p-4"><p className="text-xs font-bold">{shortlist.property.societyBuildingName}</p><p className="mt-1 text-[10px] text-muted-text">{shortlist.property.locationArea}, {shortlist.property.city}</p></div>
    {share ? <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="created-property-link">Public property link</label>
        <input id="created-property-link" readOnly value={share.publicUrl} onFocus={event => event.currentTarget.select()} className={inputClass} />
      </div>
      <div>
        <a className={`${buttonClass} text-gold`} href={share.publicUrl} target="_blank" rel="noopener noreferrer">Preview public page <ExternalLink className="h-3.5 w-3.5" /></a>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Prepared message</label>
          <button
            type="button"
            onClick={() => void copyMessage()}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-gold hover:opacity-80 transition"
          >
            {copiedMessage ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedMessage ? 'Message copied' : 'Copy message'}
          </button>
        </div>
        <div className="relative">
          <p className="whitespace-pre-wrap border border-border bg-surface-secondary/40 p-4 text-xs leading-relaxed">{share.message}</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-text">{share.channel === 'LINK' ? 'Copy this link and share it with your client.' : 'Open the prepared message, press Send in WhatsApp or your email app, then mark it as sent here. The selected photos and videos are included on the property page.'}</p>
    </div> : <form id="client-share-form" noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
      <div><p className={labelClass}>Share through</p><div className="flex flex-wrap gap-2">{(['WHATSAPP', 'EMAIL', 'LINK'] as const).map(value => <button type="button" key={value} onClick={() => { setValue('channel', value, { shouldValidate: true }); setValue('message', buildClientPropertyMessage(client.name, shortlist.property, partner, value), { shouldDirty: true }) }} aria-pressed={channel === value} className={`${buttonClass} ${channel === value ? 'bg-foreground text-background' : ''}`}>{value === 'LINK' ? 'Copy link' : value}</button>)}</div>{channel === 'EMAIL' && !client.email && <p role="alert" className="mt-2 text-xs text-red-500">Add an email address to the client before sharing by email.</p>}</div>
      <div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><p className={labelClass}>Selected photos & videos ({selected.length})</p><div className="flex gap-3"><button type="button" onClick={() => setValue('selectedMediaIds', media.slice(0, 100).map(item => item.id), { shouldValidate: true })} className="min-h-10 text-[10px] font-bold uppercase text-gold">Select all</button><button type="button" onClick={() => setValue('selectedMediaIds', [])} className="min-h-10 text-[10px] font-bold uppercase text-muted-text">Clear</button></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{media.map((item, index) => <button type="button" key={item.id} aria-pressed={selected.includes(item.id)} aria-label={`Select ${item.category === 'VIDEO' ? 'video' : 'photo'} ${index + 1}`} onClick={() => setValue('selectedMediaIds', selected.includes(item.id) ? selected.filter(id => id !== item.id) : [...selected, item.id], { shouldValidate: true })} className={`relative border text-left ${selected.includes(item.id) ? 'border-gold' : 'border-border'}`}><div className="relative flex aspect-[4/3] items-center justify-center bg-surface-secondary">{item.category === 'PHOTOGRAPH' ? <Image unoptimized src={item.url} alt={item.title || `Property photo ${index + 1}`} fill sizes="(max-width: 640px) 45vw, 180px" className="object-cover" /> : <Film className="h-8 w-8 text-gold" />}{selected.includes(item.id) && <span className="absolute right-2 top-2 bg-gold p-1 text-background"><Check className="h-3.5 w-3.5" /></span>}</div><p className="truncate p-2 text-[10px] font-bold">{item.title || `${item.category === 'VIDEO' ? 'Video' : 'Photo'} ${index + 1}`}</p></button>)}</div>{!media.length && <p className="text-xs text-muted-text">No photos or videos are available. You can still share the property details.</p>}{errors.selectedMediaIds && <p className="mt-1 text-[10px] text-red-500">{errors.selectedMediaIds.message}</p>}<p className="mt-2 text-[10px] text-muted-text">Only normal listing details and these photos/videos appear on the public page.</p></div>
      {channel === 'EMAIL' && <div><label htmlFor="share-subject" className={labelClass}>Email subject</label><input id="share-subject" {...register('subject')} className={`${inputClass} ${errors.subject ? 'border-red-500' : ''}`} />{errors.subject && <p className="text-[10px] text-red-500">{errors.subject.message}</p>}</div>}
      <div><div className="flex items-center justify-between"><label htmlFor="share-message" className={labelClass}>Personal message</label><div className="flex items-center gap-3"><button type="button" onClick={() => void copyDraftMessage()} className="flex min-h-10 items-center gap-1.5 text-[10px] font-bold uppercase text-gold hover:opacity-80 transition">{copiedDraftMessage ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}{copiedDraftMessage ? 'Message copied' : 'Copy message'}</button><button type="button" onClick={() => setValue('message', buildClientPropertyMessage(client.name, shortlist.property, partner, channel), { shouldValidate: true })} className="min-h-10 text-[10px] font-bold uppercase text-gold hover:opacity-80 transition">Reset template</button></div></div><textarea id="share-message" {...register('message')} rows={14} className={`${inputClass} leading-relaxed ${errors.message ? 'border-red-500 focus:border-red-500' : ''}`} />{errors.message && <p className="mt-1 text-[10px] text-red-500">{errors.message.message}</p>}<p className="mt-1 text-[10px] text-muted-text">The property link is filled in when you create it.</p></div>
      <div><label htmlFor="share-expiry" className={labelClass}>Link expiry (optional)</label><input id="share-expiry" type="datetime-local" onChange={event => setValue('expiresAt', event.target.value ? new Date(event.target.value).toISOString() : null, { shouldValidate: true })} className={inputClass} />{errors.expiresAt && <p className="mt-1 text-[10px] text-red-500">{errors.expiresAt.message}</p>}</div>
    </form>}
  </ClientModal>
}
