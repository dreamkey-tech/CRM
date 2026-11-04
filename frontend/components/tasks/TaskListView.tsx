'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Calendar,
  Clock,
  Flag,
  Tag,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
} from 'lucide-react'
import { useTaskStore } from '../../store/useTaskStore'
import { useAuthStore } from '../../store/useAuthStore'
import { getClientPartners } from '../../api/clients'
import type { Task, TaskStatus, TaskPriority, TaskCategory } from '../../types/task'
import type { PrimaryContactPartner } from '../../types/broker'
import { toast } from '../../utils/toast'
import { useDebounce } from '../../utils/useDebounce'

interface TaskListViewProps {
  onOpenCreate: () => void
  onViewTask: (task: Task) => void
  onEditTask: (task: Task) => void
}

export function TaskListView({
  onOpenCreate,
  onViewTask,
  onEditTask,
}: TaskListViewProps) {
  const currentUser = useAuthStore((state) => state.user)
  const {
    tasks,
    pagination,
    isLoading,
    loadTasks,
    updateStatus,
    removeTask,
  } = useTaskStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'ALL'>('ALL')
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL')
  const [scope, setScope] = useState<'ALL' | 'MINE'>('ALL')
  const [page, setPage] = useState(1)

  const [partners, setPartners] = useState<PrimaryContactPartner[]>([])

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    getClientPartners()
      .then((p) => setPartners(p || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadTasks({
      page,
      limit: 15,
      search: debouncedSearch,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
      partnerId: partnerFilter === 'ALL' ? undefined : partnerFilter,
      scope,
    })
  }, [page, debouncedSearch, statusFilter, priorityFilter, categoryFilter, partnerFilter, scope, loadTasks])

  const handleQuickStatus = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return
    try {
      await updateStatus(task.id, newStatus)
      toast.success('Status Updated', `Task marked as ${newStatus.replace(/_/g, ' ')}.`)
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return
    try {
      await removeTask(task.id)
      toast.success('Task Deleted', 'Task removed successfully.')
    } catch {
      toast.error('Failed to delete task.')
    }
  }

  const formatDueDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()

    const isOverdue = d < now

    const formattedTime = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (isToday) {
      return {
        label: `Today ${formattedTime}`,
        isOverdue: false,
        isToday: true,
      }
    }

    const formattedDate = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })

    return {
      label: `${formattedDate} • ${formattedTime}`,
      isOverdue,
      isToday: false,
    }
  }

  const categoryLabels: Record<string, string> = {
    CLIENT_MEETING: 'Client Meeting',
    SITE_VISIT: 'Site Visit',
    DOCUMENT_WORK: 'Document Work',
    ADMIN: 'Admin & Ops',
    OTHER: 'Other',
  }

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="p-4 bg-surface border border-border rounded-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by title, partner, client or property..."
              className="w-full bg-background border border-border pl-9 pr-3.5 py-2 text-xs rounded-xs text-foreground placeholder:text-muted-text/50 focus:border-gold focus:outline-hidden transition-colors"
            />
          </div>

          {/* Quick Scope Filter & New Task Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-xs p-0.5 bg-background">
              <button
                onClick={() => {
                  setScope('ALL')
                  setPage(1)
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                  scope === 'ALL'
                    ? 'bg-surface text-gold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                All Team Tasks
              </button>
              <button
                onClick={() => {
                  setScope('MINE')
                  setPage(1)
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                  scope === 'MINE'
                    ? 'bg-surface text-gold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                My Tasks
              </button>
            </div>

            <button
              onClick={onOpenCreate}
              className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Task
            </button>
          </div>
        </div>

        {/* Status Pills & Multi-filter dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'ALL', label: 'All Tasks' },
                { id: 'TODO', label: 'To Do' },
                { id: 'IN_PROGRESS', label: 'In Progress' },
                { id: 'DONE', label: 'Completed' },
                { id: 'CANCELLED', label: 'Cancelled' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id)
                  setPage(1)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st.id
                    ? 'border-gold/50 bg-gold/10 text-gold font-semibold'
                    : 'border-transparent text-muted-text hover:text-foreground hover:bg-surface-secondary'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex items-center gap-2">
            {/* Partner Filter */}
            <select
              value={partnerFilter}
              onChange={(e) => {
                setPartnerFilter(e.target.value)
                setPage(1)
              }}
              className="bg-background border border-border px-2.5 py-1.5 text-xs rounded-xs text-foreground focus:border-gold focus:outline-hidden"
            >
              <option value="ALL">All Partners</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.email}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as TaskCategory | 'ALL')
                setPage(1)
              }}
              className="bg-background border border-border px-2.5 py-1.5 text-xs rounded-xs text-foreground focus:border-gold focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="CLIENT_MEETING">Client Meeting</option>
              <option value="SITE_VISIT">Site Visit</option>
              <option value="DOCUMENT_WORK">Document Work</option>
              <option value="ADMIN">Admin & Ops</option>
              <option value="OTHER">Other Activity</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as TaskPriority | 'ALL')
                setPage(1)
              }}
              className="bg-background border border-border px-2.5 py-1.5 text-xs rounded-xs text-foreground focus:border-gold focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-surface border border-border rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/60 text-muted-text uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Task & Category</th>
                <th className="py-3 px-4 font-semibold">Assigned Partners</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-text">
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border flex items-center justify-center mx-auto text-muted-text">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="text-foreground font-semibold text-sm">No tasks found</div>
                    <p className="text-xs text-muted-text max-w-sm mx-auto">
                      No tasks matched your current filters. Schedule a new task or adjust your search.
                    </p>
                    <button
                      onClick={onOpenCreate}
                      className="px-4 py-2 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-xs text-xs font-semibold transition-colors cursor-pointer"
                    >
                      + Schedule New Task
                    </button>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const dueInfo = formatDueDate(task.dueDate)
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-surface-secondary/40 transition-colors group cursor-pointer"
                      onClick={() => onViewTask(task)}
                    >
                      {/* Title & Category */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                              task.category === 'SITE_VISIT'
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                : task.category === 'CLIENT_MEETING'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : task.category === 'DOCUMENT_WORK'
                                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                : 'bg-surface-secondary text-muted-text border border-border'
                            }`}
                          >
                            {categoryLabels[task.category] || task.category}
                          </span>
                          <span className="font-semibold text-foreground truncate group-hover:text-gold transition-colors">
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-muted-text truncate mt-1">
                            {task.description}
                          </p>
                        )}
                        {(task.client || task.property) && (
                          <div className="flex items-center gap-2 text-[10px] text-muted-text mt-1">
                            {task.client && <span>Client: {task.client.name}</span>}
                            {task.client && task.property && <span>•</span>}
                            {task.property && <span>Property: {task.property.societyBuildingName}</span>}
                          </div>
                        )}
                      </td>

                      {/* Assigned Partners */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <div
                              key={assignee.userId}
                              title={`${assignee.user.name || assignee.user.email} (${assignee.user.email})`}
                              className="w-6 h-6 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-[10px] font-bold text-gold uppercase shadow-xs shrink-0"
                            >
                              {(assignee.user.name || assignee.user.email || 'P')[0]}
                            </div>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-[9px] font-bold text-muted-text shrink-0">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-text mt-0.5 truncate max-w-[130px]">
                          {task.assignees.map((a) => a.user.name || a.user.email.split('@')[0]).join(', ')}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div
                          className={`font-medium flex items-center gap-1.5 ${
                            dueInfo.isOverdue && task.status !== 'DONE'
                              ? 'text-red-400 font-bold'
                              : dueInfo.isToday
                              ? 'text-gold font-bold'
                              : 'text-foreground'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {dueInfo.label}
                        </div>
                        {dueInfo.isOverdue && task.status !== 'DONE' && (
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block mt-0.5">
                            Overdue
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider ${
                            task.priority === 'HIGH'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Status Dropdown Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => handleQuickStatus(task, e.target.value as TaskStatus)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-hidden transition-colors cursor-pointer ${
                            task.status === 'DONE'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : task.status === 'CANCELLED'
                              ? 'bg-red-500/15 text-red-400 border-red-500/30'
                              : 'bg-surface-secondary text-muted-text border-border'
                          }`}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {task.oneClickGoogleUrl && (
                            <a
                              href={task.oneClickGoogleUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Add to Google Calendar"
                              className="p-1.5 text-muted-text hover:text-gold rounded-xs hover:bg-surface-secondary transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onViewTask(task)}
                            title="View Details"
                            className="p-1.5 text-muted-text hover:text-foreground rounded-xs hover:bg-surface-secondary transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTask(task)}
                            title="Edit"
                            className="p-1.5 text-muted-text hover:text-gold rounded-xs hover:bg-surface-secondary transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task)}
                            title="Delete"
                            className="p-1.5 text-muted-text hover:text-red-400 rounded-xs hover:bg-surface-secondary transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-text">
            <span>
              Showing {tasks.length} of {pagination.total} tasks
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
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
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
