'use client'

import React from 'react'
import { Terminal, Search, TrendingUp, FolderArchive } from 'lucide-react'
import { toast } from '../../utils/toast'

export function CommandPaletteBar() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-secondary border border-border text-xs text-muted-text">
      {/* Left Versioning Info */}
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <Terminal className="w-3.5 h-3.5 text-gold shrink-0" />
        <span className="text-foreground font-medium">DreamKey Core OS v1.0.4</span>
        <span>+</span>
        <span className="truncate">Encrypted Enterprise Session</span>
      </div>

      {/* Center Command Shortcut Pill */}
      <button
        onClick={() => toast.info('Global Search', 'Press ⌘K or start typing to search across records.')}
        className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-xl bg-surface hover:bg-surface-secondary border border-border text-xs text-foreground/80 hover:text-foreground transition cursor-pointer shadow-xs max-w-md w-full lg:w-auto"
      >
        <Search className="w-3.5 h-3.5 text-muted-text" />
        <span>Press</span>
        <kbd className="px-1.5 py-0.5 rounded bg-surface-secondary border border-border text-[10px] font-mono font-bold text-foreground">
          ⌘K
        </kbd>
        <span>for instant search across Properties, Clients & Contacts</span>
      </button>

      {/* Right Quick Links */}
      <div className="flex items-center gap-3 font-semibold text-[11px] tracking-wider uppercase">
        <button
          onClick={() => toast.info('Deal Pipeline', 'Loading real-time stage progression chart...')}
          className="inline-flex items-center gap-1.5 text-foreground hover:text-gold transition cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5 text-gold" />
          <span>DEAL PIPELINE</span>
        </button>
        <span>•</span>
        <button
          onClick={() => toast.info('Document Vault', 'Opening encrypted client deed & agreement repository...')}
          className="inline-flex items-center gap-1.5 text-foreground hover:text-gold transition cursor-pointer"
        >
          <FolderArchive className="w-3.5 h-3.5 text-gold" />
          <span>DOCUMENT VAULT</span>
        </button>
      </div>
    </div>
  )
}
