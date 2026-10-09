import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Skeleton } from './Skeleton'

export { Skeleton } from './Skeleton'
export type { SkeletonProps } from './Skeleton'

// ── 1. Breadcrumb Skeleton ───────────────────────────────────────────────────

export function BreadcrumbSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-1.5">
            {i === 0 && <Skeleton className="w-3 h-3" />}
            <Skeleton className={`h-2.5 ${i === 0 ? 'w-10' : 'w-20'}`} />
          </div>
          {i < count - 1 && (
            <ChevronRight className="w-3 h-3 text-muted-text/30 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── 2. Page Header Skeleton ──────────────────────────────────────────────────

export function PageHeaderSkeleton({ hasButton = true }: { hasButton?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-9 h-9 shrink-0 bg-gold/15" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-44 sm:w-56" />
          <Skeleton className="h-2.5 w-60 sm:w-80" />
        </div>
      </div>
      {hasButton && <Skeleton className="h-9 w-32 shrink-0" />}
    </div>
  )
}

// ── 3. Stats Row Skeleton ────────────────────────────────────────────────────

export function StatsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 4. Control Bar Skeleton ──────────────────────────────────────────────────

export function ControlBarSkeleton({ hasFilters = true }: { hasFilters?: boolean }) {
  return (
    <div className="bg-surface border border-border">
      {/* Search row */}
      <div className="flex items-stretch border-b border-border h-11 px-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-3.5 h-3.5 shrink-0" />
          <Skeleton className="h-3 w-1/3 max-w-sm" />
        </div>
        <div className="flex items-center border-l border-border pl-3">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Filter pills & sort row */}
      {hasFilters && (
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-border overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-7 w-28 shrink-0" />
        </div>
      )}
    </div>
  )
}

// ── 5. Data Table Skeleton ───────────────────────────────────────────────────

export function TableSkeleton({
  rows = 6,
  columns = 6,
  hasHeader = true,
  hasPagination = true,
}: {
  rows?: number
  columns?: number
  hasHeader?: boolean
  hasPagination?: boolean
}) {
  return (
    <div className="bg-surface border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {hasHeader && (
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <Skeleton className="h-2.5 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-surface-secondary/40 transition-colors">
                {/* Column 1: Avatar + Name + Subtitle */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                  </div>
                </td>

                {/* Column 2: Contact info */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </td>

                {/* Column 3: Area / tags */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                  </div>
                </td>

                {/* Column 4: Range / Values */}
                <td className="py-3.5 px-4">
                  <Skeleton className="h-3 w-20" />
                </td>

                {/* Column 5: Status */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-1.5 h-1.5" />
                    <Skeleton className="h-2.5 w-14" />
                  </div>
                </td>

                {/* Column 6: Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="w-7 h-7" />
                    <Skeleton className="w-7 h-7" />
                    <Skeleton className="w-7 h-7" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {hasPagination && (
        <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-secondary">
          <Skeleton className="h-3 w-36" />
          <div className="flex items-center gap-1">
            <Skeleton className="w-7 h-7" />
            <Skeleton className="h-3 w-16 mx-2" />
            <Skeleton className="w-7 h-7" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── 6. Dashboard Overview Skeleton ───────────────────────────────────────────

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Desktop 2-column top briefing & stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mt-6">
        {/* Briefing Card */}
        <div className="bg-surface border border-border p-6 space-y-4 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* Stats Overview Card */}
        <div className="bg-surface border border-border p-6 space-y-4 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </div>

      {/* Menus Section Header */}
      <div className="space-y-1 border-b border-border pb-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-80" />
      </div>

      {/* 6 Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border p-5 space-y-4 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="w-10 h-10 shrink-0" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 7. Top Navigation Bar Skeleton ───────────────────────────────────────────

export function NavbarSkeleton() {
  return (
    <header className="w-full bg-surface border-b border-border/80 fixed top-0 z-40 shadow-xs h-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9" />
          <Skeleton className="w-9 h-9" />
          <div className="flex items-center gap-2.5 pl-2">
            <Skeleton className="w-8 h-8" />
            <div className="hidden md:block space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-14" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ── 8. Full Page Skeleton Container ──────────────────────────────────────────

export interface PageSkeletonProps {
  /** Layout style: 'table' for directory lists, 'dashboard' for executive briefing */
  variant?: 'table' | 'dashboard' | 'custom'
  /** Optional custom title width or custom content */
  children?: React.ReactNode
  /** Breadcrumb items count (for table variant) */
  breadcrumbCount?: number
  /** Stats cards count (for table variant) */
  statsCount?: number
  /** Number of table rows */
  tableRows?: number
  /** Container max-width class */
  maxWidthClass?: string
}

export function PageSkeleton({
  variant = 'table',
  children,
  breadcrumbCount = 2,
  statsCount = 4,
  tableRows = 6,
  maxWidthClass = 'max-w-7xl',
}: PageSkeletonProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavbarSkeleton />

      <main className={`${maxWidthClass} mx-auto px-3 sm:px-6 pt-20 pb-12 space-y-5`}>
        {variant === 'table' && (
          <>
            <BreadcrumbSkeleton count={breadcrumbCount} />
            <PageHeaderSkeleton hasButton={true} />
            <StatsRowSkeleton count={statsCount} />
            <ControlBarSkeleton hasFilters={true} />
            <TableSkeleton rows={tableRows} />
          </>
        )}

        {variant === 'dashboard' && <DashboardOverviewSkeleton />}

        {variant === 'custom' && children}
      </main>
    </div>
  )
}
