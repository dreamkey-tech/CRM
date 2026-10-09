'use client'

import React from 'react'
import type { PropertyListingStatus } from '../../types/property'

interface PropertyStatusBadgeProps {
  status: PropertyListingStatus | string
}

export function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'Available',
          dotColor: 'bg-emerald-400',
          textColor: 'text-foreground',
        }
      case 'UNDER_NEGOTIATION':
        return {
          label: 'Under Negotiation',
          dotColor: 'bg-amber-400',
          textColor: 'text-amber-400',
        }
      case 'TOKEN_PAID':
        return {
          label: 'Token Paid',
          dotColor: 'bg-blue-400',
          textColor: 'text-blue-400',
        }
      case 'DEAL_DONE':
        return {
          label: 'Deal Done',
          dotColor: 'bg-gold',
          textColor: 'text-gold',
        }
      case 'RENTED_OUT':
        return {
          label: 'Rented Out',
          dotColor: 'bg-purple-400',
          textColor: 'text-purple-400',
        }
      case 'SOLD':
        return {
          label: 'Sold',
          dotColor: 'bg-rose-400',
          textColor: 'text-rose-400',
        }
      case 'UPCOMING':
        return {
          label: 'Upcoming',
          dotColor: 'bg-cyan-400',
          textColor: 'text-cyan-400',
        }
      default:
        return {
          label: status || 'Unknown',
          dotColor: 'bg-muted-text',
          textColor: 'text-muted-text',
        }
    }
  }

  const { label, dotColor, textColor } = getStatusConfig()

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${textColor} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 ${dotColor} shrink-0`} />
      {label}
    </span>
  )
}
