'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  Users2,
  CalendarCheck2,
  Coins,
  Calendar,
  Share2,
  Building,
  FileText,
  ArrowUpRight,
  Clock,
  Plus,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { useRouter } from '../../context/NavigationLoaderContext'
import { useRefreshStore } from '../../store/useRefreshStore'
import { useDashboardStore } from '../../store/useDashboardStore'
import { getCalendarTasks } from '../../api/tasks'
import type { Task } from '../../types/task'
import { toast } from '../../utils/toast'

function getStatCardRoute(id: string): string {
  switch (id) {
    case 'properties':
      return '/dashboard/properties'
    case 'active-leads':
      return '/dashboard/clients'
    case 'followups':
      return '/dashboard/website-users'
    case 'drafts':
      return '/dashboard/properties'
    case 'deals':
      return '/dashboard/properties'
    case 'brokers':
      return '/dashboard/brokers'
    case 'owners':
      return '/dashboard/owners'
    default:
      return '/dashboard'
  }
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2,
  Users2,
  CalendarCheck2,
  Coins,
  Share2,
  Building,
  FileText,
}

// ── Analog Clock ──────────────────────────────────────────────────────────────
function AnalogClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const s = time.getSeconds()
  const m = time.getMinutes()
  const h = time.getHours() % 12
  const secDeg = s * 6
  const minDeg = m * 6 + s * 0.1
  const hrDeg = h * 30 + m * 0.5
  const ticks = Array.from({ length: 12 }, (_, i) => i)

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="47" fill="none" stroke="var(--border)" strokeWidth="1.2" />
      {ticks.map((i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
        const isMajor = i % 3 === 0
        const inner = isMajor ? 38 : 42
        return (
          <line
            key={i}
            x1={50 + inner * Math.cos(angle)}
            y1={50 + inner * Math.sin(angle)}
            x2={50 + 46 * Math.cos(angle)}
            y2={50 + 46 * Math.sin(angle)}
            stroke={isMajor ? 'var(--color-gold)' : 'var(--border)'}
            strokeWidth={isMajor ? 1.8 : 0.8}
            strokeLinecap="round"
          />
        )
      })}
      {/* Hour */}
      <line x1="50" y1="50"
        x2={50 + 24 * Math.cos((hrDeg - 90) * (Math.PI / 180))}
        y2={50 + 24 * Math.sin((hrDeg - 90) * (Math.PI / 180))}
        stroke="var(--color-foreground)" strokeWidth="3.5" strokeLinecap="round" />
      {/* Minute */}
      <line x1="50" y1="50"
        x2={50 + 34 * Math.cos((minDeg - 90) * (Math.PI / 180))}
        y2={50 + 34 * Math.sin((minDeg - 90) * (Math.PI / 180))}
        stroke="var(--color-foreground)" strokeWidth="2.2" strokeLinecap="round" />
      {/* Second */}
      <line x1="50" y1="50"
        x2={50 + 37 * Math.cos((secDeg - 90) * (Math.PI / 180))}
        y2={50 + 37 * Math.sin((secDeg - 90) * (Math.PI / 180))}
        stroke="var(--color-gold)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="50" cy="50" r="2.5" fill="var(--color-gold)" />
    </svg>
  )
}

// ── Calendar Popover ──────────────────────────────────────────────────────────
function CalendarPopover({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const today = new Date()
  const [viewDate, setViewDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate())
  const [monthTasks, setMonthTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  const { year, month } = viewDate
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()

  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Fetch tasks for current view month
  useEffect(() => {
    setLoadingTasks(true)
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59)

    getCalendarTasks({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    })
      .then((tasks) => setMonthTasks(tasks || []))
      .catch(() => {})
      .finally(() => setLoadingTasks(false))
  }, [year, month])

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () =>
    setViewDate((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }
    )

  const nextMonth = () =>
    setViewDate((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }
    )

  const goToday = () => {
    setViewDate({ year: today.getFullYear(), month: today.getMonth() })
    setSelectedDay(today.getDate())
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-calendar]')) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Map of day number to tasks
  const tasksByDay = React.useMemo(() => {
    const map = new Map<number, Task[]>()
    for (const t of monthTasks) {
      const d = new Date(t.dueDate)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate()
        if (!map.has(dayNum)) map.set(dayNum, [])
        map.get(dayNum)!.push(t)
      }
    }
    return map
  }, [monthTasks, year, month])

  const selectedTasks = tasksByDay.get(selectedDay) || []

  return (
    <div
      data-calendar
      className="absolute top-full right-0 mt-2 z-50 border border-border bg-surface p-4 w-72 sm:w-80 shadow-2xl rounded-xs animate-in fade-in duration-150"
      style={{ boxShadow: '0 16px 52px rgba(0,0,0,0.35)' }}
    >
      {/* Nav header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
        <button
          onClick={prevMonth}
          className="p-1 rounded-md text-muted-text hover:text-foreground hover:bg-surface-secondary transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={goToday}
          className="text-[11px] font-bold tracking-[0.15em] uppercase text-gold hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5"
        >
          {monthName} {year}
        </button>

        <button
          onClick={nextMonth}
          className="p-1 rounded-md text-muted-text hover:text-foreground hover:bg-surface-secondary transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-[9px] font-bold text-muted-text text-center uppercase tracking-wide">
            {d}
          </span>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          const isToday = day === todayDate && year === todayYear && month === todayMonth
          const isSelected = day === selectedDay
          const hasTasks = day !== null && tasksByDay.has(day)
          const isWeekend = idx % 7 === 0 || idx % 7 === 6

          return (
            <div key={idx} className="flex flex-col items-center justify-center h-7 relative">
              {day !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-medium transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-gold text-black font-black shadow-xs ring-1 ring-gold'
                      : isToday
                      ? 'border border-gold text-gold font-bold'
                      : isWeekend
                      ? 'text-muted-text/50 hover:text-muted-text hover:bg-surface-secondary'
                      : 'text-foreground/80 hover:text-gold hover:bg-surface-secondary'
                  }`}
                >
                  {day}
                  {hasTasks && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-gold absolute -bottom-0.5" />
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Day Agenda Box */}
      <div className="mt-3.5 pt-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-gold" />
            {monthName.slice(0, 3)} {selectedDay}, {year}
          </span>
          <span className="text-[10px] text-muted-text">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Selected Tasks List */}
        <div className="max-h-32 overflow-y-auto space-y-1.5 pr-0.5">
          {loadingTasks ? (
            <div className="text-[10px] text-muted-text py-2 text-center">Loading tasks...</div>
          ) : selectedTasks.length === 0 ? (
            <div className="text-[10px] text-muted-text py-2 text-center bg-surface-secondary/40 rounded-xs border border-border/50">
              No tasks scheduled for this day
            </div>
          ) : (
            selectedTasks.map((t) => {
              const time = new Date(t.dueDate).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onClose()
                    router.push(`/dashboard/tasks?id=${t.id}`)
                  }}
                  className="p-1.5 rounded-xs border border-border/70 bg-surface-secondary/50 hover:border-gold/50 hover:bg-surface-secondary transition-all cursor-pointer flex items-center justify-between gap-1 text-[11px]"
                >
                  <div className="truncate flex-1">
                    <span className="font-medium text-foreground truncate block leading-tight">
                      {t.title}
                    </span>
                    <span className="text-[9px] text-muted-text uppercase tracking-wider">
                      {t.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] text-gold font-mono shrink-0 ml-1">{time}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/40">
          <button
            type="button"
            onClick={() => {
              onClose()
              router.push('/dashboard/tasks')
            }}
            className="text-[10px] text-muted-text hover:text-gold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open Tasks Calendar</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              router.push('/dashboard/tasks')
            }}
            className="px-2.5 py-1 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-xs text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export function StatsOverviewCard() {
  const router = useRouter()
  const { refreshTick } = useRefreshStore()
  const { stats, isLoading, loadOverview } = useDashboardStore()
  const [liveTime, setLiveTime] = useState({ h: '', period: '', full: '' })
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    loadOverview(refreshTick > 0)
  }, [loadOverview, refreshTick])

  useEffect(() => {
    const fmt = () => {
      const now = new Date()
      const full = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      const [hm, period] = full.split(' ')
      setLiveTime({ h: hm, period: period?.toLowerCase() ?? '', full })
    }
    fmt()
    const id = setInterval(fmt, 1000)
    return () => clearInterval(id)
  }, [])

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex mt-5 flex-col h-full gap-4">

      {/* ── Clock + Time Row ── */}
      <div className="flex items-center gap-4">
        {/* Analog clock */}
        <div className="w-[72px] h-[72px] shrink-0">
          <AnalogClock />
        </div>

        {/* Time text */}
        <div className="flex flex-col border-l-2 px-4 border-l-white/10 flex-1 min-w-0">
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-gold opacity-75 mb-1">
            Live Time
          </p>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-3xl font-black tabular-nums text-foreground tracking-tight">
              {liveTime.h}
            </span>
            <span className="text-sm font-bold text-muted-text">{liveTime.period}</span>
          </div>
          <p className="text-[11px] text-muted-text mt-1">{dateStr}</p>
        </div>

        {/* Calendar icon */}
        <div className="relative shrink-0 " data-calendar>
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className={`p-2  border cursor-pointer transition-all duration-200
              ${showCalendar
                ? 'border-gold/50 text-gold bg-gold/8'
                : 'border-border text-muted-text hover:text-gold hover:border-gold/30'}`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          {showCalendar && <CalendarPopover onClose={() => setShowCalendar(false)} />}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-border/50" />

      {/* ── 2×2 Stats Grid ── */}
      <div className="grid grid-cols-2 gap-px flex-1 overflow-hidden border border-border/50">
        {isLoading && stats.length === 0 ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 flex flex-col gap-2 bg-surface-secondary/30 animate-pulse border-border/50"
            >
              <div className="w-16 h-3 bg-muted-text/20 rounded" />
              <div className="w-20 h-8 bg-muted-text/30 rounded mt-1" />
              <div className="w-28 h-2.5 bg-muted-text/20 rounded mt-1" />
            </div>
          ))
        ) : (
          stats.map((stat, idx) => {
            const Icon = iconMap[stat.icon] || Building2
            const isRight = idx % 2 === 1
            const isBottom = idx >= 2
            return (
              <button
                key={stat.id}
                onClick={() => {
                  const route = getStatCardRoute(stat.id)
                  router.push(route)
                }}
                className={`group text-left p-4 flex flex-col gap-2 bg-surface-secondary/40 hover:bg-surface-secondary/90 hover:border-gold/30
                  transition-all duration-200 focus:outline-none cursor-pointer
                  ${!isRight ? 'border-r border-border/50' : ''}
                  ${!isBottom ? 'border-b border-border/50' : ''}
                `}
              >
                {/* Icon + Label + Hover Arrow */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: stat.color }} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-text group-hover:text-foreground/90 transition-colors truncate">
                      {stat.label}
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-text/30 group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                </div>

                {/* Value */}
                <span
                  className="text-3xl font-black tracking-tight tabular-nums leading-none transition-transform duration-200 group-hover:scale-105 origin-left"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>

                {/* Sub */}
                <p className="text-[10px] text-muted-text/60 group-hover:text-muted-text/90 transition-colors leading-snug">
                  {stat.sub}
                </p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
