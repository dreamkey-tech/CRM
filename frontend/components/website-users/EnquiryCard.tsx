'use client'

import React from 'react'
import { Phone, Mail, MapPin, Building2, IndianRupee, Calendar, ChevronRight, FileText } from 'lucide-react'
import type { WebsiteEnquiry, EnquiryStatus } from '../../types/websiteEnquiries'
import { EnquiryStatusBadge } from './EnquiryStatusBadge'

interface EnquiryCardProps {
  enquiry: WebsiteEnquiry
  onViewDetail: (enquiry: WebsiteEnquiry) => void
  onStatusChange: (id: string, newStatus: EnquiryStatus) => void
  formatDate: (dateStr: string) => string
}

export function EnquiryCard({
  enquiry,
  onViewDetail,
  onStatusChange,
  formatDate,
}: EnquiryCardProps) {
  const initials = enquiry.fullName
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className="bg-surface border border-border hover:border-gold/40 transition-colors duration-150 cursor-pointer"
      onClick={() => onViewDetail(enquiry)}
    >
      {/* Top strip: avatar + name + status */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gold/10 border border-gold/20 flex items-center justify-center text-dark-gold font-black text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-foreground text-sm truncate">{enquiry.fullName}</h4>
            <p className="text-[10px] text-muted-text flex items-center gap-1 mt-0.5 uppercase tracking-wider">
              <Calendar className="w-2.5 h-2.5 shrink-0" />
              {formatDate(enquiry.createdAt)}
            </p>
          </div>
        </div>
        <EnquiryStatusBadge status={enquiry.status} size="sm" />
      </div>

      {/* Property details row */}
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
        <div className="px-3 py-2.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1 mb-1">
            <Building2 className="w-2.5 h-2.5" />
            Type
          </span>
          <span className="text-xs font-semibold text-foreground truncate block">{enquiry.propertyType}</span>
        </div>
        <div className="px-3 py-2.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1 mb-1">
            <MapPin className="w-2.5 h-2.5" />
            Location
          </span>
          <span className="text-xs font-semibold text-foreground truncate block">{enquiry.preferredLocation}</span>
        </div>
      </div>

      {/* Budget band */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1">
          <IndianRupee className="w-2.5 h-2.5" />
          Budget Band
        </span>
        <span className="text-xs font-bold text-dark-gold">{enquiry.estimatedBudgetBand}</span>
      </div>

      {/* Contact row */}
      <div className="px-4 py-2.5 border-b border-border space-y-1">
        <a
          href={`tel:${enquiry.mobileNo}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-xs text-muted-text hover:text-gold transition-colors"
        >
          <Phone className="w-3 h-3 shrink-0" />
          <span className="truncate">{enquiry.mobileNo}</span>
        </a>
        <a
          href={`mailto:${enquiry.email}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-xs text-muted-text hover:text-gold transition-colors"
        >
          <Mail className="w-3 h-3 shrink-0" />
          <span className="truncate">{enquiry.email}</span>
        </a>
      </div>

      {/* Actions footer */}
      <div className="px-4 py-3 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <select
          value={enquiry.status}
          onChange={(e) => onStatusChange(enquiry.id, e.target.value as EnquiryStatus)}
          className="text-[10px] font-bold uppercase tracking-wide bg-surface-secondary border border-border px-2 py-1.5 text-foreground focus:outline-none focus:border-gold cursor-pointer"
        >
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="CONTACTED">Contacted</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <button
          onClick={() => onViewDetail(enquiry)}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold hover:text-dark-gold transition-colors"
        >
          <span>Details</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
