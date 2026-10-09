'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useTransition,
  Suspense,
  useMemo,
  useCallback,
} from 'react'
import {
  usePathname,
  useSearchParams,
  useRouter as useNextRouter,
} from 'next/navigation'
import Image from 'next/image'

interface NavContextType {
  isNavigating: boolean
  setIsNavigating: (loading: boolean) => void
  startLoading: () => void
  stopLoading: () => void
  navigateWithLoader: (href: string, options?: { replace?: boolean }) => void
}

const NavContext = createContext<NavContextType>({
  isNavigating: false,
  setIsNavigating: () => { },
  startLoading: () => { },
  stopLoading: () => { },
  navigateWithLoader: () => { },
})

/**
 * Checks if targetHref points to a different route pathname on the same origin.
 * Ignores same-page query param updates, hash changes, and external domains.
 */
function isDifferentPathname(targetHref: string): boolean {
  if (typeof window === 'undefined' || !targetHref) return false
  try {
    const targetUrl = new URL(targetHref, window.location.href)
    const currentUrl = new URL(window.location.href)

    // Ignore external domains
    if (targetUrl.origin !== currentUrl.origin) return false

    // Clean trailing slashes for comparison
    const cleanTargetPath = targetUrl.pathname.replace(/\/+$/, '') || '/'
    const cleanCurrentPath = currentUrl.pathname.replace(/\/+$/, '') || '/'

    return cleanTargetPath !== cleanCurrentPath
  } catch {
    return false
  }
}

function NavigationEventsWatcher({
  onRouteComplete,
}: {
  onRouteComplete: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    onRouteComplete()
  }, [pathname, searchParams, onRouteComplete])

  return null
}

export function NavigationLoaderProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useNextRouter()
  const [isPending, startTransition] = useTransition()
  const [manualLoading, setManualLoading] = useState(false)

  const startLoading = useCallback(() => {
    setManualLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setManualLoading(false)
  }, [])

  const resetLoading = useCallback(() => {
    setManualLoading(false)
  }, [])

  const navigateWithLoader = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      if (isDifferentPathname(href)) {
        setManualLoading(true)
      }
      startTransition(() => {
        if (options?.replace) {
          router.replace(href)
        } else {
          router.push(href)
        }
      })
    },
    [router]
  )

  // Global click listener for standard <a> and Next.js <Link> clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore right clicks or clicks with modifier keys (cmd/ctrl/shift/alt)
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return
      }

      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor || !anchor.href) return

      // Ignore external links, downloads, javascript/tel/mailto or target="_blank"
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return
      if (
        anchor.href.startsWith('javascript:') ||
        anchor.href.startsWith('tel:') ||
        anchor.href.startsWith('mailto:') ||
        anchor.href.startsWith('https://wa.me')
      ) {
        return
      }

      if (isDifferentPathname(anchor.href)) {
        setManualLoading(true)
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  // Safety fallback timeout: ensure loader never gets stuck indefinitely
  useEffect(() => {
    if (!manualLoading) return

    const timeout = setTimeout(() => {
      setManualLoading(false)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [manualLoading])

  const isNavigating = isPending || manualLoading

  return (
    <NavContext.Provider
      value={{
        isNavigating,
        setIsNavigating: setManualLoading,
        startLoading,
        stopLoading,
        navigateWithLoader,
      }}
    >
      <Suspense fallback={null}>
        <NavigationEventsWatcher onRouteComplete={resetLoading} />
      </Suspense>

      {children}

      {/* Global DreamKey Navigation Loading Overlay */}
      {isNavigating && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading page..."
          className="fixed inset-0 z-99999 flex items-center justify-center backdrop-blur-xs select-none animate-in fade-in duration-150"
        >
          <div className="  px-8 py-6  flex flex-col items-center justify-center min-w-[170px] animate-in zoom-in-95 duration-150">
            {/* DreamKey Brand Logo (no spin) */}
            <div className="relative w-28 h-12 flex items-center justify-center">
              <Image
                src="/logorbg.png"
                alt="DreamKey"
                width={112}
                height={48}
                className="object-contain"
                priority
              />
            </div>

            {/* 3-Dots Animated Indicator Underneath Logo */}
            <div className="flex items-center justify-center gap-1.5 mt-3.5">
              <span
                className="w-2 h-2 bg-gold animate-bounce"
                style={{ animationDelay: '-0.32s' }}
              />
              <span
                className="w-2 h-2 bg-gold animate-bounce"
                style={{ animationDelay: '-0.16s' }}
              />
              <span
                className="w-2 h-2 bg-gold animate-bounce"
                style={{ animationDelay: '0s' }}
              />
            </div>
          </div>
        </div>
      )}
    </NavContext.Provider>
  )
}

export const useNavLoader = () => useContext(NavContext)

/**
 * Custom useRouter hook that wraps Next.js App Router navigation methods
 * (push, replace, back, forward, refresh) to automatically trigger the navigation loader.
 *
 * Usage:
 * Instead of: `import { useRouter } from 'next/navigation'`
 * Use:        `import { useRouter } from '@/context/NavigationLoaderContext'`
 */
export function useRouter() {
  const nextRouter = useNextRouter()
  const { startLoading } = useNavLoader()

  return useMemo(() => {
    return {
      ...nextRouter,
      push: (href: string, options?: Parameters<typeof nextRouter.push>[1]) => {
        if (isDifferentPathname(href)) {
          startLoading()
        }
        return nextRouter.push(href, options)
      },
      replace: (
        href: string,
        options?: Parameters<typeof nextRouter.replace>[1]
      ) => {
        if (isDifferentPathname(href)) {
          startLoading()
        }
        return nextRouter.replace(href, options)
      },
      back: () => {
        startLoading()
        return nextRouter.back()
      },
      forward: () => {
        startLoading()
        return nextRouter.forward()
      },
      refresh: () => {
        startLoading()
        return nextRouter.refresh()
      },
    }
  }, [nextRouter, startLoading])
}
