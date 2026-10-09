import React, { Suspense } from 'react'
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader'
import { OwnersView } from '../../../components/owners/OwnersView'
import { TableSkeleton } from '../../../components/ui/PageSkeleton'

export default function OwnersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-20 pb-12">
        <Suspense fallback={<TableSkeleton />}>
          <OwnersView />
        </Suspense>
      </main>
    </div>
  )
}

