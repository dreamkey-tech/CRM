'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    // Re-hydrate user & permissions on page load / browser refresh
    fetchUser()
  }, [fetchUser])

  return <>{children}</>
}
