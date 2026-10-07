import type { PaginationMeta } from './websiteUsers'

export type EnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'RESOLVED' | 'CLOSED'

export interface WebsiteEnquiry {
  id: string
  fullName: string
  mobileNo: string
  email: string
  propertyType: string
  preferredLocation: string
  estimatedBudgetBand: string
  specificRequirements?: string | null
  status: EnquiryStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface EnquiryStats {
  totalEnquiries: number
  newToday: number
  pendingCount: number
  inProgressCount: number
  resolvedCount: number
}

export interface WebsiteEnquiriesListResponse {
  success: boolean
  enquiries: WebsiteEnquiry[]
  stats: EnquiryStats
  pagination: PaginationMeta
}

export interface WebsiteEnquiryStatsResponse {
  success: boolean
  stats: EnquiryStats
}

export interface WebsiteEnquiryListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  propertyType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateWebsiteEnquiryPayload {
  fullName: string
  mobileNo: string
  email: string
  propertyType: string
  preferredLocation: string
  estimatedBudgetBand: string
  specificRequirements?: string
}

export interface UpdateEnquiryStatusPayload {
  status?: EnquiryStatus
  notes?: string
}
