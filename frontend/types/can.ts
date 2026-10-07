import React from 'react'

/**
 * Props for the declarative <Can /> RBAC component
 */
export type CanProps = {
  /**
   * The atomic permission required to render the children (e.g. 'leads:create', 'deals:delete')
   */
  permission?: string
  /**
   * List of permissions where having ANY of them will grant access
   */
  anyPermissions?: string[]
  /**
   * Required role (e.g. 'SUPER_ADMIN')
   */
  role?: string
  /**
   * Optional fallback to render when access is denied
   */
  fallback?: React.ReactNode
  children: React.ReactNode
}
