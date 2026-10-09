import { create } from 'zustand'
import axios from 'axios'
import { clientDocumentFormSchema } from '../zod/client'
import { requestClientDocumentUpload, attachClientDocument, discardClientDocumentUpload } from '../api/clients'
import { useClientStore } from './useClientStore'
import { useAuthStore } from './useAuthStore'
import { getApiErrorMessage } from '../utils/errorHandler'
import type { ClientDocumentCategory, ClientDocumentUploadMetadata } from '../types/client'
import type { ClientDetail } from '../types/client'
import { getClientDocumentRule } from '../config/media-config'

export interface ClientDocumentTask {
  id: string; clientId: string; filename: string; progress: number
  state: 'QUEUED' | 'UPLOADING' | 'SAVING' | 'DONE' | 'FAILED'
  error?: string
}
interface UploadState {
  tasks: ClientDocumentTask[]
  enqueue: (clientId: string, files: File[], category: ClientDocumentCategory, title: string) => string[]
  retry: (id: string) => void
  discard: (id: string) => Promise<void>
  clearDone: () => void
}
const filesById = new Map<string, { file: File; metadata: ClientDocumentUploadMetadata; key?: string; uploaded: boolean }>()
const controllers = new Map<string, AbortController>()
let running = 0, epoch = 0
function change(id: string, value: Partial<ClientDocumentTask>) { useClientDocumentStore.setState(state => ({ tasks: state.tasks.map(task => task.id === id ? { ...task, ...value } : task) })) }
async function processTask(task: ClientDocumentTask) {
  const file = filesById.get(task.id)
  if (!file) return
  const generation = epoch, controller = new AbortController()
  controllers.set(task.id, controller); running++
  try {
    change(task.id, { state: file.uploaded ? 'SAVING' : 'UPLOADING', error: undefined })
    if (!file.uploaded) {
      // A failed PUT gets a new key; clean up the previous attempted object first.
      if (file.key) { await discardClientDocumentUpload(task.clientId, file.key); file.key = undefined }
      const signed = await requestClientDocumentUpload(task.clientId, file.metadata)
      if (generation !== epoch) return
      file.key = signed.key
      await axios.put(signed.uploadUrl, file.file, { signal: controller.signal, headers: { 'Content-Type': file.metadata.mimeType }, withCredentials: false, timeout: 120000,
        onUploadProgress: event => { if (generation === epoch) change(task.id, { progress: Math.min(99, Math.round((event.loaded / (event.total || file.file.size)) * 100)) }) },
      })
      file.uploaded = true
    }
    if (generation !== epoch) return
    change(task.id, { state: 'SAVING', progress: 99 })
    const document = await attachClientDocument(task.clientId, { ...file.metadata, key: file.key! })
    if (generation !== epoch) return
    useClientStore.getState().documentChanged(task.clientId, document)
    change(task.id, { state: 'DONE', progress: 100 })
    filesById.delete(task.id)
  } catch (error) {
    if (generation === epoch) change(task.id, { state: 'FAILED', error: getApiErrorMessage(error) })
  } finally {
    controllers.delete(task.id)
    if (generation === epoch) { running--; pump() }
  }
}
function pump() {
  for (const task of useClientDocumentStore.getState().tasks.filter(task => task.state === 'QUEUED')) {
    if (running >= 3) break
    // State is changed synchronously before the first await in processTask.
    void processTask(task)
  }
}
export const useClientDocumentStore = create<UploadState>((set) => ({
  tasks: [],
  enqueue: (clientId, files, category, title) => {
    const errors: string[] = [], tasks: ClientDocumentTask[] = []
    const rule = getClientDocumentRule(category)
    const detail = useClientStore.getState().cache[`detail:${clientId}`]?.data as ClientDetail | undefined
    const saved = detail?.documents.filter(document => document.category === category).length || 0
    const pending = useClientDocumentStore.getState().tasks.filter(task => task.clientId === clientId && task.state !== 'DONE' && filesById.get(task.id)?.metadata.category === category).length
    for (const file of files) {
      if (rule.maxCount > 0 && saved + pending + tasks.length >= rule.maxCount) { errors.push(`${file.name}: ${rule.label} allows ${rule.maxCount} file(s). Remove an existing document first.`); continue }
      const parsed = clientDocumentFormSchema.safeParse({ category, title, originalName: file.name, mimeType: file.type, sizeBytes: file.size })
      if (!parsed.success) { errors.push(`${file.name}: ${parsed.error.issues[0].message}`); continue }
      const id = crypto.randomUUID()
      filesById.set(id, { file, metadata: parsed.data, uploaded: false })
      tasks.push({ id, clientId, filename: file.name, progress: 0, state: 'QUEUED' })
    }
    set(state => ({ tasks: [...state.tasks, ...tasks] }))
    pump()
    return errors
  },
  retry: id => { change(id, { state: 'QUEUED', error: undefined, progress: 0 }); pump() },
  discard: async id => {
    const task = useClientDocumentStore.getState().tasks.find(item => item.id === id), file = filesById.get(id)
    if (!task || ['UPLOADING', 'SAVING'].includes(task.state)) return
    if (file?.key) await discardClientDocumentUpload(task.clientId, file.key)
    filesById.delete(id); set(state => ({ tasks: state.tasks.filter(item => item.id !== id) }))
  },
  clearDone: () => set(state => ({ tasks: state.tasks.filter(task => task.state !== 'DONE') })),
}))
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id === previous.user?.id) return
  epoch++; running = 0
  for (const controller of controllers.values()) controller.abort()
  controllers.clear(); filesById.clear(); useClientDocumentStore.setState({ tasks: [] })
})
