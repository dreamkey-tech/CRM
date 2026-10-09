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
} from 'lucide-react'
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
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
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
  }, [page, pagination.limit, debouncedSearch, statusFilter, authProviderFilter, sortBy, sortOrder, onTotalUsersUpdate])

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

      {/* Control Bar */}
      <div className="bg-surface border border-border">
        <div className="flex items-stretch border-b border-border">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search accounts by name, email..."
              className="w-full pl-10 pr-9 py-3 bg-transparent text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setDebouncedSearch('')
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-foreground transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center border-l border-border">
            <button
              onClick={() => {
                setIsRefreshing(true)
                loadData()
              }}
              disabled={isRefreshing}
              className="h-full px-3.5 flex items-center gap-1.5 text-muted-text hover:text-foreground hover:bg-surface-secondary/50 transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        {/* Filter row */}
        <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto no-scrollbar">
          {[{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Deactivated' }].map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value as any); setPage(1) }}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.value ? 'bg-foreground text-background' : 'text-muted-text hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          {[{ value: '', label: 'All Auth' }, { value: 'EMAIL', label: 'Email' }, { value: 'GOOGLE', label: 'Google' }].map((f) => (
            <button
              key={f.value}
              onClick={() => { setAuthProviderFilter(f.value); setPage(1) }}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                authProviderFilter === f.value ? 'bg-foreground text-background' : 'text-muted-text hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
          {debouncedSearch && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-[10px] font-bold uppercase tracking-wider text-gold shrink-0">
                "{debouncedSearch}"
                <button
                  onClick={() => {
                    setSearch('')
                    setDebouncedSearch('')
                    setPage(1)
                  }}
                  className="hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            </>
          )}
        </div>
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
                  {['User', 'Auth Method', 'Logins', 'Last Active', 'Registered', 'Status', ''].map((h) => (
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
