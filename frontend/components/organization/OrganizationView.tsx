'use client'

import React, { useState } from 'react'
import { Shield, Users, ShieldAlert } from 'lucide-react'
import { Breadcrumb } from '../ui/Breadcrumb'
import { EmployeesTabContent } from './EmployeesTabContent'
import { AuditLogsTabContent } from './AuditLogsTabContent'

export function OrganizationView() {
  const [activeTab, setActiveTab] = useState<'employees' | 'audit'>('employees')

  return (
    <div className="space-y-5">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Organization & Staff' },
        ]}
      />

      {/* Page Title & Sub-module Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
              Organization
            </h1>
          </div>
          <p className="text-xs text-muted-text mt-1">
            Super Admin control center: manage team member permissions and inspect system audit trails.
          </p>
        </div>

        {/* Tab Buttons conforming to design.md */}
        <div className="flex items-center bg-surface border border-border p-1 gap-1">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'employees'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-text hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Employees
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'audit'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-text hover:text-foreground'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Audit Logs
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'employees' ? <EmployeesTabContent /> : <AuditLogsTabContent />}
    </div>
  )
}
