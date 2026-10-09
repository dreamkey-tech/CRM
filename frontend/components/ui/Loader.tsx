'use client'

import React from 'react'
import {
  Skeleton,
  PageSkeleton,
  BreadcrumbSkeleton,
  PageHeaderSkeleton,
  StatsRowSkeleton,
  ControlBarSkeleton,
  TableSkeleton,
  DashboardOverviewSkeleton,
  NavbarSkeleton,
  type PageSkeletonProps,
} from './PageSkeleton'

export {
  Skeleton,
  PageSkeleton,
  BreadcrumbSkeleton,
  PageHeaderSkeleton,
  StatsRowSkeleton,
  ControlBarSkeleton,
  TableSkeleton,
  DashboardOverviewSkeleton,
  NavbarSkeleton,
}

export type { PageSkeletonProps }

/**
 * Reusable full-page or section loader component.
 */
export function PageLoader(props: PageSkeletonProps) {
  return <PageSkeleton {...props} />
}

export default PageLoader
