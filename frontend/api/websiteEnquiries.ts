import { adminWebsiteUsersClient, apiClient } from './client'
import type {
  WebsiteEnquiry,
  EnquiryStats,
  WebsiteEnquiriesListResponse,
  WebsiteEnquiryStatsResponse,
  WebsiteEnquiryListParams,
  CreateWebsiteEnquiryPayload,
  UpdateEnquiryStatusPayload,
} from '../types/websiteEnquiries'
import type { PaginationMeta } from '../types/websiteUsers'

/**
 * Fetch paginated list of website enquiries with search & filters
 * GET /api/v1/admin/website-users/enquiries
 */
export async function getWebsiteEnquiriesList(
  params: WebsiteEnquiryListParams = {}
): Promise<{ enquiries: WebsiteEnquiry[]; stats: EnquiryStats; pagination: PaginationMeta }> {
  const cleanParams: Record<string, string | number> = {}

  if (params.page) cleanParams.page = params.page
  if (params.limit) cleanParams.limit = params.limit
  if (params.search?.trim()) cleanParams.search = params.search.trim()
  if (params.status) cleanParams.status = params.status
  if (params.propertyType) cleanParams.propertyType = params.propertyType
  if (params.sortBy) cleanParams.sortBy = params.sortBy
  if (params.sortOrder) cleanParams.sortOrder = params.sortOrder

  const response = await adminWebsiteUsersClient.get<WebsiteEnquiriesListResponse>(
    '/enquiries',
    { params: cleanParams }
  )
  return {
    enquiries: response.data.enquiries,
    stats: response.data.stats,
    pagination: response.data.pagination,
  }
}

/**
 * Fetch summary stats for website enquiries
 * GET /api/v1/admin/website-users/enquiries/stats
 */
export async function getWebsiteEnquiryStats(): Promise<EnquiryStats> {
  const response = await adminWebsiteUsersClient.get<WebsiteEnquiryStatsResponse>(
    '/enquiries/stats'
  )
  return response.data.stats
}

/**
 * Update enquiry status and optional notes
 * PATCH /api/v1/admin/website-users/enquiries/:id/status
 */
export async function updateWebsiteEnquiryStatus(
  id: string,
  payload: UpdateEnquiryStatusPayload
): Promise<{ success: boolean; message: string; enquiry: WebsiteEnquiry }> {
  const response = await adminWebsiteUsersClient.patch<{
    success: boolean
    message: string
    enquiry: WebsiteEnquiry
  }>(`/enquiries/${id}/status`, payload)
  return response.data
}

/**
 * Delete enquiry by ID
 * DELETE /api/v1/admin/website-users/enquiries/:id
 */
export async function deleteWebsiteEnquiry(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await adminWebsiteUsersClient.delete<{
    success: boolean
    message: string
  }>(`/enquiries/${id}`)
  return response.data
}

/**
 * Public function to submit a website enquiry from frontend / property website
 * POST /api/v1/website/enquiry
 */
export async function submitWebsiteEnquiry(
  payload: CreateWebsiteEnquiryPayload
): Promise<{ success: boolean; message: string; enquiry?: WebsiteEnquiry }> {
  const response = await apiClient.post<{
    success: boolean
    message: string
    enquiry?: WebsiteEnquiry
  }>('/website/enquiry', payload)
  return response.data
}
