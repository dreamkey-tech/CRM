'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Users,
  UserCheck,
  UserPlus,
  Activity,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  ShieldOff,
  Clock,
  Calendar,
  MoreVertical,
  X,
  Loader2,
  AlertCircle,
  Globe,
  Eye,
  ChevronDown,
  CheckCircle2,
  XCircle,
  KeyRound,
  Mail,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Building2,
} from 'lucide-react'
import { formatIndianCurrency } from '../../utils/formatters'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  getWebsiteUserStats,
  getWebsiteUsersList,
  getWebsiteUserDetail,
  updateWebsiteUserStatus,
} from '../../api/websiteUsers'
import type {
  WebsiteUserStats,
  WebsiteUser,
  WebsiteUserDetail,
  PaginationMeta,
  WebsiteUsersListParams,
} from '../../types/websiteUsers'
import { TableSkeleton } from '../ui/PageSkeleton'

// Utility Helpers
function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
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

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const start = prev.current
    const end = value
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
      else prev.current = end
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconColor: string
  sub?: string
  accent?: boolean
  suffix?: string
  isDark: boolean
}

function StatCard({ label, value, icon: Icon, iconColor, sub, accent, suffix, isDark }: StatCardProps) {
  return (
    <div className="bg-surface border border-border flex flex-col gap-3 px-4 py-4 sm:py-5 transition-colors duration-150 cursor-default">
      <div className="flex items-start justify-between">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
          <Icon className="w-3 h-3" style={{ color: iconColor }} />
          {label}
        </p>
      </div>

      <div className="flex items-baseline gap-1 leading-none">
        <span
          className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none"
          style={{ color: accent ? 'var(--color-gold)' : undefined }}
        >
          <AnimatedNumber value={value} />
        </span>
        {suffix && (
          <span className="text-sm font-bold text-muted-text">{suffix}</span>
        )}
      </div>

      {sub && (
        <p className="text-[10px] text-muted-text leading-snug">{sub}</p>
      )}
    </div>
  )
}

function AuthProviderBadge({ provider, isDark }: { provider: string; isDark: boolean }) {
  const norm = provider?.toUpperCase() || 'EMAIL'
  if (norm === 'GOOGLE') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-text">
        <Globe className="w-3 h-3 text-gold" />
        Google
      </span>
    )
  }
  if (norm === 'BOTH') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-text">
        <KeyRound className="w-3 h-3 text-gold" />
        Email + Google
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-text">
      <Mail className="w-3 h-3 text-gold" />
      Email
    </span>
  )
}

interface UserDetailModalProps {
  userId: string
  isDark: boolean
  onClose: () => void
  onToggleStatus: (id: string, isActive: boolean) => void
}

function UserDetailModal({ userId, isDark, onClose, onToggleStatus }: UserDetailModalProps) {
  const [detail, setDetail] = useState<WebsiteUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    getWebsiteUserDetail(userId)
      .then((data) => {
        if (isMounted) setDetail(data)
      })
      .catch(() => {
        if (isMounted) setError('Failed to load user detail profile.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [userId])

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 flex items-center justify-center text-white font-black text-sm shrink-0"
              style={{ background: hashColor(detail?.email || userId) }}
            >
              {getInitials(detail?.name || null, detail?.email || 'U')}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate">
                {detail?.name || 'Anonymous Website User'}
              </h3>
              <p className="text-[10px] text-muted-text truncate">{detail?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gold mb-3" />
              <p className="text-xs font-medium text-muted-text uppercase tracking-wider">Loading account details...</p>
            </div>
          ) : error || !detail ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
              <p className="text-xs text-red-500">{error || 'User details unavailable.'}</p>
            </div>
          ) : (
            <>
              {/* Quick stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-border">
                <div className="px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1">Status</span>
                  {detail.isActive ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-foreground" />Active
                    </span>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-text flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-text" />Suspended
                    </span>
                  )}
                </div>
                <div className="px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1">Total Logins</span>
                  <span className="text-sm font-bold text-foreground">{detail.loginCount}</span>
                  {detail.isReturningUser && <span className="text-[10px] text-gold font-bold ml-1">(Returning)</span>}
                </div>
                <div className="px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1">Auth Method</span>
                  <AuthProviderBadge provider={detail.authProvider} isDark={isDark} />
                </div>
                <div className="px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1">Email Verified</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${detail.emailVerified ? 'text-foreground' : 'text-gold'}`}>
                    {detail.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text block mb-1">Properties Viewed</span>
                  <span className="text-sm font-bold text-foreground">{detail.propertyClicks?.length || 0}</span>
                  {(detail.propertyClicks?.length || 0) > 0 && <span className="text-[10px] text-gold font-bold ml-1">(Active)</span>}
                </div>
              </div>

              {/* Account Metadata */}
              <div className="px-5 py-4 space-y-2.5">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-3">Account Identifiers</h4>
                {[
                  { label: 'Database UUID', value: detail.id, mono: true, copyKey: 'id' },
                  { label: 'Registered Email', value: detail.email, mono: false, copyKey: 'email' },
                  detail.googleId ? { label: 'Google OAuth ID', value: detail.googleId, mono: true, copyKey: null } : null,
                  { label: 'Registration Date', value: formatDateTime(detail.createdAt), mono: false, copyKey: null },
                  { label: 'Last Active', value: formatDateTime(detail.lastActiveAt), mono: false, copyKey: null },
                ].filter(Boolean).map((row: any) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-[10px] text-muted-text font-medium">{row.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold text-foreground ${row.mono ? 'font-mono truncate max-w-[180px]' : ''}`}>
                        {row.value}
                      </span>
                      {row.copyKey && (
                        <button onClick={() => copyToClipboard(row.value, row.copyKey)} className="text-muted-text hover:text-gold transition-colors">
                          {copiedField === row.copyKey ? <Check className="w-3 h-3 text-gold" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sessions */}
              <div className="px-5 py-4">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-3">
                  Recent Sessions ({detail.recentSessions.length})
                </h4>
                {detail.recentSessions.length === 0 ? (
                  <p className="text-xs italic text-muted-text">No active session tokens found.</p>
                ) : (
                  <div className="border border-border overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-surface-secondary border-b border-border">
                        <tr>
                          {['IP Address', 'User Agent', 'Last Active'].map((h) => (
                            <th key={h} className="py-2 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-text">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {detail.recentSessions.map((session) => (
                          <tr key={session.id}>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-gold">{session.ipAddress || '—'}</td>
                            <td className="py-2.5 px-3 text-[10px] text-muted-text max-w-[180px] truncate">{session.userAgent || 'Web Browser'}</td>
                            <td className="py-2.5 px-3 text-[10px] text-muted-text">{formatRelativeTime(session.lastUsedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Property Click / Interest History */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gold" />
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                      Clicked Properties ({detail.propertyClicks?.length || 0})
                    </h4>
                  </div>
                  {detail.propertyClicks && detail.propertyClicks.length > 0 && (
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-gold/15 text-gold border border-gold/30 font-mono">
                      Active Customer Interest
                    </span>
                  )}
                </div>

                {!detail.propertyClicks || detail.propertyClicks.length === 0 ? (
                  <div className="p-4 bg-surface-secondary/40 border border-border text-center">
                    <p className="text-xs italic text-muted-text">This user has not clicked or viewed any properties on the website yet.</p>
                  </div>
                ) : (
                  <div className="border border-border overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-surface-secondary border-b border-border">
                        <tr>
                          <th className="py-2 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-text">Property</th>
                          <th className="py-2 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-text">Location & Pricing</th>
                          <th className="py-2 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-text">Clicked At</th>
                          <th className="py-2 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-text">Device IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {detail.propertyClicks.map((click) => (
                          <tr key={click.id} className="hover:bg-surface-secondary/30 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {click.property.coverImage ? (
                                  <img
                                    src={click.property.coverImage}
                                    alt=""
                                    className="w-9 h-9 rounded-xs object-cover border border-border shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-xs bg-surface-secondary border border-border flex items-center justify-center shrink-0 text-muted-text">
                                    <Building2 className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-foreground truncate max-w-[160px]">
                                    {click.property.societyBuildingName}
                                  </p>
                                  <span className="text-[9px] font-mono text-muted-text uppercase">
                                    {click.property.propertyType} {click.property.bedrooms ? `• ${click.property.bedrooms} BHK` : ''}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <p className="text-[10px] text-muted-text truncate max-w-[140px]">{click.property.locationArea}</p>
                              <p className="text-[10px] font-bold text-gold font-mono">
                                {formatIndianCurrency(click.property.askingPrice)}
                              </p>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-semibold text-foreground block">
                                {formatDateTime(click.createdAt)}
                              </span>
                              <span className="text-[9px] text-muted-text">
                                ({formatRelativeTime(click.createdAt)})
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-muted-text">
                              {click.ipAddress || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between shrink-0 bg-surface-secondary">
          {detail && (
            <button
              onClick={() => {
                onToggleStatus(detail.id, !detail.isActive)
                onClose()
              }}
              className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                detail.isActive
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-foreground hover:text-gold'
              }`}
            >
              {detail.isActive ? 'Deactivate Account' : 'Reactivate Account'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground/30 transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Cool Filter Dropdowns for Website Users ──────────────────────────────────
interface CoolFilterOption<T> {
  value: T
  label: string
  shortLabel?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

const STATUS_OPTIONS: CoolFilterOption<'active' | 'inactive' | ''>[] = [
  {
    value: '',
    label: 'All Status',
    shortLabel: 'All',
    description: 'Show active & deactivated accounts',
    icon: Users,
  },
  {
    value: 'active',
    label: 'Active Accounts',
    shortLabel: 'Active',
    description: 'Can sign in & explore public listings',
    icon: Shield,
    badge: 'Active',
  },
  {
    value: 'inactive',
    label: 'Deactivated',
    shortLabel: 'Deactivated',
    description: 'Account access disabled by admin',
    icon: ShieldOff,
    badge: 'Disabled',
  },
]

const AUTH_OPTIONS: CoolFilterOption<string>[] = [
  {
    value: '',
    label: 'All Auth Methods',
    shortLabel: 'All',
    description: 'Email OTP & Google OAuth accounts',
    icon: Globe,
  },
  {
    value: 'EMAIL',
    label: 'Email Passcode (OTP)',
    shortLabel: 'Email',
    description: 'Signed in with one-time verification code',
    icon: Mail,
    badge: 'OTP',
  },
  {
    value: 'GOOGLE',
    label: 'Google OAuth',
    shortLabel: 'Google',
    description: 'Signed in via Google One Tap SSO',
    icon: KeyRound,
    badge: 'OAuth',
  },
]

const ACTIVITY_OPTIONS: CoolFilterOption<'true' | 'false' | ''>[] = [
  {
    value: '',
    label: 'All Activity',
    shortLabel: 'All',
    description: 'All users regardless of click interest',
    icon: Activity,
  },
  {
    value: 'true',
    label: 'Clicked Properties',
    shortLabel: 'Clicked',
    description: 'Customer explored property details',
    icon: Building2,
    badge: 'Engaged',
  },
  {
    value: 'false',
    label: 'No Property Clicks',
    shortLabel: 'No Clicks',
    description: 'Registered but has not viewed details yet',
    icon: XCircle,
    badge: 'Passive',
  },
]

interface CoolFilterDropdownProps<T> {
  label: string
  icon: React.ComponentType<{ className?: string }>
  value: T
  options: CoolFilterOption<T>[]
  onChange: (value: T) => void
  menuTitle?: string
  minWidthClass?: string
}

function CoolFilterDropdown<T extends string>({
  label,
  icon: TriggerIcon,
  value,
  options,
  onChange,
  menuTitle,
  minWidthClass = 'w-64',
}: CoolFilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const selectedOption =
    options.find((o) => o.value === value) ||
    options.find((o) => o.value === '') ||
    options[0]

  const isFiltered = Boolean(value !== '')

  return (
    <div ref={ref} className="relative flex items-stretch border-t md:border-t-0 md:border-l border-border shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full md:w-auto px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer select-none whitespace-nowrap group ${
          isFiltered
            ? 'bg-gold/5 text-gold hover:bg-gold/10'
            : 'text-muted-text hover:text-foreground hover:bg-surface-secondary/60'
        } ${isOpen ? 'bg-surface-secondary/80 text-foreground' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <TriggerIcon
            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
              isFiltered ? 'text-gold' : 'text-muted-text/80 group-hover:text-foreground'
            }`}
          />
          <span className="text-muted-text font-normal">{label}:</span>
          <span
            className={`font-black truncate max-w-[110px] tracking-wide ${
              isFiltered ? 'text-gold' : 'text-foreground'
            }`}
          >
            {selectedOption?.shortLabel || selectedOption?.label}
          </span>
          {isFiltered && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 animate-pulse" />
          )}
        </div>
        <ChevronDown
          className={`w-3 h-3 shrink-0 ml-1 transition-transform duration-200 text-muted-text group-hover:text-foreground ${
            isOpen ? 'rotate-180 text-gold' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full right-0 mt-1.5 ${minWidthClass} max-w-[calc(100vw-2rem)] bg-[#0e0e11] border border-border shadow-[0_16px_40px_rgba(0,0,0,0.7)] z-50 divide-y divide-border/60 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-surface-secondary/60 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-text flex items-center gap-1.5">
              <TriggerIcon className="w-3 h-3 text-gold" />
              {menuTitle || `Filter by ${label}`}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('' as T)
                  setIsOpen(false)
                }}
                className="text-[9px] font-bold uppercase tracking-wider text-muted-text hover:text-gold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Options */}
          <div className="py-1 max-h-72 overflow-y-auto divide-y divide-border/30">
            {options.map((opt) => {
              const isSelected = opt.value === value || (opt.value === '' && !value)
              const OptionIcon = opt.icon

              return (
                <button
                  key={String(opt.value) + opt.label}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-all duration-150 cursor-pointer group/item ${
                    isSelected
                      ? 'bg-gold/10 text-gold'
                      : 'text-foreground hover:bg-surface-secondary/70 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {OptionIcon && (
                      <div
                        className={`w-6 h-6 border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-gold/40 bg-gold/10 text-gold'
                            : 'border-border/60 bg-surface text-muted-text group-hover/item:text-foreground group-hover/item:border-border'
                        }`}
                      >
                        <OptionIcon className="w-3 h-3" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs tracking-tight truncate ${
                            isSelected ? 'font-black text-gold' : 'font-semibold text-foreground'
                          }`}
                        >
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span
                            className={`text-[8px] font-mono uppercase px-1.5 py-0.2 tracking-wider ${
                              isSelected
                                ? 'bg-gold text-black font-black'
                                : 'bg-surface-secondary text-muted-text'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.description && (
                        <span className="text-[10px] text-muted-text/80 truncate leading-snug">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-gold stroke-[3]" />
                      </div>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-border/40 group-hover/item:bg-muted-text/40" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface UsersTabContentProps {
  isDark: boolean
  onTotalUsersUpdate?: (count: number) => void
}

export function UsersTabContent({ isDark, onTotalUsersUpdate }: UsersTabContentProps) {
  const [stats, setStats] = useState<WebsiteUserStats | null>(null)
  const [users, setUsers] = useState<WebsiteUser[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('')
  const [authProviderFilter, setAuthProviderFilter] = useState('')
  const [hasClickedFilter, setHasClickedFilter] = useState<'true' | 'false' | ''>('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'lastActiveAt' | 'loginCount' | 'name' | 'email'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [statsData, listData] = await Promise.all([
        getWebsiteUserStats(),
        getWebsiteUsersList({
          page,
          limit: pagination.limit,
          search: debouncedSearch.trim() || undefined,
          status: statusFilter,
          authProvider: authProviderFilter,
          hasClickedProperty: hasClickedFilter || undefined,
          sortBy,
          sortOrder,
        }),
      ])
      setStats(statsData)
      setUsers(listData.users)
      setPagination(listData.pagination)
      if (onTotalUsersUpdate) onTotalUsersUpdate(statsData.totalUsers)
    } catch (err) {
      console.error('Error fetching website users:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, pagination.limit, debouncedSearch, statusFilter, authProviderFilter, hasClickedFilter, sortBy, sortOrder, onTotalUsersUpdate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await updateWebsiteUserStatus(id, !currentStatus)
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
        )
      }
    } catch (err) {
      console.error('Failed to update user status:', err)
    }
  }

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
        <StatCard
          label="Total Registered"
          value={stats?.totalUsers || 0}
          icon={Users}
          iconColor="#D4AF37"
          sub="Website accounts"
          accent
          isDark={isDark}
        />
        <StatCard
          label="New Today"
          value={stats?.newUsersToday || 0}
          icon={UserPlus}
          iconColor="var(--color-gold)"
          sub="Registered today"
          isDark={isDark}
        />
        <StatCard
          label="Active — 7 Days"
          value={stats?.activeUsers7d || 0}
          icon={Activity}
          iconColor="var(--color-gold)"
          sub="Seen in last 7 days"
          isDark={isDark}
        />
        <StatCard
          label="Returning Rate"
          value={stats?.returningRatePercentage || 0}
          suffix="%"
          icon={TrendingUp}
          iconColor="var(--color-gold)"
          sub={`${stats?.returningUsers || 0} returning users`}
          isDark={isDark}
        />
      </div>

      {/* Control Bar with Luxury Dropdowns */}
      <div className="bg-surface border border-border">
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Search Input */}
          <div className="relative flex-1 flex items-center min-w-0">
            <Search className="w-3.5 h-3.5 absolute left-3.5 text-muted-text pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search accounts by name, email..."
              className="w-full pl-10 pr-9 py-2.5 bg-transparent text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setDebouncedSearch('')
                  setPage(1)
                }}
                className="absolute right-3 text-muted-text hover:text-foreground transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Luxury Dropdowns Group */}
          <div className="flex flex-wrap md:flex-nowrap items-stretch divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Status Dropdown */}
            <CoolFilterDropdown<'active' | 'inactive' | ''>
              label="Status"
              icon={Shield}
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(val) => {
                setStatusFilter(val)
                setPage(1)
              }}
              menuTitle="Account Status"
              minWidthClass="w-64"
            />

            {/* Auth Method Dropdown */}
            <CoolFilterDropdown<string>
              label="Auth"
              icon={KeyRound}
              value={authProviderFilter}
              options={AUTH_OPTIONS}
              onChange={(val) => {
                setAuthProviderFilter(val)
                setPage(1)
              }}
              menuTitle="Authentication Method"
              minWidthClass="w-72"
            />

            {/* Activity Dropdown */}
            <CoolFilterDropdown<'true' | 'false' | ''>
              label="Activity"
              icon={Building2}
              value={hasClickedFilter}
              options={ACTIVITY_OPTIONS}
              onChange={(val) => {
                setHasClickedFilter(val)
                setPage(1)
              }}
              menuTitle="Property Engagement"
              minWidthClass="w-72"
            />

            {/* Refresh Button */}
            <div className="flex items-center border-t md:border-t-0 md:border-l border-border shrink-0">
              <button
                onClick={() => {
                  setIsRefreshing(true)
                  loadData()
                }}
                disabled={isRefreshing}
                className="w-full md:w-auto h-full px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-muted-text hover:text-foreground hover:bg-surface-secondary/50 transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
                title="Refresh customer data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
                <span className="inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Bar (visible when any filter or search is active) */}
        {(debouncedSearch || statusFilter || authProviderFilter || hasClickedFilter) && (
          <div className="border-t border-border/60 bg-surface-secondary/40 px-3.5 py-2 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="text-muted-text uppercase font-bold tracking-wider flex items-center gap-1.5 shrink-0">
              <Filter className="w-3 h-3 text-gold" />
              Active Filters:
            </span>

            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface border border-border text-foreground font-semibold">
                <span className="text-muted-text">Search:</span> &quot;{debouncedSearch}&quot;
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setDebouncedSearch('')
                    setPage(1)
                  }}
                  className="text-muted-text hover:text-gold cursor-pointer ml-0.5"
                  title="Clear search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface border border-gold/40 text-gold font-semibold">
                <span className="text-muted-text">Status:</span>
                {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || statusFilter}
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('')
                    setPage(1)
                  }}
                  className="text-muted-text hover:text-gold cursor-pointer ml-0.5"
                  title="Clear status filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {authProviderFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface border border-gold/40 text-gold font-semibold">
                <span className="text-muted-text">Auth:</span>
                {AUTH_OPTIONS.find((o) => o.value === authProviderFilter)?.label || authProviderFilter}
                <button
                  type="button"
                  onClick={() => {
                    setAuthProviderFilter('')
                    setPage(1)
                  }}
                  className="text-muted-text hover:text-gold cursor-pointer ml-0.5"
                  title="Clear auth filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {hasClickedFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface border border-gold/40 text-gold font-semibold">
                <span className="text-muted-text">Activity:</span>
                {ACTIVITY_OPTIONS.find((o) => o.value === hasClickedFilter)?.label || hasClickedFilter}
                <button
                  type="button"
                  onClick={() => {
                    setHasClickedFilter('')
                    setPage(1)
                  }}
                  className="text-muted-text hover:text-gold cursor-pointer ml-0.5"
                  title="Clear activity filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setDebouncedSearch('')
                setStatusFilter('')
                setAuthProviderFilter('')
                setHasClickedFilter('')
                setPage(1)
              }}
              className="text-muted-text hover:text-gold transition-colors ml-auto font-bold uppercase tracking-wider underline cursor-pointer text-[9px]"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      {isLoading ? (
        <TableSkeleton rows={pagination.limit || 8} columns={6} />
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[320px] bg-surface border border-border text-center px-4 py-12">
          <div className="w-12 h-12 border border-border flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-muted-text" />
          </div>
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-1">No Accounts Found</h3>
          <p className="text-xs text-muted-text max-w-xs">No user accounts matched your search criteria or filters.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  {['User', 'Auth Method', 'Logins', 'Property Clicks', 'Last Active', 'Registered', 'Status', ''].map((h) => (
                    <th key={h} className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-secondary transition-colors cursor-pointer group"
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 flex items-center justify-center text-white font-black text-xs shrink-0"
                          style={{ background: hashColor(u.email) }}
                        >
                          {getInitials(u.name, u.email)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-foreground text-xs block truncate group-hover:text-gold transition-colors">
                            {u.name || 'Anonymous User'}
                          </span>
                          <span className="text-[10px] text-muted-text block truncate">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <AuthProviderBadge provider={u.authProvider} isDark={isDark} />
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold text-foreground">{u.loginCount}</span>
                      {u.isReturningUser && (
                        <span className="ml-1 text-[10px] font-semibold text-gold">(Returning)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.totalPropertyClicks && u.totalPropertyClicks > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-gold/15 text-gold border border-gold/30 rounded-xs">
                          <Building2 className="w-3 h-3" />
                          {u.totalPropertyClicks} {u.totalPropertyClicks === 1 ? 'Click' : 'Clicks'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-text">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[10px] text-muted-text">
                      {formatRelativeTime(u.lastActiveAt)}
                    </td>

                    <td className="py-3.5 px-4 text-[10px] text-muted-text whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        u.isActive ? 'text-foreground' : 'text-muted-text'
                      }`}>
                        <span className={`w-1.5 h-1.5 ${u.isActive ? 'bg-foreground' : 'bg-muted-text'}`} />
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedUserId(u.id)}
                          className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-gold hover:bg-gold/10 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive)}
                          className={`w-7 h-7 flex items-center justify-center transition-colors ${
                            u.isActive
                              ? 'text-muted-text hover:text-red-500'
                              : 'text-muted-text hover:text-foreground'
                          }`}
                          title={u.isActive ? 'Deactivate' : 'Reactivate'}
                        >
                          {u.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-secondary">
            <span className="text-[10px] font-medium text-muted-text uppercase tracking-wider">
              Showing <span className="text-foreground font-bold">{users.length}</span> of{' '}
              <span className="text-foreground font-bold">{pagination.total}</span> accounts
            </span>

            <div className="flex items-center gap-1">
              {[
                { icon: ChevronsLeft, action: () => setPage(1), disabled: page <= 1 },
                { icon: ChevronLeft, action: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1 },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted-text hover:text-foreground disabled:opacity-30 transition-colors">
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <span className="px-3 text-[10px] font-bold text-foreground uppercase tracking-wider">
                {page} / {pagination.totalPages}
              </span>
              {[
                { icon: ChevronRight, action: () => setPage((p) => Math.min(pagination.totalPages, p + 1)), disabled: page >= pagination.totalPages },
                { icon: ChevronsRight, action: () => setPage(pagination.totalPages), disabled: page >= pagination.totalPages },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted-text hover:text-foreground disabled:opacity-30 transition-colors">
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          isDark={isDark}
          onClose={() => setSelectedUserId(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  )
}
