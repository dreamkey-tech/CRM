'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Laptop,
  Smartphone,
  Tablet,
  User,
  LogIn,
  LogOut,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  X,
  MapPin,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react'
import { listAuditLogsApi, getAuditStatsApi, listEmployeesApi } from '../../api/organization'
import { useRefreshStore } from '../../store/useRefreshStore'
import { toast } from '../../utils/toast'
import type { AuditLogItem, AuditStats, AuditUserSummary, Employee } from '../../types/organization'

export function AuditLogsTabContent() {
  const { refreshTick } = useRefreshStore()
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [userSummary, setUserSummary] = useState<AuditUserSummary | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [moduleFilter, setModuleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'DENIED'>('ALL')
  const [deviceFilter, setDeviceFilter] = useState<'ALL' | 'DESKTOP' | 'MOBILE' | 'TABLET'>('ALL')
  const [actionFilter, setActionFilter] = useState<string>('ALL')

  // Expanded diff rows & inspection modal
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [inspectingLog, setInspectingLog] = useState<AuditLogItem | null>(null)

  // Fetch all staff members for the employee selector
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await listEmployeesApi({ limit: 100 })
        if (res.success) {
          setEmployees(res.employees)
        }
      } catch {
        // Non-blocking
      }
    }
    loadEmployees()
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const [logsRes, statsRes] = await Promise.all([
        listAuditLogsApi({
          search: search.trim() || undefined,
          userId: selectedUserId || undefined,
          module: moduleFilter === 'ALL' ? undefined : moduleFilter,
          status: statusFilter,
          deviceType: deviceFilter === 'ALL' ? undefined : deviceFilter,
          action: actionFilter === 'ALL' ? undefined : actionFilter,
        }),
        getAuditStatsApi(),
      ])

      if (logsRes.success) {
        setLogs(logsRes.logs)
        setUserSummary(logsRes.userSummary || null)
      }
      if (statsRes.success) setStats(statsRes.stats)
    } catch {
      toast.error('Audit Load Failed', 'Could not fetch system audit stream.')
    } finally {
      setLoading(false)
    }
  }, [search, selectedUserId, moduleFilter, statusFilter, deviceFilter, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs, refreshTick])

  const toggleRowExpanded = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Helper to render Device Icon & Label
  const renderDeviceBadge = (deviceType: string, deviceName: string, compact = false) => {
    const isMobile = deviceType === 'MOBILE'
    const isTablet = deviceType === 'TABLET'

    const Icon = isMobile ? Smartphone : isTablet ? Tablet : Laptop
    const typeLabel = isMobile ? 'Phone' : isTablet ? 'Tablet' : 'Laptop / PC'
    const badgeColor = isMobile
      ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
      : isTablet
      ? 'border-purple-500/30 text-purple-400 bg-purple-500/10'
      : 'border-blue-500/30 text-blue-400 bg-blue-500/10'

    if (compact) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${badgeColor}`}
        >
          <Icon className="w-2.5 h-2.5" />
          {typeLabel}
        </span>
      )
    }

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${badgeColor}`}
          >
            <Icon className="w-2.5 h-2.5" />
            {typeLabel}
          </span>
          <span className="text-[10px] text-foreground font-medium truncate max-w-[130px]">
            {deviceName.replace(/^(Laptop\/PC|Laptop\/Mac|Phone|Tablet)\s*\((.+)\)$/, '$2')}
          </span>
        </div>
      </div>
    )
  }

  // Helper for Action Badge
  const renderActionBadge = (action: string, isDenied: boolean) => {
    if (isDenied) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-red-500/40 text-red-500 bg-red-500/10">
          <XCircle className="w-2.5 h-2.5" />
          {action}
        </span>
      )
    }

    if (action === 'LOGIN') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-green-500/40 text-green-500 bg-green-500/10">
          <LogIn className="w-2.5 h-2.5" />
          LOGIN
        </span>
      )
    }

    if (action === 'LOGOUT') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-border text-muted-text bg-surface-secondary">
          <LogOut className="w-2.5 h-2.5" />
          LOGOUT
        </span>
      )
    }

    if (action === 'CREATE' || action.startsWith('CREATE_')) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-blue-500/40 text-blue-400 bg-blue-500/10">
          <PlusCircle className="w-2.5 h-2.5" />
          ADD
        </span>
      )
    }

    if (action === 'UPDATE' || action.startsWith('UPDATE_') || action === 'STATUS_CHANGED') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-gold/40 text-gold bg-gold/10">
          <Edit3 className="w-2.5 h-2.5" />
          EDIT
        </span>
      )
    }

    if (action === 'DELETE' || action.startsWith('DELETE_')) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-red-500/40 text-red-400 bg-red-500/10">
          <Trash2 className="w-2.5 h-2.5" />
          DELETE
        </span>
      )
    }

    if (action === 'VIEW_DOCUMENT') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
          <Eye className="w-2.5 h-2.5" />
          DOC VIEW
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-border bg-surface-secondary text-foreground">
        {action}
      </span>
    )
  }

  // Helper for Role Badge
  const renderRoleBadge = (role: string) => {
    let color = 'border-border text-muted-text bg-surface-secondary'
    if (role === 'SUPER_ADMIN') color = 'border-gold/40 text-gold bg-gold/10'
    else if (role === 'TELECALLER') color = 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
    else if (role === 'SALES_EXECUTIVE' || role === 'SALES_AGENT')
      color = 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
    else if (role === 'INVENTORY_MANAGER')
      color = 'border-purple-500/40 text-purple-400 bg-purple-500/10'

    return (
      <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider border ${color}`}>
        {role.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 4 Aggregate Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-gold" />
            Total Activity Logs
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-foreground">
            {stats ? stats.totalLogs.toLocaleString() : '—'}
          </span>
          <p className="text-[10px] text-muted-text">Recorded employee actions</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-blue-400" />
            Actions Today
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-foreground">
            {stats ? stats.actionsToday.toLocaleString() : '—'}
          </span>
          <p className="text-[10px] text-muted-text">Logged since 12:00 AM</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            Security Denials
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-red-500">
            {stats ? stats.securityDenials.toLocaleString() : '—'}
          </span>
          <p className="text-[10px] text-muted-text">Unauthorized access blocked</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-green-500" />
            Confidential Views
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-green-500">
            {stats ? stats.sensitiveDocViews.toLocaleString() : '—'}
          </span>
          <p className="text-[10px] text-muted-text">Aadhaar, KYC & Doc downloads</p>
        </div>
      </div>

      {/* Employee Spotlight Card (Rendered when a specific employee like Rakesh is selected) */}
      {selectedUserId && userSummary && (
        <div className="bg-surface border-2 border-gold/40 p-4 sm:p-5 relative overflow-hidden transition-all shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center font-bold text-gold text-sm uppercase">
                {userSummary.employee.name.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {userSummary.employee.name}
                  </h3>
                  {renderRoleBadge(userSummary.employee.role)}
                  {!userSummary.employee.isActive && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/30">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-text font-mono">{userSummary.employee.email}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedUserId('')}
              className="self-start md:self-auto flex items-center gap-1.5 text-xs text-muted-text hover:text-foreground border border-border px-3 py-1.5 bg-surface-secondary hover:bg-surface transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear Employee Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Last Login & Device Card */}
            <div className="lg:col-span-2 bg-surface-secondary border border-border p-3 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
                <LogIn className="w-3 h-3 text-gold" />
                Last Login & Device
              </span>

              {userSummary.lastLogin ? (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    {renderDeviceBadge(
                      userSummary.lastLogin.deviceType,
                      userSummary.lastLogin.deviceName
                    )}
                    <span className="text-xs font-bold text-foreground">
                      {userSummary.lastLogin.deviceType === 'MOBILE'
                        ? '📱 Phone'
                        : userSummary.lastLogin.deviceType === 'TABLET'
                        ? '📟 Tablet'
                        : '💻 Laptop / PC'}
                    </span>
                  </div>

                  <p className="text-xs text-foreground font-mono">
                    {userSummary.lastLogin.deviceName}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-text font-mono pt-1 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(userSummary.lastLogin.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {userSummary.lastLogin.city
                        ? `${userSummary.lastLogin.city}, ${userSummary.lastLogin.country || 'IN'}`
                        : userSummary.lastLogin.ipAddress || 'IP Recorded'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-text italic mt-2">No sign-in recorded yet</p>
              )}
            </div>

            {/* Creations */}
            <div className="bg-surface-secondary border border-border p-3 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
                <PlusCircle className="w-3 h-3 text-blue-400" />
                Items Added
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                  {userSummary.actionBreakdown.creations}
                </span>
                <p className="text-[10px] text-muted-text mt-0.5">Clients, properties & records</p>
              </div>
            </div>

            {/* Updates */}
            <div className="bg-surface-secondary border border-border p-3 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
                <Edit3 className="w-3 h-3 text-gold" />
                Items Edited
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                  {userSummary.actionBreakdown.updates}
                </span>
                <p className="text-[10px] text-muted-text mt-0.5">Status changes & modifications</p>
              </div>
            </div>

            {/* Total Actions */}
            <div className="bg-surface-secondary border border-border p-3 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-purple-400" />
                Total Actions
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                  {userSummary.totalActions}
                </span>
                <p className="text-[10px] text-muted-text mt-0.5">
                  {userSummary.actionBreakdown.logins} logins · {userSummary.actionBreakdown.views}{' '}
                  views
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar & Filter Bar */}
      <div className="bg-surface border border-border">
        {/* Top Control Row: Search & Employee Select */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Search Input */}
          <div className="relative md:col-span-7">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action, employee, phone, details, device, or IP address..."
              className="w-full pl-10 pr-4 py-3 bg-transparent text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none"
            />
          </div>

          {/* Employee Selector Dropdown */}
          <div className="md:col-span-4 flex items-center px-3 py-2 bg-surface">
            <User className="w-3.5 h-3.5 text-muted-text mr-2 shrink-0" />
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="bg-surface text-foreground">
                All Staff Members & System Activity
              </option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id} className="bg-surface text-foreground">
                  {emp.name || emp.email} ({emp.roles[0] || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <div className="md:col-span-1 flex items-center justify-center p-1">
            <button
              onClick={() => fetchLogs()}
              title="Refresh Activity"
              className="w-full h-full py-2.5 flex items-center justify-center text-muted-text hover:text-foreground text-[10px] font-bold uppercase transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border-t border-border">
          {/* 1. Device Dropdown */}
          <div className="bg-surface p-2.5 sm:px-3 sm:py-2 flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center justify-between">
              <span>Device</span>
              {deviceFilter !== 'ALL' && (
                <span className="text-[8px] text-gold uppercase font-bold">Filtered</span>
              )}
            </label>
            <div className="relative">
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value as any)}
                className={`w-full bg-surface-secondary border text-xs py-1.5 px-2.5 pr-7 appearance-none cursor-pointer focus:outline-none transition-colors ${
                  deviceFilter !== 'ALL'
                    ? 'border-gold text-gold font-bold'
                    : 'border-border text-foreground hover:border-border/80'
                }`}
              >
                <option value="ALL">All Devices</option>
                <option value="DESKTOP">Laptop / PC</option>
                <option value="MOBILE">Phone</option>
                <option value="TABLET">Tablet</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            </div>
          </div>

          {/* 2. Action Dropdown */}
          <div className="bg-surface p-2.5 sm:px-3 sm:py-2 flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center justify-between">
              <span>Action</span>
              {actionFilter !== 'ALL' && (
                <span className="text-[8px] text-gold uppercase font-bold">Filtered</span>
              )}
            </label>
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className={`w-full bg-surface-secondary border text-xs py-1.5 px-2.5 pr-7 appearance-none cursor-pointer focus:outline-none transition-colors ${
                  actionFilter !== 'ALL'
                    ? 'border-gold text-gold font-bold'
                    : 'border-border text-foreground hover:border-border/80'
                }`}
              >
                <option value="ALL">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Add (Create)</option>
                <option value="UPDATE">Edit (Update)</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW_DOCUMENT">View Document</option>
                <option value="SHORTLIST_PROPERTY">Shortlist Property</option>
                <option value="SHARE_PROPERTY">Share Property</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            </div>
          </div>

          {/* 3. Module Dropdown */}
          <div className="bg-surface p-2.5 sm:px-3 sm:py-2 flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center justify-between">
              <span>Module</span>
              {moduleFilter !== 'ALL' && (
                <span className="text-[8px] text-gold uppercase font-bold">Filtered</span>
              )}
            </label>
            <div className="relative">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className={`w-full bg-surface-secondary border text-xs py-1.5 px-2.5 pr-7 appearance-none cursor-pointer focus:outline-none transition-colors ${
                  moduleFilter !== 'ALL'
                    ? 'border-gold text-gold font-bold'
                    : 'border-border text-foreground hover:border-border/80'
                }`}
              >
                <option value="ALL">All Modules</option>
                <option value="CLIENTS">Clients</option>
                <option value="PROPERTIES">Properties</option>
                <option value="AUTH">Authentication</option>
                <option value="DOCUMENTS">Documents</option>
                <option value="BROKERS">Brokers</option>
                <option value="OWNERS">Owners</option>
                <option value="EMPLOYEES">Employees</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            </div>
          </div>

          {/* 4. Status Dropdown */}
          <div className="bg-surface p-2.5 sm:px-3 sm:py-2 flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-text flex items-center justify-between">
              <span>Status</span>
              {statusFilter !== 'ALL' && (
                <span className="text-[8px] text-gold uppercase font-bold">Filtered</span>
              )}
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`w-full bg-surface-secondary border text-xs py-1.5 px-2.5 pr-7 appearance-none cursor-pointer focus:outline-none transition-colors ${
                  statusFilter !== 'ALL'
                    ? 'border-gold text-gold font-bold'
                    : 'border-border text-foreground hover:border-border/80'
                }`}
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="DENIED">Denied</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Clear Bar */}
        {(deviceFilter !== 'ALL' ||
          actionFilter !== 'ALL' ||
          moduleFilter !== 'ALL' ||
          statusFilter !== 'ALL' ||
          selectedUserId ||
          search) && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-surface-secondary border-t border-border text-[10px] text-muted-text">
            <span className="truncate">
              Active filters:{' '}
              {[
                selectedUserId ? 'Employee selected' : null,
                deviceFilter !== 'ALL' ? `Device: ${deviceFilter}` : null,
                actionFilter !== 'ALL' ? `Action: ${actionFilter}` : null,
                moduleFilter !== 'ALL' ? `Module: ${moduleFilter}` : null,
                statusFilter !== 'ALL' ? `Status: ${statusFilter}` : null,
                search ? `Search: "${search}"` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
            <button
              onClick={() => {
                setDeviceFilter('ALL')
                setActionFilter('ALL')
                setModuleFilter('ALL')
                setStatusFilter('ALL')
                setSelectedUserId('')
                setSearch('')
              }}
              className="text-gold hover:underline font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 shrink-0 ml-2"
            >
              <X className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Activity Logs Table */}
      <div className="bg-surface border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text whitespace-nowrap">
                Timestamp (IST)
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Actor / Employee
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Action & Module
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Device (Phone/Laptop)
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text min-w-[280px]">
                What He Added / Edited
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-muted-text">
                  Loading activity stream...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-muted-text">
                  No activity logs matching query criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isDenied = log.status === 'DENIED'
                const isExpanded = !!expandedRows[log.id]
                const formattedDate = new Date(log.createdAt).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })

                const hasChanges = Array.isArray(log.changes) && log.changes.length > 0

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`transition-colors ${
                        isDenied
                          ? 'bg-red-500/5 hover:bg-red-500/10'
                          : 'hover:bg-surface-secondary/40'
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-xs font-mono text-muted-text whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.actor ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-foreground">
                                {log.actor.name}
                              </span>
                              {renderRoleBadge(log.actor.role)}
                            </div>
                            <div className="text-[10px] text-muted-text font-mono">
                              {log.actor.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-text italic">
                            System / Anonymous
                          </span>
                        )}
                      </td>

                      {/* Action & Module */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {renderActionBadge(log.action, isDenied)}
                          <span className="text-[9px] font-mono text-muted-text uppercase">
                            [{log.module}]
                          </span>
                        </div>
                      </td>

                      {/* Device & Location */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          {renderDeviceBadge(log.deviceType, log.deviceName)}
                          <span className="text-[10px] text-muted-text font-mono">
                            {log.city
                              ? `${log.city}, ${log.country || 'IN'} · `
                              : ''}
                            {log.ipAddress || '127.0.0.1'}
                          </span>
                        </div>
                      </td>

                      {/* What was Added / Edited */}
                      <td className="py-3 px-4 text-xs text-foreground">
                        <div>
                          <p className="line-clamp-2 leading-relaxed">
                            {log.details || log.resourceName || '—'}
                          </p>

                          {hasChanges && (
                            <button
                              onClick={() => toggleRowExpanded(log.id)}
                              className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-2.5 h-2.5" />
                              ) : (
                                <ChevronRight className="w-2.5 h-2.5" />
                              )}
                              {isExpanded
                                ? 'Hide Changes'
                                : `View Changes (${log.changes!.length})`}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isDenied ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-red-500 border border-red-500/40 bg-red-500/10">
                              <XCircle className="w-2.5 h-2.5" />
                              DENIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-green-500 border border-green-500/40 bg-green-500/10">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              SUCCESS
                            </span>
                          )}

                          <button
                            onClick={() => setInspectingLog(log)}
                            title="Inspect complete payload"
                            className="p-1 text-muted-text hover:text-foreground transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline Diff Viewer (when View Changes is expanded) */}
                    {isExpanded && hasChanges && (
                      <tr className="bg-surface-secondary/70 border-b border-border/80">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="border border-border bg-surface overflow-hidden">
                            <div className="bg-surface-secondary px-3 py-1.5 border-b border-border flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-text">
                              <span>Field Changes Before & After</span>
                              <span>Target: {log.resourceName || log.resourceId || 'Entity'}</span>
                            </div>

                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border/50 text-[9px] font-bold uppercase tracking-wider text-muted-text bg-surface-secondary/30">
                                  <th className="py-2 px-3 text-left w-1/4">Field</th>
                                  <th className="py-2 px-3 text-left w-5/12">Previous Value</th>
                                  <th className="py-2 px-3 text-left w-5/12">New Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                                {log.changes!.map((ch, idx) => (
                                  <tr key={idx} className="hover:bg-surface-secondary/20">
                                    <td className="py-2 px-3 font-sans font-bold text-foreground">
                                      {ch.label || ch.field}
                                    </td>
                                    <td className="py-2 px-3 text-red-400 bg-red-500/5">
                                      <span className="line-through opacity-80">
                                        {formatValue(ch.from)}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-green-400 bg-green-500/5 font-bold flex items-center gap-1.5">
                                      <ArrowRight className="w-3 h-3 text-green-400/60 shrink-0" />
                                      <span>{formatValue(ch.to)}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Deep Inspection Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-bold text-foreground">Audit Log Event Details</h3>
                <span className="text-[10px] font-mono text-muted-text">
                  [{inspectingLog.id.slice(0, 8)}]
                </span>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="text-muted-text hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-surface-secondary border border-border p-3">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block">
                    Employee
                  </span>
                  <span className="font-bold text-foreground">
                    {inspectingLog.actor?.name || 'System'}
                  </span>
                  <p className="text-[10px] text-muted-text font-mono">
                    {inspectingLog.actor?.email}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block">
                    Role
                  </span>
                  <span className="font-bold text-foreground">
                    {inspectingLog.actor?.role || 'System'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block">
                    Device
                  </span>
                  <span className="font-bold text-foreground">
                    {inspectingLog.deviceType} ({inspectingLog.deviceName})
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block">
                    IP & Location
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {inspectingLog.ipAddress || 'Unknown'} (
                    {inspectingLog.city ? `${inspectingLog.city}, ` : ''}
                    {inspectingLog.country || 'IN'})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block mb-1">
                  Action Summary
                </span>
                <p className="p-3 bg-surface-secondary border border-border text-foreground font-mono text-[11px]">
                  {inspectingLog.details || inspectingLog.resourceName || 'No description provided'}
                </p>
              </div>

              {inspectingLog.userAgent && (
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block mb-1">
                    Raw User Agent
                  </span>
                  <p className="p-2 bg-surface-secondary border border-border text-muted-text font-mono text-[10px] break-all">
                    {inspectingLog.userAgent}
                  </p>
                </div>
              )}

              {inspectingLog.changes && inspectingLog.changes.length > 0 && (
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold block mb-1">
                    Structured Diff Payload
                  </span>
                  <pre className="p-3 bg-surface-secondary border border-border text-foreground font-mono text-[10px] overflow-x-auto">
                    {JSON.stringify(inspectingLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-border flex justify-end">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatValue(val: any): string {
  if (val === null || val === undefined || val === '') return 'None'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'number') {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(2).replace(/\.00$/, '')} L`
    return val.toLocaleString('en-IN')
  }
  if (Array.isArray(val)) return val.length ? val.join(', ') : 'Empty'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
