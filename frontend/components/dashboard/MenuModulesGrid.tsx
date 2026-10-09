'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from '../../context/NavigationLoaderContext'
import {
  Building2,
  Users2,
  Handshake,
  KeyRound,
  WalletCards,
  CheckSquare2,
  ArrowRight,
} from 'lucide-react'
import { toast } from '../../utils/toast'
import { useThemeStore } from '../../store/useThemeStore'
import { getWebsiteUserStats } from '../../api/websiteUsers'
import { getBrokerStats } from '../../api/brokers'
import { getPropertyStats } from '../../api/properties'

interface MenuModule {
  id: string
  title: string
  description: string
  badge: string
  icon: React.ComponentType<{ className?: string }>
  image: string
  href?: string
}

export function MenuModulesGrid() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const router = useRouter()
  const [websiteUserCount, setWebsiteUserCount] = useState<number | null>(null)
  const [brokerCount, setBrokerCount] = useState<number | null>(null)
  const [propertyCount, setPropertyCount] = useState<number | null>(null)

  useEffect(() => {
    getWebsiteUserStats()
      .then((s) => setWebsiteUserCount(s.totalUsers))
      .catch(() => {})

    getBrokerStats()
      .then((s) => setBrokerCount(s.totalBrokers))
      .catch(() => {})

    getPropertyStats()
      .then((s) => setPropertyCount(s.totalProperties))
      .catch(() => {})
  }, [])

  const modules: MenuModule[] = [
    {
      id: 'properties',
      title: 'Properties',
      description: 'Manage property stock, inventory lifecycle, and asset verification.',
      badge:
        propertyCount !== null
          ? `${propertyCount.toLocaleString()} Units • Flats, Land, Comm.`
          : 'Stock & Inventory',
      icon: Building2,
      image: 'Golden Hour Modern Villa Retreat.png',
      href: '/dashboard/properties',
    },
    {
      id: 'clients',
      title: 'Clients',
      description: 'Manage leads, private buyer requirements, and HNW client mandates.',
      badge: '24 Active Leads • Inquiries',
      icon: Users2,
      image: 'Luxury Office Handshake at Sunset.png',
    },
    {
      id: 'brokers',
      title: 'Brokers',
      description: 'Broker network, co-broking commissions, and agency channel partners.',
      badge:
        brokerCount !== null
          ? `${brokerCount.toLocaleString()} Registered Partners`
          : 'Channel Partners',
      icon: Handshake,
      image: 'Golden-Hour Real Estate Deal.png',
      href: '/dashboard/brokers',
    },
    {
      id: 'owners',
      title: 'Owners',
      description: 'Direct owner directory, title records, and landlord relations.',
      badge: '89 Registered Landlords',
      icon: KeyRound,
      image: 'Keys to Ownership at Golden Hour.png',
    },
    {
      id: 'finance',
      title: 'Finance',
      description: 'Income, brokerage fees, client advance deposits, and expense ledgers.',
      badge: 'Commission & Cash Flow',
      icon: WalletCards,
      image: 'Golden-Hour Finance Desk with City Skyline.png',
    },
    {
      id: 'followups',
      title: 'Follow-ups / Tasks',
      description: 'Daily action queues, scheduled viewings, calls, and agent reminders.',
      badge: '8 Scheduled for Today',
      icon: CheckSquare2,
      image: 'Golden Hour Productivity Desk.png',
    },
    {
      id: 'website-users',
      title: 'User Management',
      description: 'Analytics, engagement metrics, and registered website user accounts.',
      badge: websiteUserCount !== null
        ? `${websiteUserCount.toLocaleString()} Registered Users`
        : 'Loading...',
      icon: Users2,
      image: 'user2.png',
      href: '/dashboard/website-users',
    },
  ]

  const handleModuleClick = (item: MenuModule) => {
    if (item.href) {
      router.push(item.href)
    } else {
      toast.info(`${item.title} Module`, `Opening ${item.title} workspace directory...`)
    }
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              Menus
            </h3>
          </div>
          <p className="text-xs text-muted-text mt-0.5">
            Access core business modules, verified client databases, and daily operational directories.
          </p>
        </div>
      </div>

      {/* 3x2 Grid of Module Cards with Side-Blur Background Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              onClick={() => handleModuleClick(item)}
              className={`group relative overflow-hidden border hover:border-gold/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[260px] sm:min-h-[280px] p-6 ${
                isDark ? 'border-[#262626] bg-[#111111]' : 'border-[#E5E7EB] bg-white'
              }`}
            >
              {/* 1. Sharp Background Image (right-aligned subject) */}
              <Image
                src={`/dashboard-menu-images/${item.image}`}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-right transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* 2. Side Blur Overlay (blurred over text on left, transparent on right) */}
              <div
                className="absolute inset-0 backdrop-blur-md pointer-events-none"
                style={{
                  maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 45%)',
                  WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 45%)',
                }}
              />

              {/* 3. Horizontal & Vertical Gradient Scrims */}
              <div
                className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
                  isDark
                    ? 'bg-gradient-to-r from-black/95 via-black/80 via-40% to-transparent'
                    : 'bg-gradient-to-r from-white/95 via-white/85 via-40% to-transparent'
                }`}
              />
              <div
                className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
                  isDark
                    ? 'bg-gradient-to-t from-black/70 via-transparent to-black/20'
                    : 'bg-gradient-to-t from-white/80 via-transparent to-white/20'
                }`}
              />

              {/* 4. Top & Middle Content (Icon, Title, Description) */}
              <div className="relative z-10">
                {/* Top-Left Module Icon */}
                <div className="w-12 h-12 flex items-center justify-center text-gold shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title & Description */}
                <div className="mt-4">
                  <h4
                    className={`text-xl font-bold group-hover:text-gold transition-colors tracking-tight ${
                      isDark ? 'text-white' : 'text-[#171717]'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-xs sm:text-sm mt-2 leading-relaxed max-w-[280px] ${
                      isDark ? 'text-zinc-300/90' : 'text-[#6B7280]'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>

              {/* 5. Bottom Row: Metric Badge (Left) + Action Arrow (Right) */}
              <div className="relative z-10 flex items-center justify-between gap-3 mt-6">
                {/* Bottom Chip / Metric Badge */}
                <span
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 border-b-2 border-l-2 text-xs font-medium ${
                    isDark
                      ? 'border-b-white/40 border-l-white/40 text-zinc-200'
                      : 'border-b-neutral-300 border-l-neutral-300 text-neutral-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  <span className="truncate">{item.badge}</span>
                </span>

                {/* Direct Navigation Action Arrow */}
                <div
                  className={`w-12 h-8 backdrop-blur-md border group-hover:border-gold group-hover:bg-gold flex items-center justify-center group-hover:text-black transition-all duration-300 shadow-xs shrink-0 ${
                    isDark
                      ? 'bg-black/50 border-white/15 text-white'
                      : 'bg-white/80 border-neutral-200 text-neutral-900'
                  }`}
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
