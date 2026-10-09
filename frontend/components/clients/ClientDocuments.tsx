'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, UploadCloud, Loader2, Trash2, Download, Eye } from 'lucide-react'
import { CLIENT_MEDIA_CONFIG } from '../../config/media-config'
import { clientDocumentUploadOptionsSchema, type ClientDocumentUploadOptions } from '../../zod/client'
import { useClientDocumentStore } from '../../store/useClientDocumentStore'
import { useClientStore } from '../../store/useClientStore'
import { deleteClientDocument, getClientDocumentDownload } from '../../api/clients'
import { getApiErrorMessage } from '../../utils/errorHandler'
import { toast } from '../../utils/toast'
import type { ClientDetail, ClientDocument } from '../../types/client'
import { ClientError, ClientConfirm, inputClass, labelClass, buttonClass } from './ClientModal'

export function ClientDocuments({ client }: { client: ClientDetail }) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null), [deleting, setDeleting] = useState<ClientDocument | null>(null), [opening, setOpening] = useState<string | null>(null), [dragging, setDragging] = useState(false)
  const tasks = useClientDocumentStore(state => state.tasks), enqueue = useClientDocumentStore(state => state.enqueue)
  const form = useForm<ClientDocumentUploadOptions>({ resolver: zodResolver(clientDocumentUploadOptionsSchema), mode: 'onTouched', defaultValues: { category: 'AADHAAR', title: '' } })
  const category = useWatch({ control: form.control, name: 'category' })
  const rule = CLIENT_MEDIA_CONFIG.client.documents.find(item => item.category === category)!
  const clientTasks = tasks.filter(task => task.clientId === client.id)
  const active = clientTasks.some(task => ['QUEUED', 'UPLOADING', 'SAVING'].includes(task.state))
  useEffect(() => {
    if (!active) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
  const upload = (files: File[]) => {
    setError(null)
    void form.handleSubmit(values => {
      const failures = enqueue(client.id, files, values.category, values.title)
      if (failures.length) setError(failures.join('\n'))
    })()
  }
  const open = async (document: ClientDocument, inline: boolean) => {
    const tab = window.open('about:blank', '_blank')
    if (tab) tab.opener = null
    setOpening(document.id)
    try { const url = await getClientDocumentDownload(client.id, document.id, inline); if (tab) tab.location.replace(url); else toast.error('Allow pop-ups to open the document.') }
    catch (error) { tab?.close(); toast.error('Unable to open document', getApiErrorMessage(error)) }
    finally { setOpening(null) }
  }
  return <div className="space-y-4"><ClientError message={error} /><form onSubmit={event => event.preventDefault()} className="space-y-3"><div className="flex flex-wrap gap-2">{CLIENT_MEDIA_CONFIG.client.documents.map(rule => <button type="button" key={rule.category} aria-pressed={category === rule.category} onClick={() => form.setValue('category', rule.category, { shouldValidate: true })} className={`${buttonClass} ${category === rule.category ? 'bg-foreground text-background' : ''}`}>{rule.label}</button>)}</div><div><label htmlFor="client-document-title" className={labelClass}>Document title (optional)</label><input id="client-document-title" {...form.register('title')} className={`${inputClass} ${form.formState.errors.title ? 'border-red-500' : ''}`} placeholder="For example, Aadhaar front and back" />{form.formState.errors.title && <p className="mt-1 text-[10px] text-red-500">{form.formState.errors.title.message}</p>}</div>
    <input ref={input} aria-label="Upload client documents" type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={event => { upload(Array.from(event.target.files || [])); event.target.value = '' }} />
    <button type="button" onClick={() => input.current?.click()} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); upload(Array.from(event.dataTransfer.files)) }} className={`flex min-h-36 w-full flex-col items-center justify-center gap-2 border border-dashed p-5 text-center ${dragging ? 'border-gold bg-gold/5' : 'border-border'}`}><UploadCloud className="h-7 w-7 text-gold" /><span className="text-xs font-bold uppercase">Upload {CLIENT_MEDIA_CONFIG.client.documents.find(rule => rule.category === category)?.label}</span><span className="text-[10px] text-muted-text">Choose files or drop them here · PDF, JPEG, PNG, WebP · {rule.maxMb} MB each · {rule.maxCount === 0 ? 'Unlimited files' : `Up to ${rule.maxCount} file(s)`}</span></button></form>
    {clientTasks.length > 0 && <div className="divide-y divide-border border border-border">{clientTasks.map(task => <div key={task.id} className="p-3"><div className="flex items-center justify-between gap-3"><p className="min-w-0 truncate text-xs">{task.filename}</p><span className="shrink-0 text-[9px] font-bold uppercase text-muted-text">{task.state === 'UPLOADING' ? `${task.progress}%` : task.state === 'SAVING' ? 'Saving...' : task.state}</span></div><div className="mt-2 h-1 bg-border"><div style={{ width: `${task.progress}%` }} className="h-full bg-gold transition-[width]" /></div>{task.error && <p className="mt-2 text-[10px] text-red-500">{task.error}</p>}{task.state === 'FAILED' && <div className="mt-2 flex gap-2"><button onClick={() => useClientDocumentStore.getState().retry(task.id)} className={buttonClass}>Retry</button><button onClick={() => void useClientDocumentStore.getState().discard(task.id).catch(error => toast.error('Unable to discard upload', getApiErrorMessage(error)))} className={buttonClass}>Discard</button></div>}</div>)}</div>}
    <p className="text-[10px] text-muted-text">Client documents are available to signed-in CRM partners and are never included in property shares.</p>
    <div className="divide-y divide-border border border-border">{client.documents.filter(document => document.category === category).map(document => <div key={document.id} className="flex flex-wrap items-center gap-3 p-3"><FileText className="h-5 w-5 shrink-0 text-gold" /><div className="min-w-0 flex-1"><p className="break-words text-xs font-bold">{document.title || document.originalName}</p><p className="mt-1 text-[10px] text-muted-text">{(document.sizeBytes / 1024 / 1024).toFixed(2)} MB · {document.uploadedBy?.name || 'Partner'} · {new Date(document.createdAt).toLocaleDateString('en-IN')}</p></div><div className="flex gap-1"><button aria-label={`Preview ${document.originalName}`} disabled={opening === document.id} onClick={() => void open(document, true)} className="p-3 text-muted-text hover:text-gold">{opening === document.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}</button><button aria-label={`Download ${document.originalName}`} disabled={opening === document.id} onClick={() => void open(document, false)} className="p-3 text-muted-text hover:text-gold"><Download className="h-4 w-4" /></button><button aria-label={`Delete ${document.originalName}`} onClick={() => setDeleting(document)} className="p-3 text-muted-text hover:text-red-500"><Trash2 className="h-4 w-4" /></button></div></div>)}{!client.documents.some(document => document.category === category) && <p className="p-6 text-center text-xs text-muted-text">No documents in this category yet.</p>}</div>
    {deleting && <ClientConfirm title="Delete document?" description={`Remove ${deleting.title || deleting.originalName} from the client and storage?`} onClose={() => setDeleting(null)} action={async () => { await deleteClientDocument(client.id, deleting.id); useClientStore.getState().documentChanged(client.id, deleting.id); toast.success('Document deleted') }} />}
  </div>
}
