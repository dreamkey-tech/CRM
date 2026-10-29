'use client'

import React, { useState } from 'react'
import {
  X,
  Sparkles,
  Copy,
  Check,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Building,
  Home,
  Users2,
  KeyRound,
  DollarSign,
  FileCheck2,
  ChevronDown,
} from 'lucide-react'
import { generateStrongPassword } from '../../utils/password'
import { toast } from '../../utils/toast'
import { createEmployeeApi } from '../../api/organization'
import type { Employee, ModuleAccess } from '../../types/organization'

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newEmployee: Employee) => void
}

interface ModuleRowConfig {
  id: 'brokers' | 'properties' | 'clients' | 'owners'
  label: string
  description: string
  icon: React.ElementType
  viewKey: string
  createKey: string
  editKey: string
  deleteKey: string
}

const CRUD_MODULES: ModuleRowConfig[] = [
  {
    id: 'brokers',
    label: 'Brokers Module',
    description: 'Broker directory, contacts, and society expertise',
    icon: Building,
    viewKey: 'brokers:read',
    createKey: 'brokers:create',
    editKey: 'brokers:update',
    deleteKey: 'brokers:delete',
  },
  {
    id: 'properties',
    label: 'Properties Module',
    description: 'Inventory, pricing, drafts, and media assets',
    icon: Home,
    viewKey: 'properties:read',
    createKey: 'properties:create',
    editKey: 'properties:update',
    deleteKey: 'properties:delete',
  },
  {
    id: 'clients',
    label: 'Clients Directory',
    description: 'Buyer requirements, property shortlists, and share tracking',
    icon: Users2,
    viewKey: 'clients:read',
    createKey: 'clients:create',
    editKey: 'clients:update',
    deleteKey: 'clients:delete',
  },
  {
    id: 'owners',
    label: 'Owners Registry',
    description: 'Direct owner contact records and listing assignments',
    icon: KeyRound,
    viewKey: 'owners:read',
    createKey: 'owners:create',
    editKey: 'owners:update',
    deleteKey: 'owners:delete',
  },
]

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Granular set of checked permissions
  const [permissions, setPermissions] = useState<Set<string>>(
    new Set([
      'properties:read',
      'properties:create',
      'properties:update',
      'clients:read',
      'clients:create',
      'clients:update',
      'brokers:read',
      'owners:read',
    ])
  )

  if (!isOpen) return null

  const handleGeneratePassword = () => {
    const pwd = generateStrongPassword(14)
    setPassword(pwd)
    setShowPassword(true)
    toast.info('Strong Password Generated', 'A secure 14-character password has been generated.')
  }

  const handleCopyPassword = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied', 'Password copied to clipboard.')
  }

  // Toggle single permission with dependency handling
  const togglePermission = (permKey: string, viewKey?: string) => {
    const next = new Set(permissions)
    if (next.has(permKey)) {
      next.delete(permKey)
      // If unchecking View, also remove write actions for this module
      if (viewKey && permKey === viewKey) {
        CRUD_MODULES.forEach((m) => {
          if (m.viewKey === permKey) {
            next.delete(m.createKey)
            next.delete(m.editKey)
            next.delete(m.deleteKey)
          }
        })
        if (permKey === 'finance:read') {
          next.delete('finance:manage')
        }
      }
    } else {
      next.add(permKey)
      // If checking Create, Edit, or Delete, ensure View is also enabled
      if (viewKey) {
        next.add(viewKey)
      }
    }
    setPermissions(next)
  }

  // Toggle all permissions for a CRUD module
  const toggleModuleAll = (m: ModuleRowConfig) => {
    const keys = [m.viewKey, m.createKey, m.editKey, m.deleteKey]
    const allChecked = keys.every((k) => permissions.has(k))
    const next = new Set(permissions)
    if (allChecked) {
      keys.forEach((k) => next.delete(k))
    } else {
      keys.forEach((k) => next.add(k))
    }
    setPermissions(next)
  }

  // Toggle all for finance
  const toggleFinanceAll = () => {
    const allChecked = permissions.has('finance:read') && permissions.has('finance:manage')
    const next = new Set(permissions)
    if (allChecked) {
      next.delete('finance:read')
      next.delete('finance:manage')
    } else {
      next.add('finance:read')
      next.add('finance:manage')
    }
    setPermissions(next)
  }

  // Quick preset shortcuts
  const applyPreset = (preset: 'SALES_AGENT' | 'TELECALLER' | 'FULL_ACCESS' | 'VIEW_ONLY' | 'CLEAR') => {
    switch (preset) {
      case 'SALES_AGENT':
        setPermissions(
          new Set([
            'properties:read',
            'properties:create',
            'properties:update',
            'clients:read',
            'clients:create',
            'clients:update',
            'brokers:read',
            'owners:read',
          ])
        )
        toast.info('Preset Applied', 'Configured Standard Sales Agent permissions.')
        break
      case 'TELECALLER':
        setPermissions(
          new Set([
            'properties:read',
            'brokers:read',
            'owners:read',
            'clients:read',
            'clients:create',
            'clients:update',
          ])
        )
        toast.info('Preset Applied', 'Configured Telecaller permissions (KYC restricted).')
        break
      case 'FULL_ACCESS':
        setPermissions(
          new Set([
            'brokers:read',
            'brokers:create',
            'brokers:update',
            'brokers:delete',
            'properties:read',
            'properties:create',
            'properties:update',
            'properties:delete',
            'clients:read',
            'clients:create',
            'clients:update',
            'clients:delete',
            'clients:documents:view_sensitive',
            'owners:read',
            'owners:create',
            'owners:update',
            'owners:delete',
            'finance:read',
            'finance:manage',
          ])
        )
        toast.info('Preset Applied', 'Granted Full Access across all modules.')
        break
      case 'VIEW_ONLY':
        setPermissions(
          new Set(['properties:read', 'clients:read', 'brokers:read', 'owners:read', 'finance:read'])
        )
        toast.info('Preset Applied', 'Configured View-Only permissions across all modules.')
        break
      case 'CLEAR':
        setPermissions(new Set())
        toast.info('Cleared', 'All module permissions cleared.')
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Validation Error', 'Please enter employee name.')
      return
    }
    if (!email.trim()) {
      toast.error('Validation Error', 'Please enter employee email.')
      return
    }
    if (password.length < 6) {
      toast.error('Validation Error', 'Password must be at least 6 characters.')
      return
    }

    // Compute surface-level module access for backward compatibility and overview cards
    const moduleAccess: ModuleAccess = {
      properties:
        permissions.has('properties:create') ||
        permissions.has('properties:update') ||
        permissions.has('properties:delete')
          ? 'FULL'
          : permissions.has('properties:read')
          ? 'VIEW'
          : 'NONE',
      clients:
        permissions.has('clients:create') ||
        permissions.has('clients:update') ||
        permissions.has('clients:delete')
          ? 'FULL'
          : permissions.has('clients:read')
          ? 'VIEW'
          : 'NONE',
      brokers:
        permissions.has('brokers:create') ||
        permissions.has('brokers:update') ||
        permissions.has('brokers:delete')
          ? 'FULL'
          : permissions.has('brokers:read')
          ? 'VIEW'
          : 'NONE',
      owners:
        permissions.has('owners:create') ||
        permissions.has('owners:update') ||
        permissions.has('owners:delete')
          ? 'FULL'
          : permissions.has('owners:read')
          ? 'VIEW'
          : 'NONE',
      finance: permissions.has('finance:manage')
        ? 'FULL'
        : permissions.has('finance:read')
        ? 'VIEW'
        : 'NONE',
      canViewSensitiveDocs: permissions.has('clients:documents:view_sensitive'),
    }

    try {
      setSubmitting(true)
      const res = await createEmployeeApi({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        moduleAccess,
        customPermissions: Array.from(permissions),
      })
      toast.success('Employee Created', res.message || 'Staff member created successfully.')
      // Reset form state
      setName('')
      setEmail('')
      setPassword('')
      setShowPassword(false)
      setPermissions(
        new Set([
          'properties:read',
          'properties:create',
          'properties:update',
          'clients:read',
          'clients:create',
          'clients:update',
          'brokers:read',
          'owners:read',
        ])
      )
      onSuccess(res.employee)
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create employee. Please check details.'
      toast.error('Creation Failed', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="bg-surface border border-border w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-secondary">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-gold" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Add New Employee / Member
              </h3>
              <p className="text-[10px] text-muted-text mt-0.5">
                Set credentials and customize module permissions via checkboxes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-foreground transition-colors p-1.5"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground placeholder:text-muted-text/50 focus:outline-none focus:border-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya@dreamkey.in"
                className="w-full px-3 py-2 text-xs bg-background border border-border text-foreground placeholder:text-muted-text/50 focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          {/* Password Generator Block */}
          <div className="space-y-2 p-4 bg-surface-secondary border border-border">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-gold" />
                Temporary / Initial Password *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                Generate Strong Password
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters or click generate"
                  className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-background border border-border text-foreground placeholder:text-muted-text/50 focus:outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                type="button"
                disabled={!password}
                onClick={handleCopyPassword}
                className="px-3.5 py-2 bg-background border border-border text-foreground hover:bg-surface text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-muted-text">
              Share this password with the employee. They will use it along with their email to log in.
            </p>
          </div>

          {/* Surface-Level Module Access with Granular Checkboxes */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-gold" />
                  Surface-Level Module Access & Permissions
                </h4>
                <p className="text-[10px] text-muted-text">
                  Control which sections and actions this employee can access via checkboxes.
                </p>
              </div>

              {/* Preset Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text font-mono">
                  Presets:
                </span>
                <div className="relative">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        applyPreset(e.target.value as any)
                        e.target.value = ''
                      }
                    }}
                    className="appearance-none bg-surface border border-border text-foreground px-3 py-1.5 pr-8 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:border-foreground focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="" disabled>
                      Select Role Preset...
                    </option>
                    <option value="SALES_AGENT">Standard Sales Agent</option>
                    <option value="TELECALLER">Telecaller (KYC Restricted)</option>
                    <option value="FULL_ACCESS">Full Access Admin</option>
                    <option value="VIEW_ONLY">View Only (All Modules)</option>
                    <option value="CLEAR">Clear All Selections</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-text pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Checkbox Matrix Table */}
            <div className="border border-border bg-surface overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-surface-secondary border-b border-border text-[9px] font-bold uppercase tracking-wider text-muted-text">
                <div className="col-span-5 sm:col-span-4">Module</div>
                <div className="col-span-7 sm:col-span-8 grid grid-cols-5 text-center">
                  <span>View</span>
                  <span>Create</span>
                  <span>Edit</span>
                  <span>Delete</span>
                  <span>All</span>
                </div>
              </div>

              {/* CRUD Modules Rows */}
              <div className="divide-y divide-border/60">
                {CRUD_MODULES.map((m) => {
                  const Icon = m.icon
                  const hasView = permissions.has(m.viewKey)
                  const hasCreate = permissions.has(m.createKey)
                  const hasEdit = permissions.has(m.editKey)
                  const hasDelete = permissions.has(m.deleteKey)
                  const allChecked = hasView && hasCreate && hasEdit && hasDelete

                  return (
                    <div
                      key={m.id}
                      className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-surface-secondary/40 transition-colors"
                    >
                      {/* Module Info */}
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-surface-secondary border border-border flex items-center justify-center shrink-0 text-gold">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                            {m.label}
                          </div>
                          <div className="text-[10px] text-muted-text hidden sm:block">
                            {m.description}
                          </div>
                        </div>
                      </div>

                      {/* Checkboxes Grid */}
                      <div className="col-span-7 sm:col-span-8 grid grid-cols-5 items-center justify-items-center">
                        {/* View Checkbox */}
                        <label className="flex items-center gap-1.5 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={hasView}
                            onChange={() => togglePermission(m.viewKey, m.viewKey)}
                            className="w-4 h-4 accent-gold bg-background border border-border rounded-none cursor-pointer"
                          />
                        </label>

                        {/* Create Checkbox */}
                        <label className="flex items-center gap-1.5 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={hasCreate}
                            onChange={() => togglePermission(m.createKey, m.viewKey)}
                            className="w-4 h-4 accent-gold bg-background border border-border rounded-none cursor-pointer"
                          />
                        </label>

                        {/* Edit Checkbox */}
                        <label className="flex items-center gap-1.5 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={hasEdit}
                            onChange={() => togglePermission(m.editKey, m.viewKey)}
                            className="w-4 h-4 accent-gold bg-background border border-border rounded-none cursor-pointer"
                          />
                        </label>

                        {/* Delete Checkbox */}
                        <label className="flex items-center gap-1.5 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={hasDelete}
                            onChange={() => togglePermission(m.deleteKey, m.viewKey)}
                            className="w-4 h-4 accent-gold bg-background border border-border rounded-none cursor-pointer"
                          />
                        </label>

                        {/* All Toggle Checkbox */}
                        <label className="flex items-center gap-1.5 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={() => toggleModuleAll(m)}
                            className="w-4 h-4 accent-foreground bg-background border border-border rounded-none cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}

                {/* Finance Module Row */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-surface-secondary/40 transition-colors">
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-surface-secondary border border-border flex items-center justify-center shrink-0 text-gold">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Finance & Ledgers
                      </div>
                      <div className="text-[10px] text-muted-text hidden sm:block">
                        Brokerage accounts, commissions & payouts
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 sm:col-span-8 grid grid-cols-5 items-center justify-items-center">
                    {/* View */}
                    <label className="flex items-center gap-1.5 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={permissions.has('finance:read')}
                        onChange={() => togglePermission('finance:read', 'finance:read')}
                        className="w-4 h-4 accent-gold bg-background border border-border rounded-none cursor-pointer"
                      />
                    </label>

                    {/* N/A placeholder */}
                    <span className="text-[10px] text-muted-text/30">—</span>

                    {/* Manage / Edit */}
                    <label className="flex items-center gap-1.5 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={permissions.has('finance:manage')}
                        onChange={() => togglePermission('finance:manage', 'finance:read')}
                        className="w-4 h-4 accent-gold bg-background border border-border rounded-none cursor-pointer"
                      />
                    </label>

                    {/* N/A placeholder */}
                    <span className="text-[10px] text-muted-text/30">—</span>

                    {/* All Toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={permissions.has('finance:read') && permissions.has('finance:manage')}
                        onChange={toggleFinanceAll}
                        className="w-4 h-4 accent-foreground bg-background border border-border rounded-none cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidential KYC & Aadhaar Documents Clearance Row */}
            <div className="border border-border bg-surface-secondary/60 p-3.5 flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-gold/15 border border-gold/40 flex items-center justify-center shrink-0 text-gold mt-0.5 sm:mt-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Confidential Documents Clearance (Aadhaar, KYC & Bank Receipts)
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 border border-gold/50 text-gold">
                      Sensitive
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-text mt-0.5">
                    Grants permission to view and download private client identification documents. Keep unchecked for telecallers or external agents.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer shrink-0 py-1">
                <input
                  type="checkbox"
                  checked={permissions.has('clients:documents:view_sensitive')}
                  onChange={() => togglePermission('clients:documents:view_sensitive')}
                  className="w-4 h-4 accent-gold bg-background border border-border rounded-none cursor-pointer"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground hidden sm:inline">
                  {permissions.has('clients:documents:view_sensitive') ? 'Granted' : 'Locked'}
                </span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground border border-border bg-surface hover:bg-surface-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-foreground text-background hover:bg-gold hover:text-foreground transition-colors font-bold disabled:opacity-50"
            >
              {submitting ? 'Creating Employee...' : 'Confirm & Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
