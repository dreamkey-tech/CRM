'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  Calendar,
  Building,
  CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useThemeStore } from '../../store/useThemeStore'
import { toast } from '../../utils/toast'

interface DashboardHeaderProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function DashboardHeader({
  activeTab = 'Overview',
  setActiveTab,
}: DashboardHeaderProps) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { label: 'Overview', id: 'Overview' },
    { label: 'Properties', id: 'Properties' },
    { label: 'Clients & Leads', id: 'Clients & Leads' },
    { label: 'Pipeline', id: 'Pipeline' },
    { label: 'Advisory & Reports', id: 'Advisory & Reports' },
  ]

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false)
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()

  const userName = user?.name || user?.email?.split('@')[0] || 'Mainak K.'
  const userRole = user?.roles?.[0] || 'PRINCIPAL BROKER'

  return (
    <header className="w-full bg-surface border-b border-border/80 fixed top-0 z-40 shadow-xs transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* ── Left: Brand Identity ── */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/dashboard" className="flex flex-col items-center  group">
            <div className="relative w-20 h-20 rounded-lg flex items-center justify-center p-1.5  shrink-0">
              <Image
                src="/logorm.png"
                alt="DreamKey"
                fill
                className="object-contain p-0.5"
              />
            </div>
            {/* <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-foreground">
                  DREAM<span className="text-gold">KEY</span>
                </span>
              </div>
              
            </div> */}
          </Link>



        </div>

        {/* ── Right: Widgets, Theme Toggle & User Avatar ── */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0" ref={dropdownRef}>





          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-xl bg-surface-secondary hover:bg-surface  flex items-center justify-center text-foreground hover:text-gold transition-all cursor-pointer shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-gold animate-in spin-in-180 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-muted-text hover:text-foreground animate-in spin-in-180 duration-300" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen)
                setProfileOpen(false)
              }}
              className="w-9 h-9 rounded-xl bg-surface-secondary hover:bg-surface  flex items-center justify-center text-foreground hover:text-gold transition-all cursor-pointer relative shadow-xs"
            >
              <Bell className="w-4 h-4 text-muted-text hover:text-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold animate-pulse" />
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface  border border-border shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Notifications
                  </h4>
                  <span className="text-[10px] font-semibold bg-gold/20 text-dark-gold px-2 py-0.5 ">
                    2 Unread
                  </span>
                </div>
                <div className="divide-y divide-border/60 text-xs py-2">
                  <div className="py-2.5">
                    <p className="font-semibold text-foreground">New Mandate Agreement</p>
                    <p className="text-muted-text text-[11px] mt-0.5">
                      South Kolkata Estate agreement ready for executive review.
                    </p>
                    <span className="text-[10px] text-muted-text mt-1 inline-block">10m ago</span>
                  </div>
                  <div className="py-2.5">
                    <p className="font-semibold text-foreground">Site Visit Confirmed</p>
                    <p className="text-muted-text text-[11px] mt-0.5">
                      Alipore Penthouse viewing scheduled for 11:30 AM.
                    </p>
                    <span className="text-[10px] text-muted-text mt-1 inline-block">45m ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen)
                setNotificationsOpen(false)
              }}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-surface-secondary hover:bg-surface transition-all cursor-pointer group shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-dark-gold flex items-center justify-center text-black font-extrabold text-xs shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-foreground leading-tight group-hover:text-gold transition">
                  {userName}
                </p>
                <p className="text-[10px] font-semibold text-dark-gold tracking-wide uppercase">
                  {userRole}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-text transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface  border border-border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2.5 border-b border-border/80 mb-2">
                  <p className="text-xs font-bold text-foreground">{userName}</p>
                  <p className="text-[11px] text-muted-text truncate">{user?.email || 'mainak@dreamkey.com'}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5  bg-gold/15 text-dark-gold text-[10px] font-bold uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{userRole}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      toast.info('Account Settings', 'User Profile & Security settings.')
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2  text-foreground hover:bg-surface-secondary transition text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-muted-text" />
                    <span>Account Profile</span>
                  </button>

                 
                </div>

                <div className="border-t border-border/80 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2  text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </header>
  )
}
