export type BrokerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export interface PrimaryContactPartner {
  id: string
  name: string | null
  email: string
}

export interface Broker {
  id: string
  name: string
  phone: string | null
  email: string | null
  whatsappNumber: string | null
  areaOfOperation: string | null
  primaryContactPartnerId: string | null
  minDealValue: number | null
  societyExpertise: string[]
  status: BrokerStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  _count?: { properties: number }
  primaryContactPartner?: PrimaryContactPartner | null
}

export interface BrokerPagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface BrokersListResponse {
  success: boolean
  pagination: BrokerPagination
  brokers: Broker[]
}

export interface SingleBrokerResponse {
  success: boolean
  broker: Broker
  message?: string
}

export interface BrokerActionResponse {
  success: boolean
  message: string
  broker?: Broker
}

export interface BrokerTopArea {
  area: string
  count: number
}

export interface BrokerStats {
  totalBrokers: number
  activeBrokers: number
  inactiveBrokers: number
  blockedBrokers: number
  myBrokersCount: number
  newBrokersToday: number
  newBrokersThisWeek: number
  newBrokersThisMonth: number
  topAreas: BrokerTopArea[]
}

export interface BrokerStatsResponse {
  success: boolean
  stats: BrokerStats
}

export interface BrokerQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: BrokerStatus | 'ALL'
  primaryContactPartnerId?: string
  areaOfOperation?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'minDealValue' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateBrokerPayload {
  primaryContactPartnerId?: string | null
  name: string
  phone?: string | null
  email?: string | null
  whatsappNumber?: string | null
  areaOfOperation?: string | null
  minDealValue?: number | null
  societyExpertise?: string[]
  status?: BrokerStatus
  notes?: string | null
}

export interface UpdateBrokerPayload extends Partial<CreateBrokerPayload> {
  primaryContactPartnerId?: string | null
}
