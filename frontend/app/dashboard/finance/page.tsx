import { Suspense } from 'react'
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader'
import { FinanceView } from '../../../components/finance/FinanceView'
import { TableSkeleton } from '../../../components/ui/PageSkeleton'

export const metadata = {
  title: 'Finance & Revenue Ledger | DreamKey CRM',
  description: 'Track brokerage income, operational expenses, monthly payroll, and P&L financial reports.',
}

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-slate-900 print:min-h-0">
      <div className="print:hidden">
        <DashboardHeader activeTab="Finance" />
      </div>
      <main className="mx-auto max-w-9xl px-3 pt-20 pb-12 sm:px-6 print:p-0 print:pt-0 print:pb-0 print:m-0 print:max-w-none print:w-full">
        <Suspense fallback={<TableSkeleton />}>
          <FinanceView />
        </Suspense>
      </main>
    </div>
  )
}
