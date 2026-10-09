'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import { DashboardHeader } from '../dashboard/DashboardHeader'
import { WebsiteUsersHeader } from './WebsiteUsersHeader'
import { WebsiteUsersTabs, type TabType } from './WebsiteUsersTabs'
import { UsersTabContent } from './UsersTabContent'
import { EnquiriesTabContent } from './EnquiriesTabContent'
import { getWebsiteEnquiryStats } from '../../api/websiteEnquiries'
import { getWebsiteUserStats } from '../../api/websiteUsers'
import { Breadcrumb } from '../ui/Breadcrumb'

export function WebsiteUsersView() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [usersCount, setUsersCount] = useState<number | undefined>(undefined)
  const [enquiriesCount, setEnquiriesCount] = useState<number | undefined>(undefined)
  const [newEnquiriesCount, setNewEnquiriesCount] = useState<number | undefined>(undefined)

  const fetchBadgeCounts = useCallback(async () => {
    try {
      const [uStats, eStats] = await Promise.all([
        getWebsiteUserStats(),
        getWebsiteEnquiryStats(),
      ])
      if (uStats) setUsersCount(uStats.totalUsers)
      if (eStats) {
        setEnquiriesCount(eStats.totalEnquiries)
        setNewEnquiriesCount(eStats.pendingCount)
      }
    } catch (err) {
      console.error('Error fetching badge counts:', err)
    }
  }, [])

  useEffect(() => {
    fetchBadgeCounts()
  }, [fetchBadgeCounts])

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string | null): string => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-20 pb-12 space-y-5">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/dashboard' },
            { label: 'User Management' },
          ]}
        />

        {/* Page Header */}
        <WebsiteUsersHeader activeTab={activeTab} isDark={isDark} />

        {/* Tab Selector */}
        <WebsiteUsersTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          usersCount={usersCount}
          enquiriesCount={enquiriesCount}
          newEnquiriesCount={newEnquiriesCount}
        />

        {/* Tab Content */}
        {activeTab === 'users' ? (
          <UsersTabContent
            isDark={isDark}
            onTotalUsersUpdate={(count) => setUsersCount(count)}
          />
        ) : (
          <EnquiriesTabContent
            formatDate={formatDate}
            formatDateTime={formatDateTime}
          />
        )}
      </main>
    </div>
  )
}
