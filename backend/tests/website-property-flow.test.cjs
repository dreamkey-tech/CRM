const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

function loadWebsitePropertyController() {
  const cache = new Map()
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const code = transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code
    new Function('require', 'module', 'exports', code)((name) => {
      if (!name.startsWith('.')) return require(name)
      const resolved = path.resolve(path.dirname(filename), name)
      return name.endsWith('.json') ? JSON.parse(fs.readFileSync(resolved, 'utf8')) : load(`${resolved}.ts`)
    }, module, module.exports)
    return module.exports
  }
  return load(path.resolve(__dirname, '../src/controllers/website-property.controller.ts'))
}

const websiteUser = {
  id: 'user-uuid-1234',
  email: 'client@example.com',
  name: 'Test Client',
  isActive: true,
}

const mockProperty = {
  id: 'prop-uuid-9999',
  propertyType: 'FLAT',
  societyBuildingName: 'DreamKey Altura',
  locationArea: 'New Town Action Area II',
  city: 'Kolkata',
  pincode: '700156',
  floorNumber: 14,
  totalFloors: 25,
  bedrooms: 3,
  bathrooms: 3,
  balconies: 2,
  carpetAreaSqFt: 1850,
  superBuiltUpAreaSqFt: 2750,
  pricingType: 'SALE',
  askingPrice: 18500000,
  availabilityStatus: 'AVAILABLE',
  availabilityDate: null,
  builderName: 'DreamKey Infra',
  yearOfConstruction: 2024,
  totalUnits: 150,
  amenities: ['Lake Facing', 'Sky Lounge', 'Gymnasium'],
  reraNumber: 'WBRERA/P/KOL/2024/001',
  showInWebsite: true,
  isDraft: false,
  isArchived: false,
  // Sensitive fields that MUST NEVER leak:
  notes: 'CONFIDENTIAL: Owner is willing to negotiate down by 10 Lakhs',
  accessType: 'DIRECT',
  ownerId: 'owner-uuid-secret',
  brokerId: 'broker-uuid-secret',
  sourcePartnerId: 'partner-uuid-internal',
  media: [
    {
      id: 'm-1',
      category: 'PHOTOGRAPH',
      title: 'Elevation',
      url: 'https://r2.example.com/cover.jpg',
      thumbnailUrl: null,
      mimeType: 'image/jpeg',
      sizeBytes: 120000,
      order: 0,
      isCover: true,
    },
    {
      id: 'm-2',
      category: 'PHOTOGRAPH',
      title: 'Living Room',
      url: 'https://r2.example.com/living.jpg',
      thumbnailUrl: null,
      mimeType: 'image/jpeg',
      sizeBytes: 150000,
      order: 1,
      isCover: false,
    },
  ],
}

test('public listing API returns only published properties with safe public fields and cover image', async () => {
  const controller = loadWebsitePropertyController()

  let queryCaptured = null
  const prisma = {
    property: {
      count: async ({ where }) => {
        queryCaptured = where
        return 1
      },
      findMany: async ({ where }) => {
        queryCaptured = where
        return [mockProperty]
      },
    },
  }

  const c = {
    req: {
      valid: () => ({ page: 1, limit: 12 }),
    },
    get: (key) => (key === 'prisma' ? prisma : null),
    json: (body, status = 200) => ({ body, status }),
  }

  const res = await controller.listWebsitePropertiesController(c)
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.properties.length, 1)

  const item = res.body.properties[0]
  assert.equal(item.id, 'prop-uuid-9999')
  assert.equal(item.societyBuildingName, 'DreamKey Altura')
  assert.equal(item.locationArea, 'New Town Action Area II')
  assert.equal(item.carpetAreaSqFt, 1850)
  assert.equal(item.askingPrice, 18500000)
  assert.equal(item.pricingType, 'SALE')
  assert.deepEqual(item.amenities, ['Lake Facing', 'Sky Lounge', 'Gymnasium'])
  assert.equal(item.coverImage, 'https://r2.example.com/cover.jpg')

  // Verify that confidential internal details are not present
  assert.equal(item.notes, undefined)
  assert.equal(item.ownerId, undefined)
  assert.equal(item.brokerId, undefined)
  assert.equal(item.sourcePartnerId, undefined)
  assert.equal(item.accessType, undefined)

  // Verify DB query requires showInWebsite: true, isDraft: false, isArchived: false
  assert.ok(queryCaptured.AND.some((cond) => cond.showInWebsite === true))
  assert.ok(queryCaptured.AND.some((cond) => cond.isDraft === false))
  assert.ok(queryCaptured.AND.some((cond) => cond.isArchived === false))
})

test('click recording API rejects unauthenticated visitors with 401', async () => {
  const controller = loadWebsitePropertyController()
  const prisma = { property: {}, websitePropertyClick: {} }

  const c = {
    req: {
      param: (k) => (k === 'id' ? 'prop-uuid-9999' : null),
      header: () => null,
    },
    get: (key) => (key === 'prisma' ? prisma : null), // No websiteUser attached
    json: (body, status = 200) => ({ body, status }),
  }

  const res = await controller.trackWebsitePropertyClickController(c)
  assert.equal(res.status, 401)
  assert.equal(res.body.success, false)
})

test('click recording API saves user interaction record for authenticated website user', async () => {
  const controller = loadWebsitePropertyController()

  let clickInserted = null
  const prisma = {
    property: {
      findUnique: async () => ({
        id: 'prop-uuid-9999',
        societyBuildingName: 'DreamKey Altura',
        showInWebsite: true,
        isDraft: false,
        isArchived: false,
      }),
    },
    websitePropertyClick: {
      create: async ({ data }) => {
        clickInserted = { id: 'click-uuid-001', ...data, createdAt: new Date() }
        return clickInserted
      },
    },
  }

  const c = {
    req: {
      param: (k) => (k === 'id' ? 'prop-uuid-9999' : null),
      header: (name) => {
        if (name === 'cf-connecting-ip') return '203.0.113.195'
        if (name === 'user-agent') return 'Mozilla/5.0 TestBrowser'
        return null
      },
    },
    get: (key) => {
      if (key === 'prisma') return prisma
      if (key === 'websiteUser') return websiteUser
      return null
    },
    json: (body, status = 200) => ({ body, status }),
  }

  const res = await controller.trackWebsitePropertyClickController(c)
  assert.equal(res.status, 201)
  assert.equal(res.body.success, true)
  assert.equal(clickInserted.userId, 'user-uuid-1234')
  assert.equal(clickInserted.propertyId, 'prop-uuid-9999')
  assert.equal(clickInserted.ipAddress, '203.0.113.195')
  assert.equal(clickInserted.userAgent, 'Mozilla/5.0 TestBrowser')
})

test('authenticated property details API returns complete safe specs and excludes broker/owner/notes', async () => {
  const controller = loadWebsitePropertyController()

  const prisma = {
    property: {
      findUnique: async () => mockProperty,
    },
    websitePropertyClick: {
      findFirst: async () => ({ id: 'recent-click-id' }),
      create: async () => ({}),
    },
  }

  const c = {
    req: {
      param: (k) => (k === 'id' ? 'prop-uuid-9999' : null),
      header: () => null,
    },
    get: (key) => {
      if (key === 'prisma') return prisma
      if (key === 'websiteUser') return websiteUser
      return null
    },
    json: (body, status = 200) => ({ body, status }),
  }

  const res = await controller.getWebsitePropertyDetailController(c)
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)

  const prop = res.body.property
  assert.equal(prop.id, 'prop-uuid-9999')
  assert.equal(prop.societyBuildingName, 'DreamKey Altura')
  assert.equal(prop.builderName, 'DreamKey Infra')
  assert.equal(prop.reraNumber, 'WBRERA/P/KOL/2024/001')
  assert.equal(prop.bedrooms, 3)
  assert.equal(prop.bathrooms, 3)
  assert.equal(prop.balconies, 2)
  assert.equal(prop.carpetAreaSqFt, 1850)
  assert.equal(prop.askingPrice, 18500000)
  assert.equal(prop.coverImage, 'https://r2.example.com/cover.jpg')
  assert.equal(prop.media.length, 2)

  // SECURITY CHECKS: No owner, broker, internal notes, or partner details
  assert.equal(prop.owner, undefined)
  assert.equal(prop.ownerId, undefined)
  assert.equal(prop.broker, undefined)
  assert.equal(prop.brokerId, undefined)
  assert.equal(prop.sourcePartner, undefined)
  assert.equal(prop.sourcePartnerId, undefined)
  assert.equal(prop.notes, undefined)
  assert.equal(prop.accessType, undefined)
})
