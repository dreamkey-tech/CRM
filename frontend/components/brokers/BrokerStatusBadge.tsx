'use client'

import React from 'react'
import type { BrokerStatus } from '../../types/broker'

interface BrokerStatusBadgeProps {
  status: BrokerStatus
  className?: string
}

export function BrokerStatusBadge({ status, className = '' }: BrokerStatusBadgeProps) {
  const config: Record<string, { label: string; dotClass: string; textClass: string }> = {
    ACTIVE: {
      label: 'Active',
      dotClass: 'bg-foreground',
      textClass: 'text-foreground',
    },
    INACTIVE: {
      label: 'Inactive',
      dotClass: 'bg-muted-text',
      textClass: 'text-muted-text',
    },
    BLOCKED: {
      label: 'Blocked',
      dotClass: 'bg-red-500',
      textClass: 'text-red-500',
    },
  }

  const c = config[status] ?? {
    label: status,
    dotClass: 'bg-muted-text',
    textClass: 'text-muted-text',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${c.textClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 shrink-0 ${c.dotClass}`} />
      {c.label}
    </span>
  )
}
