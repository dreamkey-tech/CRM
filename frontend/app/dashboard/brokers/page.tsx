import React, { Suspense } from 'react'
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader'
import { BrokersView } from '../../../components/brokers/BrokersView'
import { TableSkeleton } from '../../../components/ui/PageSkeleton'

export default function BrokersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-20 pb-12">
        <Suspense fallback={<TableSkeleton />}>
          <BrokersView />
        </Suspense>
      </main>
    </div>
  )
}

