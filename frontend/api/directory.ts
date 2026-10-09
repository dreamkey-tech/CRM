import { ownerApiClient, brokerApiClient } from './client'
import type { PrimaryContactPartner } from '../types/broker'
import type { LinkedPropertiesResponse } from '../types/directory'
export async function getDirectoryPartners(): Promise<PrimaryContactPartner[]> {
  return (await ownerApiClient.get<{ partners: PrimaryContactPartner[] }>('/partners')).data.partners
}
export async function getLinkedProperties(kind: 'owner' | 'broker', id: string, page = 1): Promise<LinkedPropertiesResponse> {
  const client = kind === 'owner' ? ownerApiClient : brokerApiClient
  return (await client.get<LinkedPropertiesResponse>(`/${id}/properties`, { params: { page, limit: 8 } })).data
}
