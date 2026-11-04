'use client'

import React, { useState, useEffect } from 'react'
import {
  Home,
  AlertCircle,
  FileText,
  ChevronRight,
  ShieldAlert,
  Users,
  ArrowUpRight,
} from 'lucide-react'
import { useRouter } from '../../context/NavigationLoaderContext'
import { useAuthStore } from '../../store/useAuthStore'
import { useRefreshStore } from '../../store/useRefreshStore'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { BriefingItem } from '../../api/dashboard'
import { toast } from '../../utils/toast'

const briefingIconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Home,
  AlertCircle,
  FileText,
  Users,
  ShieldAlert,
}

// ── Greeting section only (used independently on mobile) ──────────────────────
export function UserBriefingGreeting() {
  const { user } = useAuthStore()
  const currentHour = new Date().getHours()
  const greetingPrefix =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'
  const userFirstName = user?.name ? user.name.split(' ')[0] : (user?.email?.split('@')[0] || 'Team')

  return (
    <div className="px-1">
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gold mb-2 opacity-80">
        Daily Briefing
      </p>
      <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-[1.1]">
        {greetingPrefix},{' '}
        <span className="text-gold capitalize">{userFirstName}.</span>
      </h2>
      <p className="text-sm text-muted-text mt-2 leading-relaxed">
        Your executive summary across listings, client mandates, and operational milestones.
      </p>
    </div>
  )
}

// ── Briefing items only (used independently on mobile) ────────────────────────
export function UserBriefingItems() {
  const router = useRouter()
  const { refreshTick } = useRefreshStore()
  const { briefing: items, isLoading, loadOverview } = useDashboardStore()

  useEffect(() => {
    loadOverview(refreshTick > 0)
  }, [loadOverview, refreshTick])

  const handleClick = (item: BriefingItem) => {
    if (item.link) {
      router.push(item.link)
    } else {
      toast.info(item.title, item.description)
    }
  }

  return (
    <div className="px-1">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-text mb-3">
        Today&apos;s Updates
      </p>
      <div className="flex flex-col gap-2">
        {isLoading && items.length === 0 ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-16 bg-surface-secondary/40 animate-pulse border border-border/50 rounded-md"
            />
          ))
        ) : (
          items.map((item) => {
            const Icon = briefingIconMap[item.icon] || Home
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="group w-full text-left flex items-stretch border border-border/60 bg-surface-secondary/50 hover:bg-surface-secondary overflow-hidden transition-all duration-200 focus:outline-none cursor-pointer"
              >
                {/* Thick left accent */}
                <div className="w-1 shrink-0" style={{ backgroundColor: item.accent }} />
                {/* Icon */}
                <div className="flex items-center px-3 shrink-0">
                  <div className="p-2" style={{ backgroundColor: `${item.accent}18` }}>
                    <Icon className="w-4 h-4" style={{ color: item.accent }} />
                  </div>
                </div>
                {/* Content */}
                <div className="flex flex-col justify-center py-3 flex-1 min-w-0 pr-2">
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: item.accent }}
                  >
                    {item.label}
                  </span>
                  <p className="text-xs font-bold text-foreground leading-snug">{item.title}</p>
                  <p className="text-[10px] text-muted-text mt-0.5 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
                {/* Badge + chevron */}
                <div className="flex flex-col items-end justify-center gap-2 px-3 shrink-0">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${item.badgeBg}`}
                  >
                    {item.badge}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-text/40 group-hover:text-muted-text group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Full card (desktop only) ───────────────────────────────────────────────────
export function UserBriefingCard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { refreshTick } = useRefreshStore()
  const { briefing: items, isLoading, loadOverview } = useDashboardStore()

  const currentHour = new Date().getHours()
  const greetingPrefix =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'
  const userFirstName = user?.name ? user.name.split(' ')[0] : (user?.email?.split('@')[0] || 'Team')

  useEffect(() => {
    loadOverview(refreshTick > 0)
  }, [loadOverview, refreshTick])

  const handleClick = (item: BriefingItem) => {
    if (item.link) {
      router.push(item.link)
    } else {
      toast.info(item.title, item.description)
    }
  }

  return (
    <div className="flex flex-col h-full px-1 py-2">
      {/* Greeting */}
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gold mb-2 opacity-80">
          Daily Briefing
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1]">
          {greetingPrefix},{' '}
          <span className="text-gold capitalize">{userFirstName}.</span>
        </h2>
        <p className="text-sm text-muted-text mt-3 leading-relaxed max-w-sm">
          Your executive summary across listings, client mandates, and operational milestones.
        </p>
      </div>

      {/* Editorial divider rows */}
      <div className="mt-6 divide-y divide-border/40">
        {isLoading && items.length === 0 ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="py-4 flex gap-4 animate-pulse">
              <div className="w-1 h-10 bg-muted-text/20 rounded" />
              <div className="flex-1 space-y-2">
                <div className="w-24 h-3 bg-muted-text/20 rounded" />
                <div className="w-48 h-4 bg-muted-text/30 rounded" />
                <div className="w-64 h-3 bg-muted-text/20 rounded" />
              </div>
            </div>
          ))
        ) : (
          items.map((item) => {
            const Icon = briefingIconMap[item.icon] || Home
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="group w-full text-left py-4 flex items-start gap-4 transition-all duration-200 hover:pl-1 focus:outline-none cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1.5 shrink-0 mt-0.5">
                  <div
                    className="w-0.5 h-4 rounded-full opacity-60 group-hover:opacity-100 group-hover:h-5 transition-all duration-300"
                    style={{ backgroundColor: item.accent }}
                  />
                  <Icon className="w-3.5 h-3.5" style={{ color: item.accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-90 transition-opacity"
                    style={{ color: item.accent }}
                  >
                    {item.label}
                  </span>
                  <p className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors leading-snug mt-0.5">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-text mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-90 transition-opacity"
                    style={{ color: item.accent }}
                  >
                    {item.badge}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-text/30 group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
