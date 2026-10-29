'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Laptop,
} from 'lucide-react'
import { listAuditLogsApi, getAuditStatsApi } from '../../api/organization'
import { toast } from '../../utils/toast'
import type { AuditLogItem, AuditStats } from '../../types/organization'

export function AuditLogsTabContent() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'DENIED'>('ALL')

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const [logsRes, statsRes] = await Promise.all([
        listAuditLogsApi({
          search: search.trim() || undefined,
          module: moduleFilter === 'ALL' ? undefined : moduleFilter,
          status: statusFilter,
        }),
        getAuditStatsApi(),
      ])

      if (logsRes.success) setLogs(logsRes.logs)
      if (statsRes.success) setStats(statsRes.stats)
    } catch {
      toast.error('Audit Load Failed', 'Could not fetch system audit stream.')
    } finally {
      setLoading(false)
    }
  }, [search, moduleFilter, statusFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards in a Seamless Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-gold" />
            Total Activity Logs
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-foreground">
            {stats ? stats.totalLogs.toLocaleString() : '—'}
          </span>
          <p className="text-[10px] text-muted-text">Recorded employee actions</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-blue-400" />
            Actions Today
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-foreground">
            {stats ? stats.actionsToday.toLocaleString() : '—'}
          </span>
          <p className="text-[10px] text-muted-text">Logged since 12:00 AM</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            Security Denials
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-red-500">
            {stats ? stats.securityDenials.toLocaleString() : '—'}
          </span>
          <p className="text-[10px] text-muted-text">Unauthorized access blocked</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-green-500" />
            Confidential Views
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-green-500">
            {stats ? stats.sensitiveDocViews.toLocaleString() : '—'}
          </span>
          <p className="text-[10px] text-muted-text">Aadhaar, KYC & Doc downloads</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-surface border border-border">
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch border-b border-border">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee, action, details, IP, or record..."
              className="w-full pl-10 pr-4 py-3 bg-transparent text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center border-t sm:border-t-0 sm:border-l border-border">
            <button
              onClick={() => fetchLogs()}
              className="h-full px-4 py-2.5 flex items-center gap-1.5 text-muted-text hover:text-foreground text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-surface-secondary text-[9px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span className="text-muted-text mr-1">Status:</span>
            {(['ALL', 'SUCCESS', 'DENIED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-0.5 transition-colors ${
                  statusFilter === s ? 'bg-foreground text-background' : 'text-muted-text hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="w-px h-3.5 bg-border hidden sm:block" />

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <span className="text-muted-text mr-1">Module:</span>
            {['ALL', 'EMPLOYEES', 'DOCUMENTS', 'BROKERS', 'PROPERTIES', 'CLIENTS', 'OWNERS', 'FINANCE'].map(
              (m) => (
                <button
                  key={m}
                  onClick={() => setModuleFilter(m)}
                  className={`px-2 py-0.5 transition-colors whitespace-nowrap ${
                    moduleFilter === m ? 'bg-foreground text-background' : 'text-muted-text hover:text-foreground'
                  }`}
                >
                  {m}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-surface border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Timestamp (IST)
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Actor / Employee
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Action & Module
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Details & Target Resource
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                IP Address
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-muted-text">
                  Loading activity stream...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-muted-text">
                  No audit logs matching query criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isDenied = log.status === 'DENIED'
                const formattedDate = new Date(log.createdAt).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })

                return (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      isDenied ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-surface-secondary/50'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-xs font-mono text-muted-text whitespace-nowrap">
                      {formattedDate}
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4">
                      {log.actor ? (
                        <div>
                          <div className="font-bold text-xs text-foreground">{log.actor.name}</div>
                          <div className="text-[10px] text-muted-text font-mono">{log.actor.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-text italic">System / Anonymous</span>
                      )}
                    </td>

                    {/* Action & Module */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                            isDenied
                              ? 'border-red-500/50 text-red-500 bg-red-500/10'
                              : 'border-border bg-surface-secondary text-foreground'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-[9px] font-mono text-muted-text uppercase">
                          [{log.module}]
                        </span>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-xs text-foreground max-w-md">
                      <p className="line-clamp-2">{log.details || log.resourceName || '—'}</p>
                    </td>

                    {/* IP Address */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-muted-text">
                        <Laptop className="w-3 h-3 text-muted-text/60" />
                        {log.ipAddress || '127.0.0.1'}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-right">
                      {isDenied ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-red-500 border border-red-500/40 bg-red-500/10">
                          <XCircle className="w-2.5 h-2.5" />
                          DENIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-green-500 border border-green-500/40 bg-green-500/10">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          SUCCESS
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
