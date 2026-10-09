'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  X,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  Camera,
  Video,
  FileText,
  ChevronDown,
  Bookmark,
  BookmarkPlus,
  ExternalLink,
} from 'lucide-react'
import { useRouter } from '../../context/NavigationLoaderContext'
import { useDebounce } from '../../utils/useDebounce'
import { toast } from '../../utils/toast'
import { handleActionApiError } from '../../utils/errorHandler'
import {
  getProperties,
  getFilterPresets,
  deleteFilterPreset,
} from '../../api/properties'
import { Breadcrumb } from '../ui/Breadcrumb'
import { TableSkeleton } from '../ui/PageSkeleton'
import { PropertiesStatsRow } from './PropertiesStatsRow'
import { PropertyStatusBadge } from './PropertyStatusBadge'
import { PropertyFormModal } from './PropertyFormModal'
import { PropertyDetailModal } from './PropertyDetailModal'
import { DeletePropertyConfirmModal } from './DeletePropertyConfirmModal'
import { SaveFilterPresetModal } from './SaveFilterPresetModal'
import { formatBHK, formatSqFt, formatIndianCurrency } from '../../utils/formatters'
import type {
  Property,
  PropertyType,
  PropertyListingStatus,
  PropertyAccessType,
  PropertyFilterParams,
  PropertyPagination,
  PropertyFilterPreset,
} from '../../types/property'

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// ── Reusable Luxury Filter Dropdown Component ────────────────────────────────

interface FilterOption<T> {
  label: string
  value: T
  badge?: string
}

interface FilterDropdownProps<T> {
  label: string
  value: T
  options: FilterOption<T>[]
  onChange: (value: T) => void
  widthClass?: string
}

function FilterDropdown<T extends string | number | undefined>({
  label,
  value,
  options,
  onChange,
  widthClass = 'w-48',
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedOption =
    options.find((o) => o.value === value) ||
    options.find((o) => o.value === '' && (!value || value === '')) ||
    options[0]

  const isFiltered = Boolean(value !== '' && value !== undefined && value !== null)

  return (
    <div ref={ref} className="relative flex items-stretch border-t sm:border-t-0 sm:border-l border-border shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full sm:w-auto px-3 py-2 flex items-center justify-between gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-surface-secondary/60 cursor-pointer select-none whitespace-nowrap ${
          isFiltered ? 'text-gold' : 'text-muted-text hover:text-foreground'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-muted-text font-normal">{label}:</span>
          <span className={`font-bold truncate max-w-[90px] sm:max-w-[110px] ${isFiltered ? 'text-gold' : 'text-foreground'}`}>
            {selectedOption?.label || 'All'}
          </span>
        </div>
        <ChevronDown
          className={`w-3 h-3 shrink-0 ml-0.5 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 sm:left-auto sm:right-0 mt-px ${widthClass} max-w-[calc(100vw-2rem)] bg-surface border border-border shadow-2xl z-40 divide-y divide-border animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="px-3 py-2 bg-surface-secondary text-[9px] font-bold uppercase tracking-wider text-muted-text">
            Filter by {label}
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-border/50">
            {options.map((opt) => {
              const isSelected =
                opt.value === value ||
                (opt.value === '' && (!value || value === ''))
              return (
                <button
                  key={String(opt.value) + opt.label}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background font-bold'
                      : 'text-foreground hover:bg-surface-secondary/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-background'
                          : isFiltered && opt.value === value
                          ? 'bg-gold'
                          : 'bg-muted-text/40'
                      }`}
                    />
                    <span className="text-[11px] font-bold tracking-tight truncate">
                      {opt.label}
                    </span>
                  </div>
                  {opt.badge && (
                    <span
                      className={`text-[9px] font-mono shrink-0 ml-2 ${
                        isSelected ? 'text-background/80 font-bold' : 'text-muted-text'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Quick Budget Filter Options ──────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { label: 'All Budgets', value: '', min: undefined, max: undefined },
  { label: '< ₹50 L', value: '<50L', min: undefined, max: 5000000 },
  { label: '₹50 L - ₹1.5 Cr', value: '50L-1.5Cr', min: 5000000, max: 15000000 },
  { label: '₹1.5 Cr - ₹5 Cr', value: '1.5Cr-5Cr', min: 15000000, max: 50000000 },
  { label: '> ₹5 Cr', value: '>5Cr', min: 50000000, max: undefined },
]

export function PropertiesView() {
  const router = useRouter()

  // ── States ─────────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [properties, setProperties] = useState<Property[]>([])
  const [pagination, setPagination] = useState<PropertyPagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  // Filter & Search States
  const [searchInput, setSearchInput] = useState(initialSearch)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Sync state if URL search param changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== searchInput) {
      setSearchInput(urlSearch)
    }
  }, [searchParams])

  const [selectedType, setSelectedType] = useState<PropertyType | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<PropertyListingStatus | ''>('')
  const [selectedAccessType, setSelectedAccessType] = useState<PropertyAccessType | ''>('')
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('')
  const [selectedBudgetKey, setSelectedBudgetKey] = useState<string>('')
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [sortBy] = useState<'createdAt' | 'updatedAt' | 'askingPrice'>('createdAt')
  const [sortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter Presets (FR-SF-09)
  const [presets, setPresets] = useState<PropertyFilterPreset[]>([])
  const [isPresetsOpen, setIsPresetsOpen] = useState(false)
  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState(false)
  const presetsRef = useRef<HTMLDivElement>(null)

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState<Property | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Close presets dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Load Presets ───────────────────────────────────────────────────────────
  const fetchPresets = useCallback(async () => {
    try {
      const data = await getFilterPresets()
      setPresets(data)
    } catch {
      // Non-critical, ignore
    }
  }, [])

  useEffect(() => {
    fetchPresets()
  }, [fetchPresets])

  // ── Fetch Properties ───────────────────────────────────────────────────────
  const fetchPropertiesList = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true)
      try {
        const queryParams: PropertyFilterParams = {
          page: pageToFetch,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          propertyType: selectedType || undefined,
          availabilityStatus: selectedStatus || undefined,
          accessType: selectedAccessType || undefined,
          locationArea: selectedArea || undefined,
          minPrice: minPrice !== undefined ? minPrice : undefined,
          maxPrice: maxPrice !== undefined ? maxPrice : undefined,
          sortBy,
          sortOrder,
        }

        if (selectedBedrooms) {
          queryParams.bedrooms = selectedBedrooms
        }

        const data = await getProperties(queryParams)
        setProperties(data.properties)
        setPagination(data.pagination)
      } catch (err) {
        handleActionApiError(err, 'Failed to load properties')
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [
      debouncedSearch,
      selectedType,
      selectedStatus,
      selectedAccessType,
      selectedArea,
      selectedBedrooms,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      pagination.limit,
    ]
  )

  useEffect(() => {
    fetchPropertiesList(1)
  }, [fetchPropertiesList])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchPropertiesList(pagination.page)
  }

  const handleApplyPreset = (preset: PropertyFilterPreset) => {
    const f = preset.filters
    setSelectedType(f.propertyType || '')
    setSelectedStatus(f.availabilityStatus || '')
    setSelectedAccessType(f.accessType || '')
    setSelectedArea(f.locationArea || '')
    setMinPrice(f.minPrice)
    setMaxPrice(f.maxPrice)
    if (f.minPrice !== undefined || f.maxPrice !== undefined) {
      const matched = BUDGET_OPTIONS.find(
        (b) => b.min === f.minPrice && b.max === f.maxPrice
      )
      setSelectedBudgetKey(matched ? matched.value : 'custom')
    } else {
      setSelectedBudgetKey('')
    }
    if (f.bedrooms !== undefined) {
      setSelectedBedrooms(String(f.bedrooms))
    } else {
      setSelectedBedrooms('')
    }
    if (f.search) setSearchInput(f.search)
    setIsPresetsOpen(false)
    toast.info('Preset Applied', `Loaded filters from "${preset.name}".`)
  }

  const handleDeletePreset = async (e: React.MouseEvent, presetId: string) => {
    e.stopPropagation()
    try {
      await deleteFilterPreset(presetId)
      setPresets((prev) => prev.filter((p) => p.id !== presetId))
      toast.success('Preset Removed', 'Saved filter preset deleted.')
    } catch (err) {
      handleActionApiError(err, 'Failed to remove preset')
    }
  }

  const handleBudgetChange = (val: string) => {
    setSelectedBudgetKey(val)
    const opt = BUDGET_OPTIONS.find((b) => b.value === val)
    if (opt) {
      setMinPrice(opt.min)
      setMaxPrice(opt.max)
    } else {
      setMinPrice(undefined)
      setMaxPrice(undefined)
    }
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setSelectedType('')
    setSelectedStatus('')
    setSelectedAccessType('')
    setSelectedBedrooms('')
    setSelectedBudgetKey('')
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setSelectedArea('')
  }

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      selectedType ||
      selectedStatus ||
      selectedAccessType ||
      selectedBedrooms ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      selectedArea
  )

  const handleOpenDetail = (prop: Property) => {
    setSelectedPropertyDetail(prop)
    setIsDetailModalOpen(true)
  }

  const handleOpenEdit = (prop: Property, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingProperty(prop)
    setIsFormModalOpen(true)
  }

  const handleOpenDelete = (prop: Property, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDeletingProperty(prop)
    setIsDeleteModalOpen(true)
  }

  const handleBrokerClick = (brokerName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/brokers?search=${encodeURIComponent(brokerName)}`)
  }

  // Active filters count
  const activeFilterCount = [
    Boolean(debouncedSearch),
    Boolean(selectedType),
    Boolean(selectedStatus),
    Boolean(selectedAccessType),
    Boolean(selectedBedrooms),
    minPrice !== undefined || maxPrice !== undefined,
    Boolean(selectedArea),
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Properties', href: '/dashboard/properties', active: true },
            ]}
          />
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-gold" />
              Property Stock Directory
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 border border-gold/30 bg-gold/10 text-gold text-xs font-mono font-bold tracking-wider">
              {pagination.total} LISTINGS
            </span>
          </div>
          <p className="text-xs text-muted-text mt-1 max-w-2xl">
            Centralized inventory lifecycle, real-time Cloudflare R2 media vault, broker linkages, and luxury stock audit trail.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="p-2 border border-border bg-surface text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingProperty(null)
              setIsFormModalOpen(true)
            }}
            className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────────── */}
      <PropertiesStatsRow properties={properties} totalCount={pagination.total} />

      {/* ── Filter Bar & Control Strip (Unified Dropdowns) ────────────────────── */}
      <div className="space-y-2">
        {/* Main Filter Bar */}
        <div className="border border-border bg-surface flex flex-col xl:flex-row items-stretch divide-y xl:divide-y-0 divide-border">
          {/* Search Box (FR-SF-08) */}
          <div className="relative flex-1 min-w-[200px] flex items-center">
            <Search className="w-4 h-4 text-muted-text absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search society, location, remarks, or title..."
              className="w-full pl-10 pr-9 py-2.5 bg-transparent text-xs text-foreground placeholder:text-muted-text focus:outline-hidden"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 text-muted-text hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Group of Luxury Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-stretch divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* 1. Property Type Dropdown (FR-SF-01) */}
            <FilterDropdown<PropertyType | ''>
              label="Type"
              value={selectedType}
              onChange={(v) => setSelectedType(v)}
              widthClass="w-44"
              options={[
                { label: 'All Types', value: '' },
                { label: 'Flat / Apt', value: 'FLAT' },
                { label: 'Land / Plot', value: 'LAND' },
                { label: 'Commercial', value: 'COMMERCIAL' },
                { label: 'Warehouse', value: 'WAREHOUSE' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />

            {/* 2. Availability Status Dropdown (FR-SF-05) */}
            <FilterDropdown<PropertyListingStatus | ''>
              label="Status"
              value={selectedStatus}
              onChange={(v) => setSelectedStatus(v)}
              widthClass="w-52"
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Available', value: 'AVAILABLE' },
                { label: 'Under Negotiation', value: 'UNDER_NEGOTIATION' },
                { label: 'Token Paid', value: 'TOKEN_PAID' },
                { label: 'Rented Out', value: 'RENTED_OUT' },
                { label: 'Sold', value: 'SOLD' },
                { label: 'Upcoming', value: 'UPCOMING' },
              ]}
            />

            {/* 3. Access Type Dropdown (FR-SF-06) */}
            <FilterDropdown<PropertyAccessType | ''>
              label="Access"
              value={selectedAccessType}
              onChange={(v) => setSelectedAccessType(v)}
              widthClass="w-44"
              options={[
                { label: 'All Access', value: '' },
                { label: 'Direct Stock', value: 'DIRECT' },
                { label: '+1 Broker', value: 'BROKER' },
              ]}
            />

            {/* 4. Bedrooms Dropdown (FR-SF-04) */}
            <FilterDropdown<string>
              label="BHK"
              value={selectedBedrooms}
              onChange={(v) => setSelectedBedrooms(v)}
              widthClass="w-40"
              options={[
                { label: 'All BHK', value: '' },
                { label: 'Studio', value: '0' },
                { label: '1 BHK', value: '1' },
                { label: '2 BHK', value: '2' },
                { label: '3 BHK', value: '3' },
                { label: '4 BHK+', value: '4' },
              ]}
            />

            {/* 5. Budget Dropdown (FR-SF-02) */}
            <FilterDropdown<string>
              label="Budget"
              value={selectedBudgetKey}
              onChange={handleBudgetChange}
              widthClass="w-48"
              options={BUDGET_OPTIONS.map((b) => ({
                label: b.label,
                value: b.value,
              }))}
            />

            {/* 6. Filter Presets Dropdown (FR-SF-09) */}
            <div ref={presetsRef} className="relative flex items-stretch border-t sm:border-t-0 sm:border-l border-border shrink-0">
              <button
                type="button"
                onClick={() => setIsPresetsOpen((p) => !p)}
                className="w-full sm:w-auto px-3 py-2 flex items-center justify-between gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:bg-surface-secondary/60 transition-colors cursor-pointer select-none"
                title="Saved Filter Presets"
              >
                <div className="flex items-center gap-1.5">
                  <Bookmark className="w-3 h-3 text-gold shrink-0" />
                  <span>Presets</span>
                  <span className="text-muted-text font-mono">({presets.length})</span>
                </div>
                <ChevronDown
                  className={`w-3 h-3 shrink-0 ml-0.5 transition-transform duration-150 ${
                    isPresetsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isPresetsOpen && (
                <div className="absolute right-0 top-full mt-px w-64 max-w-[calc(100vw-2rem)] bg-surface border border-border shadow-2xl z-40 divide-y divide-border animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 bg-surface-secondary flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-text">
                    <span>Saved Filter Presets</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPresetsOpen(false)
                        setIsSavePresetModalOpen(true)
                      }}
                      className="text-gold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      Save Current
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-border/40">
                    {presets.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-text">
                        No saved presets yet. Click "Save Current" to create one.
                      </div>
                    ) : (
                      presets.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleApplyPreset(p)}
                          className="px-3 py-2 text-left hover:bg-surface-secondary/70 flex items-center justify-between group cursor-pointer transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs font-bold text-foreground truncate">
                              {p.name}
                            </div>
                            <div className="text-[9px] text-muted-text font-mono truncate">
                              {Object.keys(p.filters).length} filter params
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePreset(e, p.id)}
                            className="p-1 text-muted-text hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete preset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 7. View Switcher: Table vs Grid */}
            <div className="flex items-center border-t sm:border-t-0 sm:border-l border-border bg-surface-secondary/40 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-text hover:text-foreground'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-text hover:text-foreground'
                }`}
                title="Grid / Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-surface-secondary/40 border border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold shrink-0" />
              <span className="text-[10px] font-mono text-muted-text">
                <strong className="text-gold font-bold">{activeFilterCount}</strong> active filter{activeFilterCount > 1 ? 's' : ''} applied
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[10px] font-bold uppercase tracking-wider text-gold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Main View Content ────────────────────────────────────────────────── */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : properties.length === 0 ? (
        <div className="border border-border bg-surface p-12 text-center space-y-4">
          <div className="w-12 h-12 border border-border bg-surface-secondary text-gold flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">No property listings found</h3>
            <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
              {hasActiveFilters
                ? 'No properties match your current search filters. Try adjusting or clearing your filters.'
                : 'Your property stock directory is currently empty. Add your first listing to start managing inventory.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 border border-border text-xs font-bold uppercase tracking-wider text-foreground hover:bg-surface-secondary cursor-pointer"
              >
                Reset Filters
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setEditingProperty(null)
                setIsFormModalOpen(true)
              }}
              className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              + Add Property
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ══════════════════════════════════════════════════════════════════
           TABLE VIEW
           ══════════════════════════════════════════════════════════════════ */
        <div className="border border-border bg-surface overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary text-[10px] font-bold uppercase tracking-wider text-muted-text select-none">
                <th className="py-3 px-3.5 w-14">Media</th>
                <th className="py-3 px-3.5">Property & Location</th>
                <th className="py-3 px-3.5">Type & Spec</th>
                <th className="py-3 px-3.5">Asking Price</th>
                <th className="py-3 px-3.5">Access / Broker</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {properties.map((property) => {
                const photoMedia = property.media?.filter((m) => m.category === 'PHOTOGRAPH') || []
                const coverImage = (photoMedia.find((media) => media.isCover) || photoMedia[0])?.url

                return (
                  <tr
                    key={property.id}
                    onClick={() => handleOpenDetail(property)}
                    className="hover:bg-surface-secondary/50 transition-colors cursor-pointer group"
                  >
                    {/* Media Thumbnail */}
                    <td className="py-3 px-3.5">
                      <div className="relative w-12 h-10 border border-border bg-surface-secondary overflow-hidden shrink-0 flex items-center justify-center">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={property.societyBuildingName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Building2 className="w-4 h-4 text-muted-text/40" />
                        )}
                        {photoMedia.length > 0 && (
                          <div className="absolute bottom-0 right-0 px-1 bg-black/80 text-[8px] font-mono text-zinc-300">
                            {photoMedia.length}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Property & Location */}
                    <td className="py-3 px-3.5 max-w-[220px]">
                      <div className="font-bold text-foreground text-xs group-hover:text-gold transition-colors truncate">
                        {property.societyBuildingName}
                      </div>
                      <div className="text-[11px] text-muted-text flex items-center gap-1 truncate mt-0.5">
                        <MapPin className="w-3 h-3 text-gold shrink-0" />
                        <span className="truncate">
                          {property.locationArea}, {property.pincode}
                        </span>
                      </div>
                    </td>

                    {/* Type & Spec */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-surface-secondary border border-border text-[9px] font-bold uppercase tracking-wider text-foreground">
                          {property.propertyType}
                        </span>
                        {property.bedrooms !== null && property.bedrooms !== undefined && (
                          <span className="text-[11px] font-bold text-foreground">
                            {formatBHK(property.bedrooms)}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-muted-text mt-0.5">
                        {formatSqFt(property.carpetAreaSqFt)} carpet • Fl {property.floorNumber || 0}/
                        {property.totalFloors || 0}
                      </div>
                    </td>

                    {/* Asking Price */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-gold text-xs">
                        {formatIndianCurrency(property.askingPrice)}
                      </div>
                      <div className="text-[9px] font-mono uppercase text-muted-text">
                        {property.pricingType}
                      </div>
                    </td>

                    {/* Access / Linked Broker */}
                    <td className="py-3 px-3.5 max-w-[180px]">
                      {property.accessType === 'BROKER' && property.broker ? (
                        <button
                          type="button"
                          onClick={(e) => handleBrokerClick(property.broker!.name, e)}
                          className="flex items-center gap-1.5 p-1 bg-surface-secondary border border-border hover:border-gold/60 text-left transition-colors cursor-pointer group/broker max-w-full"
                          title={`Click to view broker ${property.broker.name} in directory`}
                        >
                          <div
                            className="w-5 h-5 flex items-center justify-center text-[9px] font-bold text-background shrink-0"
                            style={{ backgroundColor: hashColor(property.broker.name) }}
                          >
                            {getInitials(property.broker.name)}
                          </div>
                          <div className="min-w-0 pr-1">
                            <span className="text-[10px] font-bold text-foreground group-hover/broker:text-gold truncate block">
                              {property.broker.name}
                            </span>
                            <span className="text-[8px] font-mono text-muted-text block uppercase">
                              +1 Broker • {property.broker.areaOfOperation || 'Channel Partner'}
                            </span>
                          </div>
                          <ExternalLink className="w-2.5 h-2.5 text-muted-text group-hover/broker:text-gold shrink-0 ml-auto" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-secondary border border-border text-[9px] font-bold uppercase tracking-wider text-muted-text">
                          <span className="w-1.5 h-1.5 bg-emerald-500" />
                          Direct
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5">
                      <PropertyStatusBadge status={property.availabilityStatus} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDetail(property)
                          }}
                          className="p-1.5 border border-border text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(property, e)}
                          className="p-1.5 border border-border text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
                          title="Edit Property"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenDelete(property, e)}
                          className="p-1.5 border border-border text-muted-text hover:text-red-400 hover:bg-surface-secondary transition-colors cursor-pointer"
                          title="Delete Property & Purge Media"
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
      ) : (
        /* ══════════════════════════════════════════════════════════════════
           GRID / CARD VIEW
           ══════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((property) => {
            const photoMedia = property.media?.filter((m) => m.category === 'PHOTOGRAPH') || []
            const videoMedia = property.media?.filter((m) => m.category === 'VIDEO') || []
            const brochureMedia = property.media?.filter((m) => m.category === 'BROCHURE') || []
            const coverImage = (photoMedia.find((media) => media.isCover) || photoMedia[0])?.url

            return (
              <div
                key={property.id}
                onClick={() => handleOpenDetail(property)}
                className="border border-border bg-surface hover:border-gold/60 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              >
                {/* Image / Header Media Banner */}
                <div className="relative aspect-video bg-surface-secondary overflow-hidden border-b border-border">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={property.societyBuildingName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-text/40 bg-zinc-900/50">
                      <Building2 className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-2">
                        No Media Uploaded
                      </span>
                    </div>
                  )}

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                    <PropertyStatusBadge status={property.availabilityStatus} />
                    <span className="px-2 py-0.5 bg-black/80 backdrop-blur-xs border border-white/20 text-[9px] font-bold uppercase tracking-wider text-white">
                      {property.propertyType}
                    </span>
                  </div>

                  {/* Bottom Media Counters & Access Indicator */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono bg-black/80 px-2 py-1 border border-white/10 text-zinc-300">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3 text-gold" />
                        {photoMedia.length}
                      </span>
                      {videoMedia.length > 0 && (
                        <span className="flex items-center gap-1 border-l border-white/20 pl-1.5">
                          <Video className="w-3 h-3 text-blue-400" />
                          {videoMedia.length}
                        </span>
                      )}
                      {brochureMedia.length > 0 && (
                        <span className="flex items-center gap-1 border-l border-white/20 pl-1.5">
                          <FileText className="w-3 h-3 text-amber-400" />
                          {brochureMedia.length}
                        </span>
                      )}
                    </div>

                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black/80 border border-white/10 text-zinc-200">
                      {property.accessType === 'DIRECT' ? 'Direct Stock' : '+1 Broker'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Price & Society */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-lg font-bold font-mono text-gold tracking-tight">
                        {formatIndianCurrency(property.askingPrice)}
                      </div>
                      <div className="text-[9px] font-mono uppercase text-muted-text">
                        {property.pricingType}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-foreground group-hover:text-gold transition-colors truncate mt-1">
                      {property.societyBuildingName}
                    </h4>

                    <div className="text-xs text-muted-text flex items-center gap-1 truncate mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">
                        {property.locationArea}, {property.pincode}
                      </span>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-px bg-border my-3 border border-border">
                      <div className="bg-surface-secondary/70 p-2 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-text">
                          BHK
                        </div>
                        <div className="text-xs font-bold text-foreground font-mono mt-0.5">
                          {property.bedrooms !== null && property.bedrooms !== undefined
                            ? formatBHK(property.bedrooms)
                            : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-surface-secondary/70 p-2 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-text">
                          Carpet
                        </div>
                        <div className="text-xs font-bold text-foreground font-mono mt-0.5">
                          {formatSqFt(property.carpetAreaSqFt)}
                        </div>
                      </div>
                      <div className="bg-surface-secondary/70 p-2 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-text">
                          Floor
                        </div>
                        <div className="text-xs font-bold text-foreground font-mono mt-0.5">
                          {property.floorNumber || 0}/{property.totalFloors || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Linked Broker or Source Partner */}
                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    {property.accessType === 'BROKER' && property.broker ? (
                      <button
                        type="button"
                        onClick={(e) => handleBrokerClick(property.broker!.name, e)}
                        className="flex items-center gap-2 text-left group/broker hover:text-gold transition-colors cursor-pointer min-w-0"
                      >
                        <div
                          className="w-5 h-5 flex items-center justify-center text-[9px] font-bold text-background shrink-0"
                          style={{ backgroundColor: hashColor(property.broker.name) }}
                        >
                          {getInitials(property.broker.name)}
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-foreground group-hover/broker:text-gold block truncate">
                            {property.broker.name}
                          </span>
                          <span className="text-[8px] font-mono text-muted-text uppercase block truncate">
                            {property.broker.areaOfOperation || 'Channel Partner'}
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="text-[10px] font-mono text-muted-text flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 shrink-0" />
                        Direct Listing
                      </div>
                    )}

                    {/* Action icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(property, e)}
                        className="p-1.5 border border-border text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleOpenDelete(property, e)}
                        className="p-1.5 border border-border text-muted-text hover:text-red-400 hover:bg-surface-secondary transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination Bar ───────────────────────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="border border-border bg-surface px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-muted-text font-mono text-[11px]">
            Showing <strong className="text-foreground">{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
            <strong className="text-foreground">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{' '}
            of <strong className="text-foreground">{pagination.total}</strong> listings
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchPropertiesList(1)}
              className="p-1.5 border border-border bg-surface-secondary text-muted-text hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchPropertiesList(pagination.page - 1)}
              className="p-1.5 border border-border bg-surface-secondary text-muted-text hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-surface-secondary border border-border text-xs font-mono font-bold text-gold">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchPropertiesList(pagination.page + 1)}
              className="p-1.5 border border-border bg-surface-secondary text-muted-text hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchPropertiesList(pagination.totalPages)}
              className="p-1.5 border border-border bg-surface-secondary text-muted-text hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* Form Modal (Add / Edit) */}
      <PropertyFormModal
        isOpen={isFormModalOpen}
        initialProperty={editingProperty}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingProperty(null)
        }}
        onSuccess={() => {
          fetchPropertiesList(pagination.page)
        }}
      />

      {/* Detail Modal */}
      <PropertyDetailModal
        property={selectedPropertyDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedPropertyDetail(null)
        }}
        onEdit={(prop) => {
          setIsDetailModalOpen(false)
          setSelectedPropertyDetail(null)
          setEditingProperty(prop)
          setIsFormModalOpen(true)
        }}
        onDelete={(prop) => {
          setIsDetailModalOpen(false)
          setSelectedPropertyDetail(null)
          setDeletingProperty(prop)
          setIsDeleteModalOpen(true)
        }}
        onStatusChanged={() => {
          fetchPropertiesList(pagination.page)
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeletePropertyConfirmModal
        isOpen={isDeleteModalOpen}
        property={deletingProperty}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingProperty(null)
        }}
        onSuccess={() => {
          fetchPropertiesList(1)
        }}
      />

      {/* Save Filter Preset Modal */}
      <SaveFilterPresetModal
        isOpen={isSavePresetModalOpen}
        onClose={() => setIsSavePresetModalOpen(false)}
        currentFilters={{
          search: debouncedSearch,
          propertyType: selectedType,
          availabilityStatus: selectedStatus,
          accessType: selectedAccessType,
          locationArea: selectedArea,
          minPrice,
          maxPrice,
          bedrooms: selectedBedrooms,
        }}
        onPresetSaved={(newPreset) => {
          setPresets((prev) => [newPreset, ...prev])
        }}
      />
    </div>
  )
}
