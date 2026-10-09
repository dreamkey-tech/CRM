import React from 'react'
import { cn } from '../../utils/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Reusable base Skeleton component (Shadcn-compatible).
 * Conforms to the DreamKey CRM design system:
 * - Square / sharp geometry (no rounded corners by default)
 * - Seamless support for both Dark and Light themes via semantic tokens
 * - Smooth pulse animation
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted-text/15 dark:bg-border/80 transition-colors',
        className
      )}
      {...props}
    />
  )
}
