'use client'

import React, { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  Flag,
  Tag,
  UserCheck,
  Building,
  User,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Phone,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { useTaskStore } from '../../store/useTaskStore'
import { toast } from '../../utils/toast'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onEdit: (task: Task) => void
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
}: TaskDetailModalProps) {
  const { updateStatus, removeTask } = useTaskStore()
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!isOpen || !task) return null

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      setUpdatingStatus(true)
      await updateStatus(task.id, newStatus)
      toast.success('Status Updated', `Task marked as ${newStatus.replace(/_/g, ' ')}.`)
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return
    try {
      setDeleting(true)
      await removeTask(task.id)
      toast.success('Task Deleted', 'The task and its reminders were removed.')
      onClose()
    } catch {
      toast.error('Failed to delete task.')
    } finally {
      setDeleting(false)
    }
  }

  const categoryLabels: Record<string, string> = {
    CLIENT_MEETING: 'Client Meeting',
    SITE_VISIT: 'Site Visit',
    DOCUMENT_WORK: 'Document Work',
    ADMIN: 'Admin & Ops',
    OTHER: 'General Task',
  }

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    TODO: { label: 'To Do', bg: 'bg-muted-text/10', text: 'text-muted-text' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-500/15', text: 'text-blue-400' },
    DONE: { label: 'Completed', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-500/15', text: 'text-red-400' },
  }

  const currentBadge = statusBadges[task.status] || statusBadges.TODO

  const isDueSoonOrOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-secondary/50">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${currentBadge.bg} ${currentBadge.text}`}
            >
              {currentBadge.label}
            </span>
            <span className="text-xs text-muted-text font-medium">
              {categoryLabels[task.category] || task.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose()
                onEdit(task)
              }}
              className="p-2 text-muted-text hover:text-gold rounded-sm hover:bg-surface transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-muted-text hover:text-red-400 rounded-sm hover:bg-surface transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-text hover:text-foreground rounded-sm hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Title & Priority */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground leading-snug">{task.title}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-xs shrink-0 uppercase tracking-wider ${
                  task.priority === 'HIGH'
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : task.priority === 'MEDIUM'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {task.priority} Priority
              </span>
            </div>
            {task.description && (
              <p className="text-xs text-muted-text mt-2 whitespace-pre-wrap leading-relaxed bg-surface-secondary/40 p-3 rounded-xs border border-border">
                {task.description}
              </p>
            )}
          </div>

          {/* Quick Schedule & Google Calendar Action */}
          <div className="p-4 rounded-sm border border-border bg-surface-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xs border flex items-center justify-center shrink-0 ${
                  isDueSoonOrOverdue
                    ? 'border-red-500/40 bg-red-500/10 text-red-400'
                    : 'border-gold/30 bg-gold/10 text-gold'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-text">Scheduled Due Date</div>
                <div className="text-xs font-bold text-foreground">
                  {new Date(task.dueDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isDueSoonOrOverdue && (
                    <span className="ml-2 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>

            {task.oneClickGoogleUrl && (
              <a
                href={task.oneClickGoogleUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-xs text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Add to Google Calendar
              </a>
            )}
          </div>

          {/* Assigned Partners */}
          <div>
            <h4 className="text-xs font-bold text-muted-text uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-gold" />
              Assigned Partners ({task.assignees.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {task.assignees.map((assignee) => (
                <div
                  key={assignee.userId}
                  className="flex items-center gap-2.5 p-2.5 rounded-xs border border-border bg-surface-secondary/30"
                >
                  <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xs font-bold text-gold uppercase shrink-0">
                    {(assignee.user.name || assignee.user.email || 'P')[0]}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-foreground truncate">
                      {assignee.user.name || assignee.user.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-muted-text truncate">{assignee.user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Client or Property */}
          {(task.client || task.property) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {task.client && (
                <div className="p-3 rounded-xs border border-border bg-surface-secondary/40 space-y-1">
                  <div className="text-[10px] font-bold text-muted-text uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-gold" />
                    Linked Client
                  </div>
                  <div className="text-xs font-semibold text-foreground">{task.client.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-text">
                    <Phone className="w-3 h-3 text-gold" />
                    <a href={`tel:${task.client.phone}`} className="hover:text-gold transition-colors">
                      {task.client.phone}
                    </a>
                  </div>
                </div>
              )}

              {task.property && (
                <div className="p-3 rounded-xs border border-border bg-surface-secondary/40 space-y-1">
                  <div className="text-[10px] font-bold text-muted-text uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-3 h-3 text-gold" />
                    Linked Property
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {task.property.societyBuildingName}
                  </div>
                  <div className="text-xs text-muted-text">
                    {task.property.locationArea}, {task.property.city}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FR-TK-07: Completion History Spotlight */}
          {task.status === 'DONE' && task.completedAt && (
            <div className="p-3.5 rounded-xs border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Completed Task Record
              </div>
              <p className="text-xs text-muted-text">
                Completed on{' '}
                <strong className="text-foreground">
                  {new Date(task.completedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>{' '}
                by <strong className="text-foreground">{task.completedBy?.name || 'Partner'}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer Quick Status Actions */}
        <div className="px-6 py-3 border-t border-border bg-surface-secondary flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-xs text-muted-text">
            Created by <span className="text-foreground">{task.createdBy?.name || 'Partner'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={updatingStatus}
                className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 rounded-xs font-medium transition-colors cursor-pointer"
              >
                Mark In Progress
              </button>
            )}

            {task.status !== 'DONE' ? (
              <button
                onClick={() => handleStatusChange('DONE')}
                disabled={updatingStatus}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                Mark as Done
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('TODO')}
                disabled={updatingStatus}
                className="px-3 py-1.5 bg-surface hover:bg-surface-secondary text-muted-text hover:text-foreground border border-border rounded-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
