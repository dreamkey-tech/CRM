import { Suspense } from 'react'
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader'
import { TasksView } from '../../../components/tasks/TasksView'
import { TableSkeleton } from '../../../components/ui/PageSkeleton'


export default function TasksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activeTab="Tasks" />
      <main className="mx-auto max-w-9xl px-3 pt-20 pb-12 sm:px-6">
        <Suspense fallback={<TableSkeleton />}>
          <TasksView />
        </Suspense>
      </main>
    </div>
  )
}
