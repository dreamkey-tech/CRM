'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Handshake,
  Plus,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  Mail,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Loader2,
  X,
  ChevronDown,
} from 'lucide-react'
import { useThemeStore } from '../../store/useThemeStore'
import { getBrokersList, getBrokerStats } from '../../api/brokers'
import { BrokerStatusBadge } from './BrokerStatusBadge'
import { BrokersStatsRow } from './BrokersStatsRow'
import { BrokerFormModal } from './BrokerFormModal'
import { BrokerDetailModal } from './BrokerDetailModal'
import { DeleteBrokerConfirmModal } from './DeleteBrokerConfirmModal'
import { Breadcrumb } from '../ui/Breadcrumb'
import { TableSkeleton } from '../ui/PageSkeleton'
import { formatDealRange } from '../../utils/formatters'
import type { Broker, BrokerStats, BrokerStatus, BrokerQueryParams, BrokerPagination } from '../../types/broker'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function hashColor(str: string): string {
  const palette = [
    '#D4AF37', '#10b981', '#3b82f6', '#8b5cf6',
    '#f59e0b', '#ef4444', '#06b6d4', '#ec4899',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

// ── Hubs Dropdown ─────────────────────────────────────────────────────────────

interface HubsDropdownProps {
  topAreas: Array<{ area: string; count: number }>
  selectedArea: string
  onSelectArea: (area: string) => void
  totalBrokers: number
}

function HubsDropdown({ topAreas, selectedArea, onSelectArea, totalBrokers }: HubsDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = topAreas.find((o) => o.area.toLowerCase() === selectedArea.toLowerCase())

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative flex-1 md:flex-initial flex items-stretch md:border-l border-border">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full md:w-auto self-stretch px-3 sm:px-3.5 py-2.5 md:py-0 flex items-center justify-between md:justify-start gap-1.5 transition-colors text-[10px] font-bold uppercase tracking-wider hover:bg-surface-secondary/50 cursor-pointer whitespace-nowrap ${
          selectedArea ? 'text-gold' : 'text-muted-text hover:text-foreground'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className="text-muted-text hidden xs:inline">Hub:</span>
          <span className="max-w-[85px] xs:max-w-[120px] sm:max-w-[140px] md:max-w-[170px] truncate text-foreground font-bold">
            {current ? current.area : 'All Hubs'}
          </span>
        </div>
        <ChevronDown className={`w-3 h-3 shrink-0 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 mt-px w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-surface border border-border shadow-2xl z-30 divide-y divide-border animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-3.5 py-2 bg-surface-secondary text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
            <span>Operational Hubs</span>
            <span>{topAreas.length} Hubs Available</span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-border/60">
            <button
              type="button"
              onClick={() => {
                onSelectArea('')
                setOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                !selectedArea
                  ? 'bg-foreground text-background font-bold'
                  : 'text-foreground hover:bg-surface-secondary'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 ${!selectedArea ? 'bg-background' : 'bg-gold'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  All Hubs
                </span>
              </div>
              <span
                className={`text-[9px] font-mono ${
                  !selectedArea ? 'text-background/80 font-bold' : 'text-muted-text'
                }`}
              >
                {totalBrokers} total
              </span>
            </button>

            {topAreas.map((item) => {
              const isSelected = selectedArea.toLowerCase() === item.area.toLowerCase()
              return (
                <button
                  key={item.area}
                  type="button"
                  onClick={() => {
                    onSelectArea(item.area)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background font-bold'
                      : 'text-foreground hover:bg-surface-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`w-1.5 h-1.5 shrink-0 ${
                        isSelected ? 'bg-background' : 'bg-muted-text/60'
                      }`}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                      {item.area}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono shrink-0 ${
                      isSelected ? 'text-background/80 font-bold' : 'text-muted-text'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sort Dropdown ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'name', label: 'Broker Name' },
  { value: 'minDealValue', label: 'Min Budget' },
  { value: 'maxDealValue', label: 'Max Budget' },
] as const

type SortByValue = typeof SORT_OPTIONS[number]['value']

interface SortDropdownProps {
  value: SortByValue
  order: 'asc' | 'desc'
  onChangeSort: (v: SortByValue) => void
  onToggleOrder: () => void
}

function SortDropdown({ value, order, onChangeSort, onToggleOrder }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = SORT_OPTIONS.find((o) => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex-1 md:flex-initial flex items-stretch border-l border-border">
      {/* Sort Option Dropdown */}
      <div ref={ref} className="relative flex-1 md:flex-initial flex items-stretch">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full md:w-auto self-stretch px-3 sm:px-3.5 py-2.5 md:py-0 flex items-center justify-between md:justify-start gap-1.5 text-muted-text hover:text-foreground hover:bg-surface-secondary/50 transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
        >
          <span className="truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none">{current?.label}</span>
          <ChevronDown className={`w-3 h-3 shrink-0 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full right-0 mt-px w-48 max-w-[calc(100vw-1.5rem)] bg-surface border border-border shadow-2xl z-30 divide-y divide-border animate-in fade-in zoom-in-95 duration-100">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChangeSort(opt.value); setOpen(false) }}
                className={`w-full text-left px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  value === opt.value
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-text hover:text-foreground hover:bg-surface-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Asc / Desc Toggle Button */}
      <button
        type="button"
        onClick={onToggleOrder}
        title={order === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
        className="self-stretch px-2.5 sm:px-3.5 py-2.5 md:py-0 flex items-center gap-1 border-l border-border text-muted-text hover:text-foreground hover:bg-surface-secondary/50 transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap shrink-0"
      >
        {order === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
        <span className="hidden xs:inline">{order === 'asc' ? 'Asc' : 'Desc'}</span>
      </button>
    </div>
  )
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function BrokersView() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  // Data
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [stats, setStats] = useState<BrokerStats | null>(null)
  const [pagination, setPagination] = useState<BrokerPagination>({
    total: 0, page: 1, limit: 15, totalPages: 1,
    hasNextPage: false, hasPrevPage: false,
  })

  // Loading
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = (searchParams.get('status') as BrokerStatus) || 'ALL'
  const initialArea = searchParams.get('area') || ''

  // Filters
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<BrokerStatus | 'ALL'>(initialStatus)
  const [areaFilter, setAreaFilter] = useState(initialArea)
  const [sortBy, setSortBy] = useState<SortByValue>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  // Sync state if URL query parameters change (e.g. navigation / deep linking)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    const urlStatus = (searchParams.get('status') as BrokerStatus) || 'ALL'
    const urlArea = searchParams.get('area') || ''
    if (urlSearch !== search) {
      setSearch(urlSearch)
      setDebouncedSearch(urlSearch)
    }
    if (urlStatus !== statusFilter) {
      setStatusFilter(urlStatus)
    }
    if (urlArea !== areaFilter) {
      setAreaFilter(urlArea)
    }
  }, [searchParams])

  // Debounce search input (wait 350ms after user pauses typing before querying API)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [brokerToEdit, setBrokerToEdit] = useState<Broker | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [brokerToDelete, setBrokerToDelete] = useState<Broker | null>(null)

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)
    try {
      const res = await getBrokerStats()
      setStats(res)
    } catch (err) {
      console.error('Error fetching broker stats:', err)
    } finally {
      setIsStatsLoading(false)
    }
  }, [])

  const fetchBrokers = useCallback(
    async (pageToFetch = page) => {
      setIsLoading(true)
      try {
        const queryParams: BrokerQueryParams = {
          page: pageToFetch,
          limit: pagination.limit,
          search: debouncedSearch.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          areaOfOperation: areaFilter || undefined,
          sortBy,
          sortOrder,
        }
        const res = await getBrokersList(queryParams)
        setBrokers(res.brokers)
        setPagination(res.pagination)
      } catch (err) {
        console.error('Error fetching brokers list:', err)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [page, pagination.limit, debouncedSearch, statusFilter, areaFilter, sortBy, sortOrder]
  )

  useEffect(() => { fetchStats() }, [fetchStats])

  // Reset to page 1 whenever any filter or sort changes
  useEffect(() => {
    if (page !== 1) {
      setPage(1)
    }
  }, [debouncedSearch, statusFilter, areaFilter, sortBy, sortOrder])

  // Trigger broker fetching on page or filter changes
  useEffect(() => {
    fetchBrokers(page)
  }, [page, debouncedSearch, statusFilter, areaFilter, sortBy, sortOrder, fetchBrokers])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleClearSearch = () => {
    setSearch('')
    setDebouncedSearch('')
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchBrokers(page)
    fetchStats()
  }

  const handleOpenAddModal = () => { setBrokerToEdit(null); setIsFormModalOpen(true) }
  const handleOpenEditModal = (broker: Broker) => { setBrokerToEdit(broker); setIsFormModalOpen(true) }
  const handleOpenDetailModal = (broker: Broker) => { setSelectedBroker(broker); setIsDetailModalOpen(true) }
  const handleOpenDeleteModal = (broker: Broker) => { setBrokerToDelete(broker); setIsDeleteModalOpen(true) }

  const handleFormSuccess = () => { fetchBrokers(); fetchStats() }
  const handleDeleteSuccess = () => {
    if (isDetailModalOpen) setIsDetailModalOpen(false)
    fetchBrokers()
    fetchStats()
  }

  const STATUS_FILTERS: { value: BrokerStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'BLOCKED', label: 'Blocked' },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb Navigation ── */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Brokers' },
        ]}
      />

      {/* ── 1. Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gold/10 flex items-center justify-center">
              <Handshake className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                Broker & Partner Network
              </h2>
              <p className="text-[10px] text-muted-text mt-0.5">
                Channel partners, territory expertise, deal ranges, and relationship tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-background text-[10px] font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Broker
          </button>
        </div>
      </div>

      {/* ── 2. Stats Row ── */}
      <BrokersStatsRow
        stats={stats}
        loading={isStatsLoading}
        isDark={isDark}
      />

      {/* ── 3. Control Bar ── */}
      <div className="bg-surface border border-border">
        {/* Search + actions container (stacked on mobile, unified row on md+) */}
        <div className="flex flex-col md:flex-row md:items-stretch border-b border-border">
          {/* Row 1 on mobile: Search bar + Refresh button */}
          <div className="flex items-stretch flex-1 border-b md:border-b-0 border-border">
            <div className="relative flex-1 flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3.5 text-muted-text pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, email, area..."
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-transparent text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 text-muted-text hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 flex items-center gap-1.5 border-l border-border text-muted-text hover:text-foreground hover:bg-surface-secondary/50 transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Row 2 on mobile / Right actions on desktop: Hubs Dropdown + Sort */}
          <div className="flex items-stretch divide-x-0">
            {/* Hubs Dropdown */}
            <HubsDropdown
              topAreas={stats?.topAreas || []}
              selectedArea={areaFilter}
              onSelectArea={(area) => { setAreaFilter(area); setPage(1) }}
              totalBrokers={stats?.totalBrokers || 0}
            />

            {/* Sort dropdown */}
            <SortDropdown
              value={sortBy}
              order={sortOrder}
              onChangeSort={(v) => { setSortBy(v); setPage(1) }}
              onToggleOrder={() => { setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc')); setPage(1) }}
            />
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto no-scrollbar">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1) }}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.value
                  ? 'bg-foreground text-background'
                  : 'text-muted-text hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Active filter tags */}
          {(debouncedSearch || areaFilter) && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-[10px] font-bold uppercase tracking-wider text-gold shrink-0">
                  "{debouncedSearch}"
                  <button onClick={handleClearSearch} className="hover:text-foreground cursor-pointer">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {areaFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-[10px] font-bold uppercase tracking-wider text-gold shrink-0">
                  {areaFilter}
                  <button onClick={() => setAreaFilter('')} className="hover:text-foreground cursor-pointer">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── 4. Table / States ── */}
      {isLoading ? (
        <TableSkeleton rows={pagination.limit || 8} columns={7} />
      ) : brokers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[320px] bg-surface border border-border text-center px-4 py-12">
          <div className="w-12 h-12 border border-border flex items-center justify-center mb-4">
            <Handshake className="w-5 h-5 text-muted-text" />
          </div>
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-1">
            No Brokers Found
          </h3>
          <p className="text-xs text-muted-text max-w-xs mb-4">
            {debouncedSearch || statusFilter !== 'ALL' || areaFilter
              ? 'No broker records matched your search or filters. Try clearing some filters.'
              : 'Your broker directory is empty. Add your first channel partner to get started.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-background text-[10px] font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Broker
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  {['Broker / Partner', 'Contact', 'Area & Expertise', 'Budget Range', 'Primary Partner', 'Status', ''].map((h) => (
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
                {brokers.map((broker) => {
                  const whatsappDigits = broker.whatsappNumber
                    ? broker.whatsappNumber.replace(/[^0-9]/g, '')
                    : broker.phone
                    ? broker.phone.replace(/[^0-9]/g, '')
                    : null

                  const whatsappUrl = whatsappDigits
                    ? `https://wa.me/${whatsappDigits.length === 10 ? '91' + whatsappDigits : whatsappDigits}?text=Hi%20${encodeURIComponent(broker.name)},%20reaching%20out%20from%20DreamKey%20Real%20Estate.`
                    : null

                  return (
                    <tr
                      key={broker.id}
                      className="hover:bg-surface-secondary transition-colors cursor-pointer group"
                      onClick={() => handleOpenDetailModal(broker)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 flex items-center justify-center text-white font-black text-xs shrink-0"
                            style={{ background: hashColor(broker.name) }}
                          >
                            {getInitials(broker.name)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-foreground text-xs block truncate group-hover:text-gold transition-colors">
                              {broker.name}
                            </span>
                            {broker.notes && (
                              <span className="text-[10px] text-muted-text block truncate max-w-[180px]">
                                {broker.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {broker.phone && (
                            <div className="flex items-center gap-1.5 text-foreground font-mono text-[11px]">
                             
                              <span>{broker.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {broker.phone && (
                              <a
                                href={`tel:${broker.phone}`}
                                title="Call"
                                className="w-6 h-6 flex items-center justify-center text-muted-text hover:text-gold hover:bg-gold/10 transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="WhatsApp"
                                className="w-6 h-6 flex items-center justify-center text-muted-text hover:text-gold hover:bg-gold/10 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            )}
                            {broker.email && (
                              <a
                                href={`mailto:${broker.email}`}
                                title="Email"
                                className="w-6 h-6 flex items-center justify-center text-muted-text hover:text-gold hover:bg-gold/10 transition-colors"
                              >
                                <Mail className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Area & Expertise */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                            <MapPin className="w-3 h-3 text-gold shrink-0" />
                            <span>{broker.areaOfOperation || '—'}</span>
                          </div>
                          {broker.societyExpertise && broker.societyExpertise.length > 0 && (
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {broker.societyExpertise.slice(0, 2).map((soc, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 text-[10px] bg-surface-secondary border border-border text-muted-text font-medium"
                                >
                                  {soc}
                                </span>
                              ))}
                              {broker.societyExpertise.length > 2 && (
                                <span className="text-[10px] text-muted-text">
                                  +{broker.societyExpertise.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Budget Range */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-foreground">
                          {formatDealRange(broker.minDealValue, broker.maxDealValue)}
                        </span>
                      </td>

                      {/* Primary Contact Partner */}
                      <td className="py-3.5 px-4">
                        {broker.primaryContactPartner ? (
                          <div>
                            <div className="text-xs font-bold text-foreground">
                              {broker.primaryContactPartner.name || 'DreamKey Partner'}
                            </div>
                            <div className="text-[10px] text-muted-text">
                              {broker.primaryContactPartner.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-text italic">Not Assigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <BrokerStatusBadge status={broker.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(broker)}
                            className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-gold hover:bg-gold/10 transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(broker)}
                            className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-gold hover:bg-gold/10 transition-colors"
                            title="Edit Broker"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(broker)}
                            className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-red-500 transition-colors"
                            title="Delete Broker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-secondary">
            <span className="text-[10px] font-medium text-muted-text uppercase tracking-wider">
              Showing{' '}
              <span className="text-foreground font-bold">{brokers.length}</span> of{' '}
              <span className="text-foreground font-bold">{pagination.total}</span> brokers
            </span>

            <div className="flex items-center gap-1">
              {[
                { icon: ChevronsLeft, action: () => setPage(1), disabled: !pagination.hasPrevPage },
                { icon: ChevronLeft, action: () => setPage((p) => Math.max(1, p - 1)), disabled: !pagination.hasPrevPage },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  disabled={btn.disabled || isLoading}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted-text hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <span className="px-3 text-[10px] font-bold text-foreground uppercase tracking-wider">
                {pagination.page} / {pagination.totalPages || 1}
              </span>
              {[
                { icon: ChevronRight, action: () => setPage((p) => Math.min(pagination.totalPages, p + 1)), disabled: !pagination.hasNextPage },
                { icon: ChevronsRight, action: () => setPage(pagination.totalPages), disabled: !pagination.hasNextPage },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  disabled={btn.disabled || isLoading}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted-text hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <BrokerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        brokerToEdit={brokerToEdit}
        isDark={isDark}
      />

      <BrokerDetailModal
        broker={selectedBroker}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(broker) => { setIsDetailModalOpen(false); handleOpenEditModal(broker) }}
        onDelete={(broker) => { setIsDetailModalOpen(false); handleOpenDeleteModal(broker) }}
        isDark={isDark}
      />

      <DeleteBrokerConfirmModal
        broker={brokerToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        isDark={isDark}
      />
    </div>
  )
}
