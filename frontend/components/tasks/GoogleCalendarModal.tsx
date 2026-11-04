'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  RefreshCw,
  Unplug,
  X,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import {
  getCalendarSyncStatus,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
} from '../../api/tasks'
import type { CalendarSyncStatus } from '../../types/task'
import { toast } from '../../utils/toast'

interface GoogleCalendarModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GoogleCalendarModal({ isOpen, onClose }: GoogleCalendarModalProps) {
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const s = await getCalendarSyncStatus()
      setSyncStatus(s)
    } catch {
      toast.error('Failed to load Google Calendar sync status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setConfirmDisconnect(false)
      void fetchStatus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConnectMaster = async () => {
    try {
      setConnecting(true)
      const res = await connectGoogleCalendar()
      if (res?.url) {
        window.location.href = res.url
      } else {
        toast.error('Could not generate Google authorization link')
      }
    } catch (err: any) {
      toast.error(
        'Connection Error',
        err?.response?.data?.error || err.message || 'Failed to initiate Google authorization'
      )
    } finally {
      setConnecting(false)
    }
  }

  const handleConfirmDisconnect = async () => {
    try {
      setDisconnecting(true)
      await disconnectGoogleCalendar()
      toast.success('Disconnected', 'Google Calendar sync has been disabled.')
      setConfirmDisconnect(false)
      await fetchStatus()
    } catch {
      toast.error('Failed to disconnect calendar')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleCopyFeed = async () => {
    if (!syncStatus?.myFeedUrl) return
    try {
      await navigator.clipboard.writeText(syncStatus.myFeedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Feed Link Copied', 'Paste this URL into your phone or calendar app.')
    } catch {
      toast.error('Failed to copy feed URL')
    }
  }

  const isConnected = Boolean(syncStatus?.hasRefreshToken && syncStatus?.syncEnabled)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-surface border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-secondary/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Google Calendar Sync
              </h3>
              <p className="text-[11px] text-muted-text">
                Automatic task & visit reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-text hover:text-foreground transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-text text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-gold" />
              <span>Checking calendar connection...</span>
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              {/* Connected Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Calendar Connected</span>
                </div>
                <div className="text-xs text-foreground font-mono">
                  {syncStatus?.connectedEmail}
                </div>
                <p className="text-[11px] text-muted-text leading-relaxed">
                  CRM tasks, site visits, and scheduled reminders automatically sync with this Google Calendar.
                </p>
              </div>

              {/* Confirmation or Action Buttons */}
              {confirmDisconnect ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xs space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Disconnect Google Calendar?
                      </div>
                      <p className="text-[11px] text-muted-text mt-0.5 leading-relaxed">
                        New tasks and scheduled visits will no longer sync to{' '}
                        <span className="font-mono text-foreground font-semibold">
                          {syncStatus?.connectedEmail}
                        </span>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={disconnecting}
                      onClick={() => setConfirmDisconnect(false)}
                      className="px-3 py-1.5 border border-border text-[11px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={disconnecting}
                      onClick={handleConfirmDisconnect}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {disconnecting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <Unplug className="w-3 h-3" />
                          Yes, Disconnect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDisconnect(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unplug className="w-3.5 h-3.5" />
                    Disconnect
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-foreground text-background hover:bg-gold hover:text-foreground text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-center py-1">
              <p className="text-xs text-muted-text leading-relaxed">
                Connect your Google account so scheduled tasks, meetings, and site visits automatically sync with Google Calendar and notify team members on their phone.
              </p>

              {/* Primary Connect Button */}
              <button
                type="button"
                onClick={handleConnectMaster}
                disabled={connecting}
                className="w-full py-3 px-4 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Connect Google Calendar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-muted-text">
                One-click authorization. No complex setup or manual calendar URLs required.
              </p>
            </div>
          )}

          {/* Quick Apple Calendar / Phone Feed Copy Link */}
          {syncStatus?.myFeedUrl && (
            <div className="pt-3.5 border-t border-border flex items-center justify-between text-[11px] text-muted-text">
              <span>Apple Calendar / Outlook feed:</span>
              <button
                type="button"
                onClick={handleCopyFeed}
                className="text-gold hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Link Copied' : 'Copy Feed Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
