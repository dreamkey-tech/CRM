'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  X,
  Loader2,
  Handshake,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  IndianRupee,
  Building,
  Plus,
  AlertCircle,
  Copy,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { brokerFormSchema, type BrokerFormValues } from '../../zod/broker'
import { createBroker, updateBroker } from '../../api/brokers'
import { toast } from '../../utils/toast'
import { handleFormApiError } from '../../utils/errorHandler'
import { formatIndianCurrency } from '../../utils/formatters'
import type { Broker, BrokerStatus } from '../../types/broker'

interface BrokerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (broker: Broker) => void
  brokerToEdit?: Broker | null
  isDark?: boolean
}

export function BrokerFormModal({
  isOpen,
  onClose,
  onSuccess,
  brokerToEdit,
}: BrokerFormModalProps) {
  const isEditing = Boolean(brokerToEdit)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [societyInput, setSocietyInput] = useState('')
  const [isMaximized, setIsMaximized] = useState(false)

  // ── React Hook Form with Zod Validation ──
  const brokerForm = useForm<BrokerFormValues>({
    resolver: zodResolver(brokerFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      whatsappNumber: '',
      areaOfOperation: '',
      primaryContactPartnerId: null,
      minDealValue: '',
      maxDealValue: '',
      societyExpertise: [],
      status: 'ACTIVE',
      notes: '',
    },
    mode: 'onTouched',
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = brokerForm

  const watchedPhone = watch('phone')
  const watchedWhatsapp = watch('whatsappNumber')
  const watchedMinDeal = watch('minDealValue')
  const watchedMaxDeal = watch('maxDealValue')
  const watchedSocietyList = watch('societyExpertise') || []
  const watchedStatus = watch('status')

  // Populate or reset form values on open/edit change
  useEffect(() => {
    if (isOpen) {
      if (brokerToEdit) {
        reset({
          name: brokerToEdit.name || '',
          phone: brokerToEdit.phone || '',
          email: brokerToEdit.email || '',
          whatsappNumber: brokerToEdit.whatsappNumber || '',
          areaOfOperation: brokerToEdit.areaOfOperation || '',
          primaryContactPartnerId: brokerToEdit.primaryContactPartnerId || null,
          minDealValue:
            brokerToEdit.minDealValue !== null && brokerToEdit.minDealValue !== undefined
              ? String(brokerToEdit.minDealValue)
              : '',
          maxDealValue:
            brokerToEdit.maxDealValue !== null && brokerToEdit.maxDealValue !== undefined
              ? String(brokerToEdit.maxDealValue)
              : '',
          societyExpertise: brokerToEdit.societyExpertise || [],
          status: brokerToEdit.status || 'ACTIVE',
          notes: brokerToEdit.notes || '',
        })
      } else {
        reset({
          name: '',
          phone: '',
          email: '',
          whatsappNumber: '',
          areaOfOperation: '',
          primaryContactPartnerId: null,
          minDealValue: '',
          maxDealValue: '',
          societyExpertise: [],
          status: 'ACTIVE',
          notes: '',
        })
      }
      setErrorMessage(null)
      setSocietyInput('')
    }
  }, [isOpen, brokerToEdit, reset])

  if (!isOpen) return null

  // Society tags handlers
  const handleAddSociety = () => {
    const trimmed = societyInput.trim()
    if (!trimmed) return
    if (watchedSocietyList.includes(trimmed)) {
      toast.info('Duplicate', 'This society is already added.')
      return
    }
    setValue('societyExpertise', [...watchedSocietyList, trimmed], {
      shouldValidate: true,
      shouldDirty: true,
    })
    setSocietyInput('')
  }

  const handleRemoveSociety = (idxToRemove: number) => {
    setValue(
      'societyExpertise',
      watchedSocietyList.filter((_, idx) => idx !== idxToRemove),
      { shouldValidate: true, shouldDirty: true }
    )
  }

  // Copy phone number to WhatsApp
  const handleCopyPhoneToWhatsapp = () => {
    if (watchedPhone && watchedPhone.trim()) {
      setValue('whatsappNumber', watchedPhone.trim(), {
        shouldValidate: true,
        shouldDirty: true,
      })
      toast.info('Copied', 'Phone number copied to WhatsApp field.')
    }
  }

  // Form Submit Handler
  const onSubmit = async (data: BrokerFormValues) => {
    setErrorMessage(null)

    try {
      const minNum =
        data.minDealValue !== '' && data.minDealValue !== null && data.minDealValue !== undefined
          ? Number(data.minDealValue)
          : null
      const maxNum =
        data.maxDealValue !== '' && data.maxDealValue !== null && data.maxDealValue !== undefined
          ? Number(data.maxDealValue)
          : null

      const payload = {
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        whatsappNumber: data.whatsappNumber?.trim() || null,
        areaOfOperation: data.areaOfOperation?.trim() || null,
        primaryContactPartnerId: data.primaryContactPartnerId || null,
        minDealValue: minNum,
        maxDealValue: maxNum,
        societyExpertise: data.societyExpertise || [],
        status: data.status,
        notes: data.notes?.trim() || null,
      }

      if (isEditing && brokerToEdit) {
        const res = await updateBroker(brokerToEdit.id, payload)
        toast.success('Broker updated', 'Broker details have been saved.')
        if (res.broker) onSuccess(res.broker)
      } else {
        const res = await createBroker(payload)
        toast.success('Broker registered', 'New broker added to the directory.')
        if (res.broker) onSuccess(res.broker)
      }
      onClose()
    } catch (err: unknown) {
      handleFormApiError<BrokerFormValues>(err, {
        setError,
        setBannerError: setErrorMessage,
        toastTitle: isEditing ? 'Failed to update broker' : 'Failed to register broker',
      })
    }
  }

  // Input class generator with error border state
  const getInputCls = (hasError?: boolean, withIcon = false) => {
    return `w-full ${withIcon ? 'pl-9 pr-3.5' : 'px-3.5'} py-2.5 border ${
      hasError ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-gold'
    } bg-background text-foreground text-xs focus:outline-none transition-colors`
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 ${
        isMaximized ? 'p-0' : 'p-0 sm:p-4'
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full bg-surface shadow-2xl flex flex-col transition-all duration-150 ${
          isMaximized
            ? 'h-full max-h-screen border-0'
            : 'sm:max-w-2xl border border-border max-h-[96vh] sm:max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-surface-secondary/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gold/10 flex items-center justify-center shrink-0">
              <Handshake className="w-4 h-4 text-gold" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                {isEditing ? 'Edit Broker Profile' : 'Register New Broker'}
              </h3>
              <p className="text-[10px] text-muted-text truncate">
                {isEditing
                  ? 'Update contact details, area expertise and budget range'
                  : 'Add a new real estate channel partner to the CRM directory'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Maximize / Minimize Toggle */}
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              className="w-8 h-8 flex items-center justify-center text-muted-text hover:text-foreground hover:bg-surface-secondary border border-border transition-colors cursor-pointer"
              title={isMaximized ? 'Restore Default Size' : 'Maximize Fullscreen'}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-muted-text hover:text-foreground hover:bg-surface-secondary border border-border transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Server / Global Error Banner ── */}
        {errorMessage && (
          <div className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border-b border-red-500/20 text-red-500 text-[10px] font-medium shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Form Body (scrollable) ── */}
        <form
          id="broker-form"
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto flex-1 divide-y divide-border"
        >
          {/* Section 1 — Basic Information */}
          <div className="px-5 py-5 space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text">
              Basic Information
            </p>

            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
                Broker / Partner Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Rajesh Sharma"
                className={getInputCls(Boolean(errors.name))}
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
                  Mobile / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+91 9876543210"
                    className={getInputCls(Boolean(errors.phone), true)}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phone.message}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                    WhatsApp Number
                  </label>
                  {watchedPhone && watchedPhone !== watchedWhatsapp && (
                    <button
                      type="button"
                      onClick={handleCopyPhoneToWhatsapp}
                      className="text-[10px] font-bold uppercase tracking-wider text-gold hover:text-primary-hover transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      Same as phone
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MessageCircle className="w-3.5 h-3.5 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    {...register('whatsappNumber')}
                    placeholder="+91 9876543210"
                    className={getInputCls(Boolean(errors.whatsappNumber), true)}
                  />
                </div>
                {errors.whatsappNumber && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.whatsappNumber.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Email & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="broker@example.com"
                    className={getInputCls(Boolean(errors.email), true)}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
                  Primary Area of Operation
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('areaOfOperation')}
                    placeholder="e.g. Bandra West, Khar, Juhu"
                    className={getInputCls(Boolean(errors.areaOfOperation), true)}
                  />
                </div>
                {errors.areaOfOperation && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.areaOfOperation.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 — Deal Value */}
          <div className="px-5 py-5 space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text">
              Deal Value & Budget Capacity (INR ₹)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                    Minimum Deal Value (₹)
                  </label>
                  {watchedMinDeal &&
                    !isNaN(Number(watchedMinDeal)) &&
                    Number(watchedMinDeal) > 0 && (
                      <span className="text-[10px] font-bold text-gold">
                        {formatIndianCurrency(Number(watchedMinDeal))}
                      </span>
                    )}
                </div>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    {...register('minDealValue')}
                    placeholder="e.g. 5000000 (50L)"
                    className={getInputCls(Boolean(errors.minDealValue), true)}
                  />
                </div>
                {errors.minDealValue && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.minDealValue.message}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                    Maximum Deal Value (₹)
                  </label>
                  {watchedMaxDeal &&
                    !isNaN(Number(watchedMaxDeal)) &&
                    Number(watchedMaxDeal) > 0 && (
                      <span className="text-[10px] font-bold text-gold">
                        {formatIndianCurrency(Number(watchedMaxDeal))}
                      </span>
                    )}
                </div>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    {...register('maxDealValue')}
                    placeholder="e.g. 50000000 (5Cr)"
                    className={getInputCls(Boolean(errors.maxDealValue), true)}
                  />
                </div>
                {errors.maxDealValue && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.maxDealValue.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 — Society Expertise */}
          <div className="px-5 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text">
                Society / Locality Expertise
              </p>
              <span className="text-[10px] text-muted-text font-medium">
                {watchedSocietyList.length} added
              </span>
            </div>

            <div className="flex gap-0 border border-border">
              <div className="relative flex-1">
                <Building className="w-3.5 h-3.5 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={societyInput}
                  onChange={(e) => setSocietyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSociety()
                    }
                  }}
                  placeholder="Type society or building name and press Enter"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-background text-foreground text-xs focus:outline-none focus:border-gold transition-colors border-0"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSociety}
                className="px-4 py-2.5 bg-gold text-background text-[10px] font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {watchedSocietyList.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-surface-secondary border border-border">
                {watchedSocietyList.map((soc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border text-[10px] font-medium text-foreground"
                  >
                    {soc}
                    <button
                      type="button"
                      onClick={() => handleRemoveSociety(idx)}
                      className="text-muted-text hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section 4 — Status & Notes */}
          <div className="px-5 py-5 space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text">
              Status & Notes
            </p>

            {/* Status — Button group, no select */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-2">
                Broker Status
              </label>
              <div className="flex border border-border overflow-hidden">
                {(['ACTIVE', 'INACTIVE', 'BLOCKED'] as BrokerStatus[]).map((st, i) => {
                  const isSelected = watchedStatus === st
                  const activeColor =
                    st === 'ACTIVE'
                      ? 'bg-foreground text-background'
                      : st === 'INACTIVE'
                      ? 'bg-foreground text-background'
                      : 'bg-red-600 text-white'
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() =>
                        setValue('status', st, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        i > 0 ? 'border-l border-border' : ''
                      } ${
                        isSelected
                          ? activeColor
                          : 'text-muted-text hover:text-foreground hover:bg-surface-secondary'
                      }`}
                    >
                      {st}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
                Internal CRM Notes / Relationship Remarks
              </label>
              <textarea
                rows={3}
                {...register('notes')}
                placeholder="Key partner for luxury properties, fast turnaround, preferred commissions, etc."
                className="w-full px-3.5 py-2.5 border border-border bg-background text-foreground text-xs focus:outline-none focus:border-gold transition-colors resize-none"
              />
              {errors.notes && (
                <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.notes.message}</span>
                </p>
              )}
            </div>
          </div>
        </form>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-3 shrink-0 bg-surface-secondary">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="broker-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-gold hover:bg-primary-hover text-background text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Register Broker'}
          </button>
        </div>
      </div>
    </div>
  )
}
