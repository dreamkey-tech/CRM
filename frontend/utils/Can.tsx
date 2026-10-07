'use client'

import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import type { CanProps } from '../types/can'

/**
 * Declarative RBAC Permission Guard Component
 * Usage:
 * ```tsx
 * <Can permission="leads:create" fallback={<p>Locked</p>}>
 *   <button>Create Lead</button>
 * </Can>
 * ```
 */
export function Can({ permission, anyPermissions, role, fallback = null, children }: CanProps) {
  const { hasPermission, hasAnyPermission, hasRole } = useAuthStore()

  let isAllowed = true

  if (permission && !hasPermission(permission)) {
    isAllowed = false
  }

  if (anyPermissions && !hasAnyPermission(anyPermissions)) {
    isAllowed = false
  }

  if (role && !hasRole(role)) {
    isAllowed = false
  }

  if (!isAllowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
