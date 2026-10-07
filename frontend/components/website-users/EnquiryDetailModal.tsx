'use client'

import React, { useState } from 'react'
import {
  X,
  Phone,
  Mail,
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Copy,
  Check,
  Save,
  Loader2,
  Trash2,
} from 'lucide-react'
import type { WebsiteEnquiry, EnquiryStatus } from '../../types/websiteEnquiries'
import { EnquiryStatusBadge } from './EnquiryStatusBadge'

interface EnquiryDetailModalProps {
  enquiry: WebsiteEnquiry | null
  onClose: () => void
  onUpdateStatus: (id: string, newStatus: EnquiryStatus, notes?: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  formatDate: (dateStr: string) => string
}

export function EnquiryDetailModal({
  enquiry,
  onClose,
  onUpdateStatus,
  onDelete,
  formatDate,
}: EnquiryDetailModalProps) {
  if (!enquiry) return null

  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status)
  const [notes, setNotes] = useState<string>(enquiry.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await onUpdateStatus(enquiry.id, status, notes)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    try {
      setIsSubmitting(true)
      await onDelete(enquiry.id)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const initials = enquiry.fullName
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border w-full sm:max-w-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gold/10 border border-gold/25 flex items-center justify-center text-dark-gold font-black text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-bold text-base text-foreground truncate">{enquiry.fullName}</h3>
                <EnquiryStatusBadge status={status} size="sm" />
              </div>
              <p className="text-[10px] text-muted-text flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                <Clock className="w-2.5 h-2.5" />
                Submitted {formatDate(enquiry.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 divide-y divide-border">

          {/* Quick Contact Actions */}
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div className="flex items-center justify-between gap-2 bg-surface-secondary border border-border px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">{enquiry.mobileNo}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copyToClipboard(enquiry.mobileNo, 'mobile')}
                  className="w-6 h-6 flex items-center justify-center text-muted-text hover:text-foreground transition-colors"
                  title="Copy"
                >
                  {copiedField === 'mobile' ? <Check className="w-3.5 h-3.5 text-gold" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`tel:${enquiry.mobileNo}`}
                  className="w-6 h-6 flex items-center justify-center text-gold hover:text-dark-gold transition-colors"
                  title="Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between gap-2 bg-surface-secondary border border-border px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">{enquiry.email}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copyToClipboard(enquiry.email, 'email')}
                  className="w-6 h-6 flex items-center justify-center text-muted-text hover:text-foreground transition-colors"
                  title="Copy"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-gold" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`mailto:${enquiry.email}`}
                  className="w-6 h-6 flex items-center justify-center text-gold hover:text-dark-gold transition-colors"
                  title="Send Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Core Enquiry Fields */}
          <div className="px-5 py-4 grid grid-cols-3 divide-x divide-border">
            <div className="pr-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text flex items-center gap-1 mb-1.5">
                <Building2 className="w-2.5 h-2.5" /> Type
              </span>
              <p className="text-sm font-bold text-foreground">{enquiry.propertyType}</p>
            </div>
            <div className="px-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text flex items-center gap-1 mb-1.5">
                <MapPin className="w-2.5 h-2.5" /> Location
              </span>
              <p className="text-sm font-bold text-foreground">{enquiry.preferredLocation}</p>
            </div>
            <div className="pl-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text flex items-center gap-1 mb-1.5">
                <IndianRupee className="w-2.5 h-2.5" /> Budget
              </span>
              <p className="text-sm font-bold text-dark-gold">{enquiry.estimatedBudgetBand}</p>
            </div>
          </div>

          {/* Specific Requirements */}
          <div className="px-5 py-4">
            <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text flex items-center gap-1 mb-2">
              <FileText className="w-2.5 h-2.5" /> Customer Message / Requirements
            </label>
            <div className="bg-surface-secondary border border-border p-3 text-xs text-foreground leading-relaxed whitespace-pre-wrap min-h-[60px]">
              {enquiry.specificRequirements || (
                <span className="text-muted-text italic">No specific requirements mentioned.</span>
              )}
            </div>
          </div>

          {/* Status + Notes */}
          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1.5">
                  Update Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
                  className="w-full bg-surface-secondary border border-border px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-gold transition-colors cursor-pointer uppercase tracking-wide"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1.5">
                  Enquiry ID
                </label>
                <input
                  type="text"
                  readOnly
                  value={enquiry.id}
                  className="w-full bg-surface-secondary border border-border px-3 py-2 text-[10px] font-mono text-muted-text"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text flex items-center gap-1 mb-1.5">
                <MessageSquare className="w-2.5 h-2.5" /> Internal Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes: conversations, property matches sent, follow-up dates..."
                className="w-full bg-surface-secondary border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-text/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-5 py-4 border-t border-border flex flex-wrap items-center justify-between gap-3 shrink-0 bg-surface-secondary">
          {onDelete && (
            <div>
              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Confirm?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-2.5 py-1 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border text-xs font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-gold hover:bg-dark-gold text-black font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
