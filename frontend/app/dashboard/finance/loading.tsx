import { DashboardHeader } from '../../../components/dashboard/DashboardHeader'
import { TableSkeleton } from '../../../components/ui/PageSkeleton'

export default function FinanceLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activeTab="Finance" />
      <main className="mx-auto max-w-9xl px-3 pt-20 pb-12 sm:px-6">
        <TableSkeleton />
      </main>
    </div>
  )
}
