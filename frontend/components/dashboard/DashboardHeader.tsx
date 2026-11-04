'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useNavLoader } from '../../context/NavigationLoaderContext'
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  ShieldCheck,
  Shield,
  LogOut,
  Calendar,
  Building,
  CheckCircle2,
  RefreshCw,
  CheckCheck,
  Inbox,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useThemeStore } from '../../store/useThemeStore'
import { useRefreshStore } from '../../store/useRefreshStore'
import { useNotificationStore } from '../../store/useNotificationStore'
import type { CrmNotification } from '../../api/notifications'
import { toast } from '../../utils/toast'

function formatTimeAgo(isoString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  } catch {
    return 'Recent'
  }
}

interface DashboardHeaderProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function DashboardHeader({
  activeTab = 'Overview',
  setActiveTab,
}: DashboardHeaderProps) {
  const router = useRouter()
  const { startLoading, stopLoading } = useNavLoader()
  const { user, logout, hasPermission } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { refreshTick, isRefreshing, triggerRefresh } = useRefreshStore()
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markRead,
    markAllRead,
  } = useNotificationStore()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Poll notifications every 30 seconds and refresh immediately on refreshTick
  useEffect(() => {
    loadNotifications(refreshTick > 0)
    const interval = setInterval(() => {
      loadNotifications()
    }, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications, refreshTick])

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true)
      await markAllRead()
      toast.success('All marked as read', 'Your notifications are up to date.')
    } catch {
      toast.error('Failed to update notifications')
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleNotificationClick = async (n: CrmNotification) => {
    await markRead(n.id)
    if (n.link) {
      setNotificationsOpen(false)
      router.push(n.link)
    }
  }

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

  const handleGlobalRefresh = () => {
    startLoading()
    triggerRefresh()
    setTimeout(() => {
      stopLoading()
    }, 450)
  }

  return (
    <header className="w-full bg-surface border-b border-border/80 fixed top-0 z-40 shadow-xs transition-colors duration-200">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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





          {/* Global Page Refresh Button */}
          <button
            onClick={handleGlobalRefresh}
            disabled={isRefreshing}
            title="Refresh active page data"
            className="w-9 h-9 rounded-xl bg-surface-secondary hover:bg-surface flex items-center justify-center text-foreground hover:text-gold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-text hover:text-foreground transition-all duration-300 ${
                isRefreshing ? 'animate-spin text-gold' : ''
              }`}
            />
          </button>

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
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                  Notification.requestPermission().catch(() => {})
                }
                setNotificationsOpen(!notificationsOpen)
                setProfileOpen(false)
              }}
              title="Notifications"
              className="w-9 h-9 rounded-xl bg-surface-secondary hover:bg-surface flex items-center justify-center text-foreground hover:text-gold transition-all cursor-pointer relative shadow-xs"
            >
              <Bell className="w-4 h-4 text-muted-text hover:text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-black font-extrabold text-[10px] flex items-center justify-center leading-none animate-pulse shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-surface border border-border shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Notifications
                    </h4>
                    {unreadCount > 0 ? (
                      <span className="text-[10px] font-semibold bg-gold/20 text-dark-gold px-2 py-0.5 rounded-full">
                        {unreadCount} Unread
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-text">All caught up</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={isMarkingAll}
                      className="text-[10px] font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-border/60 text-xs py-2 max-h-[380px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center text-muted-text">
                      <Inbox className="w-8 h-8 opacity-40 mb-2" />
                      <p className="text-xs">No notifications yet</p>
                      <p className="text-[10px] text-muted-text/70 mt-0.5">
                        New inquiries and assigned leads will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`py-3 px-2 rounded-lg transition-colors cursor-pointer group flex items-start gap-3 ${
                          !item.isRead
                            ? 'bg-gold/5 hover:bg-gold/10'
                            : 'hover:bg-surface-secondary/60'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !item.isRead ? 'bg-gold' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-xs truncate ${
                                !item.isRead
                                  ? 'font-bold text-foreground'
                                  : 'font-medium text-muted-text'
                              }`}
                            >
                              {item.title}
                            </p>
                            <span className="text-[10px] text-muted-text/70 shrink-0">
                              {formatTimeAgo(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-muted-text text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-foreground hover:bg-surface-secondary transition text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-muted-text" />
                    <span>Account Profile</span>
                  </button>

                  {hasPermission('employees:manage') && (
                    <Link
                      href="/dashboard/organization"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-foreground hover:bg-surface-secondary transition text-left cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-gold" />
                      <span>Organization & Staff</span>
                    </Link>
                  )}
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
