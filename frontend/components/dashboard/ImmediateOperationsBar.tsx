'use client'

import React from 'react'
import { Plus, UserPlus, CalendarPlus, Database } from 'lucide-react'
import { toast } from '../../utils/toast'

export function ImmediateOperationsBar() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border shadow-xs text-xs">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="font-bold text-[11px] tracking-wider uppercase text-muted-text">
          IMMEDIATE OPERATIONS:
        </span>

        <button
          onClick={() => toast.info('Add Listing Unit', 'Opening property inventory listing wizard...')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface border border-border text-foreground font-semibold transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-gold" />
          <span>Add Listing Unit</span>
        </button>

        <span className="text-muted-text hidden sm:inline">•</span>

        <button
          onClick={() => toast.info('Register Client Lead', 'Opening HNW client onboarding form...')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface border border-border text-foreground font-semibold transition cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
          <span>Register Client Lead</span>
        </button>

        <span className="text-muted-text hidden sm:inline">•</span>

        <button
          onClick={() => toast.info('Schedule Site Visit', 'Opening property viewing scheduler...')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface border border-border text-foreground font-semibold transition cursor-pointer"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-amber-500" />
          <span>Schedule Site Visit</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-text shrink-0 font-medium">
        <Database className="w-3 h-3 text-emerald-500 shrink-0" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Database Synchronized</span>
        <span>•</span>
        <span className="font-mono">0 sec ago</span>
      </div>
    </div>
  )
}
