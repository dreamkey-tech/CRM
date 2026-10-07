'use client'

import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('dk_theme') as ThemeMode | null
  const initial = saved === 'dark' ? 'dark' : 'light'
  applyThemeToDOM(initial)
  return initial
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') {
      applyThemeToDOM(nextTheme)
      localStorage.setItem('dk_theme', nextTheme)
    }
    set({ theme: nextTheme })
  },
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      applyThemeToDOM(theme)
      localStorage.setItem('dk_theme', theme)
    }
    set({ theme })
  },
}))

if (typeof window !== 'undefined') {
  // Ensure DOM is in sync on client bootstrap
  const initial = getInitialTheme()
  useThemeStore.setState({ theme: initial })
}
