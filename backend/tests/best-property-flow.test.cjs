const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

function loadControllers() {
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
  return {
    websiteProperty: load(path.resolve(__dirname, '../src/controllers/website-property.controller.ts')),
    crmProperty: load(path.resolve(__dirname, '../src/controllers/property.controller.ts')),
  }
}

const mockBestProperty = {
  id: 'best-prop-1',
  propertyType: 'FLAT',
  societyBuildingName: 'DreamKey Altura',
  locationArea: 'New Town Action Area II',
  city: 'Kolkata',
  pincode: '700156',
  bedrooms: 3,
  bathrooms: 3,
  carpetAreaSqFt: 1850,
  superBuiltUpAreaSqFt: 2750,
  pricingType: 'SALE',
  askingPrice: 18500000,
  availabilityStatus: 'AVAILABLE',
  amenities: ['Gym', 'Pool'],
  showInWebsite: true,
  isBestProperty: true,
  isDraft: false,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  media: [
    {
      id: 'm-1',
      category: 'PHOTOGRAPH',
      url: 'https://r2.example.com/cover.jpg',
      thumbnailUrl: null,
      mimeType: 'image/jpeg',
      order: 0,
      isCover: true,
      title: 'Cover Photo',
    },
  ],
}

test('public /best-properties API returns best properties with public card format and no auth required', async () => {
  const { websiteProperty } = loadControllers()

  let queryCaptured = null
  const prisma = {
    property: {
      findMany: async ({ where, take }) => {
        queryCaptured = { where, take }
        return [mockBestProperty]
      },
    },
  }

  const c = {
    get: (key) => (key === 'prisma' ? prisma : null),
    json: (body, status = 200) => ({ body, status }),
  }

  const res = await websiteProperty.listBestPropertiesController(c)
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.total, 1)
  assert.equal(res.body.properties.length, 1)

  const prop = res.body.properties[0]
  assert.equal(prop.id, 'best-prop-1')
  assert.equal(prop.societyBuildingName, 'DreamKey Altura')
  assert.equal(prop.coverImage, 'https://r2.example.com/cover.jpg')
  assert.equal(prop.isBestProperty, true)

  // Verify query conditions: isBestProperty: true, showInWebsite: true, isDraft: false, isArchived: false
  assert.equal(queryCaptured.where.isBestProperty, true)
  assert.equal(queryCaptured.where.showInWebsite, true)
  assert.equal(queryCaptured.where.isDraft, false)
  assert.equal(queryCaptured.where.isArchived, false)
  assert.equal(queryCaptured.take, 3)
})

test('updatePropertyWebsiteSettingsController blocks setting 4th best property', async () => {
  const { crmProperty } = loadControllers()

  const prisma = {
    user: {
      findUnique: async () => ({ id: 'partner-1' }),
    },
    property: {
      findUnique: async () => ({
        id: 'prop-4',
        showInWebsite: true,
        isBestProperty: false,
      }),
      count: async () => 3, // Already 3 best properties exist!
    },
  }

  const c = {
    get: (key) => {
      if (key === 'prisma') return prisma
      if (key === 'user') return { id: 'partner-1' }
      return null
    },
    req: {
      param: (p) => (p === 'id' ? 'prop-4' : null),
      valid: () => ({ isBestProperty: true }),
    },
    json: (body, status = 200) => ({ body, status }),
  }

  const res = await crmProperty.updatePropertyWebsiteSettingsController(c)
  assert.equal(res.status, 400)
  assert.equal(res.body.success, false)
  assert.equal(res.body.code, 'BEST_PROPERTIES_LIMIT_EXCEEDED')
})

test('updatePropertyWebsiteSettingsController auto-publishes to website when marked as best property', async () => {
  const { crmProperty } = loadControllers()

  let updatePayload = null
  const prisma = {
    user: {
      findUnique: async () => ({ id: 'partner-1' }),
    },
    property: {
      findUnique: async () => ({
        id: 'prop-1',
        showInWebsite: false,
        isBestProperty: false,
      }),
      count: async () => 1, // Only 1 exists, so 2nd is allowed
      update: async ({ data }) => {
        updatePayload = data
        return {
          id: 'prop-1',
          ...data,
          media: [],
          owner: null,
          broker: null,
          sourcePartner: { id: 'partner-1', name: 'Partner', email: 'partner@example.com' },
        }
      },
    },
    propertyAuditLog: {
      create: async () => ({ id: 'log-1' }),
    },
  }

  const c = {
    get: (key) => {
      if (key === 'prisma') return prisma
      if (key === 'user') return { id: 'partner-1' }
      return null
    },
    req: {
      param: (p) => (p === 'id' ? 'prop-1' : null),
      valid: () => ({ isBestProperty: true }),
    },
    json: (body, status = 200) => ({ body, status }),
  }

  const res = await crmProperty.updatePropertyWebsiteSettingsController(c)
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(updatePayload.isBestProperty, true)
  assert.equal(updatePayload.showInWebsite, true) // Automatically set to true!
})

test('updatePropertyWebsiteSettingsController auto-resets best property when unpublished from website', async () => {
  const { crmProperty } = loadControllers()

  let updatePayload = null
  const prisma = {
    user: {
      findUnique: async () => ({ id: 'partner-1' }),
    },
    property: {
      findUnique: async () => ({
        id: 'prop-1',
        showInWebsite: true,
        isBestProperty: true,
      }),
      count: async () => 0,
      update: async ({ data }) => {
        updatePayload = data
        return {
          id: 'prop-1',
          ...data,
          media: [],
          owner: null,
          broker: null,
          sourcePartner: { id: 'partner-1', name: 'Partner', email: 'partner@example.com' },
        }
      },
    },
    propertyAuditLog: {
      create: async () => ({ id: 'log-1' }),
    },
  }

  const c = {
    get: (key) => {
      if (key === 'prisma') return prisma
      if (key === 'user') return { id: 'partner-1' }
      return null
    },
    req: {
      param: (p) => (p === 'id' ? 'prop-1' : null),
      valid: () => ({ showInWebsite: false }),
    },
    json: (body, status = 200) => ({ body, status }),
  }

  const res = await crmProperty.updatePropertyWebsiteSettingsController(c)
  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(updatePayload.showInWebsite, false)
  assert.equal(updatePayload.isBestProperty, false) // Automatically reset!
})
