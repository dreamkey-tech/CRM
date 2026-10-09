import { create } from 'zustand'
import * as api from '../api/clients'
import { useAuthStore } from './useAuthStore'
import { getApiErrorMessage } from '../utils/errorHandler'
import type { Client, ClientDetail, ClientQueryParams, ClientsListResponse, ClientShortlistedProperty, ClientPropertyShare, ClientDocument } from '../types/client'

interface CacheEntry { data: unknown; expiresAt: number }
interface ClientStore {
  cache: Record<string, CacheEntry>
  loading: Record<string, boolean>
  errors: Record<string, string | undefined>
  listVersion: number
  fetch: <T>(key: string, loader: () => Promise<T>, force?: boolean, ttl?: number) => Promise<T>
  loadList: (params: ClientQueryParams, force?: boolean) => Promise<ClientsListResponse>
  loadDetail: (id: string, force?: boolean) => Promise<ClientDetail>
  loadStats: (force?: boolean) => ReturnType<typeof api.getClientStats>
  loadPartners: (force?: boolean) => ReturnType<typeof api.getClientPartners>
  loadOptions: (search: string, page: number, force?: boolean) => ReturnType<typeof api.getClientPropertyOptions>
  savedClient: (client: Client) => void
  removedClient: (id: string) => void
  shortlistChanged: (id: string, shortlist: ClientShortlistedProperty | string) => void
  shareChanged: (id: string, share: ClientPropertyShare) => void
  documentChanged: (id: string, document: ClientDocument | string) => void
  reset: () => void
}
let generation = 0
const pending = new Map<string, Promise<unknown>>()
export const clientListKey = (params: ClientQueryParams) => `list:${JSON.stringify(params)}`
export const clientOptionsKey = (search: string, page: number) => `options:${search}:${page}`
const detailKey = (id: string) => `detail:${id}`
const mutateDetail = (id: string, edit: (value: ClientDetail) => ClientDetail) => {
  useClientStore.setState(state => {
    const entry = state.cache[detailKey(id)]
    if (!entry) return state
    return { cache: { ...state.cache, [detailKey(id)]: { ...entry, data: edit(entry.data as ClientDetail) } } }
  })
}
function syncListCounts(id: string) {
  const detail = useClientStore.getState().cache[detailKey(id)]?.data as ClientDetail | undefined
  if (!detail) return
  useClientStore.setState(state => ({ cache: Object.fromEntries(Object.entries(state.cache).map(([key, entry]) => {
    if (!key.startsWith('list:')) return [key, entry]
    const data = entry.data as ClientsListResponse
    return [key, { ...entry, data: { ...data, clients: data.clients.map(client => client.id === id ? { ...client, _count: detail._count } : client) } }]
  })) }))
}
const invalidateLists = () => useClientStore.setState(state => ({
  listVersion: state.listVersion + 1,
  cache: Object.fromEntries(Object.entries(state.cache).map(([key, entry]) => [key, key.startsWith('list:') || key === 'stats' ? { ...entry, expiresAt: 0 } : entry])),
}))
export const useClientStore = create<ClientStore>((set, get) => ({
  cache: {}, loading: {}, errors: {}, listVersion: 0,
  fetch: async <T,>(key: string, loader: () => Promise<T>, force = false, ttl = 60000) => {
    const cached = get().cache[key]
    if (!force && cached && cached.expiresAt > Date.now()) return cached.data as T
    if (pending.has(key)) return pending.get(key) as Promise<T>
    const startedGeneration = generation
    set(state => ({ loading: { ...state.loading, [key]: true }, errors: { ...state.errors, [key]: undefined } }))
    const request = loader().then(data => {
      if (generation === startedGeneration) set(state => ({ cache: { ...state.cache, [key]: { data, expiresAt: Date.now() + ttl } } }))
      return data
    }).catch(error => {
      if (generation === startedGeneration) set(state => ({ errors: { ...state.errors, [key]: getApiErrorMessage(error) } }))
      throw error
    }).finally(() => {
      if (generation === startedGeneration) { pending.delete(key); set(state => ({ loading: { ...state.loading, [key]: false } })) }
    })
    pending.set(key, request)
    return request
  },
  loadList: (params, force) => get().fetch(clientListKey(params), () => api.getClients(params), force),
  loadDetail: (id, force) => get().fetch(detailKey(id), () => api.getClient(id), force),
  loadStats: (force) => get().fetch('stats', api.getClientStats, force),
  loadPartners: (force) => get().fetch('partners', api.getClientPartners, force, 300000),
  loadOptions: (search, page, force) => get().fetch(clientOptionsKey(search, page), () => api.getClientPropertyOptions(search, page), force),
  savedClient: client => {
    mutateDetail(client.id, detail => ({ ...detail, ...client }))
    invalidateLists()
  },
  removedClient: id => {
    set(state => ({ cache: Object.fromEntries(Object.entries(state.cache).filter(([key]) => key !== detailKey(id))) }))
    invalidateLists()
  },
  shortlistChanged: (id, item) => {
    mutateDetail(id, detail => {
      const items = detail.shortlistedProperties.filter(value => value.id !== (typeof item === 'string' ? item : item.id))
      if (typeof item !== 'string') items.unshift(item)
      return { ...detail, shortlistedProperties: items, _count: { shortlistedProperties: items.length, documents: detail.documents.length } }
    })
    syncListCounts(id)
  },
  shareChanged: (id, share) => mutateDetail(id, detail => ({ ...detail,
    shares: [share, ...detail.shares.filter(item => item.id !== share.id)],
    shortlistedProperties: detail.shortlistedProperties.map(item => item.id === share.shortlistedPropertyId && share.status === 'SENT_CONFIRMED' && item.status === 'SHORTLISTED' ? { ...item, status: 'SHARED' } : item),
  })),
  documentChanged: (id, item) => {
    mutateDetail(id, detail => {
      const documents = detail.documents.filter(value => value.id !== (typeof item === 'string' ? item : item.id))
      if (typeof item !== 'string') documents.unshift(item)
      return { ...detail, documents, _count: { shortlistedProperties: detail.shortlistedProperties.length, documents: documents.length } }
    })
    syncListCounts(id)
  },
  reset: () => { generation++; pending.clear(); set({ cache: {}, loading: {}, errors: {}, listVersion: 0 }) },
}))
// Personal data is kept only in memory and cleared whenever the signed-in user changes.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useClientStore.getState().reset()
})
