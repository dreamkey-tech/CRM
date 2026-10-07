import type { Metadata } from 'next'
import { DashboardView } from '../../components/dashboard/DashboardView'

export const metadata: Metadata = {
  title: 'Dashboard | DreamKey CRM',
  description: 'Manage your leads, deals, and permissions in DreamKey CRM',
}

/**
 * Server Component (SSR) for the Dashboard Page
 */
export default function DashboardPage() {
  return <DashboardView />
}
