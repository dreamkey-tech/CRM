'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  MapPin,
  IndianRupee,
  Phone,
  Mail,
  Eye,
  Loader2,
  Inbox,
  X,
  FileSpreadsheet,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import {
  getWebsiteEnquiriesList,
  updateWebsiteEnquiryStatus,
  deleteWebsiteEnquiry,
} from '../../api/websiteEnquiries'
import type {
  WebsiteEnquiry,
  EnquiryStats,
  EnquiryStatus,
  WebsiteEnquiryListParams,
} from '../../types/websiteEnquiries'
import type { PaginationMeta } from '../../types/websiteUsers'
import { EnquiryStatusBadge } from './EnquiryStatusBadge'
import { EnquiryCard } from './EnquiryCard'
import { EnquiryDetailModal } from './EnquiryDetailModal'

interface EnquiriesTabContentProps {
  formatDate: (dateStr: string) => string
  formatDateTime: (dateStr: string) => string
}

export function EnquiriesTabContent({ formatDate, formatDateTime }: EnquiriesTabContentProps) {
  const [enquiries, setEnquiries] = useState<WebsiteEnquiry[]>([])
  const [stats, setStats] = useState<EnquiryStats | null>(null)
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState<WebsiteEnquiry | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy] = useState('createdAt')
  const [sortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  const fetchEnquiries = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true)
      else setIsLoading(true)

      try {
        const params: WebsiteEnquiryListParams = {
          page,
          limit: pagination.limit,
          search,
          status: statusFilter,
          sortBy,
          sortOrder,
        }
        const data = await getWebsiteEnquiriesList(params)
        setEnquiries(data.enquiries)
        setStats(data.stats)
        setPagination(data.pagination)
      } catch (error) {
        console.error('Error fetching website enquiries:', error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [page, pagination.limit, search, statusFilter, sortBy, sortOrder]
  )

  useEffect(() => {
    fetchEnquiries()
  }, [fetchEnquiries])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val)
    setPage(1)
  }

  const handleStatusChange = async (id: string, newStatus: EnquiryStatus, notes?: string) => {
    try {
      const res = await updateWebsiteEnquiryStatus(id, { status: newStatus, notes })
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus, notes: notes ?? e.notes } : e))
        )
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry((prev) =>
            prev ? { ...prev, status: newStatus, notes: notes ?? prev.notes } : null
          )
        }
        fetchEnquiries()
      }
    } catch (err) {
      console.error('Failed to update enquiry status:', err)
    }
  }

  const handleDeleteEnquiry = async (id: string) => {
    try {
      const res = await deleteWebsiteEnquiry(id)
      if (res.success) {
        setEnquiries((prev) => prev.filter((e) => e.id !== id))
        fetchEnquiries()
      }
    } catch (err) {
      console.error('Failed to delete enquiry:', err)
    }
  }

  const handleExportCSV = () => {
    if (!enquiries.length) return
    const headers = [
      'Full Name', 'Mobile No', 'Email', 'Property Type',
      'Preferred Location', 'Budget Band', 'Specific Requirements', 'Status', 'Date',
    ]
    const rows = enquiries.map((e) => [
      `"${e.fullName.replace(/"/g, '""')}"`,
      `"${e.mobileNo}"`,
      `"${e.email}"`,
      `"${e.propertyType}"`,
      `"${e.preferredLocation}"`,
      `"${e.estimatedBudgetBand}"`,
      `"${(e.specificRequirements || '').replace(/"/g, '""')}"`,
      `"${e.status}"`,
      `"${formatDate(e.createdAt)}"`,
    ])
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const a = document.createElement('a')
    a.href = encodeURI(csv)
    a.download = `dreamkey_enquiries_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const STATUS_TABS = [
    { value: 'ALL', label: 'All' },
    { value: 'NEW', label: 'New' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ]

  return (
    <div className="space-y-5">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
        {[
          {
            label: 'Total Enquiries',
            value: stats?.totalEnquiries ?? 0,
            icon: MessageSquare,
            accent: false,
          },
          {
            label: 'Submitted Today',
            value: stats?.newToday ?? 0,
            icon: Calendar,
            accent: true,
          },
          {
            label: 'Pending / New',
            value: stats?.pendingCount ?? 0,
            icon: Clock,
            accent: false,
          },
          {
            label: 'Resolved',
            value: stats?.resolvedCount ?? 0,
            icon: CheckCircle2,
            accent: false,
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-surface px-4 py-4 sm:py-5 flex flex-col justify-between gap-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                {stat.label}
              </span>
              <span
                className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none ${
                  stat.accent ? 'text-gold' : 'text-foreground'
                }`}
              >
                {stat.value.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Control Bar ── */}
      <div className="bg-surface border border-border">
        {/* Search row */}
        <div className="flex items-stretch border-b border-border">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, phone, email, location, budget..."
              className="w-full pl-10 pr-10 py-3 bg-transparent text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center border-l border-border">
            <button
              onClick={() => fetchEnquiries(true)}
              disabled={isRefreshing}
              className="h-full px-3 flex items-center gap-1.5 text-muted-text hover:text-foreground transition-colors text-[10px] font-bold uppercase tracking-wider border-r border-border"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!enquiries.length}
              className="h-full px-3 flex items-center gap-1.5 text-gold hover:text-dark-gold transition-colors text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
              title="Export CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center overflow-x-auto no-scrollbar px-2 py-2 gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusFilterChange(tab.value)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-foreground text-background'
                  : 'text-muted-text hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[320px] bg-surface border border-border">
          <Loader2 className="w-6 h-6 animate-spin text-gold mb-3" />
          <p className="text-xs font-medium text-muted-text uppercase tracking-wider">Loading enquiries...</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[320px] bg-surface border border-border text-center px-4 py-12">
          <div className="w-12 h-12 border border-border flex items-center justify-center mb-4">
            <Inbox className="w-5 h-5 text-muted-text" />
          </div>
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-1">No Enquiries Found</h3>
          <p className="text-xs text-muted-text max-w-xs">
            {search || statusFilter !== 'ALL'
              ? 'No enquiries matched your filters. Try adjusting your search or status filter.'
              : 'No customer enquiries have been submitted yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {enquiries.map((enquiry) => (
              <EnquiryCard
                key={enquiry.id}
                enquiry={enquiry}
                onViewDetail={setSelectedEnquiry}
                onStatusChange={handleStatusChange}
                formatDate={formatDate}
              />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-surface border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    {['Customer', 'Property Type', 'Location', 'Budget', 'Date', 'Status', ''].map((h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="hover:bg-surface-secondary transition-colors cursor-pointer group"
                      onClick={() => setSelectedEnquiry(enquiry)}
                    >
                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gold/10 border border-gold/20 flex items-center justify-center text-dark-gold font-black text-xs shrink-0">
                            {enquiry.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-foreground text-xs block truncate group-hover:text-gold transition-colors">
                              {enquiry.fullName}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-muted-text mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Phone className="w-2.5 h-2.5 text-gold" />
                                {enquiry.mobileNo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Property Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Building2 className="w-3 h-3 text-gold shrink-0" />
                          {enquiry.propertyType}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-text">
                          <MapPin className="w-3 h-3 text-gold shrink-0" />
                          <span className="truncate max-w-[140px]">{enquiry.preferredLocation}</span>
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-dark-gold">{enquiry.estimatedBudgetBand}</span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] text-muted-text whitespace-nowrap font-medium">
                          {formatDate(enquiry.createdAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={enquiry.status}
                          onChange={(e) => handleStatusChange(enquiry.id, e.target.value as EnquiryStatus)}
                          className="bg-surface-secondary border border-border px-2 py-1 text-[10px] font-bold text-foreground focus:outline-none focus:border-gold cursor-pointer uppercase tracking-wide"
                        >
                          <option value="NEW">New</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedEnquiry(enquiry)}
                          className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-gold hover:bg-gold/10 transition-colors ml-auto"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-border px-4 py-3">
            <span className="text-[10px] font-medium text-muted-text uppercase tracking-wider">
              Showing{' '}
              <span className="text-foreground font-bold">{enquiries.length}</span>
              {' '}of{' '}
              <span className="text-foreground font-bold">{pagination.total}</span>
              {' '}enquiries
            </span>

            <div className="flex items-center gap-1">
              {[
                { icon: ChevronsLeft, action: () => setPage(1), disabled: page <= 1, title: 'First' },
                { icon: ChevronLeft, action: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1, title: 'Prev' },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  title={btn.title}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted-text hover:text-foreground hover:border-foreground/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}

              <span className="px-3 text-[10px] font-bold text-foreground uppercase tracking-wider">
                {page} / {pagination.totalPages}
              </span>

              {[
                { icon: ChevronRight, action: () => setPage((p) => Math.min(pagination.totalPages, p + 1)), disabled: page >= pagination.totalPages, title: 'Next' },
                { icon: ChevronsRight, action: () => setPage(pagination.totalPages), disabled: page >= pagination.totalPages, title: 'Last' },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  title={btn.title}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted-text hover:text-foreground hover:border-foreground/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onUpdateStatus={handleStatusChange}
          onDelete={handleDeleteEnquiry}
          formatDate={formatDate}
        />
      )}
    </div>
  )
}
