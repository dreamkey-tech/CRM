'use client'

import React, { useState, useEffect } from 'react'
import { Building2, Users2, CalendarCheck2, Coins, Calendar } from 'lucide-react'
import { toast } from '../../utils/toast'

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
  const today = new Date()
  const [viewDate, setViewDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })

  const { year, month } = viewDate
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()

  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

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

  const goToday = () =>
    setViewDate({ year: today.getFullYear(), month: today.getMonth() })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-calendar]')) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      data-calendar
      className="absolute top-full right-0 mt-2 z-50  border border-border bg-surface p-4 w-60"
      style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.22)' }}
    >
      {/* Nav header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded-md text-muted-text hover:text-foreground hover:bg-surface-secondary transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={goToday}
          className="text-[10px] font-bold tracking-[0.15em] uppercase text-gold hover:opacity-80 transition-opacity"
        >
          {monthName} {year}
        </button>

        <button
          onClick={nextMonth}
          className="p-1 rounded-md text-muted-text hover:text-foreground hover:bg-surface-secondary transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-[9px] font-bold text-muted-text text-center uppercase tracking-wide">{d}</span>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          const isToday = day === todayDate && year === todayYear && month === todayMonth
          const isWeekend = idx % 7 === 0 || idx % 7 === 6
          return (
            <div key={idx} className="flex items-center justify-center h-6">
              {day !== null && (
                <span
                  className={`text-[10px] w-6 h-6 flex items-center justify-center  font-medium transition-all cursor-pointer
                    ${isToday
                      ? 'bg-gold text-black font-black'
                      : isWeekend
                      ? 'text-muted-text/40 hover:text-muted-text'
                      : 'text-foreground/70 hover:text-gold'
                    }`}
                >
                  {day}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Today shortcut */}
      {(year !== todayYear || month !== todayMonth) && (
        <button
          onClick={goToday}
          className="mt-3 w-full text-center text-[9px] font-bold uppercase tracking-widest text-gold/60 hover:text-gold transition-colors"
        >
          Back to today
        </button>
      )}
    </div>
  )
}

// ── Stats data ────────────────────────────────────────────────────────────────
const stats = [
  {
    id: 'properties',
    label: 'Properties',
    value: '128',
    sub: 'Flats · Land · Commercial',
    icon: Building2,
    color: '#f59e0b',
  },
  {
    id: 'active-leads',
    label: 'Active Leads',
    value: '24',
    sub: '8 high-intent inquiries',
    icon: Users2,
    color: '#10b981',
  },
  {
    id: 'followups',
    label: 'Follow-ups',
    value: '8',
    sub: '3 overdue callbacks',
    icon: CalendarCheck2,
    color: '#f43f5e',
  },
  {
    id: 'deals',
    label: 'Active Deals',
    value: '5',
    sub: '₹4.8 Cr pipeline',
    icon: Coins,
    color: '#D4AF37',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────
export function StatsOverviewCard() {
  const [liveTime, setLiveTime] = useState({ h: '', period: '', full: '' })
  const [showCalendar, setShowCalendar] = useState(false)

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
      <div className="grid grid-cols-2 gap-px flex-1  overflow-hidden border border-border/50">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          const isRight = idx % 2 === 1
          const isBottom = idx >= 2
          return (
            <button
              key={stat.id}
              onClick={() => toast.info(stat.label, stat.sub)}
              className={`group text-left p-4 flex flex-col gap-2 bg-surface-secondary/40 hover:bg-surface-secondary/80
                transition-all duration-200 focus:outline-none
                ${!isRight ? 'border-r border-border/50' : ''}
                ${!isBottom ? 'border-b border-border/50' : ''}
              `}
            >
              {/* Icon + Label */}
              <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 shrink-0" style={{ color: stat.color }} />
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-text group-hover:text-foreground/80 transition-colors">
                  {stat.label}
                </span>
              </div>

              {/* Value */}
              <span
                className="text-3xl font-black tracking-tight tabular-nums leading-none transition-transform duration-200 group-hover:scale-105 origin-left"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>

              {/* Sub */}
              <p className="text-[10px] text-muted-text/60 group-hover:text-muted-text/80 transition-colors leading-snug">
                {stat.sub}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
