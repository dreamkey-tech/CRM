const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

const root = path.resolve(__dirname, '../..')
const cache = new Map()
function load(relative) {
  const filename = path.resolve(root, relative)
  if (cache.has(filename)) return cache.get(filename).exports
  const module = { exports: {} }
  cache.set(filename, module)
  const localRequire = createRequire(filename)
  const requireModule = (name) => {
    if (name.endsWith('.json')) return JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), name), 'utf8'))
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(filename), name + '.ts')))
    return localRequire(name)
  }
  new Function('require', 'module', 'exports', transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code)(requireModule, module, module.exports)
  return module.exports
}
const backend = load('backend/src/zod/client.ts')
const frontend = load('frontend/zod/client.ts')
const media = load('backend/src/config/media-config.ts')
const partner = '22222222-2222-4222-8222-222222222222'
const property = '33333333-3333-4333-8333-333333333333'
const client = { name: 'Test Client', phone: '9876543210' }
const form = { ...client, email: '', whatsappNumber: '', address: '', notes: '', status: 'ACTIVE', assignedPartnerIds: [partner] }
const document = { category: 'AADHAAR', title: '', originalName: 'identity.pdf', mimeType: 'application/pdf', sizeBytes: 1024 }

test('simple client creation and form agree; attribution is server controlled', () => {
  assert.deepEqual(backend.createClientSchema.parse(client), { ...client, status: 'ACTIVE', assignedPartnerIds: [] })
  assert.equal(frontend.clientFormSchema.safeParse(form).success, true)
  assert.equal(backend.createClientSchema.safeParse(form).success, true)
  for (const field of ['createdById', 'createdAt', 'primaryContactPartnerId']) {
    assert.equal(backend.createClientSchema.safeParse({ ...client, [field]: partner }).success, false)
  }
  assert.equal(backend.createClientSchema.safeParse({ name: 'Client' }).success, false)
})

test('client edits preserve omitted status and assignments; mine filter uses assignment semantics', () => {
  assert.deepEqual(backend.updateClientSchema.parse({ notes: 'Changed' }), { notes: 'Changed' })
  assert.deepEqual(backend.updateClientSchema.parse({}), {})
  assert.deepEqual(backend.updateClientSchema.parse({ assignedPartnerIds: [] }), { assignedPartnerIds: [] })
  assert.equal(backend.clientQuerySchema.parse({ scope: 'MINE' }).scope, 'MINE')
  assert.equal(backend.clientQuerySchema.safeParse({ scope: 'MINE', createdById: partner }).success, false)
})

test('multiple partners are supported but duplicates and invalid partners are rejected', () => {
  assert.equal(backend.assignClientPartnersSchema.safeParse({ assignedPartnerIds: [partner, property] }).success, true)
  for (const assignedPartnerIds of [[partner, partner], ['invalid']]) {
    assert.equal(backend.assignClientPartnersSchema.safeParse({ assignedPartnerIds }).success, false)
    assert.equal(frontend.clientFormSchema.safeParse({ ...form, assignedPartnerIds }).success, false)
  }
})

test('both sides reject invalid contact details and allow optional email/WhatsApp', () => {
  for (const change of [{ phone: '123' }, { email: 'invalid' }, { whatsappNumber: '123' }, { name: ' ' }]) {
    assert.equal(backend.createClientSchema.safeParse({ ...form, ...change }).success, false)
    assert.equal(frontend.clientFormSchema.safeParse({ ...form, ...change }).success, false)
  }
  assert.equal(backend.createClientSchema.safeParse({ ...client, email: null, whatsappNumber: null }).success, true)
})

test('document rules match on both sides and each category permits PDFs and images only', () => {
  const frontConfig = JSON.parse(fs.readFileSync(path.join(root, 'frontend/config/client-media.json'), 'utf8'))
  assert.deepEqual(frontConfig, media.CLIENT_MEDIA_CONFIG)
  assert.equal(frontConfig.client.storage, 'PRIVATE')
  for (const rule of frontConfig.client.documents) {
    for (const mimeType of ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']) {
      const file = { ...document, category: rule.category, mimeType, sizeBytes: rule.maxMb * 1024 * 1024 }
      assert.equal(backend.clientDocumentMetadataSchema.safeParse(file).success, true)
      assert.equal(frontend.clientDocumentFormSchema.safeParse(file).success, true)
    }
    for (const change of [{ mimeType: 'video/mp4' }, { mimeType: 'image/svg+xml' }, { sizeBytes: 0 }, { sizeBytes: rule.maxMb * 1024 * 1024 + 1 }]) {
      const file = { ...document, category: rule.category, ...change }
      assert.equal(backend.clientDocumentMetadataSchema.safeParse(file).success, false)
      assert.equal(frontend.clientDocumentFormSchema.safeParse(file).success, false)
    }
  }
  assert.equal(backend.clientDocumentMetadataSchema.safeParse({ ...document, category: 'OTHER' }).success, false)
  assert.equal(backend.attachClientDocumentSchema.safeParse({ ...document, key: 'private-key', url: 'https://public.example/id.pdf' }).success, false)
  assert.equal(backend.generateClientDocumentUploadUrlsSchema.safeParse({ clientId: partner, files: Array(31).fill(document) }).success, false)
})

test('sharing validates selections and never accepts client-controlled public tokens or snapshots', () => {
  const share = { shortlistedPropertyId: property, channel: 'WHATSAPP', subject: '', message: 'Hello, please view this property.', selectedMediaIds: [partner], expiresAt: null }
  assert.equal(backend.createClientPropertyShareSchema.safeParse(share).success, true)
  assert.equal(frontend.clientPropertyShareFormSchema.safeParse(share).success, true)
  for (const change of [{ message: ' ' }, { selectedMediaIds: [partner, partner] }, { publicToken: 'guessable' }, { propertySnapshot: { notes: 'private' } }, { recipient: 'someone-else' }, { status: 'SENT_CONFIRMED' }]) {
    assert.equal(backend.createClientPropertyShareSchema.safeParse({ ...share, ...change }).success, false)
  }
  assert.equal(backend.updateClientShareStatusSchema.safeParse({ status: 'DELIVERED' }).success, false)
  assert.equal(backend.updateClientShareStatusSchema.safeParse({ status: 'COMPOSER_OPENED' }).success, true)
})

test('public listing snapshots reject private CRM details', () => {
  const snapshot = { societyBuildingName: 'Test Society', propertyType: 'FLAT', locationArea: 'New Town', city: 'Kolkata', pricingType: 'SALE', askingPrice: 5000000, carpetAreaSqFt: 1000, superBuiltUpAreaSqFt: null, bedrooms: 3, bathrooms: 2, balconies: null, floorNumber: 5, totalFloors: 15, amenities: [] }
  assert.equal(backend.publicPropertySnapshotSchema.safeParse(snapshot).success, true)
  for (const field of ['notes', 'owner', 'broker', 'client', 'documents', 'createdBy']) {
    assert.equal(backend.publicPropertySnapshotSchema.safeParse({ ...snapshot, [field]: 'private' }).success, false)
  }
})

test('migration constraints prevent assignment duplicates and cross-property/cross-client sharing', () => {
  const { Prisma } = require('@prisma/client')
  const model = (name) => Prisma.dmmf.datamodel.models.find((item) => item.name === name)
  const sql = fs.readFileSync(path.join(root, 'backend/prisma/migrations/20261009170000_clients_v1/migration.sql'), 'utf8')
  assert.match(sql, /PRIMARY KEY \("clientId","partnerId"\)/)
  assert.match(sql, /CREATE UNIQUE INDEX .* ON "client_shortlisted_properties"\("clientId", "propertyId"\)/)
  assert.match(sql, /FOREIGN KEY \("shortlistedPropertyId", "clientId", "propertyId"\) REFERENCES "client_shortlisted_properties"\("id", "clientId", "propertyId"\) ON DELETE RESTRICT/)
  assert.match(sql, /FOREIGN KEY \("propertyMediaId", "propertyId"\) REFERENCES "property_media"\("id", "propertyId"\)/)
  assert.match(sql, /FOREIGN KEY \("shareId", "propertyId"\) REFERENCES "client_property_shares"\("id", "propertyId"\)/)
  assert.equal(model('ClientDocument').fields.some((field) => field.name === 'url'), false)
  assert.match(sql, /ALTER TABLE "client_documents" .*FOREIGN KEY \("clientId"\) REFERENCES "clients"\("id"\) ON DELETE RESTRICT/)
  assert.equal(model('ClientPropertyShare').fields.some((field) => field.name === 'selectedMediaSnapshot'), true)
  for (const [enumName, schema] of [['ClientStatus', 'clientStatusSchema'], ['ClientShortlistStatus', 'clientShortlistStatusSchema'], ['ClientShareStatus', 'clientShareStatusSchema'], ['ClientShareChannel', 'clientShareChannelSchema'], ['ClientDocumentCategory', 'clientDocumentCategorySchema']]) {
    const values = Object.values(require('@prisma/client')[enumName])
    assert.deepEqual(backend[schema].options, values)
    assert.deepEqual(frontend[schema].options, values)
  }
})
