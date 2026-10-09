export type PropertyType = 'FLAT' | 'LAND' | 'WAREHOUSE' | 'COMMERCIAL' | 'OTHER'

export type PropertyPricingType = 'SALE' | 'RENT'

export type PropertyListingStatus =
  | 'AVAILABLE'
  | 'UNDER_NEGOTIATION'
  | 'TOKEN_PAID'
  | 'DEAL_DONE'
  | 'RENTED_OUT'
  | 'SOLD'
  | 'UPCOMING'

export type PropertyAccessType = 'DIRECT' | 'BROKER'

export type PropertyMediaCategory =
  | 'PHOTOGRAPH'
  | 'VIDEO'
  | 'FLOOR_PLAN'
  | 'BROCHURE'
  | 'OTHER'

export type BedroomType = 'STUDIO' | '1BHK' | '2BHK' | '3BHK' | '4BHK_PLUS'

export interface PropertyMedia {
  id: string
  propertyId: string
  category: PropertyMediaCategory
  title?: string | null
  key: string
  url: string
  thumbnailUrl?: string | null
  mimeType: string
  sizeBytes: number
  order: number
  isCover: boolean
  createdAt: string
  updatedAt: string
}

export interface PropertyAuditLog {
  id: string
  propertyId: string
  userId: string
  action: string
  description?: string | null
  changes?: Record<string, any> | null
  createdAt: string
  user?: {
    id: string
    name?: string | null
    email: string
  }
}

export interface LinkedBroker {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  whatsappNumber?: string | null
  areaOfOperation?: string | null
}

export interface LinkedOwner extends LinkedBroker {
  address?: string | null
}

export interface SourcePartner {
  id: string
  name?: string | null
  email: string
}

export interface Property {
  id: string
  isDraft: boolean
  isArchived: boolean
  archivedAt?: string | null
  propertyType: PropertyType
  societyBuildingName: string
  locationArea: string
  pincode: string
  city: string
  floorNumber?: number | null
  totalFloors?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  balconies?: number | null
  carpetAreaSqFt: number
  superBuiltUpAreaSqFt?: number | null
  pricingType: PropertyPricingType
  askingPrice: number
  availabilityStatus: PropertyListingStatus
  availabilityDate?: string | null
  accessType: PropertyAccessType
  ownerId?: string | null
  brokerId?: string | null
  sourcePartnerId: string
  builderName?: string | null
  yearOfConstruction?: number | null
  totalUnits?: number | null
  amenities: string[]
  reraNumber?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string

  media?: PropertyMedia[]
  owner?: LinkedOwner | null
  broker?: LinkedBroker | null
  sourcePartner?: SourcePartner
  auditLogs?: PropertyAuditLog[]
}

export interface PropertyPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PropertyStats {
  totalProperties: number
  availableCount: number
  underNegotiationCount: number
  dealDoneCount: number
  directCount: number
  brokerCount: number
}

export type PropertyQueryParams = PropertyFilterParams

export interface PropertyFilterParams {
  page?: number
  limit?: number
  search?: string
  propertyType?: string // comma-separated e.g. "FLAT,COMMERCIAL"
  pricingType?: string // "SALE" | "RENT"
  minPrice?: number
  maxPrice?: number
  locationArea?: string
  pincode?: string
  bedrooms?: string
  bedroomTypes?: string
  minBedrooms?: number
  maxBedrooms?: number
  minCarpetArea?: number
  maxCarpetArea?: number
  availabilityStatus?: string
  accessType?: string
  sourcePartnerId?: string
  ownerId?: string
  brokerId?: string
  isDraft?: 'true' | 'false' | 'all'
  isArchived?: 'true' | 'false' | 'all'
  sortBy?: 'createdAt' | 'updatedAt' | 'askingPrice' | 'carpetAreaSqFt' | 'societyBuildingName'
  sortOrder?: 'asc' | 'desc'
}

export interface PropertyFilterPreset {
  id: string
  userId: string
  name: string
  filters: Record<string, any>
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface PresignedUploadItem {
  filename: string
  category: PropertyMediaCategory
  key: string
  uploadUrl: string
  publicUrl: string
  mimeType: string
  sizeBytes: number
}

export interface UploadTask {
  id: string
  file: File
  filename: string
  category: PropertyMediaCategory
  sizeBytes: number
  progress: number
  status: 'QUEUED' | 'UPLOADING' | 'ATTACHING' | 'COMPLETED' | 'ERROR' | 'CANCELLED'
  errorMessage?: string
  key?: string
  publicUrl?: string
  uploadUrl?: string
  uploaded?: boolean
  attachedMedia?: PropertyMedia
  propertyId?: string
  previewUrl?: string
}

export interface PropertyDraftStorage {
  propertyId?: string
  formData: Partial<Property>
  uploadedMedia: PropertyMedia[]
  savedAt: string
}
