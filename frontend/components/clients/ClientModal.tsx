'use client'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { X, Maximize2, Minimize2, Loader2 } from 'lucide-react'

export const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-40'
export const inputClass = 'w-full border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-gold'
export const labelClass = 'mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-text'
export function ClientModal({ title, onClose, children, footer, busy = false, compact = false }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; busy?: boolean; compact?: boolean }) {
  const titleId = useId(), panel = useRef<HTMLDivElement>(null), closeRef = useRef(onClose)
  const [full, setFull] = useState(false)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    const key = (event: KeyboardEvent) => {
      const modals = document.querySelectorAll('[data-client-modal]')
      if (modals[modals.length - 1] !== panel.current) return
      if (event.key === 'Escape' && !busy) { event.preventDefault(); closeRef.current() }
      if (event.key === 'Tab') {
        const elements = Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]') || []).filter(element => element.getClientRects().length > 0)
        const first = elements[0], last = elements[elements.length - 1]
        if (!first) { event.preventDefault(); return }
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus() }
  }, [busy])
  return <div className="fixed inset-0 z-[75] flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
    <div ref={panel} tabIndex={-1} data-client-modal role="dialog" aria-modal="true" aria-labelledby={titleId} className={`flex w-full flex-col border border-border bg-surface outline-none ${full ? 'h-[96dvh] max-w-[96vw]' : compact ? 'max-h-[92dvh] sm:max-w-sm' : 'max-h-[94dvh] sm:max-w-4xl'}`}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border p-4 sm:px-5"><h2 id={titleId} className="min-w-0 break-words text-sm font-bold uppercase">{title}</h2><div className="flex shrink-0 gap-2">{!compact && <button aria-label="Toggle fullscreen" onClick={() => setFull(!full)} className="border border-border p-2.5">{full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>}<button disabled={busy} aria-label="Close dialog" onClick={onClose} className="border border-border p-2.5"><X className="h-4 w-4" /></button></div></header>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
      {footer && <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border bg-surface-secondary p-4 sm:px-5">{footer}</footer>}
    </div>
  </div>
}
export function ClientError({ message, retry }: { message?: string | null; retry?: () => void }) {
  return message ? <div role="alert" className="mb-4 border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">{message}{retry && <button onClick={retry} className="ml-3 underline">Retry</button>}</div> : null
}
export function ClientLoading({ text = 'Loading...' }: { text?: string }) { return <div role="status" className="flex min-h-40 items-center justify-center gap-2 text-xs text-muted-text"><Loader2 className="h-5 w-5 animate-spin text-gold" />{text}</div> }
export function ClientConfirm({ title, description, onClose, action }: { title: string; description: string; onClose: () => void; action: () => Promise<void> }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null)
  const confirm = async () => {
    setBusy(true); setError(null)
    try { await action(); onClose() } catch (error) { const { getApiErrorMessage } = await import('../../utils/errorHandler'); setError(getApiErrorMessage(error)) } finally { setBusy(false) }
  }
  return <ClientModal compact title={title} onClose={onClose} busy={busy} footer={<><button disabled={busy} onClick={onClose} className={buttonClass}>Cancel</button><button disabled={busy} onClick={() => void confirm()} className={`${buttonClass} text-red-500`}>{busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{busy ? 'Please wait...' : 'Confirm'}</button></>}><p className="mb-4 text-xs leading-relaxed text-muted-text">{description}</p><ClientError message={error} /></ClientModal>
}
