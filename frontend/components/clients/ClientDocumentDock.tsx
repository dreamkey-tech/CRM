'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { Loader2, FileText, X } from 'lucide-react'
import { useClientDocumentStore } from '../../store/useClientDocumentStore'

export function ClientDocumentDock() {
  const tasks = useClientDocumentStore(state => state.tasks), clear = useClientDocumentStore(state => state.clearDone)
  const active = tasks.filter(task => ['QUEUED', 'UPLOADING', 'SAVING'].includes(task.state)), failed = tasks.filter(task => task.state === 'FAILED')
  useEffect(() => {
    if (!active.length) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active.length])
  if (!tasks.length) return null
  const first = active[0] || failed[0] || tasks[tasks.length - 1]
  return <aside aria-live="polite" className="fixed bottom-4 left-3 z-[90] w-[min(320px,calc(100vw-24px))] border border-border bg-surface p-3 shadow-xl"><div className="flex items-center gap-2">{active.length ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <FileText className="h-4 w-4 text-gold" />}<p className="flex-1 text-[10px] font-bold uppercase">{active.length ? `Uploading ${active.length} client document(s)` : failed.length ? `${failed.length} document(s) need attention` : 'Client documents saved'}</p>{!active.length && !failed.length && <button aria-label="Dismiss upload progress" onClick={clear} className="p-2"><X className="h-3.5 w-3.5" /></button>}</div><Link href={`/dashboard/clients?clientId=${first.clientId}&tab=documents`} className="mt-2 block truncate text-[10px] text-muted-text hover:text-gold">{first.filename} · View documents</Link>{active.length > 0 && <div className="mt-2 h-1 bg-border"><div className="h-full bg-gold transition-[width]" style={{ width: `${Math.round(active.reduce((sum, task) => sum + task.progress, 0) / active.length)}%` }} /></div>}</aside>
}
