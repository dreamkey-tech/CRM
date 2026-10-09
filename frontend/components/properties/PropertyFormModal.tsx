'use client'

import { PropertyStatusSelect } from './PropertyStatusSelect'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  X,
  Building2,
  Image as ImageIcon,
  Film,
  FileText,
  UploadCloud,
  Check,
  Star,
  Trash2,
  Handshake,
  MapPin,
  Sparkles,
  Info,
  Loader2,
  RotateCcw,
  Plus,
  Maximize2,
  Minimize2,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { propertyFormSchema, type PropertyFormValues } from '../../zod/property'
import { createPropertyDraft, updateProperty, getPropertyById, deleteProperty, deletePropertyMedia, reorderPropertyMedia } from '../../api/properties'
import { useMediaUpload } from '../../context/MediaUploadContext'
import { PROPERTY_MEDIA_CONFIG, getMediaRuleForCategory } from '../../config/media-config'
import { DeleteMediaConfirmModal } from './DeleteMediaConfirmModal'
import { OwnerSelectModal } from './OwnerSelectModal'
import { BrokerSelectModal } from './BrokerSelectModal'
import { toast } from '../../utils/toast'
import { handleFormApiError } from '../../utils/errorHandler'
import { formatIndianCurrency } from '../../utils/formatters'
import type {
  Property,
  PropertyType,
  PropertyPricingType,
  PropertyListingStatus,
  PropertyAccessType,
  PropertyMediaCategory,
  PropertyMedia,
  LinkedBroker,
} from '../../types/property'
import type { Broker } from '../../types/broker'

interface PropertyFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialProperty?: Property | null
}

const STORAGE_DRAFT_KEY = 'dreamkey_crm_property_form_draft'

const AMENITY_OPTIONS = [
  'Parking',
  'Gymnasium',
  'High Speed Elevators',
  '24x7 Security & CCTV',
  'Power Backup',
  'Swimming Pool',
  'Clubhouse',
  'Children Play Area',
  'Intercom Facility',
  'Fire Safety System',
  'Garden / Park',
  'Piped Gas',
]

export function PropertyFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialProperty,
}: PropertyFormModalProps) {
  const { startUploadBatch, tasks, forgetMedia, setIsDockOpen, beginMediaActivity } = useMediaUpload()
  const [isPreparingUpload, setIsPreparingUpload] = useState(false)
  const [isChangingMedia, setIsChangingMedia] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<PropertyMedia | null>(null)
  const [deleteMediaError, setDeleteMediaError] = useState<string | null>(null)
  const deletingMediaRef = useRef(false)
  const preparingUploadRef = useRef(false)
  const draftPromiseRef = useRef<Promise<Property> | null>(null)

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'MEDIA' | 'SOCIETY'>('DETAILS')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  // Property ID for draft session
  const [propertyId, setPropertyId] = useState<string>('')
  const currentPropertyIdRef = useRef(propertyId)
  useEffect(() => { currentPropertyIdRef.current = propertyId }, [propertyId])
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<Property['owner']>(null)
  const [selectedBroker, setSelectedBroker] = useState<LinkedBroker | null>(null)

  // Media Management
  const [storedMedia, setUploadedMedia] = useState<PropertyMedia[]>([])
  const [mediaCategoryTab, setMediaCategoryTab] = useState<PropertyMediaCategory>('PHOTOGRAPH')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedMedia = useMemo(() => {
    const completed = tasks.filter((task) => task.propertyId === propertyId && task.attachedMedia).map((task) => task.attachedMedia!)
    return [...storedMedia, ...completed.filter((media) => !storedMedia.some((item) => item.id === media.id))]
  }, [storedMedia, tasks, propertyId])
  const propertyTasks = tasks.filter((task) => task.propertyId === propertyId)
  const hasPendingUploads = propertyTasks.some((task) => ['QUEUED', 'UPLOADING', 'ATTACHING'].includes(task.status))
  const hasFailedUploads = propertyTasks.some((task) => task.status === 'ERROR')
  const mediaBusy = isPreparingUpload || isChangingMedia || hasPendingUploads

  const ensureDraft = async (id: string) => {
    if (initialProperty) return initialProperty
    if (!draftPromiseRef.current) {
      draftPromiseRef.current = createPropertyDraft({
        id, societyBuildingName: form.getValues('societyBuildingName') || 'Draft Property',
        propertyType: form.getValues('propertyType'), pricingType: form.getValues('pricingType'),
        carpetAreaSqFt: parseFloat(form.getValues('carpetAreaSqFt')) || 0,
        askingPrice: parseFloat(form.getValues('askingPrice')) || 0,
      }).catch((error) => { draftPromiseRef.current = null; throw error })
    }
    const draft = await draftPromiseRef.current
    setPropertyId(draft.id)
    return draft
  }

  // ── React Hook Form with Zod Resolver ──────────────────────────────────────
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      propertyType: 'FLAT',
      pricingType: 'SALE',
      societyBuildingName: '',
      locationArea: '',
      pincode: '',
      city: 'Mumbai',
      floorNumber: '',
      totalFloors: '',
      bedrooms: '2',
      bathrooms: '2',
      balconies: '1',
      carpetAreaSqFt: '',
      superBuiltUpAreaSqFt: '',
      askingPrice: '',
      availabilityStatus: 'AVAILABLE',
      availabilityDate: '',
      accessType: 'DIRECT',
      ownerId: null,
      brokerId: null,
      builderName: '',
      yearOfConstruction: '',
      totalUnits: '',
      amenities: ['Parking', 'High Speed Elevators', '24x7 Security & CCTV'],
      reraNumber: '',
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
  } = form

  const watchedPropertyType = watch('propertyType')
  const watchedPricingType = watch('pricingType')
  const watchedAccessType = watch('accessType')
  const watchedAvailabilityStatus = watch('availabilityStatus')
  const watchedBedrooms = watch('bedrooms')
  const watchedBathrooms = watch('bathrooms')
  const watchedBalconies = watch('balconies')
  const watchedAmenities = watch('amenities') || []
  const watchedAskingPrice = watch('askingPrice')

  // ── Initialize or Restore Draft on Open ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    draftPromiseRef.current = null

    if (initialProperty) {
      // Editing existing property
      // Opening the editor synchronizes its fields with the selected property.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPropertyId(initialProperty.id)
      setSelectedOwner(initialProperty.owner || null)
      setSelectedBroker(initialProperty.broker || null)
      setUploadedMedia(initialProperty.media || [])
      reset({
        propertyType: initialProperty.propertyType,
        pricingType: initialProperty.pricingType,
        societyBuildingName: initialProperty.societyBuildingName || '',
        locationArea: initialProperty.locationArea || '',
        pincode: initialProperty.pincode || '',
        city: initialProperty.city || 'Mumbai',
        floorNumber: initialProperty.floorNumber?.toString() || '',
        totalFloors: initialProperty.totalFloors?.toString() || '',
        bedrooms: initialProperty.bedrooms !== null && initialProperty.bedrooms !== undefined ? String(initialProperty.bedrooms) : '2',
        bathrooms: initialProperty.bathrooms !== null && initialProperty.bathrooms !== undefined ? String(initialProperty.bathrooms) : '2',
        balconies: initialProperty.balconies !== null && initialProperty.balconies !== undefined ? String(initialProperty.balconies) : '1',
        carpetAreaSqFt: initialProperty.carpetAreaSqFt ? String(initialProperty.carpetAreaSqFt) : '',
        superBuiltUpAreaSqFt: initialProperty.superBuiltUpAreaSqFt ? String(initialProperty.superBuiltUpAreaSqFt) : '',
        askingPrice: initialProperty.askingPrice ? String(initialProperty.askingPrice) : '',
        availabilityStatus: initialProperty.availabilityStatus || 'AVAILABLE',
        availabilityDate: initialProperty.availabilityDate
          ? new Date(initialProperty.availabilityDate).toISOString().split('T')[0]
          : '',
        accessType: initialProperty.accessType || 'DIRECT',
        ownerId: initialProperty.ownerId || initialProperty.owner?.id || null,
        brokerId: initialProperty.brokerId || initialProperty.broker?.id || null,
        builderName: initialProperty.builderName || '',
        yearOfConstruction: initialProperty.yearOfConstruction ? String(initialProperty.yearOfConstruction) : '',
        totalUnits: initialProperty.totalUnits ? String(initialProperty.totalUnits) : '',
        amenities: initialProperty.amenities || ['Parking', 'High Speed Elevators'],
        reraNumber: initialProperty.reraNumber || '',
        notes: initialProperty.notes || '',
      })
    } else {
      // Check for saved local draft
      const savedDraft = localStorage.getItem(STORAGE_DRAFT_KEY)
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft)
          setPropertyId(parsed.propertyId || crypto.randomUUID())
          setSelectedOwner(parsed.selectedOwner || null)
          setSelectedBroker(parsed.selectedBroker || null)
          setUploadedMedia(parsed.uploadedMedia || [])
          if (parsed.propertyId) {
            getPropertyById(parsed.propertyId).then((property) => {
              if (property.isDraft) setUploadedMedia(property.media || [])
              else {
                // A successful publish may have completed before the local draft was cleared.
                setPropertyId(crypto.randomUUID())
                setUploadedMedia([])
              }
            }).catch(() => { /* The local draft may not have been created on the server yet. */ })
          }
          reset({
            propertyType: parsed.propertyType || 'FLAT',
            pricingType: parsed.pricingType || 'SALE',
            societyBuildingName: parsed.societyBuildingName || '',
            locationArea: parsed.locationArea || '',
            pincode: parsed.pincode || '',
            city: parsed.city || 'Mumbai',
            floorNumber: parsed.floorNumber || '',
            totalFloors: parsed.totalFloors || '',
            bedrooms: parsed.bedrooms || '2',
            bathrooms: parsed.bathrooms || '2',
            balconies: parsed.balconies || '1',
            carpetAreaSqFt: parsed.carpetAreaSqFt || '',
            superBuiltUpAreaSqFt: parsed.superBuiltUpAreaSqFt || '',
            askingPrice: parsed.askingPrice || '',
            availabilityStatus: parsed.availabilityStatus || 'AVAILABLE',
            availabilityDate: parsed.availabilityDate || '',
            accessType: parsed.accessType || 'DIRECT',
            ownerId: parsed.ownerId || null,
            brokerId: parsed.brokerId || null,
            builderName: parsed.builderName || '',
            yearOfConstruction: parsed.yearOfConstruction || '',
            totalUnits: parsed.totalUnits || '',
            amenities: parsed.amenities || ['Parking', 'High Speed Elevators', '24x7 Security & CCTV'],
            reraNumber: parsed.reraNumber || '',
            notes: parsed.notes || '',
          })
        } catch {
          setPropertyId(crypto.randomUUID())
        }
      } else {
        setPropertyId(crypto.randomUUID())
        reset({
          propertyType: 'FLAT',
          pricingType: 'SALE',
          societyBuildingName: '',
          locationArea: '',
          pincode: '',
          city: 'Mumbai',
          floorNumber: '',
          totalFloors: '',
          bedrooms: '2',
          bathrooms: '2',
          balconies: '1',
          carpetAreaSqFt: '',
          superBuiltUpAreaSqFt: '',
          askingPrice: '',
          availabilityStatus: 'AVAILABLE',
          availabilityDate: '',
          accessType: 'DIRECT',
          ownerId: null,
      brokerId: null,
          builderName: '',
          yearOfConstruction: '',
          totalUnits: '',
          amenities: ['Parking', 'High Speed Elevators', '24x7 Security & CCTV'],
          reraNumber: '',
          notes: '',
        })
        setUploadedMedia([])
        setSelectedOwner(null)
        setSelectedBroker(null)
      }
    }
    setErrorMessage(null)
  }, [isOpen, initialProperty, reset])

  // ── Auto-Save Draft to LocalStorage ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || initialProperty) return

    const persistDraft = (values: Partial<PropertyFormValues>) => {
      const draftData = {
        ...values,
        propertyId,
        selectedOwner,
        selectedBroker,
        uploadedMedia,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(draftData))
    }
    persistDraft(form.getValues())
    const subscription = watch((values) => persistDraft(values as Partial<PropertyFormValues>))

    return () => subscription.unsubscribe()
  }, [isOpen, initialProperty, watch, propertyId, selectedOwner, selectedBroker, uploadedMedia, form])

  const clearDraft = async () => {
    if (mediaBusy || isSubmitting || hasFailedUploads) return
    if (draftPromiseRef.current || uploadedMedia.length) {
      setIsChangingMedia(true)
      try {
        const draft = await ensureDraft(propertyId)
        if (!draft.isDraft) throw new Error('This property is already published. Open it from the property list to edit it.')
        await deleteProperty(draft.id)
        uploadedMedia.forEach((media) => forgetMedia(media.id))
      } catch (error) {
        toast.error('Could not reset draft', error instanceof Error ? error.message : 'Please retry.')
        return
      } finally { setIsChangingMedia(false) }
    }
    draftPromiseRef.current = null
    localStorage.removeItem(STORAGE_DRAFT_KEY)
    setPropertyId(crypto.randomUUID())
    setSelectedOwner(null)
    setSelectedBroker(null)
    setUploadedMedia([])
    reset({
      propertyType: 'FLAT',
      pricingType: 'SALE',
      societyBuildingName: '',
      locationArea: '',
      pincode: '',
      city: 'Mumbai',
      floorNumber: '',
      totalFloors: '',
      bedrooms: '2',
      bathrooms: '2',
      balconies: '1',
      carpetAreaSqFt: '',
      superBuiltUpAreaSqFt: '',
      askingPrice: '',
      availabilityStatus: 'AVAILABLE',
      availabilityDate: '',
      accessType: 'DIRECT',
      ownerId: null,
      brokerId: null,
      builderName: '',
      yearOfConstruction: '',
      totalUnits: '',
      amenities: ['Parking', 'High Speed Elevators', '24x7 Security & CCTV'],
      reraNumber: '',
      notes: '',
    })
    toast.info('Draft Cleared', 'All fields reset to blank template.')
  }

  // ── Broker Selection ───────────────────────────────────────────────────────
  const handleSelectBroker = (broker: Broker) => {
    setSelectedBroker({
      id: broker.id,
      name: broker.name,
      phone: broker.phone,
      email: broker.email,
      whatsappNumber: broker.whatsappNumber,
      areaOfOperation: broker.areaOfOperation,
    })
    setSelectedOwner(null)
    setValue('ownerId', null)
    setValue('brokerId', broker.id, { shouldValidate: true, shouldDirty: true })
    setIsBrokerModalOpen(false)
  }

  const handleRemoveBroker = () => {
    setSelectedBroker(null)
    setValue('brokerId', null, { shouldValidate: true, shouldDirty: true })
  }

  // ── Amenities Toggle ───────────────────────────────────────────────────────
  const toggleAmenity = (amenity: string) => {
    const current = watchedAmenities
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity]
    setValue('amenities', next, { shouldValidate: true, shouldDirty: true })
  }

  // ── Media Upload Actions ───────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length || preparingUploadRef.current || isSubmitting) return
    const rule = getMediaRuleForCategory(mediaCategoryTab)
    if (!rule) return
    const queuedCount = propertyTasks.filter((task) => task.category === mediaCategoryTab &&
      !['COMPLETED', 'CANCELLED'].includes(task.status)).length
    const existingCount = uploadedMedia.filter((media) => media.category === mediaCategoryTab).length
    if (rule.maxCount > 0 && existingCount + queuedCount + files.length > rule.maxCount) {
      toast.error('Too many files', `You can add up to ${rule.maxCount} files in ${rule.label}.`)
      return
    }
    const invalid = files.find((file) => file.size === 0 || file.size > rule.maxMb * 1024 * 1024 ||
      !rule.allowedMimeTypes.includes(file.type))
    if (invalid) {
      toast.error('File cannot be uploaded', `${invalid.name}: choose a supported file up to ${rule.maxMb}MB.`)
      return
    }
    preparingUploadRef.current = true
    setIsPreparingUpload(true)
    const finishPreparing = beginMediaActivity(`Preparing ${files.length} ${files.length === 1 ? 'file' : 'files'}...`)
    try {
      const draft = await ensureDraft(propertyId || crypto.randomUUID())
      await startUploadBatch(draft.id, files.map((file) => ({ file, category: mediaCategoryTab })), (media) => {
        if (currentPropertyIdRef.current !== draft.id) return
        setUploadedMedia((previous) => [...previous, ...media.filter((item) => !previous.some((saved) => saved.id === item.id))])
      })
    } catch (error) {
      toast.error('Could not start upload', error instanceof Error ? error.message : 'Please retry.')
    } finally {
      preparingUploadRef.current = false
      setIsPreparingUpload(false)
      finishPreparing()
    }
  }

  const handleSetCoverPhoto = async (mediaId: string) => {
    if (mediaBusy || isSubmitting) return
    setIsChangingMedia(true)
    try {
      const updated = await reorderPropertyMedia(propertyId, uploadedMedia.map((media, index) => ({
        id: media.id, order: index, isCover: media.id === mediaId,
      })))
      setUploadedMedia(updated)
      toast.success('Cover Photo Updated', 'Your cover photo has been saved.')
    } catch (error) {
      toast.error('Could not update cover', error instanceof Error ? error.message : 'Please retry.')
    } finally { setIsChangingMedia(false) }
  }

  const handleRemoveMedia = (mediaId: string) => {
    if (mediaBusy || isSubmitting) return
    const media = uploadedMedia.find((item) => item.id === mediaId)
    if (!media) return
    setDeleteMediaError(null)
    setMediaToDelete(media)
  }

  const confirmRemoveMedia = async () => {
    if (!mediaToDelete || deletingMediaRef.current || mediaBusy || isSubmitting) return
    const mediaId = mediaToDelete.id
    deletingMediaRef.current = true
    setIsChangingMedia(true)
    setDeleteMediaError(null)
    const finishDeleting = beginMediaActivity('Deleting file...')
    try {
      await deletePropertyMedia(propertyId, mediaId)
      forgetMedia(mediaId)
      setUploadedMedia((previous) => previous.filter((media) => media.id !== mediaId))
      setMediaToDelete(null)
      toast.success('Media Removed', 'File removed from this property.')
      // Deletion already succeeded; a failed refresh must not report a failed delete.
      try {
        const property = await getPropertyById(propertyId)
        setUploadedMedia(property.media || [])
      } catch { /* Keep the successfully updated local list. */ }
    } catch (error) {
      setDeleteMediaError(error instanceof Error ? error.message : 'Could not remove this file. Please retry.')
    } finally {
      deletingMediaRef.current = false
      setIsChangingMedia(false)
      finishDeleting()
    }
  }

  // ── Form Submission ────────────────────────────────────────────────────────
  const onSubmit = async (data: PropertyFormValues) => {
    if (mediaBusy || hasFailedUploads) {
      setErrorMessage('Wait for uploads to finish. Retry or cancel failed uploads in the upload panel before saving.')
      return
    }
    const parsedCarpet = parseFloat(data.carpetAreaSqFt)
    const parsedPrice = parseFloat(data.askingPrice)

    const payload: Partial<Property> = {
      propertyType: data.propertyType,
      pricingType: data.pricingType,
      societyBuildingName: data.societyBuildingName.trim(),
      locationArea: data.locationArea.trim(),
      pincode: data.pincode.trim(),
      city: data.city.trim() || 'Mumbai',
      floorNumber: data.floorNumber ? parseInt(data.floorNumber, 10) : null,
      totalFloors: data.totalFloors ? parseInt(data.totalFloors, 10) : null,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms, 10) : 2,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms, 10) : 2,
      balconies: data.balconies ? parseInt(data.balconies, 10) : 1,
      carpetAreaSqFt: parsedCarpet,
      superBuiltUpAreaSqFt: data.superBuiltUpAreaSqFt ? parseFloat(data.superBuiltUpAreaSqFt) : null,
      askingPrice: parsedPrice,
      availabilityStatus: data.availabilityStatus,
      availabilityDate: data.availabilityDate ? new Date(data.availabilityDate).toISOString() : null,
      accessType: data.accessType,
      ownerId: data.accessType === 'DIRECT' ? data.ownerId || null : null,
      brokerId: data.accessType === 'BROKER' && data.brokerId ? data.brokerId : null,
      builderName: data.builderName?.trim() || null,
      yearOfConstruction: data.yearOfConstruction ? parseInt(data.yearOfConstruction, 10) : null,
      totalUnits: data.totalUnits ? parseInt(data.totalUnits, 10) : null,
      amenities: data.amenities || [],
      reraNumber: data.reraNumber?.trim() || null,
      notes: data.notes?.trim() || null,
      isDraft: false,
    }

    try {
      if (initialProperty) {
        await updateProperty(initialProperty.id, payload)
        toast.success('Property Updated', 'Property listing updated successfully.')
      } else {
        const draft = await ensureDraft(propertyId || crypto.randomUUID())
        await updateProperty(draft.id, payload)
        localStorage.removeItem(STORAGE_DRAFT_KEY)
        toast.success('Listing Created', 'Property listing is now live in the CRM database.')
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      handleFormApiError<PropertyFormValues>(err, {
        setError,
        setBannerError: setErrorMessage,
        toastTitle: initialProperty ? 'Failed to update property' : 'Failed to create property',
      })
    }
  }

  if (!isOpen) return null

  const currentMediaRule = getMediaRuleForCategory(mediaCategoryTab)

  const getInputCls = (hasError?: boolean) => {
    return `w-full px-3.5 py-2.5 border ${
      hasError ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-gold'
    } bg-background text-foreground text-xs focus:outline-hidden transition-colors`
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 ${
        isMaximized ? 'p-0' : 'p-0 sm:p-4'
      }`}
    >
      <div
        className={`w-full bg-surface shadow-2xl flex flex-col transition-all duration-150 ${
          isMaximized
            ? 'h-full max-h-screen border-0'
            : 'sm:max-w-4xl border border-border max-h-[96vh] sm:max-h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-surface-secondary">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold shrink-0" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {initialProperty ? 'Edit Property Listing' : 'Add New Property Inventory'}
              </h3>
              <p className="text-[10px] text-muted-text">
                {initialProperty
                  ? `Updating ${initialProperty.societyBuildingName}`
                  : 'Your draft is saved automatically'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!initialProperty && (
              <button
                type="button"
                onClick={clearDraft}
                disabled={mediaBusy || isSubmitting || hasFailedUploads}
                className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-text hover:text-red-400 border border-border hover:border-red-400/40 transition-colors cursor-pointer"
                title="Clear Draft"
              >
                <RotateCcw className="w-3 h-3 inline mr-1" /> Reset
              </button>
            )}

            {/* Maximize / Minimize Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-foreground border border-border hover:bg-surface transition-colors cursor-pointer"
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
              disabled={isSubmitting || isPreparingUpload || isChangingMedia}
              className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-foreground border border-border hover:bg-surface transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Server / Global Error Banner */}
        {errorMessage && (
          <div className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border-b border-red-500/20 text-red-500 text-[10px] font-medium shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-border bg-surface shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'DETAILS'
                ? 'border-gold text-gold bg-gold/5'
                : 'border-transparent text-muted-text hover:text-foreground'
            }`}
          >
            1. Core Listing Details
            {(errors.societyBuildingName ||
              errors.locationArea ||
              errors.pincode ||
              errors.carpetAreaSqFt ||
              errors.askingPrice ||
              errors.brokerId || errors.ownerId) && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block ml-1.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MEDIA')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'MEDIA'
                ? 'border-gold text-gold bg-gold/5'
                : 'border-transparent text-muted-text hover:text-foreground'
            }`}
          >
            2. Photos & Media ({uploadedMedia.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SOCIETY')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'SOCIETY'
                ? 'border-gold text-gold bg-gold/5'
                : 'border-transparent text-muted-text hover:text-foreground'
            }`}
          >
            3. Society Insights & Notes
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form noValidate
          id="property-form"
          onSubmit={(event) => { void handleSubmit(onSubmit)(event) }}
          className="overflow-y-auto flex-1 p-5 space-y-6"
        >
          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: CORE LISTING DETAILS
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-5">
              {/* Row 1: Property Type & Pricing Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Property Type <span className="text-gold">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                    {(['FLAT', 'LAND', 'WAREHOUSE', 'COMMERCIAL', 'OTHER'] as PropertyType[]).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setValue('propertyType', type, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider border text-center transition-colors cursor-pointer ${
                            watchedPropertyType === type
                              ? 'bg-foreground text-background border-foreground font-black'
                              : 'bg-surface-secondary border-border text-muted-text hover:text-foreground'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Listing Type <span className="text-gold">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setValue('pricingType', 'SALE', {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider border text-center transition-colors cursor-pointer ${
                        watchedPricingType === 'SALE'
                          ? 'bg-gold text-background border-gold font-black'
                          : 'bg-surface-secondary border-border text-muted-text hover:text-foreground'
                      }`}
                    >
                      For Sale (Outright)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setValue('pricingType', 'RENT', {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider border text-center transition-colors cursor-pointer ${
                        watchedPricingType === 'RENT'
                          ? 'bg-gold text-background border-gold font-black'
                          : 'bg-surface-secondary border-border text-muted-text hover:text-foreground'
                      }`}
                    >
                      For Lease / Rent
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Society Name & Pin Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Society / Building Name <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('societyBuildingName')}
                    placeholder="e.g. Oberoi Sky City, Lodha Park"
                    className={getInputCls(Boolean(errors.societyBuildingName))}
                  />
                  {errors.societyBuildingName && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.societyBuildingName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    PIN Code <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    {...register('pincode')}
                    placeholder="e.g. 400050"
                    className={getInputCls(Boolean(errors.pincode))}
                  />
                  {errors.pincode && (
                    <p className="text-[10px] text-red-500 mt-1">{errors.pincode.message}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Area & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Area / Locality <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('locationArea')}
                    placeholder="e.g. Bandra West, Pali Hill"
                    className={getInputCls(Boolean(errors.locationArea))}
                  />
                  {errors.locationArea && (
                    <p className="text-[10px] text-red-500 mt-1">{errors.locationArea.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    placeholder="e.g. Mumbai"
                    className={getInputCls(Boolean(errors.city))}
                  />
                </div>
              </div>

              {/* Row 4: Bedrooms, Bathrooms, Balconies */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Bedrooms (BHK)
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {[
                      { label: 'ST', val: '0' },
                      { label: '1', val: '1' },
                      { label: '2', val: '2' },
                      { label: '3', val: '3' },
                      { label: '4', val: '4' },
                      { label: '5+', val: '5' },
                    ].map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() =>
                          setValue('bedrooms', b.val, { shouldValidate: true, shouldDirty: true })
                        }
                        className={`py-1.5 text-[10px] font-bold uppercase border text-center transition-colors cursor-pointer ${
                          watchedBedrooms === b.val
                            ? 'bg-foreground text-background border-foreground font-black'
                            : 'bg-surface-secondary border-border text-muted-text hover:text-foreground'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Bathrooms
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {['1', '2', '3', '4', '5'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setValue('bathrooms', num, { shouldValidate: true, shouldDirty: true })
                        }
                        className={`py-1.5 text-[10px] font-bold uppercase border text-center transition-colors cursor-pointer ${
                          watchedBathrooms === num
                            ? 'bg-foreground text-background border-foreground font-black'
                            : 'bg-surface-secondary border-border text-muted-text hover:text-foreground'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Balconies
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {['0', '1', '2', '3+'].map((num) => {
                      const val = num === '3+' ? '3' : num
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            setValue('balconies', val, { shouldValidate: true, shouldDirty: true })
                          }
                          className={`py-1.5 text-[10px] font-bold uppercase border text-center transition-colors cursor-pointer ${
                            watchedBalconies === val
                              ? 'bg-foreground text-background border-foreground font-black'
                              : 'bg-surface-secondary border-border text-muted-text hover:text-foreground'
                          }`}
                        >
                          {num}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Row 5: Floors, Carpet Area, Built-up Area */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Floor No.
                  </label>
                  <input
                    type="number"
                    {...register('floorNumber')}
                    placeholder="e.g. 14"
                    className={getInputCls(Boolean(errors.floorNumber))}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Total Floors
                  </label>
                  <input
                    type="number"
                    {...register('totalFloors')}
                    placeholder="e.g. 35"
                    className={getInputCls(Boolean(errors.totalFloors))}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Carpet Area (sq ft) <span className="text-gold">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('carpetAreaSqFt')}
                    placeholder="e.g. 1250"
                    className={getInputCls(Boolean(errors.carpetAreaSqFt))}
                  />
                  {errors.carpetAreaSqFt && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.carpetAreaSqFt.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Super Built-up (sq ft)
                  </label>
                  <input
                    type="number"
                    {...register('superBuiltUpAreaSqFt')}
                    placeholder="e.g. 1650"
                    className={getInputCls(Boolean(errors.superBuiltUpAreaSqFt))}
                  />
                </div>
              </div>

              {/* Row 6: Asking Price & Availability Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Asking Price / Rent (INR) <span className="text-gold">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('askingPrice')}
                    placeholder="e.g. 35000000"
                    className={getInputCls(Boolean(errors.askingPrice))}
                  />
                  {watchedAskingPrice && !isNaN(Number(watchedAskingPrice)) && (
                    <p className="text-[10px] font-mono text-gold mt-1 font-bold">
                      {formatIndianCurrency(Number(watchedAskingPrice))}
                    </p>
                  )}
                  {errors.askingPrice && (
                    <p className="text-[10px] text-red-500 mt-1">{errors.askingPrice.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Availability Status
                  </label>
                  <PropertyStatusSelect value={watchedAvailabilityStatus} onChange={value => setValue('availabilityStatus', value, { shouldValidate: true, shouldDirty: true })} />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Availability Date
                  </label>
                  <input
                    type="date"
                    {...register('availabilityDate')}
                    className={getInputCls(Boolean(errors.availabilityDate))}
                  />
                </div>
              </div>

              {/* Row 7: Access Type & Broker Selection */}
              <div className="border border-border p-4 bg-surface-secondary/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                      Listing Access & Source
                    </span>
                    <p className="text-[10px] text-muted-text">
                      Link this listing to its owner or broker.
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setValue('accessType', 'DIRECT', {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                        setValue('brokerId', null)
                        setSelectedBroker(null)
                      }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase border transition-colors cursor-pointer ${
                        watchedAccessType === 'DIRECT'
                          ? 'bg-foreground text-background border-foreground font-black'
                          : 'bg-surface border-border text-muted-text hover:text-foreground'
                      }`}
                    >
                      Direct
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('accessType', 'BROKER', {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                        setValue('ownerId', null, { shouldDirty: true })
                        setSelectedOwner(null)
                        setIsBrokerModalOpen(true)
                      }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase border transition-colors cursor-pointer ${
                        watchedAccessType === 'BROKER'
                          ? 'bg-gold text-background border-gold font-black'
                          : 'bg-surface border-border text-muted-text hover:text-foreground'
                      }`}
                    >
                      +1 Broker
                    </button>
                  </div>
                </div>

                {watchedAccessType === 'DIRECT' && <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between gap-3 border border-border bg-surface p-3">
                    <div><p className="text-xs font-bold">{selectedOwner?.name || 'No owner linked yet'}</p><p className="text-[10px] text-muted-text">{selectedOwner?.phone || 'Select an owner or add a new owner.'}</p></div>
                    <button type="button" onClick={() => setIsOwnerModalOpen(true)} className="bg-gold px-3 py-2 text-[10px] font-bold uppercase text-background">{selectedOwner ? 'Change owner' : 'Select / Add owner'}</button>
                  </div>{errors.ownerId && <p className="mt-1 text-[10px] text-red-500">{errors.ownerId.message}</p>}
                </div>}
                {watchedAccessType === 'BROKER' && (
                  <div className="pt-2 border-t border-border/80">
                    {selectedBroker ? (
                      <div className="flex items-center justify-between p-3 bg-surface border border-gold/40">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Handshake className="w-4 h-4 text-gold shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-foreground block truncate">
                              {selectedBroker.name}
                            </span>
                            <span className="text-[9px] font-mono text-muted-text block">
                              {selectedBroker.phone || selectedBroker.email || 'Channel Partner'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsBrokerModalOpen(true)}
                            className="text-[9px] font-bold uppercase tracking-wider text-gold hover:underline cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveBroker}
                            className="p-1 text-muted-text hover:text-red-400 cursor-pointer"
                            title="Remove Broker Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-surface border border-dashed border-red-500/50 text-xs">
                        <span className="text-[10px] text-red-400 font-medium">
                          No broker linked yet. Please select a broker partner.
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsBrokerModalOpen(true)}
                          className="px-3 py-1 bg-gold text-black text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          + Select Broker
                        </button>
                      </div>
                    )}
                    {errors.brokerId && (
                      <p className="text-[10px] text-red-500 mt-1">{errors.brokerId.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: MEDIA UPLOADER (DRIVEN BY property-media.json)
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'MEDIA' && (
            <div className="space-y-5">
              {/* Media Sub-Tabs */}
              <div className="flex items-center gap-1 border-b border-border pb-2 overflow-x-auto">
                {(
                  [
                    { category: 'PHOTOGRAPH', label: 'Photos', icon: ImageIcon },
                    { category: 'VIDEO', label: 'Videos', icon: Film },
                    { category: 'FLOOR_PLAN', label: 'Floor Plans', icon: FileText },
                    { category: 'BROCHURE', label: 'Brochures & Docs', icon: FileText },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon
                  const count = uploadedMedia.filter((m) => m.category === tab.category).length
                  const rule = getMediaRuleForCategory(tab.category)
                  const active = mediaCategoryTab === tab.category

                  return (
                    <button
                      key={tab.category}
                      type="button"
                      onClick={() => setMediaCategoryTab(tab.category)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        active
                          ? 'bg-foreground text-background border-foreground font-black'
                          : 'bg-surface-secondary border-border text-muted-text hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span className="font-mono opacity-80">
                        ({count}/{rule?.maxCount || '∞'})
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Upload Dropzone */}
              {currentMediaRule && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-gold/60 bg-surface-secondary/40 p-8 text-center cursor-pointer transition-colors group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={currentMediaRule.allowedMimeTypes.join(',')}
                    onChange={handleFileSelect}
                    disabled={isPreparingUpload || isSubmitting || isChangingMedia}
                    className="hidden"
                  />
                  <div className="w-10 h-10 border border-border bg-surface text-gold flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    {isPreparingUpload ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mt-3">
                    {isPreparingUpload ? 'Preparing your upload...' : `Upload ${currentMediaRule.label}`}
                  </h4>
                  <p className="text-[10px] text-muted-text mt-1">
                    Max {currentMediaRule.maxMb}MB per file • Up to{' '}
                    {currentMediaRule.maxCount || 'unlimited'} items
                  </p>
                  <p className="text-[9px] font-mono text-muted-text/80 mt-0.5">
                    Supported: {currentMediaRule.allowedMimeTypes.join(', ')}
                  </p>
                </div>
              )}

              {(hasPendingUploads || hasFailedUploads) && (
                <div className="border border-border bg-surface-secondary p-3 text-xs" role="status">
                  <p>{hasFailedUploads ? 'Some files could not be saved. Retry or discard them before publishing.' : 'Your files are uploading and being saved. Keep this browser tab open.'}</p>
                  <button type="button" onClick={() => setIsDockOpen(true)} className="mt-2 text-gold underline">View upload progress</button>
                </div>
              )}
              {/* Staged Upload Grid */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-text flex items-center justify-between">
                  <span>Uploaded Media ({uploadedMedia.length} total files)</span>
                  <span className="text-[9px] font-mono">
                    Click ★ to set primary listing cover photo
                  </span>
                </div>

                {uploadedMedia.length === 0 ? (
                  <div className="p-8 border border-border bg-surface-secondary/20 text-center text-xs text-muted-text">
                    No files staged yet. Select files above to stream directly to Cloudflare R2.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedMedia.map((item) => (
                      <div
                        key={item.id}
                        className={`relative border group bg-surface overflow-hidden flex flex-col justify-between ${
                          item.isCover ? 'border-gold ring-1 ring-gold/40' : 'border-border'
                        }`}
                      >
                        {/* Thumbnail / Preview */}
                        <div className="aspect-video bg-surface-secondary relative overflow-hidden flex items-center justify-center">
                          {item.category === 'PHOTOGRAPH' || item.category === 'FLOOR_PLAN' ? (
                            <img
                              src={item.url}
                              alt={item.title || 'Media thumbnail'}
                              className="w-full h-full object-cover"
                            />
                          ) : item.category === 'VIDEO' ? (
                            <div className="flex flex-col items-center justify-center text-muted-text">
                              <Film className="w-6 h-6 text-blue-400" />
                              <span className="text-[8px] font-mono mt-1 uppercase">Video</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-text">
                              <FileText className="w-6 h-6 text-amber-400" />
                              <span className="text-[8px] font-mono mt-1 uppercase">Brochure PDF</span>
                            </div>
                          )}

                          {item.isCover && (
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-gold text-black text-[8px] font-black uppercase tracking-wider">
                              Cover Photo
                            </div>
                          )}
                        </div>

                        {/* Card Info & Actions */}
                        <div className="p-2 flex items-center justify-between border-t border-border bg-surface-secondary/50">
                          <div className="min-w-0 pr-1">
                            <span className="text-[9px] font-mono text-muted-text block truncate">
                              {(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {item.category === 'PHOTOGRAPH' && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(item.id)}
                                disabled={mediaBusy || isSubmitting}
                                className={`p-1 transition-colors cursor-pointer ${
                                  item.isCover
                                    ? 'text-gold'
                                    : 'text-muted-text hover:text-foreground'
                                }`}
                                title="Set as Cover Photo"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${item.isCover ? 'fill-gold' : ''}`}
                                />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(item.id)}
                              disabled={mediaBusy || isSubmitting}
                              className="p-1 text-muted-text hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: SOCIETY INSIGHTS & NOTES
              ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'SOCIETY' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Developer / Builder Name
                  </label>
                  <input
                    type="text"
                    {...register('builderName')}
                    placeholder="e.g. Oberoi Realty, Godrej"
                    className={getInputCls(Boolean(errors.builderName))}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Year of Construction
                  </label>
                  <input
                    type="number"
                    {...register('yearOfConstruction')}
                    placeholder="e.g. 2022"
                    className={getInputCls(Boolean(errors.yearOfConstruction))}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                    Total Units in Complex
                  </label>
                  <input
                    type="number"
                    {...register('totalUnits')}
                    placeholder="e.g. 240"
                    className={getInputCls(Boolean(errors.totalUnits))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                  RERA Registration Number
                </label>
                <input
                  type="text"
                  {...register('reraNumber')}
                  placeholder="e.g. P51800001234"
                  className={getInputCls(Boolean(errors.reraNumber))}
                />
              </div>

              {/* Amenities Grid */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-2">
                  Key Amenities & Facilities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMENITY_OPTIONS.map((item) => {
                    const isSelected = watchedAmenities.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className={`p-2.5 text-left border text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-foreground text-background border-foreground font-black'
                            : 'bg-surface-secondary border-border text-muted-text hover:text-foreground'
                        }`}
                      >
                        <span className="truncate pr-1">{item}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Private Notes */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-1.5">
                  Internal Remarks & Private Notes
                </label>
                <textarea
                  rows={4}
                  {...register('notes')}
                  placeholder="Private agent remarks, key lockbox codes, tenant exit dates, or owner contact timings..."
                  className={getInputCls(Boolean(errors.notes))}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between bg-surface">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isPreparingUpload || isChangingMedia}
              className="px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab === 'DETAILS' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('MEDIA')}
                  className="px-4 py-2 bg-surface-secondary border border-border text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-secondary/80 transition-colors cursor-pointer"
                >
                  Next: Photos & Media →
                </button>
              )}

              {activeTab === 'MEDIA' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('SOCIETY')}
                  className="px-4 py-2 bg-surface-secondary border border-border text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-secondary/80 transition-colors cursor-pointer"
                >
                  Next: Society & Notes →
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || mediaBusy || hasFailedUploads}
                className="px-5 py-2 bg-gold hover:bg-gold-light text-black text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {mediaBusy ? 'Saving media...' : hasFailedUploads ? 'Resolve failed uploads' : initialProperty
                    ? isSubmitting
                      ? 'Updating...'
                      : 'Update Listing'
                    : isSubmitting
                    ? 'Publishing...'
                    : 'Publish Listing'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <DeleteMediaConfirmModal
        media={mediaToDelete}
        isDeleting={isChangingMedia}
        error={deleteMediaError}
        onClose={() => { if (!deletingMediaRef.current) setMediaToDelete(null) }}
        onConfirm={confirmRemoveMedia}
      />
      {/* Broker Link Modal */}
      {isOwnerModalOpen && <OwnerSelectModal onClose={() => setIsOwnerModalOpen(false)} onSelect={owner => {
        setSelectedOwner(owner); setSelectedBroker(null)
        setValue('ownerId', owner.id, { shouldValidate: true, shouldDirty: true })
        setValue('brokerId', null, { shouldDirty: true })
      }} />}
      <BrokerSelectModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        onSelectBroker={handleSelectBroker}
        selectedBrokerId={selectedBroker?.id}
      />
    </div>
  )
}
