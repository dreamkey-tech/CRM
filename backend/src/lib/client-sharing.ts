import type { Property, PropertyMedia } from '@prisma/client'
import { publicPropertySnapshotSchema, selectedPropertyMediaSnapshotSchema } from '../zod/client'
import { AppError } from './errors'

export function publicPropertySnapshot(property: Property) {
  return publicPropertySnapshotSchema.parse({ societyBuildingName: property.societyBuildingName, propertyType: property.propertyType,
    locationArea: property.locationArea, city: property.city, pricingType: property.pricingType, askingPrice: property.askingPrice,
    carpetAreaSqFt: property.carpetAreaSqFt, superBuiltUpAreaSqFt: property.superBuiltUpAreaSqFt,
    bedrooms: property.bedrooms, bathrooms: property.bathrooms, balconies: property.balconies,
    floorNumber: property.floorNumber, totalFloors: property.totalFloors, amenities: property.amenities,
  })
}
export function selectShareMedia(media: PropertyMedia[], ids: string[]) {
  const selected = ids.map(id => media.find(item => item.id === id))
  if (selected.some(item => !item || !['PHOTOGRAPH', 'VIDEO'].includes(item.category))) throw new AppError('Select only photos and videos belonging to this property. Please refresh your selection.', 400, 'INVALID_SHARE_MEDIA', [{ field: 'selectedMediaIds', message: 'Only this property’s photos and videos can be shared.' }])
  return selected as PropertyMedia[]
}
export function mediaSnapshot(media: PropertyMedia[]) {
  return selectedPropertyMediaSnapshotSchema.parse(media.map((item, order) => ({ propertyMediaId: item.id, category: item.category,
    title: item.title, mimeType: item.mimeType, sizeBytes: item.sizeBytes, order,
  })))
}
export function randomShareToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}
export function normalizeWhatsappNumber(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^0/, '')
  return digits.length === 10 ? `91${digits}` : digits
}
