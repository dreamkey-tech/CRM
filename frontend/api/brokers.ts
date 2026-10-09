import { brokerApiClient } from './client'
import type {
  Broker,
  BrokerStats,
  BrokersListResponse,
  BrokerStatsResponse,
  SingleBrokerResponse,
  BrokerActionResponse,
  BrokerQueryParams,
  CreateBrokerPayload,
  UpdateBrokerPayload,
  BrokerPagination,
} from '../types/broker'

/**
 * 1. Fetch paginated list of brokers with search & filter params
 * GET /api/v1/brokers
 */
export async function getBrokersList(
  params: BrokerQueryParams = {}
): Promise<{ brokers: Broker[]; pagination: BrokerPagination }> {
  const cleanParams: Record<string, string | number> = {}

  if (params.page) cleanParams.page = params.page
  if (params.limit) cleanParams.limit = params.limit
  if (params.search?.trim()) cleanParams.search = params.search.trim()
  if (params.status) cleanParams.status = params.status
  if (params.primaryContactPartnerId) cleanParams.primaryContactPartnerId = params.primaryContactPartnerId
  if (params.areaOfOperation?.trim()) cleanParams.areaOfOperation = params.areaOfOperation.trim()
  if (params.sortBy) cleanParams.sortBy = params.sortBy
  if (params.sortOrder) cleanParams.sortOrder = params.sortOrder

  const response = await brokerApiClient.get<BrokersListResponse>('', {
    params: cleanParams,
  })

  return {
    brokers: response.data.brokers || [],
    pagination: response.data.pagination,
  }
}

/**
 * 2. Fetch broker statistics and metrics for the dashboard
 * GET /api/v1/brokers/stats
 */
export async function getBrokerStats(): Promise<BrokerStats> {
  const response = await brokerApiClient.get<BrokerStatsResponse>('/stats')
  return response.data.stats
}

/**
 * 3. Fetch single broker profile by ID
 * GET /api/v1/brokers/:id
 */
export async function getBrokerById(id: string): Promise<Broker> {
  const response = await brokerApiClient.get<SingleBrokerResponse>(`/${id}`)
  return response.data.broker
}

/**
 * 4. Register a new broker in the CRM directory
 * POST /api/v1/brokers
 */
export async function createBroker(
  payload: CreateBrokerPayload
): Promise<BrokerActionResponse> {
  const response = await brokerApiClient.post<BrokerActionResponse>('', payload)
  return response.data
}

/**
 * 5. Update an existing broker
 * PUT /api/v1/brokers/:id
 */
export async function updateBroker(
  id: string,
  payload: UpdateBrokerPayload
): Promise<BrokerActionResponse> {
  const response = await brokerApiClient.put<BrokerActionResponse>(`/${id}`, payload)
  return response.data
}

/**
 * 6. Delete a broker from the CRM directory
 * DELETE /api/v1/brokers/:id
 */
export async function deleteBroker(id: string): Promise<BrokerActionResponse> {
  const response = await brokerApiClient.delete<BrokerActionResponse>(`/${id}`)
  return response.data
}
