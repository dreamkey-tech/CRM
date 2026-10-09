'use client'

import React from 'react'
import { Building2, Sparkles, Clock, CheckCircle2 } from 'lucide-react'
import type { Property } from '../../types/property'

interface PropertiesStatsRowProps {
  properties: Property[]
  totalCount: number
}

export function PropertiesStatsRow({ properties, totalCount }: PropertiesStatsRowProps) {
  const availableCount = properties.filter(
    (p) => p.availabilityStatus === 'AVAILABLE' && !p.isArchived && !p.isDraft
  ).length

  const pipelineCount = properties.filter(
    (p) =>
      (p.availabilityStatus === 'UNDER_NEGOTIATION' ||
        p.availabilityStatus === 'TOKEN_PAID') &&
      !p.isArchived
  ).length

  const closedCount = properties.filter(
    (p) =>
      (p.availabilityStatus === 'DEAL_DONE' ||
        p.availabilityStatus === 'SOLD' ||
        p.availabilityStatus === 'RENTED_OUT') &&
      !p.isArchived
  ).length

  const stats = [
    {
      label: 'Total Stock Listed',
      value: totalCount.toLocaleString(),
      subtext: 'Flats, Land & Commercial units',
      icon: Building2,
      color: 'var(--color-gold)',
    },
    {
      label: 'Live & Available',
      value: availableCount.toLocaleString(),
      subtext: 'Ready for client site visits',
      icon: Sparkles,
      color: '#10b981', // emerald
    },
    {
      label: 'In Negotiation / Token',
      value: pipelineCount.toLocaleString(),
      subtext: 'Active buyer & token discussions',
      icon: Clock,
      color: '#f59e0b', // amber
    },
    {
      label: 'Deals Closed / Sold',
      value: closedCount.toLocaleString(),
      subtext: 'Successfully leased or sold',
      icon: CheckCircle2,
      color: '#3b82f6', // blue
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
      {stats.map((item, idx) => {
        const Icon = item.icon
        return (
          <div
            key={idx}
            className="bg-surface flex flex-col justify-between gap-3 px-4 py-4 sm:py-5 transition-colors hover:bg-surface-secondary/50"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
              <Icon className="w-3 h-3 shrink-0" style={{ color: item.color }} />
              <span className="truncate">{item.label}</span>
            </p>
            <span
              className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-foreground"
              style={idx === 0 ? { color: 'var(--color-gold)' } : {}}
            >
              {item.value}
            </span>
            <p className="text-[10px] text-muted-text truncate">{item.subtext}</p>
          </div>
        )
      })}
    </div>
  )
}
