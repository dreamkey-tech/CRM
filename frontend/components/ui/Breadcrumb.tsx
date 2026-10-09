'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  /** The text label displayed for this breadcrumb segment */
  label: string
  /** The target URL. If not provided or if the item is active, it renders as plain text */
  href?: string
  /** Optional icon to display alongside the label */
  icon?: React.ComponentType<{ className?: string }>
  /** Manually override whether this item is active (defaults to true for the last item) */
  active?: boolean
}

export interface BreadcrumbProps {
  /** Ordered list of breadcrumb items from root to current page */
  items: BreadcrumbItem[]
  /** Custom separator node. Defaults to a subtle ChevronRight icon */
  separator?: React.ReactNode
  /** Whether to automatically display a Home icon when the first item is 'Home' (default: true) */
  showHomeIcon?: boolean
  /** Additional container classes */
  className?: string
}

/**
 * Reusable Breadcrumb navigation component for DreamKey CRM.
 * Follows the design system: sharp geometry, CSS design tokens, dark/light theme aware.
 *
 * Example:
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/dashboard' },
 *     { label: 'Brokers' }
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({
  items,
  separator,
  showHomeIcon = true,
  className = '',
}: BreadcrumbProps) {
  if (!items || items.length === 0) return null

  const defaultSeparator = (
    <ChevronRight
      className="w-3 h-3 text-muted-text/40 shrink-0 select-none"
      aria-hidden="true"
    />
  )

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-[10px] font-bold uppercase tracking-wider ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isActive = item.active !== undefined ? item.active : isLast
          const isFirst = index === 0

          // Determine icon: custom icon prop, or auto Home icon for first item if label is 'Home'
          let IconComponent = item.icon
          if (!IconComponent && isFirst && showHomeIcon && item.label.toLowerCase() === 'home') {
            IconComponent = Home
          }

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {isActive || !item.href ? (
                <span
                  aria-current={isActive ? 'page' : undefined}
                  className="flex items-center gap-1.5 text-foreground select-none"
                >
                  {IconComponent && (
                    <IconComponent className="w-3 h-3 text-gold shrink-0" />
                  )}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="group flex items-center gap-1.5 text-muted-text hover:text-gold transition-colors duration-150 focus:outline-none focus-visible:underline"
                >
                  {IconComponent && (
                    <IconComponent className="w-3 h-3 text-muted-text group-hover:text-gold transition-colors duration-150 shrink-0" />
                  )}
                  <span>{item.label}</span>
                </Link>
              )}

              {!isLast && (
                <span className="flex items-center" aria-hidden="true">
                  {separator ?? defaultSeparator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
