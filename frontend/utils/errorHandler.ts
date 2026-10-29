import axios from 'axios'
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import { toast } from './toast'

/**
 * Standard API error response structure from backend
 */
export interface ApiErrorPayload {
  success?: boolean
  error?: string
  message?: string
  code?: string
  details?: Array<{ field?: string; message: string }>
}

/**
 * Human-friendly action descriptions for technical RBAC permissions.
 * Translates codes like 'brokers:read' into natural, non-technical language.
 */
export const PERMISSION_FRIENDLY_NAMES: Record<string, string> = {
  'properties:read': 'view property listings',
  'properties:create': 'add new properties',
  'properties:update': 'edit properties',
  'properties:delete': 'delete properties',
  'clients:read': 'view the client directory',
  'clients:create': 'register new clients',
  'clients:update': 'edit client details',
  'clients:delete': 'delete clients',
  'clients:documents:view_sensitive': 'view confidential client documents (KYC / Aadhaar)',
  'brokers:read': 'view the broker directory',
  'brokers:create': 'add new brokers',
  'brokers:update': 'edit brokers',
  'brokers:delete': 'delete brokers',
  'owners:read': 'view property owners',
  'owners:create': 'add property owners',
  'owners:update': 'edit property owners',
  'owners:delete': 'delete property owners',
  'finance:read': 'view financial ledgers & reports',
  'finance:manage': 'manage financial transactions',
  'employees:read': 'view staff accounts & permissions',
  'employees:manage': 'manage staff accounts & permissions',
  'audit:read': 'view system audit logs',
  'settings:read': 'view system settings',
  'settings:update': 'update system settings',
  'roles:read': 'view security roles',
  'roles:create': 'create security roles',
  'roles:update': 'modify security roles',
  'roles:delete': 'delete security roles',
}

/**
 * Strips technical codes (e.g. `(brokers:read)`) and transforms permission errors into friendly English.
 */
export function formatFriendlyErrorMessage(raw: string, permissionCode?: string): string {
  if (!raw || typeof raw !== 'string') return ''

  // 1. Check for explicit or parenthesized permission codes
  const code = permissionCode || (raw.match(/\(([a-zA-Z0-9_*:-]+)\)/) || [])[1]
  if (code && PERMISSION_FRIENDLY_NAMES[code]) {
    return `You do not have permission to ${PERMISSION_FRIENDLY_NAMES[code]}. Please contact your CRM administrator if you need access.`
  }

  let cleaned = raw

  // 2. Remove parenthesized codes like (brokers:read) or (properties:create)
  cleaned = cleaned.replace(/\s*\([a-zA-Z0-9_*:-]+\)/g, '')

  // 3. Remove standalone permission syntax like brokers:read
  cleaned = cleaned.replace(/\b[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+\b/g, '')

  // 4. Clean up any double spaces or punctuation
  cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').trim()

  return cleaned
}

/**
 * Checks whether an error is a permission denial or restricted access error.
 * Used across the UI to suppress useless "Retry" buttons on 403 errors.
 */
export function isPermissionOrAccessError(error: unknown): boolean {
  if (!error) return false
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return true
    const data = error.response?.data as ApiErrorPayload | undefined
    if (data?.code === 'PERMISSION_DENIED' || data?.code === 'FORBIDDEN') return true
  }
  if (typeof error === 'string') {
    const lower = error.toLowerCase()
    return (
      lower.includes('permission') ||
      lower.includes('access restricted') ||
      lower.includes('contact your crm administrator') ||
      lower.includes('contact your administrator') ||
      lower.includes('not authorized') ||
      lower.includes('unauthorized') ||
      lower.includes('forbidden')
    )
  }
  if (error instanceof Error) {
    const lower = error.message.toLowerCase()
    return (
      lower.includes('permission') ||
      lower.includes('access restricted') ||
      lower.includes('contact your crm administrator') ||
      lower.includes('contact your administrator')
    )
  }
  return false
}

/**
 * Extracts a user-friendly, plain-English error message from backend responses or network failures.
 * Designed specifically for non-technical CRM users.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected issue occurred. Please try again.'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as (ApiErrorPayload & { requiredPermission?: string }) | undefined

    // 1. Backend provided explicit user-friendly error string
    if (data?.error && typeof data.error === 'string') {
      return formatFriendlyErrorMessage(data.error, data.requiredPermission)
    }
    if (data?.message && typeof data.message === 'string') {
      return formatFriendlyErrorMessage(data.message, data.requiredPermission)
    }

    // 2. Network & Connectivity errors
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Unable to connect to the CRM server. Please check your internet connection and try again.'
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'The request took too long to complete. Please try again in a moment.'
    }

    // 3. Fallback based on HTTP status codes
    const status = error.response.status
    switch (status) {
      case 400:
        return 'The request contains invalid information. Please review your input and try again.'
      case 401:
        return 'Your session has expired. Please sign in again to continue.'
      case 403:
        return data?.requiredPermission && PERMISSION_FRIENDLY_NAMES[data.requiredPermission]
          ? `You do not have permission to ${PERMISSION_FRIENDLY_NAMES[data.requiredPermission]}. Please contact your CRM administrator if you need access.`
          : 'You do not have permission to access this feature. Please contact your CRM administrator if you need access.'
      case 404:
        return 'The requested record or service could not be found.'
      case 409:
        return 'A record with this information already exists in the system.'
      case 429:
        return 'Too many requests. Please wait a few moments before trying again.'
      case 500:
      case 502:
      case 503:
        return 'The CRM service is temporarily experiencing technical difficulties. Please try again shortly.'
    }
  }

  if (error instanceof Error) {
    return formatFriendlyErrorMessage(error.message)
  }

  return fallbackMessage
}

/**
 * Helper to handle errors on forms:
 * - Shows an interactive error Toast
 * - Sets the server banner error state
 * - Maps field-level validation errors automatically to React Hook Form fields
 */
export function handleFormApiError<T extends FieldValues>(
  error: unknown,
  options?: {
    setError?: UseFormSetError<T>
    setBannerError?: (msg: string | null) => void
    toastTitle?: string
    fallbackMessage?: string
  }
): string {
  const message = getApiErrorMessage(error, options?.fallbackMessage)

  // 1. Show Toast notification
  toast.error(options?.toastTitle || 'Action could not be completed', message)

  // 2. Set banner error in component state if provided
  if (options?.setBannerError) {
    options.setBannerError(message)
  }

  // 3. Bind backend field validation errors to React Hook Form
  if (axios.isAxiosError(error) && options?.setError) {
    const details = error.response?.data?.details
    if (Array.isArray(details)) {
      for (const item of details) {
        if (item.field && item.message) {
          options.setError(item.field as Path<T>, {
            type: 'server',
            message: item.message,
          })
        }
      }
    }
  }

  return message
}

/**
 * Helper for button clicks or general actions that need toast errors
 */
export function handleActionApiError(
  error: unknown,
  toastTitle = 'Operation failed'
): string {
  const message = getApiErrorMessage(error)
  toast.error(toastTitle, message)
  return message
}

/**
 * Throws a clean error message for async API calls
 */
export function handleApiError(error: unknown, context?: string): Error {
  const message = getApiErrorMessage(
    error,
    context ? `Failed to ${context}. Please try again.` : undefined
  )
  if (axios.isAxiosError(error)) {
    error.message = message
    return error
  }
  return new Error(message)
}

