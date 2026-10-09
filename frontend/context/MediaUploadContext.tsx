'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { generateUploadUrls, uploadFileToR2, attachPropertyMedia, discardPropertyUpload } from '../api/properties'
import { toast } from '../utils/toast'
import type { UploadTask, PropertyMedia, PropertyMediaCategory } from '../types/property'

interface MediaUploadContextType {
  activities: Array<{ id: string; label: string }>
  beginMediaActivity: (label: string) => () => void
  tasks: UploadTask[]
  isUploading: boolean
  overallProgress: number
  activeCount: number
  completedCount: number
  totalCount: number
  startUploadBatch: (
    propertyId: string,
    files: Array<{ file: File; category: PropertyMediaCategory; customKey?: string }>,
    onCompleted?: (media: PropertyMedia[]) => void
  ) => Promise<void>
  cancelTask: (taskId: string) => void
  retryTask: (taskId: string) => void
  clearCompleted: () => void
  forgetMedia: (mediaId: string) => void
  isDockOpen: boolean
  setIsDockOpen: (open: boolean) => void
}

const MediaUploadContext = createContext<MediaUploadContextType | undefined>(undefined)
const CONCURRENCY_LIMIT = 3
const isActive = (task: UploadTask) => ['QUEUED', 'UPLOADING', 'ATTACHING'].includes(task.status)

export function MediaUploadProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Array<{ id: string; label: string }>>([])
  const beginMediaActivity = (label: string) => {
    const id = crypto.randomUUID()
    setActivities((previous) => [...previous, { id, label }])
    setIsDockOpen(true)
    return () => setActivities((previous) => previous.filter((activity) => activity.id !== id))
  }
  const [tasks, setTasks] = useState<UploadTask[]>([])
  const [isDockOpen, setIsDockOpen] = useState(false)
  // Queue mutations happen synchronously in refs, never inside React state updaters.
  const tasksRef = useRef<UploadTask[]>([])
  const running = useRef(new Map<string, AbortController>())
  const callbacks = useRef(new Map<string, (media: PropertyMedia[]) => void>())
  const customKeys = useRef(new Map<string, string | undefined>())
  const attachmentQueues = useRef(new Map<string, Promise<unknown>>())

  const patchTask = useCallback((id: string, patch: Partial<UploadTask>) => {
    tasksRef.current = tasksRef.current.map((task) => task.id === id ? { ...task, ...patch } : task)
    setTasks(tasksRef.current)
  }, [setTasks])

  const executeUpload = async (task: UploadTask, controller: AbortController) => {
    let current = task
    try {
      if (!current.uploaded) {
        // Sign when a queue slot opens, and sign again on retry to avoid expired URLs.
        const { urls } = await generateUploadUrls({
          propertyId: task.propertyId,
          files: [{ filename: task.filename, category: task.category, sizeBytes: task.sizeBytes,
            contentType: task.file.type || 'application/octet-stream', customKey: customKeys.current.get(task.id), existingKey: current.key }],
        })
        if (controller.signal.aborted) return
        const upload = urls[0]
        if (!upload) throw new Error('Could not prepare this upload. Please retry.')
        current = { ...current, key: upload.key, publicUrl: upload.publicUrl, uploadUrl: upload.uploadUrl }
        patchTask(task.id, { key: current.key, publicUrl: current.publicUrl, uploadUrl: current.uploadUrl })
        await uploadFileToR2(upload.uploadUrl, task.file, (progress) => patchTask(task.id, { progress }), controller.signal)
        current.uploaded = true
        patchTask(task.id, { uploaded: true })
      }
      patchTask(task.id, { status: 'ATTACHING', progress: 100 })
      const propertyId = task.propertyId!
      const previous = attachmentQueues.current.get(propertyId) || Promise.resolve()
      const attachment = previous.catch(() => undefined).then(() => attachPropertyMedia(propertyId, [{
        category: task.category, key: current.key!, url: current.publicUrl!,
        mimeType: task.file.type || 'application/octet-stream', sizeBytes: task.sizeBytes,
      }]))
      attachmentQueues.current.set(propertyId, attachment)
      const media = await attachment
      if (attachmentQueues.current.get(propertyId) === attachment) attachmentQueues.current.delete(propertyId)
      patchTask(task.id, { status: 'COMPLETED', progress: 100, attachedMedia: media[0], errorMessage: undefined })
      callbacks.current.get(task.id)?.(media)
      callbacks.current.delete(task.id)
    } catch (error: unknown) {
      if (controller.signal.aborted && current.key && current.propertyId) {
        try { await discardPropertyUpload(current.propertyId, current.key) }
        catch {
          patchTask(task.id, { status: 'ERROR', uploaded: true, errorMessage: 'Upload cancelled, but storage cleanup failed. Discard this file to retry cleanup.' })
        }
      }
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : 'Upload failed. Please retry.'
        patchTask(task.id, { status: 'ERROR', errorMessage: message })
        toast.error('File not saved', `${task.filename}: ${message}`)
      }
    } finally {
      running.current.delete(task.id)
      // Trigger the scheduler even if the last state update rendered before finally.
      setTasks([...tasksRef.current])
    }
  }

  useEffect(() => {
    const queued = tasksRef.current.filter((task) => task.status === 'QUEUED' && !running.current.has(task.id))
    for (const task of queued.slice(0, CONCURRENCY_LIMIT - running.current.size)) {
      const controller = new AbortController()
      running.current.set(task.id, controller)
      patchTask(task.id, { status: 'UPLOADING' })
      void executeUpload(task, controller)
    }
  }, [tasks, patchTask]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warnBeforeReload = (event: BeforeUnloadEvent) => {
      if (tasksRef.current.some(isActive)) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warnBeforeReload)
    return () => window.removeEventListener('beforeunload', warnBeforeReload)
  }, [])

  const startUploadBatch: MediaUploadContextType['startUploadBatch'] = async (propertyId, files, onCompleted) => {
    const newTasks = files.map(({ file, category, customKey }) => {
      const id = crypto.randomUUID()
      if (onCompleted) callbacks.current.set(id, onCompleted)
      customKeys.current.set(id, customKey)
      return { id, file, filename: file.name, category, sizeBytes: file.size,
        progress: 0, status: 'QUEUED' as const, propertyId }
    })
    tasksRef.current = [...tasksRef.current, ...newTasks]
    setTasks(tasksRef.current)
    setIsDockOpen(true)
  }

  const cancelTask = async (id: string) => {
    const task = tasksRef.current.find((item) => item.id === id)
    if (!task || !['QUEUED', 'UPLOADING', 'ERROR'].includes(task.status)) return
    if (task.key && task.propertyId && task.status !== 'UPLOADING') {
      patchTask(id, { status: 'ATTACHING' })
      try { await discardPropertyUpload(task.propertyId, task.key) }
      catch (error) {
        patchTask(id, { status: 'ERROR' })
        toast.error('Could not discard file', error instanceof Error ? error.message : 'Please retry.')
        return
      }
    }
    running.current.get(id)?.abort()
    patchTask(id, { status: 'CANCELLED', progress: 0 })
    callbacks.current.delete(id)
  }
  const retryTask = (id: string) => {
    if (running.current.has(id) || tasksRef.current.find((task) => task.id === id)?.status !== 'ERROR') return
    patchTask(id, { status: 'QUEUED', errorMessage: undefined, progress: 0 })
  }
  const forgetMedia = (mediaId: string) => {
    tasksRef.current = tasksRef.current.filter((task) => task.attachedMedia?.id !== mediaId)
    setTasks(tasksRef.current)
  }
  const clearCompleted = () => {
    for (const task of tasksRef.current.filter((item) => ['COMPLETED', 'CANCELLED'].includes(item.status))) {
      callbacks.current.delete(task.id)
      customKeys.current.delete(task.id)
    }
    tasksRef.current = tasksRef.current.filter((task) => !['COMPLETED', 'CANCELLED'].includes(task.status))
    setTasks(tasksRef.current)
  }
  const activeCount = tasks.filter(isActive).length
  const completedCount = tasks.filter((task) => task.status === 'COMPLETED').length
  const overallProgress = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0

  return <MediaUploadContext.Provider value={{ activities, beginMediaActivity, tasks, isUploading: activeCount > 0, overallProgress,
    activeCount, completedCount, totalCount: tasks.length, startUploadBatch, cancelTask, retryTask,
    clearCompleted, forgetMedia, isDockOpen, setIsDockOpen }}>{children}</MediaUploadContext.Provider>
}

export function useMediaUpload() {
  const context = useContext(MediaUploadContext)
  if (!context) throw new Error('useMediaUpload must be used within a MediaUploadProvider')
  return context
}
