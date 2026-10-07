import type { Metadata } from 'next'
import { WebsiteUsersView } from '../../../components/website-users/WebsiteUsersView'

export const metadata: Metadata = {
  title: 'User Management | DreamKey CRM',
  description: 'Monitor website user analytics, engagement metrics, and manage registered users.',
}

export default function WebsiteUsersPage() {
  return <WebsiteUsersView />
}
