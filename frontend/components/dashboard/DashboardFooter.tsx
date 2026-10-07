'use client'

import React from 'react'

export function DashboardFooter() {
  return (
    <footer className="w-full py-6 border-t border-border/80 text-xs text-muted-text flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="font-bold text-foreground tracking-tight">DREAMKEY</span>
        <span>•</span>
        <span>Private Wealth Advisory Infrastructure</span>
      </div>

      <div className="flex items-center gap-2 text-center sm:text-right font-medium">
        <span>© 2026 DreamKey Realty Partners LLC. Strictly Confidential.</span>
        <span>•</span>
        <span className="inline-flex items-center gap-1 text-gold font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span>Encrypted Core OS</span>
        </span>
      </div>
    </footer>
  )
}
