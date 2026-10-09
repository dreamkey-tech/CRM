'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { usePathname } from 'next/navigation'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const isPublicShare = usePathname().startsWith('/share/')

  useEffect(() => {
    // Re-hydrate user & permissions on page load / browser refresh
    if (!isPublicShare) void fetchUser()
  }, [fetchUser, isPublicShare])

  return <>{children}</>
}
