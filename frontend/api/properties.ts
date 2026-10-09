import axios from 'axios'
import { propertyApiClient } from './client'
import { handleApiError } from '../utils/errorHandler'
import type {
  Property,
  PropertyPagination,
  PropertyFilterParams,
  PropertyFilterPreset,
  PresignedUploadItem,
  PropertyMedia,
  PropertyStats,
} from '../types/property'

export interface GetPropertiesResponse {
  success: boolean
  properties: Property[]
  pagination: PropertyPagination
}

/**
 * 0. Get Property Statistics
 */
export async function getPropertyStats(): Promise<PropertyStats> {
  try {
    const res = await propertyApiClient.get<{ success: boolean; stats: PropertyStats }>('/stats')
    return res.data.stats
  } catch (error) {
    throw handleApiError(error, 'fetch property statistics')
  }
}

/**
 * 1. List Properties with filters, search, and pagination
 */
export async function getProperties(
  params?: PropertyFilterParams
): Promise<GetPropertiesResponse> {
  try {
    const res = await propertyApiClient.get<GetPropertiesResponse>('', {
      params,
    })
    return res.data
  } catch (error) {
    throw handleApiError(error, 'fetch properties')
  }
}

export const getPropertiesList = getProperties


/**
 * 2. Get Property by ID
 */
export async function getPropertyById(id: string): Promise<Property> {
  try {
    const res = await propertyApiClient.get<{ success: boolean; property: Property }>(
      `/${id}`
    )
    return res.data.property
  } catch (error) {
    throw handleApiError(error, 'fetch property details')
  }
}

/**
 * 3. Create Draft Property
 */
export async function createPropertyDraft(
  data: Partial<Property>
): Promise<Property> {
  try {
    const res = await propertyApiClient.post<{ success: boolean; property: Property }>(
      '/draft',
      data
    )
    return res.data.property
  } catch (error) {
    throw handleApiError(error, 'create draft property')
  }
}

/**
 * 4. Create Full Property Listing
 */
export async function createProperty(
  data: Partial<Property>
): Promise<Property> {
  try {
    const res = await propertyApiClient.post<{ success: boolean; property: Property }>(
      '',
      data
    )
    return res.data.property
  } catch (error) {
    throw handleApiError(error, 'create property listing')
  }
}

/**
 * 5. Update Property Details
 */
export async function updateProperty(
  id: string,
  data: Partial<Property>
): Promise<Property> {
  try {
    const res = await propertyApiClient.put<{ success: boolean; property: Property }>(
      `/${id}`,
      data
    )
    return res.data.property
  } catch (error) {
    throw handleApiError(error, 'update property')
  }
}

/**
 * 6. Quick Status Update
 */
export async function updatePropertyStatus(
  id: string,
  availabilityStatus: string,
  availabilityDate?: string | null,
  note?: string
): Promise<Property> {
  try {
    const res = await propertyApiClient.patch<{ success: boolean; property: Property }>(
      `/${id}/status`,
      { availabilityStatus, availabilityDate, note }
    )
    return res.data.property
  } catch (error) {
    throw handleApiError(error, 'update property status')
  }
}

/**
 * 7. Archive / Restore Property
 */
export async function toggleArchiveProperty(id: string): Promise<Property> {
  try {
    const res = await propertyApiClient.patch<{ success: boolean; property: Property }>(
      `/${id}/archive`
    )
    return res.data.property
  } catch (error) {
    throw handleApiError(error, 'toggle archive property')
  }
}

/**
 * 8. Delete Property and all R2 files
 */
export async function deleteProperty(id: string): Promise<void> {
  try {
    await propertyApiClient.delete(`/${id}`)
  } catch (error) {
    throw handleApiError(error, 'delete property')
  }
}

/**
 * 9. Generate Presigned Upload URLs for Direct R2 Upload
 */
export async function generateUploadUrls(data: {
  propertyId?: string
  files: Array<{
    filename: string
    contentType: string
    sizeBytes: number
    category: string
    customKey?: string
    existingKey?: string
  }>
}): Promise<{ propertyId: string; urls: PresignedUploadItem[] }> {
  try {
    const res = await propertyApiClient.post<{
      success: boolean
      propertyId: string
      urls: PresignedUploadItem[]
    }>('/media/upload-urls', data)
    return res.data
  } catch (error) {
    throw handleApiError(error, 'generate upload URLs')
  }
}

/**
 * 10. Direct Upload File to Cloudflare R2 via Presigned PUT URL
 */
export async function uploadFileToR2(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<void> {
  await axios.put(uploadUrl, file, {
    signal,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percent)
      }
    },
  })
}

/**
 * 11. Attach Uploaded Media to Property
 */
export async function attachPropertyMedia(
  propertyId: string,
  media: Array<{
    category: string
    title?: string | null
    key: string
    url: string
    thumbnailUrl?: string | null
    mimeType: string
    sizeBytes: number
    order?: number
    isCover?: boolean
  }>
): Promise<PropertyMedia[]> {
  try {
    const res = await propertyApiClient.post<{
      success: boolean
      media: PropertyMedia[]
    }>(`/${propertyId}/media`, { media })
    return res.data.media
  } catch (error) {
    throw handleApiError(error, 'attach property media')
  }
}

/**
 * 12. Delete Single Media Item
 */
export async function deletePropertyMedia(
  propertyId: string,
  mediaId: string
): Promise<void> {
  try {
    await propertyApiClient.delete(`/${propertyId}/media/${mediaId}`)
  } catch (error) {
    throw handleApiError(error, 'delete property media')
  }
}

/**
 * 13. Reorder Property Media & Cover Image
 */
export async function reorderPropertyMedia(
  propertyId: string,
  mediaOrders: Array<{ id: string; order: number; isCover?: boolean }>
): Promise<PropertyMedia[]> {
  try {
    const res = await propertyApiClient.put<{
      success: boolean
      media: PropertyMedia[]
    }>(`/${propertyId}/media/reorder`, { mediaOrders })
    return res.data.media
  } catch (error) {
    throw handleApiError(error, 'reorder property media')
  }
}

/**
 * 14. Filter Presets: List
 */
export async function getFilterPresets(): Promise<PropertyFilterPreset[]> {
  try {
    const res = await propertyApiClient.get<{
      success: boolean
      presets: PropertyFilterPreset[]
    }>('/filters/presets')
    return res.data.presets
  } catch (error) {
    throw handleApiError(error, 'fetch filter presets')
  }
}

/**
 * 15. Filter Presets: Create
 */
export async function createFilterPreset(data: {
  name: string
  filters: Record<string, any>
  isDefault?: boolean
}): Promise<PropertyFilterPreset> {
  try {
    const res = await propertyApiClient.post<{
      success: boolean
      preset: PropertyFilterPreset
    }>('/filters/presets', data)
    return res.data.preset
  } catch (error) {
    throw handleApiError(error, 'save filter preset')
  }
}

export async function saveFilterPreset(
  name: string,
  filters: Record<string, any>,
  isDefault?: boolean
): Promise<PropertyFilterPreset> {
  return createFilterPreset({ name, filters, isDefault })
}

/**
 * 16. Filter Presets: Delete
 */
export async function deleteFilterPreset(presetId: string): Promise<void> {
  try {
    await propertyApiClient.delete(`/filters/presets/${presetId}`)
  } catch (error) {
    throw handleApiError(error, 'delete filter preset')
  }
}

/** Discard a file that uploaded successfully but was never attached. */
export async function discardPropertyUpload(propertyId: string, key: string): Promise<void> {
  try {
    await propertyApiClient.post(`/${propertyId}/media/discard-upload`, { key })
  } catch (error) { throw handleApiError(error, 'discard upload') }
}
