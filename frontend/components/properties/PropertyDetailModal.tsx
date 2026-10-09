'use client'

import React, { useState } from 'react'
import {
  X,
  Building2,
  MapPin,
  Maximize2,
  Minimize2,
  Calendar,
  Handshake,
  User,
  History,
  FileText,
  Film,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit2,
  Archive,
  Trash2,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useRouter } from '../../context/NavigationLoaderContext'
import { PropertyStatusBadge } from './PropertyStatusBadge'
import { updatePropertyStatus, toggleArchiveProperty } from '../../api/properties'
import { toast } from '../../utils/toast'
import { formatIndianCurrency, formatDate, formatRelativeTime, formatSqFt, formatBHK } from '../../utils/formatters'
import type { Property, PropertyListingStatus } from '../../types/property'

interface PropertyDetailModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onEdit: (property: Property) => void
  onDelete: (property: Property) => void
  onStatusChanged: () => void
}

export function PropertyDetailModal({
  property,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChanged,
}: PropertyDetailModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MEDIA' | 'SOCIETY' | 'AUDIT'>('OVERVIEW')
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  if (!isOpen || !property) return null

  const photos = (property.media || []).filter((m) => m.category === 'PHOTOGRAPH')
  const videos = (property.media || []).filter((m) => m.category === 'VIDEO')
  const floorPlans = (property.media || []).filter((m) => m.category === 'FLOOR_PLAN')
  const brochures = (property.media || []).filter(
    (m) => m.category === 'BROCHURE' || m.category === 'OTHER'
  )

  const handleStatusChange = async (newStatus: PropertyListingStatus) => {
    if (newStatus === property.availabilityStatus) return
    setIsUpdatingStatus(true)
    try {
      await updatePropertyStatus(property.id, newStatus)
      toast.success('Status Updated', `Property status updated to ${newStatus}`)
      onStatusChanged()
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleToggleArchive = async () => {
    setIsArchiving(true)
    try {
      await toggleArchiveProperty(property.id)
      toast.success(
        property.isArchived ? 'Listing Restored' : 'Listing Archived',
        property.isArchived ? 'Property restored to active directory' : 'Property moved to archive'
      )
      onStatusChanged()
      onClose()
    } catch (err: any) {
      toast.error('Archive Action Failed', err.message || 'Could not toggle archive')
    } finally {
      setIsArchiving(false)
    }
  }

  const handleNavigateToBroker = () => {
    if (property.broker) {
      onClose()
      router.push(`/dashboard/brokers?search=${encodeURIComponent(property.broker.name)}`)
    }
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
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-gold shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground truncate">
                  {property.societyBuildingName}
                </h3>
                <PropertyStatusBadge status={property.availabilityStatus} />
              </div>
              <p className="text-[10px] text-muted-text truncate">
                {property.locationArea}, {property.city} — PIN {property.pincode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose()
                onEdit(property)
              }}
              className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-surface border border-border text-foreground hover:border-gold/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3 text-gold" /> Edit
            </button>

            {/* Maximize / Minimize Toggle */}
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
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-muted-text hover:text-foreground border border-border hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border-b border-border text-center">
          <div className="bg-surface px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
              Asking {property.pricingType === 'RENT' ? 'Rent' : 'Price'}
            </p>
            <p className="text-sm sm:text-base font-black text-gold font-mono">
              {formatIndianCurrency(property.askingPrice)}
            </p>
          </div>

          <div className="bg-surface px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
              Layout & Bedrooms
            </p>
            <p className="text-xs sm:text-sm font-bold text-foreground">
              {formatBHK(property.bedrooms)} • {property.propertyType}
            </p>
          </div>

          <div className="bg-surface px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
              Carpet Area
            </p>
            <p className="text-xs sm:text-sm font-bold text-foreground">
              {formatSqFt(property.carpetAreaSqFt)}
            </p>
          </div>

          <div className="bg-surface px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
              Sourcing Partner
            </p>
            <p className="text-xs font-bold text-foreground truncate">
              {property.accessType === 'BROKER' && property.broker ? (
                <span
                  onClick={handleNavigateToBroker}
                  className="text-gold hover:underline cursor-pointer flex items-center justify-center gap-1"
                  title="Click to view broker in directory"
                >
                  <Handshake className="w-3 h-3 inline" /> {property.broker.name}
                </span>
              ) : (
                'Direct Owner Stock'
              )}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-border bg-surface shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
              activeTab === 'OVERVIEW'
                ? 'border-gold text-gold bg-gold/5'
                : 'border-transparent text-muted-text hover:text-foreground'
            }`}
          >
            Overview & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MEDIA')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'MEDIA'
                ? 'border-gold text-gold bg-gold/5'
                : 'border-transparent text-muted-text hover:text-foreground'
            }`}
          >
            Media & Gallery ({(property.media || []).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SOCIETY')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
              activeTab === 'SOCIETY'
                ? 'border-gold text-gold bg-gold/5'
                : 'border-transparent text-muted-text hover:text-foreground'
            }`}
          >
            Society Insights
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'AUDIT'
                ? 'border-gold text-gold bg-gold/5'
                : 'border-transparent text-muted-text hover:text-foreground'
            }`}
          >
            <History className="w-3 h-3" /> Audit Log
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Photo Showcase Carousel */}
              {photos.length > 0 ? (
                <div className="relative aspect-16/9 sm:aspect-21/9 bg-background border border-border overflow-hidden flex items-center justify-center">
                  <img
                    src={photos[activePhotoIndex]?.url}
                    alt={property.societyBuildingName}
                    className="w-full h-full object-cover"
                  />

                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActivePhotoIndex((prev) =>
                            prev === 0 ? photos.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-gold hover:text-black transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setActivePhotoIndex((prev) =>
                            prev === photos.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-gold hover:text-black transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 border border-white/20 text-[9px] font-mono text-white">
                        {activePhotoIndex + 1} / {photos.length} Photos
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-21/9 bg-surface-secondary/40 border border-border flex flex-col items-center justify-center text-muted-text text-xs">
                  <Building2 className="w-8 h-8 text-gold/60 mb-2" />
                  <span>No property photos uploaded yet</span>
                </div>
              )}

              {/* Key Specifications Grid */}
              <div className="border border-border divide-y divide-border bg-surface">
                <div className="px-4 py-3 bg-surface-secondary flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                    Property Specifications
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                    {property.propertyType} • {property.pricingType}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 p-4 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] text-muted-text uppercase font-bold block mb-1">
                      Floor & Total Floors
                    </span>
                    <span className="font-bold text-foreground">
                      {property.floorNumber !== null && property.floorNumber !== undefined
                        ? `Floor ${property.floorNumber}`
                        : '—'}{' '}
                      {property.totalFloors ? `of ${property.totalFloors}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-muted-text uppercase font-bold block mb-1">
                      Bathrooms & Balconies
                    </span>
                    <span className="font-bold text-foreground">
                      {property.bathrooms || 0} Baths • {property.balconies || 0} Balconies
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-muted-text uppercase font-bold block mb-1">
                      Super Built-up Area
                    </span>
                    <span className="font-bold text-foreground">
                      {property.superBuiltUpAreaSqFt
                        ? formatSqFt(property.superBuiltUpAreaSqFt)
                        : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-muted-text uppercase font-bold block mb-1">
                      Listed By Partner
                    </span>
                    <span className="font-bold text-foreground truncate block">
                      {property.sourcePartner?.name || property.sourcePartner?.email || 'CRM Partner'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Broker Card */}
              {property.accessType === 'BROKER' && property.broker && (
                <div className="p-4 border border-border bg-surface-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 border border-border bg-surface flex items-center justify-center text-gold shrink-0">
                      <Handshake className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                        Sourcing Broker Partner
                      </p>
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {property.broker.name}
                      </h4>
                      <p className="text-[10px] text-muted-text truncate">
                        {property.broker.phone || 'No phone'} • {property.broker.areaOfOperation || 'Mumbai'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNavigateToBroker}
                    className="px-3 py-1.5 bg-surface border border-border text-[10px] font-bold uppercase tracking-wider text-gold hover:border-gold transition-colors flex items-center gap-1 shrink-0"
                  >
                    View Broker Profile <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Remarks & Notes */}
              {property.notes && (
                <div className="border border-border p-4 bg-surface">
                  <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-2">
                    Internal Agent Remarks & Notes
                  </h4>
                  <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {property.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEDIA & DOWNLOADS */}
          {activeTab === 'MEDIA' && (
            <div className="space-y-6">
              {/* Photographs Section */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gold" />
                  Photographs ({photos.length})
                </h4>
                {photos.length === 0 ? (
                  <p className="text-xs text-muted-text">No photographs uploaded.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photos.map((photo) => (
                      <a
                        key={photo.key}
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-4/3 bg-background border border-border overflow-hidden block"
                      >
                        <img
                          src={photo.url}
                          alt="Photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {photo.isCover && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-gold text-background text-[8px] font-bold uppercase">
                            Cover
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos Section */}
              {videos.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-blue-400" />
                    Video Tours ({videos.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map((vid) => (
                      <div key={vid.key} className="border border-border bg-surface p-2">
                        <video
                          src={vid.url}
                          controls
                          className="w-full aspect-16/9 bg-black object-cover mb-2"
                        />
                        <div className="flex items-center justify-between text-[10px] text-muted-text px-1">
                          <span className="font-bold text-foreground truncate">{vid.title || 'Property Video'}</span>
                          <span>{(vid.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents & PDF Section */}
              {(floorPlans.length > 0 || brochures.length > 0) && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gold" />
                    Floor Plans & Society Brochures
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...floorPlans, ...brochures].map((doc) => (
                      <a
                        key={doc.key}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 border border-border bg-surface hover:bg-surface-secondary transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-5 h-5 text-gold shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground group-hover:text-gold transition-colors truncate">
                              {doc.title || doc.category}
                            </p>
                            <p className="text-[10px] text-muted-text">
                              PDF • {(doc.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>

                        <Download className="w-4 h-4 text-muted-text group-hover:text-gold transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SOCIETY INSIGHTS */}
          {activeTab === 'SOCIETY' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border">
                <div className="bg-surface p-3.5">
                  <span className="text-[9px] text-muted-text uppercase font-bold block mb-1">
                    Builder / Developer
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {property.builderName || '—'}
                  </span>
                </div>

                <div className="bg-surface p-3.5">
                  <span className="text-[9px] text-muted-text uppercase font-bold block mb-1">
                    Year of Construction
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {property.yearOfConstruction || '—'}
                  </span>
                </div>

                <div className="bg-surface p-3.5">
                  <span className="text-[9px] text-muted-text uppercase font-bold block mb-1">
                    Total Units in Project
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {property.totalUnits || '—'}
                  </span>
                </div>

                <div className="bg-surface p-3.5">
                  <span className="text-[9px] text-muted-text uppercase font-bold block mb-1">
                    MahaRERA Number
                  </span>
                  <span className="text-xs font-bold text-foreground font-mono">
                    {property.reraNumber || '—'}
                  </span>
                </div>
              </div>

              {/* Amenities */}
              <div className="border border-border p-4 bg-surface">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text mb-3">
                  Society Amenities & Infrastructure ({property.amenities.length})
                </h4>
                {property.amenities.length === 0 ? (
                  <p className="text-xs text-muted-text">No amenities recorded.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="p-2 bg-surface-secondary border border-border text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-gold shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOG */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                  Listing Edit & Status History
                </h4>
                <span className="text-[9px] text-muted-text">
                  Partner edits are permanently recorded
                </span>
              </div>

              {!property.auditLogs || property.auditLogs.length === 0 ? (
                <p className="text-xs text-muted-text py-6 text-center">
                  No edit logs recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-border border border-border bg-surface">
                  {property.auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-surface-secondary border border-border text-gold inline-block mb-1">
                          {log.action}
                        </span>
                        <p className="text-xs text-foreground font-medium">
                          {log.description || 'Listing modified'}
                        </p>
                        <p className="text-[10px] text-muted-text mt-0.5">
                          By {log.user?.name || log.user?.email || 'Partner'}
                        </p>
                      </div>

                      <span className="text-[10px] text-muted-text font-mono shrink-0">
                        {formatDate(log.createdAt)} ({formatRelativeTime(log.createdAt)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Quick Status Dropdown & Actions */}
        <div className="px-5 py-3.5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-surface-secondary">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text shrink-0">
              Quick Status:
            </span>
            <select
              value={property.availabilityStatus}
              onChange={(e) => handleStatusChange(e.target.value as PropertyListingStatus)}
              disabled={isUpdatingStatus}
              className="px-2.5 py-1.5 bg-surface border border-border text-[10px] font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-gold transition-colors"
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_NEGOTIATION">Under Negotiation</option>
              <option value="TOKEN_PAID">Token Paid</option>
              <option value="DEAL_DONE">Deal Done</option>
              <option value="RENTED_OUT">Rented Out</option>
              <option value="SOLD">Sold</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
            {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleToggleArchive}
              disabled={isArchiving}
              className="px-3 py-1.5 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground transition-colors flex items-center gap-1"
            >
              <Archive className="w-3.5 h-3.5" />
              {property.isArchived ? 'Restore' : 'Archive'}
            </button>

            <button
              onClick={() => {
                onClose()
                onDelete(property)
              }}
              className="px-3 py-1.5 border border-red-500/40 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
