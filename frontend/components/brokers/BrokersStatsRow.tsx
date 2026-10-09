'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Handshake,
  UserCheck,
  Building2,
  TrendingUp,
} from 'lucide-react'
import type { BrokerStats } from '../../types/broker'

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const start = prev.current
    const end = value
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
      else prev.current = end
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconColor: string
  sub?: string
  suffix?: string
  accent?: boolean
}

function StatCard({ label, value, icon: Icon, iconColor, sub, suffix, accent }: StatCardProps) {
  return (
    <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5 transition-colors duration-150 cursor-default">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
        <Icon className="w-3 h-3" style={{ color: iconColor }} />
        {label}
      </p>

      <div className="flex items-baseline gap-1 leading-none">
        <span
          className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none"
          style={{ color: accent ? 'var(--color-gold)' : undefined }}
        >
          <AnimatedNumber value={value} />
        </span>
        {suffix && (
          <span className="text-sm font-bold text-muted-text">{suffix}</span>
        )}
      </div>

      {sub && (
        <p className="text-[10px] text-muted-text leading-snug">{sub}</p>
      )}
    </div>
  )
}

interface BrokersStatsRowProps {
  stats: BrokerStats | null
  loading?: boolean
  isDark?: boolean
}

export function BrokersStatsRow({
  stats,
  loading = false,
}: BrokersStatsRowProps) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface h-24 px-4 py-5" />
        ))}
      </div>
    )
  }

  const total = stats?.totalBrokers || 0
  const active = stats?.activeBrokers || 0
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
      <StatCard
        label="Total Brokers"
        value={total}
        icon={Handshake}
        iconColor="var(--color-gold)"
        sub="Registered partners"
        accent
      />
      <StatCard
        label="Active Network"
        value={active}
        icon={UserCheck}
        iconColor="var(--color-gold)"
        sub={`${activePercent}% active rate`}
      />
      <StatCard
        label="My Relationships"
        value={stats?.myBrokersCount || 0}
        icon={Building2}
        iconColor="var(--color-gold)"
        sub="Assigned to you"
      />
      <StatCard
        label="Growth This Month"
        value={stats?.newBrokersThisMonth || 0}
        icon={TrendingUp}
        iconColor="var(--color-gold)"
        sub={`+${stats?.newBrokersThisWeek || 0} added this week`}
        suffix="new"
      />
    </div>
  )
}
