const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

const root = path.resolve(__dirname, '..')

function loader() {
  const cache = new Map()
  function read(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const req = createRequire(filename)
    new Function(
      'require',
      'module',
      'exports',
      transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code
    )(
      (name) =>
        name.endsWith('.json')
          ? JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), name), 'utf8'))
          : name.startsWith('.')
          ? read(path.resolve(path.dirname(filename), name + '.ts'))
          : req(name),
      module,
      module.exports
    )
    return module.exports
  }
  return (relative) => read(path.resolve(root, 'src', relative))
}

const load = loader()
const { getDashboardOverviewController } = load('controllers/dashboard.controller.ts')
const { listNotificationsController, markNotificationReadController } = load('controllers/notification.controller.ts')

test('Dashboard overview adapts to Super Admin (*:*) capability and includes financial pipeline', async () => {
  const mockPrisma = {
    property: {
      count: async ({ where }) => {
        if (where?.propertyType === 'FLAT') return 40
        if (where?.propertyType === 'COMMERCIAL') return 20
        if (where?.propertyType === 'LAND') return 10
        if (where?.availabilityStatus) return 5
        return 70
      },
      aggregate: async () => ({ _sum: { askingPrice: 48000000 } }),
    },
    client: {
      count: async () => 24,
    },
    clientPartnerAssignment: {
      count: async () => 0,
    },
    websiteEnquiry: {
      count: async () => 8,
      findMany: async () => [
        { id: 'enq-1', fullName: 'Amit Roy', propertyType: 'FLAT', preferredLocation: 'New Town', estimatedBudgetBand: '1.2 Cr' }
      ],
    },
    clientPropertyShare: {
      count: async () => 14,
    },
    clientShortlistedProperty: {
      findMany: async () => [],
    },
    auditLog: {
      findMany: async () => [],
      findFirst: async () => ({ deviceName: 'Laptop (Linux • Chrome)', createdAt: new Date() }),
    },
    broker: { count: async () => 12 },
    owner: { count: async () => 18 },
  }

  let jsonResult = null
  const mockContext = {
    get: (key) => {
      if (key === 'user') return { id: 'admin-1', name: 'Super Admin', email: 'admin@dreamkey.com' }
      if (key === 'permissions') return ['*:*']
      if (key === 'roles') return ['SUPER_ADMIN']
      if (key === 'prisma') return mockPrisma
      return null
    },
    json: (data) => {
      jsonResult = data
      return data
    },
  }

  await getDashboardOverviewController(mockContext)
  assert.equal(jsonResult.success, true)
  assert.equal(jsonResult.data.stats.length, 4)

  // Verify properties stat
  const propStat = jsonResult.data.stats.find((s) => s.id === 'properties')
  assert.equal(propStat.value, '70')
  assert.ok(propStat.sub.includes('40 Flats'))

  // Verify financial pipeline is present because caller has *:*
  const dealsStat = jsonResult.data.stats.find((s) => s.id === 'deals')
  assert.ok(dealsStat)
  assert.equal(dealsStat.label, 'Active Deals')
  assert.ok(dealsStat.sub.includes('Cr pipeline'))
})

test('Dashboard overview strictly excludes financial pipeline for roles lacking finance:read', async () => {
  const mockPrisma = {
    property: {
      count: async ({ where }) => {
        if (where?.sourcePartnerId) return 0
        return 70
      },
      aggregate: async () => ({ _sum: { askingPrice: 999999999 } }),
    },
    client: {
      count: async () => 24,
    },
    clientPartnerAssignment: {
      count: async () => 6,
    },
    websiteEnquiry: {
      count: async () => 3,
      findMany: async () => [],
    },
    clientPropertyShare: {
      count: async () => 12,
    },
    clientShortlistedProperty: {
      findMany: async () => [],
    },
    auditLog: {
      findMany: async () => [],
      findFirst: async () => null,
    },
    broker: { count: async () => 0 },
    owner: { count: async () => 0 },
  }

  let jsonResult = null
  const mockContext = {
    get: (key) => {
      // Telecaller role with clients and properties read, but NO finance:read
      if (key === 'user') return { id: 'caller-1', name: 'Rakesh Telecaller', email: 'rakesh@dreamkey.com' }
      if (key === 'permissions') return ['properties:read', 'clients:read', 'clients:create']
      if (key === 'roles') return ['TELECALLER']
      if (key === 'prisma') return mockPrisma
      return null
    },
    json: (data) => {
      jsonResult = data
      return data
    },
  }

  await getDashboardOverviewController(mockContext)
  assert.equal(jsonResult.success, true)

  // Financial active deals card must NOT be present
  const dealCard = jsonResult.data.stats.find((s) => s.label === 'Active Deals')
  assert.equal(dealCard, undefined)

  // Instead, non-sensitive Decks Shared must be returned
  const sharesCard = jsonResult.data.stats.find((s) => s.label === 'Decks Shared')
  assert.ok(sharesCard)
  assert.equal(sharesCard.value, '12')
})

test('Notification visibility enforces capability partitioning (Super Admin sees all, staff only their scope)', async () => {
  const notificationsDB = [
    { id: 'n-1', userId: 'caller-1', requiredPermission: null, title: 'Lead Assigned', isRead: false },
    { id: 'n-2', userId: 'agent-2', requiredPermission: null, title: 'Other Agent Lead', isRead: false },
    { id: 'n-3', userId: null, requiredPermission: 'clients:read', title: 'New Web Enquiry', isRead: false },
    { id: 'n-4', userId: null, requiredPermission: 'audit:read', title: 'Security Alert: Access Denied', isRead: false },
  ]

  const mockPrisma = {
    notification: {
      findMany: async ({ where }) => {
        if (!where || Object.keys(where).length === 0) return notificationsDB
        return notificationsDB.filter((n) => {
          if (where.OR) {
            return where.OR.some((clause) => {
              if (clause.userId === 'caller-1') return n.userId === 'caller-1'
              if (clause.userId === null && clause.requiredPermission?.in) {
                return n.userId === null && clause.requiredPermission.in.includes(n.requiredPermission)
              }
              return false
            })
          }
          return false
        })
      },
      count: async () => 2,
    },
  }

  // 1. Telecaller call
  let callerResult = null
  const callerContext = {
    get: (key) => {
      if (key === 'user') return { id: 'caller-1' }
      if (key === 'roles') return ['TELECALLER']
      if (key === 'permissions') return ['clients:read', 'properties:read']
      if (key === 'prisma') return mockPrisma
      return null
    },
    json: (d) => { callerResult = d; return d },
  }

  await listNotificationsController(callerContext)
  assert.equal(callerResult.success, true)
  const callerTitles = callerResult.notifications.map((n) => n.title)

  // Caller can see their direct notification (Lead Assigned) and web enquiry (clients:read)
  assert.ok(callerTitles.includes('Lead Assigned'))
  assert.ok(callerTitles.includes('New Web Enquiry'))

  // Caller CANNOT see other agent's lead or security alert (audit:read)
  assert.equal(callerTitles.includes('Other Agent Lead'), false)
  assert.equal(callerTitles.includes('Security Alert: Access Denied'), false)

  // 2. Super Admin call
  let adminResult = null
  const adminContext = {
    get: (key) => {
      if (key === 'user') return { id: 'admin-1' }
      if (key === 'roles') return ['SUPER_ADMIN']
      if (key === 'permissions') return ['*:*']
      if (key === 'prisma') return mockPrisma
      return null
    },
    json: (d) => { adminResult = d; return d },
  }

  await listNotificationsController(adminContext)
  assert.equal(adminResult.success, true)
  // Super Admin sees ALL 4 notifications
  assert.equal(adminResult.notifications.length, 4)
})
