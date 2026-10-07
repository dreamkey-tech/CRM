'use client'

import React from 'react'
import { Users, MessageSquare } from 'lucide-react'

export type TabType = 'users' | 'enquiries'

interface WebsiteUsersTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  usersCount?: number
  enquiriesCount?: number
  newEnquiriesCount?: number
}

export function WebsiteUsersTabs({
  activeTab,
  onTabChange,
  usersCount,
  enquiriesCount,
  newEnquiriesCount,
}: WebsiteUsersTabsProps) {
  const tabs = [
    {
      key: 'users' as TabType,
      label: 'Registered Accounts',
      icon: Users,
      count: usersCount,
      badge: null,
    },
    {
      key: 'enquiries' as TabType,
      label: 'Website Enquiries',
      icon: MessageSquare,
      count: enquiriesCount,
      badge: newEnquiriesCount && newEnquiriesCount > 0 ? `${newEnquiriesCount} New` : null,
    },
  ]

  return (
    <div className="flex items-center gap-0 border-b border-border overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] whitespace-nowrap border-b-2 transition-all duration-150 cursor-pointer ${
              isActive
                ? 'border-b-gold text-foreground'
                : 'border-b-transparent text-muted-text hover:text-foreground hover:border-b-border'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-gold' : ''}`} />
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  isActive
                    ? 'bg-gold/15 text-dark-gold'
                    : 'bg-surface-secondary text-muted-text'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-foreground text-background">
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
