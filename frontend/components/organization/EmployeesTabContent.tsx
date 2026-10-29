'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserCheck,
  UserX,
  PhoneCall,
  Search,
  RefreshCw,
  Plus,
  Shield,
  Key,
  Edit2,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react'
import { listEmployeesApi } from '../../api/organization'
import { toast } from '../../utils/toast'
import { useAuthStore } from '../../store/useAuthStore'
import { AddEmployeeModal } from './AddEmployeeModal'
import { EditEmployeeModal } from './EditEmployeeModal'
import { ResetPasswordModal } from './ResetPasswordModal'
import { DeleteEmployeeModal } from './DeleteEmployeeModal'
import type { Employee } from '../../types/organization'

export function EmployeesTabContent() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  // Modals state
  const currentUser = useAuthStore((s) => s.user)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [resetEmployee, setResetEmployee] = useState<Employee | null>(null)
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null)

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      const res = await listEmployeesApi({
        search: search.trim() || undefined,
        status: statusFilter,
      })
      if (res.success) {
        setEmployees(res.employees)
      }
    } catch {
      toast.error('Load Failed', 'Could not fetch employees directory.')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Stats calculation
  const totalStaff = employees.length
  const activeCount = employees.filter((e) => e.isActive).length
  const telecallerCount = employees.filter(
    (e) => !e.moduleAccess.canViewSensitiveDocs || e.roles.includes('TELECALLER')
  ).length
  const inactiveCount = employees.filter((e) => !e.isActive).length

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards in a Seamless Grid per design.md */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <Users className="w-3 h-3 text-gold" />
            Total Employees
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-foreground">
            {loading ? '—' : totalStaff}
          </span>
          <p className="text-[10px] text-muted-text">Registered CRM staff accounts</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <UserCheck className="w-3 h-3 text-green-500" />
            Active Members
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-green-500">
            {loading ? '—' : activeCount}
          </span>
          <p className="text-[10px] text-muted-text">Can access CRM modules</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <PhoneCall className="w-3 h-3 text-blue-400" />
            Restricted / Telecallers
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-foreground">
            {loading ? '—' : telecallerCount}
          </span>
          <p className="text-[10px] text-muted-text">Confidential KYC locked</p>
        </div>

        <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
            <UserX className="w-3 h-3 text-red-500" />
            Deactivated / Suspended
          </p>
          <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none text-foreground">
            {loading ? '—' : inactiveCount}
          </span>
          <p className="text-[10px] text-muted-text">Access revoked</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-surface border border-border">
        {/* Search & Actions Row */}
        <div className="flex flex-col sm:flex-row items-stretch border-b border-border">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee by name or email..."
              className="w-full pl-10 pr-4 py-3 bg-transparent text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center border-t sm:border-t-0 sm:border-l border-border divide-x divide-border">
            <button
              onClick={() => fetchEmployees()}
              className="h-full px-4 py-2.5 flex items-center gap-1.5 text-muted-text hover:text-foreground text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="h-full px-5 py-2.5 flex items-center gap-2 bg-foreground text-background hover:bg-gold hover:text-foreground text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto no-scrollbar bg-surface-secondary">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-text mr-2">
            Status:
          </span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                statusFilter === filter
                  ? 'bg-foreground text-background'
                  : 'text-muted-text hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-surface border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Employee
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Primary Role
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Module Access
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                KYC Clearance
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                Status
              </th>
              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-muted-text">
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-muted-text">
                  No employee records found. Click &quot;Add Employee&quot; to invite a member.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const isSuperAdmin = emp.roles.includes('SUPER_ADMIN')
                return (
                  <tr key={emp.id} className="hover:bg-surface-secondary/50 transition-colors">
                    {/* Name & Email */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-xs text-foreground">
                        {emp.name || 'Unnamed Employee'}
                      </div>
                      <div className="text-[11px] text-muted-text font-mono mt-0.5">{emp.email}</div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-border bg-surface-secondary text-foreground">
                        <Shield className="w-2.5 h-2.5 text-gold" />
                        {emp.roles[0] || 'STAFF'}
                      </span>
                    </td>

                    {/* Module Access Badges */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1 max-w-sm">
                        {(['brokers', 'properties', 'clients', 'owners'] as const).map((mod) => {
                          const label = mod.charAt(0).toUpperCase() + mod.slice(1)
                          if (isSuperAdmin) {
                            return (
                              <span
                                key={mod}
                                className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-green-500/40 text-green-400 bg-green-500/10"
                              >
                                {label}: FULL
                              </span>
                            )
                          }
                          const perms = emp.permissions || []
                          const hasView = perms.includes(`${mod}:read`)
                          const hasCreate = perms.includes(`${mod}:create`)
                          const hasEdit = perms.includes(`${mod}:update`)
                          const hasDelete = perms.includes(`${mod}:delete`)
                          const isAll = hasView && hasCreate && hasEdit && hasDelete

                          if (!hasView && !hasCreate && !hasEdit && !hasDelete) {
                            return (
                              <span
                                key={mod}
                                className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-border text-muted-text/40 line-through"
                              >
                                {label}: NONE
                              </span>
                            )
                          }

                          const actions: string[] = []
                          if (hasView) actions.push('VIEW')
                          if (hasCreate) actions.push('ADD')
                          if (hasEdit) actions.push('EDIT')
                          if (hasDelete) actions.push('DEL')

                          return (
                            <span
                              key={mod}
                              className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                                isAll
                                  ? 'border-green-500/40 text-green-400 bg-green-500/10'
                                  : 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                              }`}
                            >
                              {label}: {isAll ? 'FULL' : actions.join(', ')}
                            </span>
                          )
                        })}

                        {/* Finance Badge */}
                        {(() => {
                          if (isSuperAdmin) {
                            return (
                              <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-gold/40 text-gold bg-gold/10">
                                Finance: FULL
                              </span>
                            )
                          }
                          const perms = emp.permissions || []
                          const hasRead = perms.includes('finance:read')
                          const hasManage = perms.includes('finance:manage')
                          if (hasRead && hasManage) {
                            return (
                              <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-gold/40 text-gold bg-gold/10">
                                Finance: FULL
                              </span>
                            )
                          }
                          if (hasRead) {
                            return (
                              <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-gold/40 text-gold bg-gold/10">
                                Finance: VIEW
                              </span>
                            )
                          }
                          return (
                            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-border text-muted-text/40 line-through">
                              Finance: NONE
                            </span>
                          )
                        })()}
                      </div>
                    </td>

                    {/* Sensitive KYC Clearance */}
                    <td className="py-3 px-4">
                      {emp.moduleAccess.canViewSensitiveDocs || isSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-green-500 border border-green-500/30 bg-green-500/10">
                          <Unlock className="w-2.5 h-2.5" />
                          Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-muted-text border border-border bg-surface-secondary">
                          <Lock className="w-2.5 h-2.5 text-gold" />
                          Restricted
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                          emp.isActive
                            ? 'border-green-500/40 text-green-500 bg-green-500/10'
                            : 'border-red-500/40 text-red-500 bg-red-500/10'
                        }`}
                      >
                        {emp.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          title="Edit Permissions"
                          className="p-1.5 text-muted-text hover:text-foreground border border-border bg-surface hover:bg-surface-secondary transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setResetEmployee(emp)}
                          title="Reset Password"
                          className="p-1.5 text-muted-text hover:text-foreground border border-border bg-surface hover:bg-surface-secondary transition-colors"
                        >
                          <Key className="w-3 h-3" />
                        </button>
                        {!isSuperAdmin && emp.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeleteEmployee(emp)}
                            title="Delete Employee"
                            className="p-1.5 text-muted-text hover:text-red-400 border border-border bg-surface hover:bg-red-500/10 hover:border-red-500/40 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={(newEmp) => {
          if (newEmp) {
            setEmployees((prev) => {
              const exists = prev.some((e) => e.id === newEmp.id)
              if (exists) return prev
              return [newEmp, ...prev]
            })
          }
          fetchEmployees()
        }}
      />

      <EditEmployeeModal
        isOpen={!!editingEmployee}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSuccess={() => fetchEmployees()}
      />

      <ResetPasswordModal
        isOpen={!!resetEmployee}
        employee={resetEmployee}
        onClose={() => setResetEmployee(null)}
      />

      <DeleteEmployeeModal
        isOpen={!!deleteEmployee}
        employee={deleteEmployee}
        onClose={() => setDeleteEmployee(null)}
        onSuccess={() => fetchEmployees()}
      />
    </div>
  )
}
