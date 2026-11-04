'use client'

import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  ShieldCheck,
  Building,
} from 'lucide-react'
import { useTaskStore } from '../../store/useTaskStore'
import { getClientPartners } from '../../api/clients'
import type { Task, TaskHistoryItem } from '../../types/task'
import type { PrimaryContactPartner } from '../../types/broker'
import { toast } from '../../utils/toast'

interface TaskHistoryViewProps {
  onViewTask: (task: Task) => void
}

export function TaskHistoryView({ onViewTask }: TaskHistoryViewProps) {
  const {
    history,
    historyPagination,
    historyLoading,
    loadHistory,
    updateStatus,
  } = useTaskStore()

  const [partnerFilter, setPartnerFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [partners, setPartners] = useState<PrimaryContactPartner[]>([])

  useEffect(() => {
    getClientPartners()
      .then((p) => setPartners(p || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadHistory(page, partnerFilter)
  }, [page, partnerFilter, loadHistory])

  const handleReopen = async (task: TaskHistoryItem) => {
    try {
      await updateStatus(task.id, 'IN_PROGRESS')
      toast.success('Task Reopened', `"${task.title}" has been moved back to In Progress.`)
      void loadHistory(page, partnerFilter)
    } catch {
      toast.error('Failed to reopen task.')
    }
  }

  const formatDuration = (ms: number | null) => {
    if (!ms || ms <= 0) return 'Immediate'
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h`
    const mins = Math.floor(ms / (1000 * 60))
    return `${Math.max(1, mins)}m`
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="p-4 bg-surface border border-border rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Completed Task History
          </h3>
          <p className="text-xs text-muted-text">
            Audit history tracking exact completion timestamps, turnaround times, and partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={partnerFilter}
            onChange={(e) => {
              setPartnerFilter(e.target.value)
              setPage(1)
            }}
            className="bg-background border border-border px-3 py-1.5 text-xs rounded-xs text-foreground focus:border-gold focus:outline-hidden"
          >
            <option value="ALL">All Partners</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Completed History Table */}
      <div className="bg-surface border border-border rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/60 text-muted-text uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Completed Task</th>
                <th className="py-3 px-4 font-semibold">Completed Timestamp</th>
                <th className="py-3 px-4 font-semibold">Completed By</th>
                <th className="py-3 px-4 font-semibold">Turnaround</th>
                <th className="py-3 px-4 font-semibold">Timeline Accuracy</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {historyLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-text">
                    Loading completed history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-muted-text mx-auto" />
                    <div className="text-foreground font-semibold">No completed tasks recorded yet</div>
                    <p className="text-xs text-muted-text">
                      Completed tasks will appear here with completion timestamp and performance metrics.
                    </p>
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-secondary/40 transition-colors group cursor-pointer"
                    onClick={() => onViewTask(item)}
                  >
                    {/* Task Title & Category */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-foreground truncate group-hover:text-gold transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-muted-text flex items-center gap-1.5 mt-0.5">
                        <span className="uppercase font-bold text-muted-text/80">
                          {item.category.replace(/_/g, ' ')}
                        </span>
                        {item.property && (
                          <>
                            <span>•</span>
                            <span className="truncate">{item.property.societyBuildingName}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Completion Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.completedAt ? (
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            {new Date(item.completedAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-[10px] text-muted-text">
                            {new Date(item.completedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-text">—</span>
                      )}
                    </td>

                    {/* Completed By */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-400 uppercase">
                          {(item.completedBy?.name || item.completedBy?.email || 'P')[0]}
                        </div>
                        <span className="font-medium text-foreground">
                          {item.completedBy?.name || item.completedBy?.email || 'Partner'}
                        </span>
                      </div>
                    </td>

                    {/* Turnaround Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-muted-text">
                      {formatDuration(item.timeToCompleteMs)}
                    </td>

                    {/* Timeline Accuracy */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.isOverdue ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wider">
                          Completed Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                          On Time
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewTask(item)}
                          className="p-1.5 text-muted-text hover:text-foreground rounded-xs hover:bg-surface-secondary transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReopen(item)}
                          className="px-2.5 py-1 text-[11px] font-medium text-muted-text hover:text-gold border border-border hover:border-gold/40 rounded-xs hover:bg-surface-secondary transition-all flex items-center gap-1 cursor-pointer"
                          title="Reopen Task"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reopen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {historyPagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-text">
            <span>
              Showing {history.length} of {historyPagination.total} completed records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-xs border border-border hover:bg-surface-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-foreground px-2">
                Page {page} of {historyPagination.totalPages}
              </span>
              <button
                disabled={page >= historyPagination.totalPages}
                onClick={() => setPage((p) => Math.min(historyPagination.totalPages, p + 1))}
                className="p-1.5 rounded-xs border border-border hover:bg-surface-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
