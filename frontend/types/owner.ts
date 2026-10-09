import type { PrimaryContactPartner, BrokerPagination } from './broker'

export type OwnerStatus = 'ACTIVE' | 'INACTIVE'
export interface Owner {
  id: string
  name: string
  phone: string
  email: string | null
  whatsappNumber: string | null
  address: string | null
  notes: string | null
  status: OwnerStatus
  primaryContactPartnerId: string | null
  createdById: string
  primaryContactPartner?: PrimaryContactPartner | null
  createdBy?: PrimaryContactPartner
  _count?: { properties: number }
  createdAt: string
  updatedAt: string
}
export interface OwnerPayload {
  name: string
  phone: string
  email?: string | null
  whatsappNumber?: string | null
  address?: string | null
  notes?: string | null
  primaryContactPartnerId?: string | null
  status?: OwnerStatus
}
export interface OwnerQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: OwnerStatus | 'ALL'
  primaryContactPartnerId?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status'
  sortOrder?: 'asc' | 'desc'
}
export interface OwnerStats { totalOwners: number; activeOwners: number; inactiveOwners: number; myOwnersCount: number }
export interface OwnersListResponse { success: boolean; owners: Owner[]; pagination: BrokerPagination }
