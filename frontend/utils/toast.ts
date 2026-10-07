import { toast as sonnerToast } from 'sonner'

/**
 * Unified Toast Notification Wrapper for DreamKey CRM
 *
 * Usage:
 * ```ts
 * toast.success("Lead created successfully!")
 * toast.error("Invalid credentials")
 * toast.info("New deal assigned to you")
 * toast.warning("Session will expire in 5 minutes")
 * toast.promise(saveLeadPromise, {
 *   loading: 'Saving lead...',
 *   success: 'Lead saved!',
 *   error: (err) => `Failed to save: ${err.message}`
 * })
 * ```
 */
export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, { description })
  },

  error: (message: string, description?: string) => {
    return sonnerToast.error(message, { description })
  },

  info: (message: string, description?: string) => {
    return sonnerToast.info(message, { description })
  },

  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, { description })
  },

  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, { description })
  },

  promise: <T>(
    promise: Promise<T>,
    data: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return sonnerToast.promise(promise, data)
  },

  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId)
  },
}
