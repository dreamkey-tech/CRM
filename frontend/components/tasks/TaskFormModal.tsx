'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  Flag,
  Tag,
  UserCheck,
  Building,
  User,
  ExternalLink,
  Loader2,
  Check,
} from 'lucide-react'
import { createTask, updateTask } from '../../api/tasks'
import { getClientPartners, getClients } from '../../api/clients'
import { getProperties } from '../../api/properties'
import { useAuthStore } from '../../store/useAuthStore'
import { useTaskStore } from '../../store/useTaskStore'
import type { Task, TaskPriority, TaskCategory, CreateTaskPayload } from '../../types/task'
import type { PrimaryContactPartner } from '../../types/broker'
import { toast } from '../../utils/toast'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task | null // if editing
  initialDate?: string | null // if clicked from calendar
}

export function TaskFormModal({
  isOpen,
  onClose,
  task,
  initialDate,
}: TaskFormModalProps) {
  const currentUser = useAuthStore((state) => state.user)
  const { loadTasks, loadCalendarTasks, loadStats } = useTaskStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [category, setCategory] = useState<TaskCategory>('OTHER')
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([])
  const [clientId, setClientId] = useState<string>('')
  const [propertyId, setPropertyId] = useState<string>('')

  const [partners, setPartners] = useState<PrimaryContactPartner[]>([])
  const [clients, setClients] = useState<Array<{ id: string; name: string; phone: string }>>([])
  const [properties, setProperties] = useState<
    Array<{ id: string; societyBuildingName: string; locationArea: string }>
  >([])

  const [loadingData, setLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form state
  useEffect(() => {
    if (!isOpen) return

    setLoadingData(true)
    Promise.all([
      getClientPartners().catch(() => []),
      getClients({ limit: 100, status: 'ACTIVE' }).then((r) => r.clients).catch(() => []),
      getProperties({ limit: 100 }).then((r) => r.properties).catch(() => []),
    ])
      .then(([partnersData, clientsData, propertiesData]) => {
        setPartners(partnersData || [])
        setClients(clientsData || [])
        setProperties(propertiesData || [])
      })
      .finally(() => setLoadingData(false))

    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      // Format to YYYY-MM-DDTHH:mm
      const d = new Date(task.dueDate)
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setDueDate(localIso)
      setPriority(task.priority)
      setCategory(task.category)
      setSelectedPartnerIds(task.assignees.map((a) => a.userId))
      setClientId(task.clientId || '')
      setPropertyId(task.propertyId || '')
    } else {
      setTitle('')
      setDescription('')
      // Set initial date: provided initialDate or today + 2 hours
      const base = initialDate ? new Date(initialDate) : new Date(Date.now() + 2 * 3600 * 1000)
      if (initialDate && !initialDate.includes('T')) {
        base.setHours(11, 0, 0, 0)
      }
      const localIso = new Date(base.getTime() - base.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setDueDate(localIso)
      setPriority('MEDIUM')
      setCategory('OTHER')
      // Default to assign to current user
      setSelectedPartnerIds(currentUser?.id ? [currentUser.id] : [])
      setClientId('')
      setPropertyId('')
    }
  }, [isOpen, task, initialDate, currentUser])

  if (!isOpen) return null

  const togglePartner = (id: string) => {
    setSelectedPartnerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const assignToMyself = () => {
    if (currentUser?.id && !selectedPartnerIds.includes(currentUser.id)) {
      setSelectedPartnerIds((prev) => [...prev, currentUser.id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || title.trim().length < 3) {
      toast.error('Validation Error', 'Task title must be at least 3 characters.')
      return
    }

    if (!dueDate) {
      toast.error('Validation Error', 'Please select a valid due date and time.')
      return
    }

    if (selectedPartnerIds.length === 0) {
      toast.error('Validation Error', 'Please assign this task to at least one partner.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        category,
        assigneeIds: selectedPartnerIds,
        clientId: clientId || null,
        propertyId: propertyId || null,
      }

      if (task) {
        await updateTask(task.id, payload)
        toast.success('Task Updated', `"${title}" has been updated and synced.`)
      } else {
        await createTask(payload)
        toast.success(
          'Task Scheduled',
          `"${title}" assigned to ${selectedPartnerIds.length} partner${
            selectedPartnerIds.length > 1 ? 's' : ''
          }.`
        )
      }

      void loadTasks()
      void loadCalendarTasks()
      void loadStats()
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save task.'
      toast.error('Error', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {task ? 'Edit Scheduled Task' : 'Schedule New Task'}
              </h3>
              <p className="text-xs text-muted-text">
                Assign to partners, track deadlines, and sync with DreamKey Google Calendar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-text hover:text-foreground rounded-sm hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Site Visit with Mr. Roy at South City Tower 2"
              className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xs text-foreground placeholder:text-muted-text/50 focus:border-gold focus:outline-hidden transition-colors"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xs text-foreground focus:border-gold focus:outline-hidden transition-colors"
              >
                <option value="CLIENT_MEETING">Client Meeting</option>
                <option value="SITE_VISIT">Site Visit</option>
                <option value="DOCUMENT_WORK">Document Work</option>
                <option value="ADMIN">Admin & Operations</option>
                <option value="OTHER">Other Activity</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-gold" />
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => {
                  const active = priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 text-xs font-semibold rounded-xs border transition-all cursor-pointer ${
                        active
                          ? p === 'HIGH'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-xs'
                            : p === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-xs'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs'
                          : 'border-border text-muted-text hover:text-foreground hover:bg-surface-secondary'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" />
                Due Date & Time <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today5pm = new Date()
                    today5pm.setHours(17, 0, 0, 0)
                    const iso = new Date(today5pm.getTime() - today5pm.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                    setDueDate(iso)
                  }}
                  className="text-[10px] text-muted-text hover:text-gold transition-colors cursor-pointer"
                >
                  Today 5 PM
                </button>
                <span className="text-muted-text/30">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const tom10am = new Date(Date.now() + 86400000)
                    tom10am.setHours(10, 0, 0, 0)
                    const iso = new Date(tom10am.getTime() - tom10am.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                    setDueDate(iso)
                  }}
                  className="text-[10px] text-muted-text hover:text-gold transition-colors cursor-pointer"
                >
                  Tomorrow 10 AM
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xs text-foreground focus:border-gold focus:outline-hidden transition-colors"
            />
          </div>

          {/* Assigned Partners (Multi-select) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-gold" />
                Assigned Partners ({selectedPartnerIds.length}) <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={assignToMyself}
                className="text-[10px] text-gold hover:underline cursor-pointer"
              >
                + Assign to Myself
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-border bg-background rounded-xs">
              {partners.length === 0 ? (
                <div className="col-span-2 text-xs text-muted-text text-center py-2">
                  {loadingData ? 'Loading partners...' : 'No other partners found.'}
                </div>
              ) : (
                partners.map((partner) => {
                  const isSelected = selectedPartnerIds.includes(partner.id)
                  return (
                    <div
                      key={partner.id}
                      onClick={() => togglePartner(partner.id)}
                      className={`flex items-center justify-between p-2 rounded-xs border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-gold/50 bg-gold/10 text-foreground font-medium'
                          : 'border-border/60 hover:border-border text-muted-text hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-[10px] font-bold text-gold uppercase shrink-0">
                          {(partner.name || partner.email || 'P')[0]}
                        </div>
                        <div className="truncate">
                          <div className="truncate text-foreground text-xs leading-tight">
                            {partner.name || partner.email.split('@')[0]}
                          </div>
                          <div className="text-[10px] text-muted-text truncate">{partner.email}</div>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 ml-1.5 ${
                          isSelected ? 'border-gold bg-gold text-black' : 'border-border'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <p className="text-[11px] text-muted-text/70 mt-1">
              Assignees will receive instant in-app alerts and Google Calendar invites at their personal Gmail.
            </p>
          </div>

          {/* Relational Context: Client & Property */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Client Link */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gold" />
                Link Client (Optional)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 rounded-xs text-xs text-foreground focus:border-gold focus:outline-hidden transition-colors"
              >
                <option value="">No client linked</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Property Link */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-gold" />
                Link Property (Optional)
              </label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 rounded-xs text-xs text-foreground focus:border-gold focus:outline-hidden transition-colors"
              >
                <option value="">No property linked</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.societyBuildingName}, {p.locationArea}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Task Notes & Briefing (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key requirements, site visit notes, gate pass directions, or documents needed..."
              className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xs text-foreground placeholder:text-muted-text/50 focus:border-gold focus:outline-hidden transition-colors resize-none"
            />
          </div>

          {/* Submit & Cancel */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-muted-text hover:text-foreground rounded-xs text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {task ? 'Save Changes' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
