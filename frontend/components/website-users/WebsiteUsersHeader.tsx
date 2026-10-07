'use client'

import React from 'react'
import { Globe } from 'lucide-react'
import type { TabType } from './WebsiteUsersTabs'

interface WebsiteUsersHeaderProps {
  activeTab: TabType
  isDark: boolean
}

export function WebsiteUsersHeader({ activeTab, isDark }: WebsiteUsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pb-4">
      <div>
       
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          {activeTab === 'users' ? 'Registered Accounts' : 'Website Enquiries'}
        </h1>
        <p className="text-xs text-muted-text mt-1 max-w-lg">
          {activeTab === 'users'
            ? 'Complete directory of registered website accounts, authentication records, and user activity.'
            : 'Track customer property queries, budget bands, preferred locations, and lead statuses.'}
        </p>
      </div>
    </div>
  )
}
