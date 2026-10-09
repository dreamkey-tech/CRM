import { ownerApiClient } from './client'
import type { Owner, OwnerPayload, OwnerQueryParams, OwnerStats, OwnersListResponse } from '../types/owner'

export async function getOwnersList(params: OwnerQueryParams = {}): Promise<OwnersListResponse> {
  const response = await ownerApiClient.get<OwnersListResponse>('', { params })
  return response.data
}
export async function getOwnerById(id: string): Promise<Owner> {
  return (await ownerApiClient.get<{ owner: Owner }>(`/${id}`)).data.owner
}
export async function getOwnerStats(): Promise<OwnerStats> {
  return (await ownerApiClient.get<{ stats: OwnerStats }>('/stats')).data.stats
}
export async function createOwner(payload: OwnerPayload): Promise<Owner> {
  return (await ownerApiClient.post<{ owner: Owner }>('', payload)).data.owner
}
export async function updateOwner(id: string, payload: Partial<OwnerPayload>): Promise<Owner> {
  return (await ownerApiClient.put<{ owner: Owner }>(`/${id}`, payload)).data.owner
}
export async function deleteOwner(id: string): Promise<void> { await ownerApiClient.delete(`/${id}`) }
