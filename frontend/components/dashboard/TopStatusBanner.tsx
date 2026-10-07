'use client'

import React from 'react'
import { Activity } from 'lucide-react'

export function TopStatusBanner() {
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 px-1 text-xs text-muted-text border-b border-border/60">
      <div className="flex items-center gap-2 font-medium">
        <span className="w-2 h-2 rounded-full bg-gold animate-pulse shrink-0" />
        <span className="text-foreground font-semibold">DREAMKEY REALITY</span>
        <span className="text-muted-text">•</span>
        <span>Internal CRM & Operations Executive Desk</span>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono">
        <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-foreground font-medium">SYSTEM LIVE</span>
        <span className="text-muted-text">•</span>
        <span>{currentDateFormatted}</span>
      </div>
    </div>
  )
}
