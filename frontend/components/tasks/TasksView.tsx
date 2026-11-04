'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  List,
  Calendar,
  History,
  Plus,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { useTaskStore } from '../../store/useTaskStore'
import { useRefreshStore } from '../../store/useRefreshStore'
import { TaskListView } from './TaskListView'
import { TaskCalendarView } from './TaskCalendarView'
import { TaskHistoryView } from './TaskHistoryView'
import { TaskFormModal } from './TaskFormModal'
import { TaskDetailModal } from './TaskDetailModal'
import { GoogleCalendarModal } from './GoogleCalendarModal'
import type { Task } from '../../types/task'
import { toast } from '../../utils/toast'

export function TasksView() {
  const {
    stats,
    activeTab,
    setActiveTab,
    loadStats,
    loadTasks,
    loadCalendarTasks,
  } = useTaskStore()
  const refreshTick = useRefreshStore((state) => state.refreshTick)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [initialDateForCreate, setInitialDateForCreate] = useState<string | null>(null)
  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false)

  // Handle return from Google Calendar OAuth
  useEffect(() => {
    const googleSync = searchParams.get('googleSync')
    const email = searchParams.get('email')
    const error = searchParams.get('error')

    if (googleSync === 'connected') {
      toast.success(
        'Google Calendar Connected!',
        `Successfully linked ${email || 'master calendar'} for automated background sync.`
      )
      router.replace(pathname, { scroll: false })
    } else if (error) {
      toast.error('Google Calendar Connection Failed', `Error: ${error}`)
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams, router, pathname])

  useEffect(() => {
    void loadStats()
  }, [loadStats, refreshTick])

  const handleOpenCreateWithDate = (dateIso: string) => {
    setEditingTask(null)
    setInitialDateForCreate(dateIso)
    setFormOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingTask(null)
    setInitialDateForCreate(null)
    setFormOpen(true)
  }

  const handleEdit = (task: Task) => {
    setDetailTask(null)
    setEditingTask(task)
    setInitialDateForCreate(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Task Management</h1>
            <span className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30 rounded-full">
              Operations & Schedule
            </span>
          </div>
          <p className="text-xs text-muted-text mt-1">
            Schedule site visits, client meetings, partner follow-ups, and manage team deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCalendarSyncOpen(true)}
            className="px-3.5 py-2 bg-surface hover:bg-surface-secondary text-foreground border border-border hover:border-gold/50 rounded-xs text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Calendar className="w-4 h-4 text-gold" />
            <span>Google Calendar Sync</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Task
          </button>
        </div>
      </div>

      {/* 4 Metric Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Due Today */}
        <div className="p-3.5 bg-surface border border-border rounded-xs">
          <div className="flex items-center justify-between text-muted-text mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Due Today</span>
            <Clock className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {stats?.dueToday ?? 0}
          </div>
          <div className="text-[10px] text-muted-text mt-0.5">
            {stats?.myDueToday ? `${stats.myDueToday} assigned to you` : 'Daily action queue'}
          </div>
        </div>

        {/* In Progress */}
        <div className="p-3.5 bg-surface border border-border rounded-xs">
          <div className="flex items-center justify-between text-muted-text mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {stats?.inProgress ?? 0}
          </div>
          <div className="text-[10px] text-muted-text mt-0.5">Active field assignments</div>
        </div>

        {/* Completed This Week */}
        <div className="p-3.5 bg-surface border border-border rounded-xs">
          <div className="flex items-center justify-between text-muted-text mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {stats?.completedThisWeek ?? 0}
          </div>
          <div className="text-[10px] text-muted-text mt-0.5">Resolved this week</div>
        </div>

        {/* Overdue */}
        <div className="p-3.5 bg-surface border border-border rounded-xs">
          <div className="flex items-center justify-between text-muted-text mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className={`text-2xl font-black ${(stats?.overdue ?? 0) > 0 ? 'text-red-400' : 'text-foreground'}`}>
            {stats?.overdue ?? 0}
          </div>
          <div className="text-[10px] text-muted-text mt-0.5">Requires immediate attention</div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border bg-surface px-3 py-1.5 rounded-xs">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-xs font-bold rounded-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'list'
              ? 'bg-gold/15 text-gold border border-gold/30 shadow-xs'
              : 'text-muted-text hover:text-foreground hover:bg-surface-secondary'
          }`}
        >
          <List className="w-4 h-4" />
          Task List
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-xs font-bold rounded-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-gold/15 text-gold border border-gold/30 shadow-xs'
              : 'text-muted-text hover:text-foreground hover:bg-surface-secondary'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendar View (Day / Week / Month)
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-gold/15 text-gold border border-gold/30 shadow-xs'
              : 'text-muted-text hover:text-foreground hover:bg-surface-secondary'
          }`}
        >
          <History className="w-4 h-4" />
          Completed Task History
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'list' && (
        <TaskListView
          onOpenCreate={handleOpenCreate}
          onViewTask={(task) => setDetailTask(task)}
          onEditTask={handleEdit}
        />
      )}

      {activeTab === 'calendar' && (
        <TaskCalendarView
          onOpenCreateWithDate={handleOpenCreateWithDate}
          onViewTask={(task) => setDetailTask(task)}
        />
      )}

      {activeTab === 'history' && (
        <TaskHistoryView onViewTask={(task) => setDetailTask(task)} />
      )}

      {/* Modals */}
      <TaskFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        task={editingTask}
        initialDate={initialDateForCreate}
      />

      <TaskDetailModal
        isOpen={Boolean(detailTask)}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        onEdit={handleEdit}
      />

      <GoogleCalendarModal
        isOpen={calendarSyncOpen}
        onClose={() => setCalendarSyncOpen(false)}
      />
    </div>
  )
}
