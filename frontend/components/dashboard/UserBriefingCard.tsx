'use client'

import React from 'react'
import { Home, AlertCircle, FileText, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { toast } from '../../utils/toast'

const briefingItems = [
  {
    id: 1,
    icon: Home,
    accent: '#f59e0b',
    label: 'Property Visits',
    title: '3 visits scheduled today',
    description:
      'Alipore Penthouse · 11:30 AM — New Town Commercial Hub · 2:15 PM — Rajarhat Residential Land · 4:30 PM',
    badge: 'Confirmed',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 2,
    icon: AlertCircle,
    accent: '#f43f5e',
    label: 'Urgent Follow-ups',
    title: '2 high-priority clients due before 2 PM',
    description:
      'Dr. S. Chatterjee · Bespoke Villa Mandate — Vikram Singhania · Warehouse Lease Agreement',
    badge: 'Urgent',
    badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  },
  {
    id: 3,
    icon: FileText,
    accent: '#3b82f6',
    label: 'Agreement Review',
    title: '1 new mandate ready for review',
    description:
      'Exclusive Seller Representation · South Kolkata Luxury Estate · ₹12.5 Cr valuation',
    badge: 'Drafted',
    badgeBg: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  },
]

// ── Greeting section only (used independently on mobile) ──────────────────────
export function UserBriefingGreeting() {
  const { user } = useAuthStore()
  const currentHour = new Date().getHours()
  const greetingPrefix =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Mainak'

  return (
    <div className="px-1">
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gold mb-2 opacity-80">
        Daily Briefing
      </p>
      <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-[1.1]">
        {greetingPrefix},{' '}
        <span className="text-gold">{userFirstName}.</span>
      </h2>
      <p className="text-sm text-muted-text mt-2 leading-relaxed">
        Your executive summary across listings, client mandates, and transaction milestones.
      </p>
    </div>
  )
}

// ── Briefing items only (used independently on mobile) ────────────────────────
export function UserBriefingItems() {
  return (
    <div className="px-1">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-text mb-3">
        Today&apos;s Updates
      </p>
      <div className="flex flex-col gap-2">
        {briefingItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => toast.info(item.title, item.description)}
              className="group w-full text-left flex items-stretch  border border-border/60 bg-surface-secondary/50 hover:bg-surface-secondary overflow-hidden transition-all duration-200 focus:outline-none"
            >
              {/* Thick left accent */}
              <div className="w-1 shrink-0" style={{ backgroundColor: item.accent }} />
              {/* Icon */}
              <div className="flex items-center px-3 shrink-0">
                <div className="p-2 " style={{ backgroundColor: `${item.accent}18` }}>
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
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5  border ${item.badgeBg}`}
                >
                  {item.badge}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-text/40 group-hover:text-muted-text group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Full card (desktop only) ───────────────────────────────────────────────────
export function UserBriefingCard() {
  const { user } = useAuthStore()
  const currentHour = new Date().getHours()
  const greetingPrefix =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Mainak'

  return (
    <div className="flex flex-col h-full px-1 py-2">
      {/* Greeting */}
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gold mb-2 opacity-80">
          Daily Briefing
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1]">
          {greetingPrefix},{' '}
          <span className="text-gold">{userFirstName}.</span>
        </h2>
        <p className="text-sm text-muted-text mt-3 leading-relaxed max-w-sm">
          Your executive summary across listings, client mandates, and transaction milestones.
        </p>
      </div>

      {/* Editorial divider rows */}
      <div className="mt-6 divide-y divide-border/40">
        {briefingItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => toast.info(item.title, item.description)}
              className="group w-full text-left py-4 flex items-start gap-4 transition-all duration-200 hover:pl-1 focus:outline-none"
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
              <span
                className="text-[10px] font-bold uppercase tracking-widest shrink-0 mt-1 opacity-50 group-hover:opacity-80 transition-opacity"
                style={{ color: item.accent }}
              >
                {item.badge}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
