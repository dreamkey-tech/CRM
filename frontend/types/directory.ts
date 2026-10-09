import type { PropertyListingStatus, PropertyPricingType } from './property'
import type { BrokerPagination } from './broker'
export interface LinkedProperty {
  id: string
  societyBuildingName: string
  locationArea: string
  city: string
  pricingType: PropertyPricingType
  askingPrice: number
  availabilityStatus: PropertyListingStatus
  isArchived: boolean
  carpetAreaSqFt: number
  media: Array<{ url: string }>
}
export interface LinkedPropertiesResponse { success: boolean; properties: LinkedProperty[]; pagination: BrokerPagination }
