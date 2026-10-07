'use client'

import React, { useState } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { TopStatusBanner } from './TopStatusBanner'
import { UserBriefingCard, UserBriefingGreeting, UserBriefingItems } from './UserBriefingCard'
import { StatsOverviewCard } from './StatsOverviewCard'
import { MenuModulesGrid } from './MenuModulesGrid'
import { ImmediateOperationsBar } from './ImmediateOperationsBar'
import { CommandPaletteBar } from './CommandPaletteBar'
import { DashboardFooter } from './DashboardFooter'
import { useAuthStore } from '../../store/useAuthStore'

export function DashboardView() {
  const { isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Overview')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-xs font-mono">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border shadow-md">
          <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <span>Validating authenticated executive session...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200 selection:bg-gold/30">
      {/* ── 1. Top Navbar Header ── */}
      <DashboardHeader />

      {/* ── 2. Main Executive Workspace Content ── */}
      <main className="flex-1 max-w-9xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Top Status Desk Banner */}
        {/* <TopStatusBanner /> */}

        {/* ── Mobile layout: Greeting → Clock+Stats → Briefing Items ── */}
        <div className="flex flex-col gap-5 mt-16 lg:hidden">
          <UserBriefingGreeting />
          <StatsOverviewCard />
          <UserBriefingItems />
        </div>

        {/* ── Desktop layout: 2-column side-by-side grid ── */}
        <div className="hidden mt-11 lg:grid lg:grid-cols-2 gap-6 items-stretch">
          <UserBriefingCard />
          <StatsOverviewCard />
        </div>

        {/* Menus Section: 6 Core Business Modules */}
        <MenuModulesGrid />







      </main>
    </div>
  )
}
