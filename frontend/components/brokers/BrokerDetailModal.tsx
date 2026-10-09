'use client'

import React from 'react'
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  ShieldCheck,
  FileText,
  IndianRupee,
} from 'lucide-react'
import { BrokerStatusBadge } from './BrokerStatusBadge'
import { formatDealRange, formatDate, formatRelativeTime } from '../../utils/formatters'
import type { Broker } from '../../types/broker'

function hashColor(str: string): string {
  const palette = [
    '#D4AF37', '#10b981', '#3b82f6', '#8b5cf6',
    '#f59e0b', '#ef4444', '#06b6d4', '#ec4899',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

function getInitials(name: string): string {
  return name.trim().split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

interface BrokerDetailModalProps {
  broker: Broker | null
  isOpen: boolean
  onClose: () => void
  onEdit: (broker: Broker) => void
  onDelete: (broker: Broker) => void
  isDark?: boolean
}

export function BrokerDetailModal({
  broker,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: BrokerDetailModalProps) {
  if (!isOpen || !broker) return null

  const whatsappDigits = broker.whatsappNumber
    ? broker.whatsappNumber.replace(/[^0-9]/g, '')
    : broker.phone
    ? broker.phone.replace(/[^0-9]/g, '')
    : null

  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits.length === 10 ? '91' + whatsappDigits : whatsappDigits}?text=Hi%20${encodeURIComponent(broker.name)},%20reaching%20out%20from%20DreamKey%20Real%20Estate.`
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 flex items-center justify-center text-white font-black text-sm shrink-0"
              style={{ background: hashColor(broker.name) }}
            >
              {getInitials(broker.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-foreground">{broker.name}</h3>
                <BrokerStatusBadge status={broker.status} />
              </div>
              <p className="text-[10px] text-muted-text mt-0.5 font-mono">
                ID: {broker.id.slice(0, 12)}…
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 divide-y divide-border">

          {/* Quick Contact Actions */}
          <div className="grid grid-cols-3 divide-x divide-border">
            {broker.phone ? (
              <a
                href={`tel:${broker.phone}`}
                className="flex items-center justify-center gap-2 py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-text/40 cursor-not-allowed">
                <Phone className="w-3.5 h-3.5" />
                <span>No Phone</span>
              </div>
            )}

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-gold hover:bg-surface-secondary transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-text/40 cursor-not-allowed">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>No WhatsApp</span>
              </div>
            )}

            {broker.email ? (
              <a
                href={`mailto:${broker.email}`}
                className="flex items-center justify-center gap-2 py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-text/40 cursor-not-allowed">
                <Mail className="w-3.5 h-3.5" />
                <span>No Email</span>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            <div className="px-4 py-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1">Mobile</span>
              <span className="text-xs font-bold text-foreground font-mono">{broker.phone || '—'}</span>
            </div>
            <div className="px-4 py-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1">WhatsApp</span>
              <span className="text-xs font-bold text-foreground font-mono">{broker.whatsappNumber || broker.phone || '—'}</span>
            </div>
            <div className="px-4 py-3 col-span-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1">Email</span>
              <span className="text-xs font-bold text-foreground truncate block">{broker.email || '—'}</span>
            </div>
          </div>

          {/* Area & Budget */}
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gold" /> Area of Operation
              </p>
              <p className="text-xs font-bold text-foreground">
                {broker.areaOfOperation || 'All Prime Localities'}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-gold" /> Deal Capacity
              </p>
              <p className="text-xs font-bold text-foreground">
                {formatDealRange(broker.minDealValue, broker.maxDealValue)}
              </p>
            </div>
          </div>

          {/* Primary Partner */}
          <div className="px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-gold" /> Primary Contact Partner
            </p>
            {broker.primaryContactPartner ? (
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">
                    {broker.primaryContactPartner.name || 'DreamKey Partner'}
                  </p>
                  <p className="text-[10px] text-muted-text">{broker.primaryContactPartner.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-text italic">No internal partner assigned.</p>
            )}
          </div>

          {/* Society Expertise */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text flex items-center gap-1">
                <Building2 className="w-3 h-3 text-gold" /> Society / Locality Expertise
              </p>
              <span className="text-[10px] text-muted-text font-medium">
                {broker.societyExpertise?.length || 0} societies
              </span>
            </div>
            {broker.societyExpertise && broker.societyExpertise.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {broker.societyExpertise.map((soc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 bg-surface-secondary border border-border text-[10px] font-medium text-foreground"
                  >
                    {soc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-text italic">No specific societies recorded.</p>
            )}
          </div>

          {/* Notes */}
          {broker.notes && (
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3 text-gold" /> CRM Notes
              </p>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{broker.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="px-4 py-3 flex flex-wrap items-center gap-4 bg-surface-secondary">
            <span className="text-[10px] text-muted-text flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Added: {formatDate(broker.createdAt)}
            </span>
            <span className="text-[10px] text-muted-text flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated: {formatRelativeTime(broker.updatedAt)}
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between shrink-0 bg-surface-secondary">
          <button
            type="button"
            onClick={() => onDelete(broker)}
            className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
          >
            Delete Broker
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit(broker)}
              className="px-4 py-2 bg-gold hover:bg-primary-hover text-background text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
