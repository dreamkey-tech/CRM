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
 * Extracts a user-friendly, plain-English error message from backend responses or network failures.
 * Designed specifically for non-technical CRM users.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected issue occurred. Please try again.'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorPayload | undefined

    // 1. Backend provided explicit user-friendly error string
    if (data?.error && typeof data.error === 'string') {
      return data.error
    }
    if (data?.message && typeof data.message === 'string') {
      return data.message
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
        return 'You do not have permission to access this feature. Please contact your manager or administrator.'
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
    return error.message
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
