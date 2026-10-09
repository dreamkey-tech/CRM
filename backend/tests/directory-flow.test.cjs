const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path'), { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')
function load(relative) {
  const cache = new Map()
  function read(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }; cache.set(filename, module)
    new Function('require', 'module', 'exports', transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code)(name => name.endsWith('.json') ? JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), name), 'utf8')) : name.startsWith('.') ? read(path.resolve(path.dirname(filename), name + '.ts')) : require(name), module, module.exports)
    return module.exports
  }
  return read(path.resolve(__dirname, '../src', relative))
}
const ownerSchemas = load('zod/owner.ts'), brokerSchemas = load('zod/broker.ts'), propertySchemas = load('zod/property.ts')
const userId = '22222222-2222-4222-8222-222222222222'
const ownerId = '33333333-3333-4333-8333-333333333333'
const brokerId = '44444444-4444-4444-8444-444444444444'
const listing = { societyBuildingName: 'Test Society', locationArea: 'Mumbai', pincode: '400001', askingPrice: 1000000, carpetAreaSqFt: 500 }
function context(prisma, body, user = { id: userId }) { return { get: name => name === 'prisma' ? prisma : user, req: { valid: () => body, param: () => ownerId }, json: (body, status = 200) => ({ body, status }) } }

test('partial updates preserve every omitted field rather than applying creation defaults', () => {
  for (const schema of [ownerSchemas.updateOwnerSchema, brokerSchemas.updateBrokerSchema, propertySchemas.updatePropertySchema]) {
    assert.deepEqual(schema.parse({ notes: 'Changed notes' }), { notes: 'Changed notes' })
    assert.deepEqual(schema.parse({}), {})
  }
})
test('owner phone is required and creator attribution is never accepted from request data', () => {
  assert.equal(ownerSchemas.createOwnerSchema.safeParse({ name: 'Test Owner' }).success, false)
  const owner = ownerSchemas.createOwnerSchema.parse({ name: 'Test Owner', phone: '9876543210', createdById: brokerId })
  assert.equal(owner.status, 'ACTIVE'); assert.equal(owner.createdById, undefined)
})
test('published listings require exactly the contact matching their source', () => {
  assert.equal(propertySchemas.createPropertySchema.safeParse(listing).success, false)
  assert.equal(propertySchemas.createPropertySchema.safeParse({ ...listing, accessType: 'DIRECT', ownerId }).success, true)
  assert.equal(propertySchemas.createPropertySchema.safeParse({ ...listing, accessType: 'BROKER', brokerId }).success, true)
  assert.equal(propertySchemas.createPropertySchema.safeParse({ ...listing, ownerId, brokerId }).success, false)
  assert.equal(propertySchemas.createPropertyDraftSchema.safeParse({}).success, true)
  assert.equal(propertySchemas.createPropertyDraftSchema.safeParse({ ownerId, brokerId }).success, false)
})
test('broker maximum budget is no longer accepted or sortable', () => {
  assert.equal(brokerSchemas.createBrokerSchema.parse({ name: 'Broker', maxDealValue: 100 }).maxDealValue, undefined)
  assert.equal(brokerSchemas.brokerQuerySchema.safeParse({ sortBy: 'maxDealValue' }).success, false)
})
test('owner creation uses the authenticated user as creator and default partner', async () => {
  let saved
  const prisma = { user: { findFirst: async () => ({ id: userId }) }, owner: { create: async ({ data }) => { saved = data; return { id: ownerId, ...data } } } }
  const body = ownerSchemas.createOwnerSchema.parse({ name: 'Test Owner', phone: '9876543210', createdById: brokerId })
  const result = await load('controllers/owner.controller.ts').createOwnerController(context(prisma, body))
  assert.equal(result.status, 201); assert.equal(saved.createdById, userId); assert.equal(saved.primaryContactPartnerId, userId)
})
test('owner creation requires authentication and honors an explicitly unassigned partner', async () => {
  const controller = load('controllers/owner.controller.ts')
  await assert.rejects(() => controller.createOwnerController(context({}, {}, null)), error => error.statusCode === 401)
  let saved
  const prisma = { owner: { create: async ({ data }) => { saved = data; return data } } }
  await controller.createOwnerController(context(prisma, { name: 'Owner', phone: '9876543210', status: 'ACTIVE', primaryContactPartnerId: null }))
  assert.equal(saved.primaryContactPartnerId, null); assert.equal(saved.createdById, userId)
})
test('invalid primary partner produces a field error', async () => {
  const controller = load('controllers/owner.controller.ts')
  await assert.rejects(() => controller.createOwnerController(context({ user: { findFirst: async () => null } }, { primaryContactPartnerId: brokerId })), error => error.statusCode === 400 && error.details[0].field === 'primaryContactPartnerId')
})
test('changing listing source clears the previous contact automatically', async () => {
  const controller = load('controllers/property.controller.ts')
  const existing = { id: ownerId, ...listing, ownerId, accessType: 'DIRECT', isDraft: false, availabilityDate: null }
  let saved
  const prisma = { user: { findUnique: async () => ({ id: userId }) }, broker: { findUnique: async () => ({ id: brokerId }) }, property: { findUnique: async () => existing, update: async ({ data }) => { saved = data; return { ...existing, ...data } } }, propertyAuditLog: { create: async () => ({}) } }
  const result = await controller.updatePropertyController(context(prisma, { accessType: 'BROKER', brokerId }))
  assert.equal(result.status, 200); assert.equal(saved.ownerId, null); assert.equal(saved.brokerId, brokerId)
})
test('a contact mismatching the existing listing source is rejected without writes', async () => {
  const controller = load('controllers/property.controller.ts')
  const prisma = { user: { findUnique: async () => ({ id: userId }) }, owner: { findUnique: async () => ({ id: ownerId }) }, property: { findUnique: async () => ({ ...listing, accessType: 'BROKER', brokerId, isDraft: false }) } }
  assert.equal((await controller.updatePropertyController(context(prisma, { ownerId }))).status, 400)
})
