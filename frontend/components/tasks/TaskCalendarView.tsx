'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  UserCheck,
  Building,
  User,
  Filter,
} from 'lucide-react'
import { useTaskStore } from '../../store/useTaskStore'
import { useAuthStore } from '../../store/useAuthStore'
import { getClientPartners } from '../../api/clients'
import type { Task, TaskCategory } from '../../types/task'
import type { PrimaryContactPartner } from '../../types/broker'

interface TaskCalendarViewProps {
  onOpenCreateWithDate: (dateIso: string) => void
  onViewTask: (task: Task) => void
}

export function TaskCalendarView({
  onOpenCreateWithDate,
  onViewTask,
}: TaskCalendarViewProps) {
  const currentUser = useAuthStore((state) => state.user)
  const {
    calendarTasks,
    calendarLoading,
    loadCalendarTasks,
    calendarViewMode,
    setCalendarViewMode,
    selectedPartnerFilter,
    setSelectedPartnerFilter,
  } = useTaskStore()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [partners, setPartners] = useState<PrimaryContactPartner[]>([])

  useEffect(() => {
    getClientPartners()
      .then((p) => setPartners(p || []))
      .catch(() => {})
  }, [])

  // Calculate start and end date for fetching based on view
  useEffect(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()

    let start: Date
    let end: Date

    if (calendarViewMode === 'month') {
      start = new Date(y, m - 1, 20)
      end = new Date(y, m + 1, 15)
    } else if (calendarViewMode === 'week') {
      const day = currentDate.getDay()
      start = new Date(currentDate)
      start.setDate(currentDate.getDate() - day - 2)
      end = new Date(currentDate)
      end.setDate(currentDate.getDate() + (6 - day) + 2)
    } else {
      start = new Date(y, m, currentDate.getDate() - 1)
      end = new Date(y, m, currentDate.getDate() + 1)
    }

    loadCalendarTasks({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      partnerId: selectedPartnerFilter === 'ALL' ? undefined : selectedPartnerFilter,
    })
  }, [currentDate, calendarViewMode, selectedPartnerFilter, loadCalendarTasks])

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate)
    if (calendarViewMode === 'month') {
      next.setMonth(next.getMonth() - 1)
    } else if (calendarViewMode === 'week') {
      next.setDate(next.getDate() - 7)
    } else {
      next.setDate(next.getDate() - 1)
    }
    setCurrentDate(next)
  }

  const handleNext = () => {
    const next = new Date(currentDate)
    if (calendarViewMode === 'month') {
      next.setMonth(next.getMonth() + 1)
    } else if (calendarViewMode === 'week') {
      next.setDate(next.getDate() + 7)
    } else {
      next.setDate(next.getDate() + 1)
    }
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Header Title
  const headerTitle = useMemo(() => {
    if (calendarViewMode === 'month') {
      return currentDate.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    } else if (calendarViewMode === 'week') {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${startOfWeek.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      })} - ${endOfWeek.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`
    } else {
      return currentDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
  }, [currentDate, calendarViewMode])

  // Category Accent Helpers
  const getCategoryStyles = (category: TaskCategory) => {
    switch (category) {
      case 'SITE_VISIT':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
      case 'CLIENT_MEETING':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      case 'DOCUMENT_WORK':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30'
      case 'ADMIN':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30'
      default:
        return 'bg-surface-secondary text-muted-text border-border'
    }
  }

  // Month Grid Calculation
  const monthDays = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const firstDay = new Date(y, m, 1).getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()

    const days: Array<{
      date: Date
      isCurrentMonth: boolean
      isToday: boolean
      tasks: Task[]
    }> = []

    // Previous month padding
    const prevMonthDays = new Date(y, m, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(y, m - 1, prevMonthDays - i)
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        tasks: [],
      })
    }

    const today = new Date()
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(y, m, i)
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()

      const dayTasks = calendarTasks.filter((t) => {
        const td = new Date(t.dueDate)
        return (
          td.getDate() === i &&
          td.getMonth() === m &&
          td.getFullYear() === y
        )
      })

      days.push({
        date: d,
        isCurrentMonth: true,
        isToday,
        tasks: dayTasks,
      })
    }

    // Next month padding to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(y, m + 1, i)
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        tasks: [],
      })
    }

    return days
  }, [currentDate, calendarTasks])

  // Week Days Calculation
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days: Array<{
      date: Date
      isToday: boolean
      tasks: Task[]
    }> = []

    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)

      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()

      const dayTasks = calendarTasks.filter((t) => {
        const td = new Date(t.dueDate)
        return (
          td.getDate() === d.getDate() &&
          td.getMonth() === d.getMonth() &&
          td.getFullYear() === d.getFullYear()
        )
      })

      days.push({ date: d, isToday, tasks: dayTasks })
    }

    return days
  }, [currentDate, calendarTasks])

  // Day Tasks Calculation
  const dayTasks = useMemo(() => {
    return calendarTasks.filter((t) => {
      const td = new Date(t.dueDate)
      return (
        td.getDate() === currentDate.getDate() &&
        td.getMonth() === currentDate.getMonth() &&
        td.getFullYear() === currentDate.getFullYear()
      )
    })
  }, [currentDate, calendarTasks])

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="p-4 bg-surface border border-border rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation & Period Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-xs bg-background">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-surface-secondary text-muted-text hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-gold hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-surface-secondary text-muted-text hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-foreground tracking-tight">{headerTitle}</h2>
          {calendarLoading && (
            <span className="text-[11px] text-muted-text animate-pulse">Syncing...</span>
          )}
        </div>

        {/* View Switcher & Partner Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Partner Selector (FR-TK-06: for all partners) */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedPartnerFilter}
              onChange={(e) => setSelectedPartnerFilter(e.target.value)}
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

          {/* View Mode Switcher: Day, Week, Month */}
          <div className="flex items-center border border-border rounded-xs p-0.5 bg-background">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCalendarViewMode(mode)}
                className={`px-3 py-1 text-xs font-semibold rounded-xs uppercase tracking-wider transition-all cursor-pointer ${
                  calendarViewMode === mode
                    ? 'bg-surface text-gold shadow-xs'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const iso = currentDate.toISOString().slice(0, 10)
              onOpenCreateWithDate(iso)
            }}
            className="px-3.5 py-1.5 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Schedule
          </button>
        </div>
      </div>

      {/* 1. MONTH VIEW */}
      {calendarViewMode === 'month' && (
        <div className="bg-surface border border-border rounded-xs overflow-hidden shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-border bg-surface-secondary/70 text-center text-[10px] font-bold uppercase tracking-wider text-muted-text py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border border-b border-border">
            {monthDays.map((cell, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const iso = cell.date.toISOString().slice(0, 10)
                  onOpenCreateWithDate(iso)
                }}
                className={`min-h-[105px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-colors group cursor-pointer ${
                  !cell.isCurrentMonth
                    ? 'bg-surface-secondary/20 text-muted-text/40'
                    : 'hover:bg-surface-secondary/30'
                }`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      cell.isToday
                        ? 'bg-gold text-black font-black'
                        : cell.isCurrentMonth
                        ? 'text-foreground/80'
                        : 'text-muted-text/30'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const iso = cell.date.toISOString().slice(0, 10)
                      onOpenCreateWithDate(iso)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-text hover:text-gold transition-opacity cursor-pointer"
                    title="Add task for this day"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Tasks List in cell */}
                <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                  {cell.tasks.slice(0, 3).map((task) => {
                    const timeStr = new Date(task.dueDate).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    const catStyle = getCategoryStyles(task.category)

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewTask(task)
                        }}
                        className={`px-1.5 py-0.5 text-[10px] rounded-xs border truncate font-medium flex items-center justify-between gap-1 hover:brightness-110 transition-all ${catStyle}`}
                      >
                        <span className="truncate">{task.title}</span>
                        <span className="text-[9px] opacity-75 shrink-0">{timeStr}</span>
                      </div>
                    )
                  })}
                  {cell.tasks.length > 3 && (
                    <div className="text-[9px] font-bold text-gold px-1">
                      +{cell.tasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {calendarViewMode === 'week' && (
        <div className="bg-surface border border-border rounded-xs overflow-hidden shadow-xs">
          <div className="grid grid-cols-7 divide-x divide-border">
            {weekDays.map((col, idx) => (
              <div key={idx} className="min-h-[420px] flex flex-col">
                {/* Column Day Header */}
                <div
                  className={`p-3 text-center border-b border-border ${
                    col.isToday ? 'bg-gold/10 text-gold' : 'bg-surface-secondary/50 text-foreground'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                    {col.date.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-base font-bold mt-0.5 inline-flex w-7 h-7 items-center justify-center rounded-full ${
                      col.isToday ? 'bg-gold text-black' : ''
                    }`}
                  >
                    {col.date.getDate()}
                  </div>
                </div>

                {/* Day Tasks Column */}
                <div
                  onClick={() => {
                    const iso = col.date.toISOString().slice(0, 10)
                    onOpenCreateWithDate(iso)
                  }}
                  className="p-2 space-y-2 flex-1 hover:bg-surface-secondary/20 transition-colors cursor-pointer"
                >
                  {col.tasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-muted-text/30 italic">
                      No tasks
                    </div>
                  ) : (
                    col.tasks.map((task) => {
                      const timeStr = new Date(task.dueDate).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      const catStyle = getCategoryStyles(task.category)

                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewTask(task)
                          }}
                          className={`p-2 rounded-xs border text-xs space-y-1 hover:brightness-110 transition-all ${catStyle}`}
                        >
                          <div className="font-semibold text-foreground leading-snug line-clamp-2">
                            {task.title}
                          </div>
                          <div className="flex items-center justify-between text-[10px] opacity-80">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeStr}
                            </span>
                            <span className="font-bold uppercase text-[9px]">{task.priority}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW */}
      {calendarViewMode === 'day' && (
        <div className="bg-surface border border-border rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Schedule for {currentDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-xs text-muted-text">
                {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            <button
              onClick={() => {
                const iso = currentDate.toISOString().slice(0, 10)
                onOpenCreateWithDate(iso)
              }}
              className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Task for Today
            </button>
          </div>

          {dayTasks.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-muted-text mx-auto" />
              <div className="text-sm font-semibold text-foreground">No tasks scheduled for this day</div>
              <p className="text-xs text-muted-text max-w-sm mx-auto">
                Enjoy your clear schedule, or click above to schedule client viewings or document reviews.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayTasks.map((task) => {
                const timeStr = new Date(task.dueDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const catStyle = getCategoryStyles(task.category)

                return (
                  <div
                    key={task.id}
                    onClick={() => onViewTask(task)}
                    className="p-4 rounded-xs border border-border bg-surface-secondary/40 hover:bg-surface-secondary hover:border-gold/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${catStyle}`}>
                          {task.category.replace(/_/g, ' ')}
                        </span>
                        <h4 className="font-bold text-foreground text-sm">{task.title}</h4>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-text line-clamp-1">{task.description}</p>
                      )}
                      {(task.client || task.property) && (
                        <div className="flex items-center gap-3 text-xs text-muted-text pt-1">
                          {task.client && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-gold" />
                              {task.client.name}
                            </span>
                          )}
                          {task.property && (
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-gold" />
                              {task.property.societyBuildingName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground flex items-center gap-1.5 justify-end">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          {timeStr}
                        </div>
                        <div className="text-[10px] text-muted-text font-semibold uppercase tracking-wider">
                          {task.priority} Priority
                        </div>
                      </div>

                      <div className="flex items-center -space-x-1.5">
                        {task.assignees.slice(0, 3).map((a) => (
                          <div
                            key={a.userId}
                            title={a.user.name || a.user.email}
                            className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xs font-bold text-gold uppercase"
                          >
                            {(a.user.name || a.user.email || 'P')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
