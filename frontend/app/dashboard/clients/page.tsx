import { Suspense } from 'react'
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader'
import { ClientsView } from '../../../components/clients/ClientsView'
import { TableSkeleton } from '../../../components/ui/PageSkeleton'
export default function ClientsPage() {
  return <div className="min-h-screen bg-background text-foreground"><DashboardHeader /><main className="mx-auto max-w-7xl px-3 pt-20 pb-12 sm:px-6"><Suspense fallback={<TableSkeleton />}><ClientsView /></Suspense></main></div>
}
