import { adminWebsiteUsersClient } from './client'
import type {
  WebsiteUserStatsResponse,
  WebsiteUserStats,
  WebsiteUsersListResponse,
  WebsiteUser,
  PaginationMeta,
  WebsiteUserDetailResponse,
  WebsiteUserDetail,
  UpdateUserStatusResponse,
  WebsiteUsersListParams,
} from '../types/websiteUsers'

export type {
  WebsiteUserStats,
  WebsiteUser,
  PaginationMeta,
  WebsiteUserDetail,
  WebsiteUsersListParams,
}

/**
 * Fetch aggregated analytics stats for the CRM website users dashboard
 * GET /api/v1/admin/website-users/stats
 */
export async function getWebsiteUserStats(): Promise<WebsiteUserStats> {
  const response = await adminWebsiteUsersClient.get<WebsiteUserStatsResponse>('/stats')
  return response.data.stats
}

/**
 * Fetch paginated list of website users with optional search, filter, sort
 * GET /api/v1/admin/website-users
 */
export async function getWebsiteUsersList(
  params: WebsiteUsersListParams = {}
): Promise<{ users: WebsiteUser[]; pagination: PaginationMeta }> {
  const cleanParams: Record<string, string | number> = {}

  if (params.page) cleanParams.page = params.page
  if (params.limit) cleanParams.limit = params.limit
  if (params.search?.trim()) cleanParams.search = params.search.trim()
  if (params.status) cleanParams.status = params.status
  if (params.authProvider) cleanParams.authProvider = params.authProvider
  if (params.sortBy) cleanParams.sortBy = params.sortBy
  if (params.sortOrder) cleanParams.sortOrder = params.sortOrder

  const response = await adminWebsiteUsersClient.get<WebsiteUsersListResponse>(
    '/',
    { params: cleanParams }
  )
  return {
    users: response.data.users,
    pagination: response.data.pagination,
  }
}

/**
 * Fetch detailed profile + session history for a single website user
 * GET /api/v1/admin/website-users/:id
 */
export async function getWebsiteUserDetail(id: string): Promise<WebsiteUserDetail> {
  const response = await adminWebsiteUsersClient.get<WebsiteUserDetailResponse>(`/${id}`)
  return response.data.user
}

/**
 * Activate or deactivate a website user account
 * PATCH /api/v1/admin/website-users/:id/status
 */
export async function updateWebsiteUserStatus(
  id: string,
  isActive: boolean
): Promise<UpdateUserStatusResponse> {
  const response = await adminWebsiteUsersClient.patch<UpdateUserStatusResponse>(
    `/${id}/status`,
    { isActive }
  )
  return response.data
}
