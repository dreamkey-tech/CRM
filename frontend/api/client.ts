import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios'

/**
 * Common Axios configuration for all CRM API clients.
 * `withCredentials: true` ensures that HttpOnly session cookies are attached to all requests.
 */
const defaultAxiosConfig: CreateAxiosDefaults = {
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
}

/**
 * Helper to create pre-configured Axios clients for different domain modules
 */
function createApiClient(subPath: string = ''): AxiosInstance {
  const instance = axios.create({
    ...defaultAxiosConfig,
    baseURL: subPath ? `/api/v1${subPath}` : '/api/v1',
  })

  // Global Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Auto-redirect or log global unauthorized errors if needed
      return Promise.reject(error)
    }
  )

  return instance
}

// 1. General Root API Client (/api)
export const apiClient = createApiClient('')

// 2. Authentication API Client (/api/auth)
export const authApiClient = createApiClient('/auth')

// 3. CRM Client Leads & Deals API Client (/api/clients)
export const clientApiClient = createApiClient('/clients')

// 4. Real Estate Broker Management API Client (/api/brokers)
export const brokerApiClient = createApiClient('/brokers')

// 5. Property Owner Management API Client (/api/owners)
export const ownerApiClient = createApiClient('/owners')

// 6. Admin — Website User Management API Client (/api/v1/admin/website-users)
export const adminWebsiteUsersClient = createApiClient('/admin/website-users')
