import type { PrimaryContactPartner, BrokerPagination } from './broker'
import type { LinkedProperty } from './directory'
import type { PropertyType, PropertyMediaCategory } from './property'
import type { ClientDocumentCategory } from '../config/media-config'
import type { ClientFormValues, ClientPropertyShareFormValues } from '../zod/client'
export type { ClientDocumentCategory } from '../config/media-config'

export type ClientStatus = 'ACTIVE' | 'INACTIVE'
export type ClientShortlistStatus = 'SHORTLISTED' | 'SHARED' | 'VISITED' | 'INTERESTED' | 'NOT_INTERESTED'
export type ClientShareChannel = 'WHATSAPP' | 'EMAIL' | 'LINK'
export type ClientShareStatus = 'PREPARED' | 'COMPOSER_OPENED' | 'SENT_CONFIRMED'

export interface ClientPartnerAssignment {
  clientId: string
  partnerId: string
  assignedById: string
  assignedAt: string
  partner: PrimaryContactPartner
  assignedBy?: PrimaryContactPartner
}

export interface Client {
  id: string
  name: string
  phone: string
  email: string | null
  whatsappNumber: string | null
  address: string | null
  notes: string | null
  status: ClientStatus
  createdById: string
  createdBy?: PrimaryContactPartner
  assignedPartners: ClientPartnerAssignment[]
  _count?: { shortlistedProperties: number; documents: number }
  createdAt: string
  updatedAt: string
}

export type ClientPayload = ClientFormValues
export type ClientPropertySharePayload = ClientPropertyShareFormValues
export interface ClientQueryParams {
  page?: number
  limit?: number
  search?: string
  scope?: 'ALL' | 'MINE'
  status?: ClientStatus | 'ALL'
  partnerId?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status'
  sortOrder?: 'asc' | 'desc'
}
export interface ClientsListResponse { success: boolean; clients: Client[]; pagination: BrokerPagination }
export interface ClientStats { totalClients: number; activeClients: number; inactiveClients: number; myClientsCount: number }

export interface ClientShortlistedProperty {
  id: string
  clientId: string
  propertyId: string
  status: ClientShortlistStatus
  notes: string | null
  addedById: string
  addedBy?: PrimaryContactPartner
  property: ClientPropertyOption
  createdAt: string
  updatedAt: string
}

export interface ClientPropertyOption extends PublicPropertySnapshot {
  id: string
  isArchived: boolean
  isDraft: boolean
  availabilityStatus: LinkedProperty['availabilityStatus']
  media: Array<{ id: string; category: PropertyMediaCategory; title: string | null; url: string; thumbnailUrl: string | null; mimeType: string; sizeBytes: number; order: number; isCover: boolean }>
}

export interface ClientDetail extends Client {
  shortlistedProperties: ClientShortlistedProperty[]
  documents: ClientDocument[]
  shares: ClientPropertyShare[]
}

export interface ClientDocumentUploadMetadata {
  category: ClientDocumentCategory
  title: string
  originalName: string
  mimeType: string
  sizeBytes: number
}

// Public property fields are explicitly listed. No owner, broker, client, or internal notes.
export interface PublicPropertySnapshot {
  societyBuildingName: string
  propertyType: PropertyType
  locationArea: string
  city: string
  pricingType: LinkedProperty['pricingType']
  askingPrice: number
  carpetAreaSqFt: number
  superBuiltUpAreaSqFt: number | null
  bedrooms: number | null
  bathrooms: number | null
  balconies: number | null
  floorNumber: number | null
  totalFloors: number | null
  amenities: string[]
}

export interface SharedPropertyMediaSummary {
  propertyMediaId: string
  category: PropertyMediaCategory
  title: string | null
  mimeType: string
  sizeBytes: number
  order: number
}

export interface SharedPropertyMedia extends SharedPropertyMediaSummary {
  url: string
  thumbnailUrl: string | null
}

export interface ClientPropertyShare {
  id: string
  shortlistedPropertyId: string
  clientId: string
  propertyId: string
  publicUrl: string
  channel: ClientShareChannel
  status: ClientShareStatus
  recipient: string | null
  subject: string | null
  message: string
  propertySnapshot: PublicPropertySnapshot
  selectedMediaSnapshot: SharedPropertyMediaSummary[]
  selectedMedia?: SharedPropertyMedia[]
  createdById: string
  createdBy?: PrimaryContactPartner
  composerOpenedAt: string | null
  sentConfirmedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientDocument {
  id: string
  clientId: string
  category: ClientDocumentCategory
  title: string | null
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadedById: string
  uploadedBy?: PrimaryContactPartner
  createdAt: string
  updatedAt: string
  // No permanent public URL. Fetch a temporary authorized preview/download URL.
}

export interface PublicPropertyShare {
  property: PublicPropertySnapshot
  media: SharedPropertyMedia[]
  contact: { name: string; phone: string | null; email: string | null }
  availabilityStatus: LinkedProperty['availabilityStatus']
  company: { name: string; description: string; website: string; phone: string; whatsappNumber: string; email: string; address: string }
}
