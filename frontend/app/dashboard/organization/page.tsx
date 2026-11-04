import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader'
import { OrganizationView } from '../../../components/organization/OrganizationView'
import { TableSkeleton } from '../../../components/ui/PageSkeleton'


export const metadata: Metadata = {
  title: 'Organization — Employees & Audit Logs | DreamKey CRM',
  description: 'Manage employees, configure role permissions, and view system audit trails.',
}

export default function OrganizationPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <main className="max-w-9xl mx-auto px-3 sm:px-6 pt-20 pb-12">
        <Suspense fallback={<TableSkeleton />}>
          <OrganizationView />
        </Suspense>
      </main>
    </div>
  )
}
