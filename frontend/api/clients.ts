import { clientApiClient, apiClient } from './client'
import type { Client, ClientPayload, ClientQueryParams, ClientsListResponse, ClientStats, ClientDetail, ClientPropertyOption, ClientShortlistedProperty, ClientPropertyShare, ClientPropertySharePayload, ClientDocument, ClientDocumentUploadMetadata, ClientShortlistStatus, ClientShareStatus } from '../types/client'
import type { PrimaryContactPartner } from '../types/broker'

export async function getClients(params: ClientQueryParams) { return (await clientApiClient.get<ClientsListResponse>('', { params })).data }
export async function getClient(id: string) { return (await clientApiClient.get<{ client: ClientDetail }>(`/${id}`)).data.client }
export async function getClientStats() { return (await clientApiClient.get<{ stats: ClientStats }>('/stats')).data.stats }
export async function getClientPartners() { return (await clientApiClient.get<{ partners: PrimaryContactPartner[] }>('/partners')).data.partners }
export async function saveClient(id: string | undefined, payload: Partial<ClientPayload>) {
  return (id ? await clientApiClient.patch<{ client: Client }>(`/${id}`, payload) : await clientApiClient.post<{ client: Client }>('', payload)).data.client
}
export async function deleteClient(id: string) { await clientApiClient.delete(`/${id}`) }
export async function getClientPropertyOptions(search: string, page: number) {
  return (await clientApiClient.get<{ properties: ClientPropertyOption[]; pagination: { total: number; page: number; hasNextPage: boolean } }>('/property-options', { params: { search, page } })).data
}
export async function addClientShortlist(id: string, propertyId: string, notes: string) {
  return (await clientApiClient.post<{ shortlist: ClientShortlistedProperty }>(`/${id}/shortlist`, { propertyId, notes })).data.shortlist
}
export async function updateClientShortlist(id: string, shortlistId: string, payload: { status: ClientShortlistStatus; notes: string }) {
  return (await clientApiClient.patch<{ shortlist: ClientShortlistedProperty }>(`/${id}/shortlist/${shortlistId}`, payload)).data.shortlist
}
export async function removeClientShortlist(id: string, shortlistId: string) { await clientApiClient.delete(`/${id}/shortlist/${shortlistId}`) }
export async function createClientShare(id: string, payload: ClientPropertySharePayload) {
  return (await clientApiClient.post<{ share: ClientPropertyShare }>(`/${id}/shares`, payload)).data.share
}
export async function updateClientShare(id: string, shareId: string, status: Exclude<ClientShareStatus, 'PREPARED'>) {
  return (await clientApiClient.patch<{ share: ClientPropertyShare }>(`/${id}/shares/${shareId}/status`, { status })).data.share
}
export async function revokeClientShare(id: string, shareId: string) { await clientApiClient.delete(`/${id}/shares/${shareId}`) }
export async function requestClientDocumentUpload(id: string, file: ClientDocumentUploadMetadata) {
  return (await clientApiClient.post<{ files: Array<ClientDocumentUploadMetadata & { key: string; uploadUrl: string }> }>(`/${id}/documents/upload-urls`, { clientId: id, files: [file] })).data.files[0]
}
export async function attachClientDocument(id: string, metadata: ClientDocumentUploadMetadata & { key: string }) {
  return (await clientApiClient.post<{ document: ClientDocument }>(`/${id}/documents`, metadata)).data.document
}
export async function discardClientDocumentUpload(id: string, key: string) { await clientApiClient.delete(`/${id}/documents/uploads`, { data: { key } }) }
export async function deleteClientDocument(id: string, documentId: string) { await clientApiClient.delete(`/${id}/documents/${documentId}`) }
export async function getClientDocumentDownload(id: string, documentId: string, inline = false) {
  return (await clientApiClient.get<{ url: string }>(`/${id}/documents/${documentId}/download`, { params: { inline } })).data.url
}
export async function getPublicClientShare(token: string) {
  return (await apiClient.get<import('../types/client').PublicPropertyShare>(`/public/property-shares/${token}`, { withCredentials: false })).data
}
