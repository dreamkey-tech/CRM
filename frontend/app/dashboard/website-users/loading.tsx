import { PageSkeleton } from '../../../components/ui/PageSkeleton'

export default function WebsiteUsersLoading() {
  return (
    <PageSkeleton
      variant="table"
      breadcrumbCount={2}
      statsCount={4}
      tableRows={8}
      maxWidthClass="max-w-7xl"
    />
  )
}
