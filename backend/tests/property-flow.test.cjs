const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

// Run the actual TypeScript controllers with in-memory DB/storage boundaries.
function loadController(storage = {}) {
  const cache = new Map()
  const r2 = {
    verifyR2Object: async () => true,
    getR2PublicUrl: (_, key) => `https://media.example.com/${key}`,
    deleteR2Object: async () => true,
    deleteR2Objects: async () => true,
    ...storage,
  }
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const code = transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code
    new Function('require', 'module', 'exports', code)((name) => {
      if (name === '../lib/r2') return r2
      if (!name.startsWith('.')) return require(name)
      const resolved = path.resolve(path.dirname(filename), name)
      return name.endsWith('.json') ? JSON.parse(fs.readFileSync(resolved, 'utf8')) : load(`${resolved}.ts`)
    }, module, module.exports)
    return module.exports
  }
  return load(path.resolve(__dirname, '../src/controllers/property.controller.ts'))
}
const propertyId = '11111111-1111-4111-8111-111111111111'
const partner = { id: '22222222-2222-4222-8222-222222222222' }
function context(prisma, body, params = { id: propertyId }) {
  prisma.user = { findUnique: async () => partner, findFirst: async () => partner }
  prisma.propertyAuditLog ||= { create: async () => ({}) }
  return {
    env: {}, get: (name) => name === 'prisma' ? prisma : partner,
    req: { valid: () => body, json: async () => body, param: (name) => name ? params[name] : params },
    json: (body, status = 200) => ({ body, status }),
  }
}
const mediaInput = { category: 'PHOTOGRAPH', key: `properties/${propertyId}/photograph/image.jpg`,
  url: 'https://untrusted.example.com/image.jpg', mimeType: 'image/jpeg', sizeBytes: 100 }

test('draft keeps its requested ID and repeated requests reuse it', async () => {
  let stored, creates = 0
  const prisma = { property: {
    findUnique: async () => stored || null,
    create: async ({ data }) => { creates++; return stored = { ...data, media: [] } },
  } }
  const controller = loadController()
  const c = context(prisma, { id: propertyId })
  assert.equal((await controller.createPropertyDraftController(c)).body.property.id, propertyId)
  assert.equal((await controller.createPropertyDraftController(c)).body.property.id, propertyId)
  assert.equal(creates, 1)
})

test('publishing updates the same draft instead of creating another property', async () => {
  let updatedId
  const existing = { id: propertyId, isDraft: true, societyBuildingName: 'Test Society', locationArea: 'Mumbai',
    pincode: '400001', carpetAreaSqFt: 500, askingPrice: 1000000, accessType: 'DIRECT', availabilityDate: null }
  const c = context({ property: { findUnique: async () => existing,
    update: async ({ where, data }) => { updatedId = where.id; return { ...existing, ...data } } } }, { isDraft: false })
  const result = await loadController().updatePropertyController(c)
  assert.equal(result.status, 200)
  assert.equal(updatedId, propertyId)
  assert.equal(result.body.property.isDraft, false)
})

test('incomplete draft cannot be published', async () => {
  const c = context({ property: { findUnique: async () => ({ id: propertyId, askingPrice: 0, carpetAreaSqFt: 0 }) } }, { isDraft: false })
  assert.equal((await loadController().updatePropertyController(c)).status, 400)
})

test('attachment retries return the same media without duplicate records', async () => {
  let record, creates = 0
  const prisma = { property: { findUnique: async () => ({ id: propertyId }) }, propertyMedia: {
    count: async () => record ? 1 : 0,
    findFirst: async ({ where }) => where.key ? record : null,
    create: async ({ data }) => { creates++; return record = { id: 'media-1', ...data } },
  } }
  const controller = loadController()
  const c = context(prisma, { media: [mediaInput] })
  const first = await controller.attachPropertyMediaController(c)
  const second = await controller.attachPropertyMediaController(c)
  assert.equal(first.status, 200)
  assert.equal(second.body.media[0].id, first.body.media[0].id)
  assert.equal(creates, 1)
  assert.equal(record.url, `https://media.example.com/${mediaInput.key}`)
  assert.equal(record.isCover, true)
})

test('attachment rejects a key belonging to another property', async () => {
  const c = context({ property: { findUnique: async () => ({ id: propertyId }) }, propertyMedia: { count: async () => 0 } },
    { media: [{ ...mediaInput, key: 'properties/another-property/image.jpg' }] })
  assert.equal((await loadController().attachPropertyMediaController(c)).status, 400)
})

test('attachment rejects an object with mismatching storage metadata', async () => {
  const c = context({ property: { findUnique: async () => ({ id: propertyId }) },
    propertyMedia: { count: async () => 0, findFirst: async () => null } }, { media: [mediaInput] })
  assert.equal((await loadController({ verifyR2Object: async () => false }).attachPropertyMediaController(c)).status, 400)
})

test('failed R2 deletion preserves the database media record', async () => {
  let deleted = false
  const c = context({ propertyMedia: { findFirst: async () => mediaInput, delete: async () => { deleted = true } } }, {},
    { id: propertyId, mediaId: 'media-1' })
  assert.equal((await loadController({ deleteR2Object: async () => false }).deletePropertyMediaController(c)).status, 502)
  assert.equal(deleted, false)
})

test('failed R2 batch deletion preserves the property', async () => {
  let deleted = false
  const c = context({ property: { findUnique: async () => ({ media: [mediaInput] }), delete: async () => { deleted = true } } }, {})
  assert.equal((await loadController({ deleteR2Objects: async () => false }).deletePropertyController(c)).status, 502)
  assert.equal(deleted, false)
})

test('discard cannot delete an already attached file', async () => {
  const c = context({ propertyMedia: { findFirst: async () => ({ id: 'media-1' }) } }, { key: mediaInput.key })
  assert.equal((await loadController().discardPropertyUploadController(c)).status, 409)
})

test('presigning refuses a nonexistent property', async () => {
  const c = context({ property: { findUnique: async () => null } }, { propertyId, files: [] })
  assert.equal((await loadController().generatePropertyUploadUrlsController(c)).status, 404)
})
