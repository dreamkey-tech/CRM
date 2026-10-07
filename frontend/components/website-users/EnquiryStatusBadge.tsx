'use client'

import React from 'react'
import { Clock, CheckCircle2, XCircle, HelpCircle, PhoneCall } from 'lucide-react'
import type { EnquiryStatus } from '../../types/websiteEnquiries'

interface EnquiryStatusBadgeProps {
  status: EnquiryStatus | string
  size?: 'sm' | 'md'
}

export function EnquiryStatusBadge({ status, size = 'md' }: EnquiryStatusBadgeProps) {
  const normStatus = (status || 'NEW').toUpperCase()

  const config: Record<
    string,
    { label: string; dotColor: string; textColor: string }
  > = {
    NEW: {
      label: 'New',
      dotColor: 'bg-gold',
      textColor: 'text-dark-gold',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      dotColor: 'bg-foreground',
      textColor: 'text-foreground',
    },
    CONTACTED: {
      label: 'Contacted',
      dotColor: 'bg-foreground/60',
      textColor: 'text-foreground',
    },
    RESOLVED: {
      label: 'Resolved',
      dotColor: 'bg-foreground',
      textColor: 'text-foreground',
    },
    CLOSED: {
      label: 'Closed',
      dotColor: 'bg-muted-text',
      textColor: 'text-muted-text',
    },
  }

  const current = config[normStatus] || {
    label: normStatus,
    dotColor: 'bg-muted-text',
    textColor: 'text-muted-text',
  }

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider ${current.textColor} ${textSize}`}>
      <span className={`w-1.5 h-1.5 shrink-0 ${current.dotColor}`} />
      {current.label}
    </span>
  )
}
