import type { Context } from 'hono'
import type { AppEnv } from '../db'

export interface StatCardData {
  id: string
  label: string
  value: string
  sub: string
  icon: string // 'Building2' | 'Users2' | 'CalendarCheck2' | 'Coins' | 'Share2'
  color: string
}

export interface BriefingItemData {
  id: string | number
  icon: string // 'Home' | 'AlertCircle' | 'FileText' | 'ShieldAlert' | 'Users'
  accent: string
  label: string
  title: string
  description: string
  badge: string
  badgeBg: string
  link?: string
}

/**
 * GET /v1/dashboard/overview
 * Dynamically computes 4-slot stat cards and daily briefing items based strictly on
 * the caller's atomic permissions (Capability-Based RBAC), scaling across 1,000+ custom roles.
 */
export async function getDashboardOverviewController(c: Context<AppEnv>) {
  const user = c.get('user')!
  const permissions = c.get('permissions') || []
  const prisma = c.get('prisma')

  const hasWildcard = permissions.includes('*:*')
  const canReadProperties = hasWildcard || permissions.includes('properties:read')
  const canManageProperties =
    hasWildcard || permissions.includes('properties:create') || permissions.includes('properties:update')
  const canReadClients = hasWildcard || permissions.includes('clients:read')
  const canManageClients =
    hasWildcard || permissions.includes('clients:create') || permissions.includes('clients:update')
  const canReadFinance = hasWildcard || permissions.includes('finance:read')
  const canReadAudit = hasWildcard || permissions.includes('audit:read')
  const canReadBrokers = hasWildcard || permissions.includes('brokers:read')
  const canReadOwners = hasWildcard || permissions.includes('owners:read')

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Execute database queries in parallel
  const [
    // 1. Property metrics
    totalActiveProperties,
    flatsCount,
    commCount,
    landCount,
    draftPropertiesCount,
    mySourcedPropertiesCount,

    // 2. Client & Lead metrics
    totalActiveClients,
    recentClientsCount,
    myAssignedClientsCount,

    // 3. Website enquiry metrics
    unresolvedEnquiriesCount,
    todayEnquiriesCount,
    latestNewEnquiries,

    // 4. Client shortlists & shares
    mySharesCount,
    totalSharesCount,
    activeDealsCount,
    activePipelineValuation,
    latestShortlists,

    // 5. Audit & Security
    recentDeniedLogs,
    latestLoginLog,

    // 6. Broker & Owner counts
    totalBrokersCount,
    totalOwnersCount,
  ] = await Promise.all([
    // Properties
    canReadProperties
      ? prisma.property.count({ where: { isDraft: false, isArchived: false } })
      : Promise.resolve(0),
    canReadProperties
      ? prisma.property.count({ where: { propertyType: 'FLAT', isDraft: false, isArchived: false } })
      : Promise.resolve(0),
    canReadProperties
      ? prisma.property.count({ where: { propertyType: 'COMMERCIAL', isDraft: false, isArchived: false } })
      : Promise.resolve(0),
    canReadProperties
      ? prisma.property.count({ where: { propertyType: 'LAND', isDraft: false, isArchived: false } })
      : Promise.resolve(0),
    canManageProperties
      ? prisma.property.count({ where: { isDraft: true, isArchived: false } })
      : Promise.resolve(0),
    canReadProperties
      ? prisma.property.count({ where: { sourcePartnerId: user.id, isArchived: false } })
      : Promise.resolve(0),

    // Clients
    canReadClients
      ? prisma.client.count({ where: { status: 'ACTIVE' } })
      : Promise.resolve(0),
    canReadClients
      ? prisma.client.count({ where: { status: 'ACTIVE', createdAt: { gte: sevenDaysAgo } } })
      : Promise.resolve(0),
    canReadClients
      ? prisma.clientPartnerAssignment.count({
          where: { partnerId: user.id, client: { status: 'ACTIVE' } },
        })
      : Promise.resolve(0),

    // Enquiries
    canReadClients || canManageClients
      ? prisma.websiteEnquiry.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } })
      : Promise.resolve(0),
    canReadClients || canManageClients
      ? prisma.websiteEnquiry.count({ where: { createdAt: { gte: startOfToday } } })
      : Promise.resolve(0),
    canReadClients || canManageClients
      ? prisma.websiteEnquiry.findMany({
          where: { status: 'NEW' },
          orderBy: { createdAt: 'desc' },
          take: 2,
        })
      : Promise.resolve([]),

    // Shortlists & Shares
    canReadClients
      ? prisma.clientPropertyShare.count({ where: { createdById: user.id } })
      : Promise.resolve(0),
    canReadClients
      ? prisma.clientPropertyShare.count()
      : Promise.resolve(0),
    canReadFinance || canReadProperties
      ? prisma.property.count({
          where: {
            availabilityStatus: { in: ['UNDER_NEGOTIATION', 'TOKEN_PAID'] },
            isArchived: false,
          },
        })
      : Promise.resolve(0),
    canReadFinance
      ? prisma.property.aggregate({
          where: {
            availabilityStatus: { in: ['UNDER_NEGOTIATION', 'TOKEN_PAID'] },
            isArchived: false,
          },
          _sum: { askingPrice: true },
        })
      : Promise.resolve({ _sum: { askingPrice: 0 } }),
    canReadClients
      ? prisma.clientShortlistedProperty.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 2,
          include: {
            client: { select: { id: true, name: true } },
            property: { select: { id: true, societyBuildingName: true, locationArea: true, askingPrice: true } },
          },
        })
      : Promise.resolve([]),

    // Audit
    canReadAudit
      ? prisma.auditLog.findMany({
          where: {
            action: 'ACCESS_DENIED',
            createdAt: { gte: startOfToday },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        })
      : Promise.resolve([]),
    canReadAudit
      ? prisma.auditLog.findFirst({
          where: { action: 'LOGIN', status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve(null),

    // Brokers & Owners
    canReadBrokers ? prisma.broker.count({ where: { status: 'ACTIVE' } }) : Promise.resolve(0),
    canReadOwners ? prisma.owner.count({ where: { status: 'ACTIVE' } }) : Promise.resolve(0),
  ])

  // -------------------------------------------------------------
  // 1. Build Dynamic 4-Slot Stat Cards
  // -------------------------------------------------------------
  const stats: StatCardData[] = []

  // Slot 1: Properties
  if (canReadProperties) {
    if (hasWildcard || canManageProperties || mySourcedPropertiesCount === 0) {
      stats.push({
        id: 'properties',
        label: 'Properties',
        value: String(totalActiveProperties),
        sub: `${flatsCount} Flats · ${commCount} Comm · ${landCount} Land`,
        icon: 'Building2',
        color: '#f59e0b',
      })
    } else {
      stats.push({
        id: 'properties',
        label: 'My Listings',
        value: String(mySourcedPropertiesCount),
        sub: `${totalActiveProperties} available in portfolio`,
        icon: 'Building2',
        color: '#f59e0b',
      })
    }
  }

  // Slot 2: Clients / Leads
  if (canReadClients) {
    if (hasWildcard || canManageClients || myAssignedClientsCount === 0) {
      stats.push({
        id: 'active-leads',
        label: 'Active Leads',
        value: String(totalActiveClients),
        sub: `${recentClientsCount} new this week`,
        icon: 'Users2',
        color: '#10b981',
      })
    } else {
      stats.push({
        id: 'active-leads',
        label: 'My Active Leads',
        value: String(myAssignedClientsCount),
        sub: `${totalActiveClients} company total`,
        icon: 'Users2',
        color: '#10b981',
      })
    }
  }

  // Slot 3: Inquiries / Follow-ups
  if (canReadClients || canManageClients) {
    stats.push({
      id: 'followups',
      label: 'Follow-ups',
      value: String(unresolvedEnquiriesCount),
      sub: `${todayEnquiriesCount} new today`,
      icon: 'CalendarCheck2',
      color: '#f43f5e',
    })
  } else if (canManageProperties) {
    stats.push({
      id: 'drafts',
      label: 'Draft Listings',
      value: String(draftPropertiesCount),
      sub: 'Pending review',
      icon: 'FileText',
      color: '#f43f5e',
    })
  }

  // Slot 4: Deals / Finance vs Property Shares vs Brokers
  if (canReadFinance) {
    const pipelineSum = activePipelineValuation._sum.askingPrice || 0
    const inCr = (pipelineSum / 10000000).toFixed(1)
    stats.push({
      id: 'deals',
      label: 'Active Deals',
      value: String(activeDealsCount),
      sub: `₹${inCr} Cr pipeline`,
      icon: 'Coins',
      color: '#D4AF37',
    })
  } else if (canReadClients) {
    // Privacy safeguard: Non-finance roles see property decks sent instead
    const sharesToShow = mySharesCount > 0 ? mySharesCount : totalSharesCount
    stats.push({
      id: 'deals',
      label: 'Decks Shared',
      value: String(sharesToShow),
      sub: `${mySharesCount} sent by you`,
      icon: 'Share2',
      color: '#D4AF37',
    })
  } else if (canReadBrokers) {
    stats.push({
      id: 'brokers',
      label: 'Broker Network',
      value: String(totalBrokersCount),
      sub: 'Active channel partners',
      icon: 'Building2',
      color: '#D4AF37',
    })
  } else if (canReadOwners) {
    stats.push({
      id: 'owners',
      label: 'Direct Owners',
      value: String(totalOwnersCount),
      sub: 'Registered property owners',
      icon: 'Users2',
      color: '#D4AF37',
    })
  }

  // Fallback to guarantee exactly 4 cards even for minimal permission roles
  while (stats.length < 4) {
    stats.push({
      id: `slot-${stats.length}`,
      label: 'CRM Status',
      value: 'Online',
      sub: 'System operational',
      icon: 'Building2',
      color: '#10b981',
    })
  }

  // -------------------------------------------------------------
  // 2. Build Capability-Guarded Daily Briefing Items
  // -------------------------------------------------------------
  const briefing: BriefingItemData[] = []

  // Item A: Urgent Website Inquiries
  if ((canReadClients || canManageClients) && latestNewEnquiries.length > 0) {
    const first = latestNewEnquiries[0]
    briefing.push({
      id: 'briefing-enquiry',
      icon: 'AlertCircle',
      accent: '#f43f5e',
      label: 'Urgent Inquiry',
      title: `${latestNewEnquiries.length} new website ${latestNewEnquiries.length === 1 ? 'inquiry' : 'inquiries'} awaiting call`,
      description: `${first.fullName} · ${first.propertyType} in ${first.preferredLocation} (₹${first.estimatedBudgetBand})`,
      badge: 'Urgent',
      badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
      link: '/dashboard/website-users',
    })
  }

  // Item B: Shortlisted Properties / Visits
  if (canReadClients && latestShortlists.length > 0) {
    const s = latestShortlists[0]
    briefing.push({
      id: 'briefing-shortlist',
      icon: 'Home',
      accent: '#f59e0b',
      label: 'Property Shortlist',
      title: `${s.client.name} shortlisted ${s.property.societyBuildingName}`,
      description: `${s.property.locationArea} · ₹${(s.property.askingPrice / 10000000).toFixed(2)} Cr`,
      badge: s.status === 'VISITED' ? 'Visited' : 'Active',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      link: `/dashboard/clients?clientId=${s.client.id}`,
    })
  }

  // Item C: Pending Property Drafts / Mandate Reviews
  if (canManageProperties && draftPropertiesCount > 0) {
    briefing.push({
      id: 'briefing-drafts',
      icon: 'FileText',
      accent: '#3b82f6',
      label: 'Inventory Review',
      title: `${draftPropertiesCount} property draft${draftPropertiesCount > 1 ? 's' : ''} ready for review`,
      description: 'Review and publish property listings to website and sharing catalogue.',
      badge: 'Drafted',
      badgeBg: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
      link: '/dashboard/properties',
    })
  }

  // Item D: Security / Audit Alert
  if (canReadAudit) {
    if (recentDeniedLogs.length > 0) {
      const log = recentDeniedLogs[0]
      briefing.push({
        id: 'briefing-security-alert',
        icon: 'ShieldAlert',
        accent: '#f43f5e',
        label: 'Security Flag',
        title: `${recentDeniedLogs.length} unauthorized access attempt${recentDeniedLogs.length > 1 ? 's' : ''} blocked`,
        description: log.details || 'RBAC permission denial logged by system.',
        badge: 'Denied',
        badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
        link: '/dashboard/organization?tab=audit',
      })
    } else if (latestLoginLog) {
      briefing.push({
        id: 'briefing-security-ok',
        icon: 'ShieldAlert',
        accent: '#10b981',
        label: 'Security Status',
        title: 'System & RBAC access protected',
        description: `Active session on ${latestLoginLog.deviceName || 'Desktop'} · Logged in today.`,
        badge: 'Verified',
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        link: '/dashboard/organization?tab=audit',
      })
    }
  }

  // Fallback briefing item if user has few items
  if (briefing.length === 0) {
    briefing.push({
      id: 'briefing-welcome',
      icon: 'Home',
      accent: '#10b981',
      label: 'Workspace Ready',
      title: 'All CRM services up to date',
      description: 'Your real-time operations dashboard is connected to live database records.',
      badge: 'Active',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      link: '/dashboard',
    })
  }

  return c.json({
    success: true,
    data: {
      stats: stats.slice(0, 4),
      briefing: briefing.slice(0, 3),
    },
  })
}
