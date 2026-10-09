const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path'), { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')
const root = path.resolve(__dirname, '../..')
function loader(stubs = {}) {
  const cache = new Map()
  const read = filename => {
    if (stubs[filename]) return stubs[filename]
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }; cache.set(filename, module)
    const req = createRequire(filename)
    new Function('require', 'module', 'exports', transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code)(name => name.endsWith('.json') ? JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), name), 'utf8')) : name.startsWith('.') ? read(path.resolve(path.dirname(filename), name + '.ts')) : req(name), module, module.exports)
    return module.exports
  }
  return relative => read(path.resolve(root, relative))
}
const load = loader(), controller = load('backend/src/controllers/client.controller.ts'), sharing = load('backend/src/lib/client-sharing.ts'), documents = load('backend/src/lib/client-documents.ts'), schema = load('backend/src/zod/client.ts')
const userId = '22222222-2222-4222-8222-222222222222', clientId = '33333333-3333-4333-8333-333333333333', propertyId = '44444444-4444-4444-8444-444444444444', otherUser = '55555555-5555-4555-8555-555555555555'
const property = { id: propertyId, societyBuildingName: 'Test Society', propertyType: 'FLAT', locationArea: 'New Town', city: 'Kolkata', pricingType: 'SALE', askingPrice: 5000000, carpetAreaSqFt: 1000, superBuiltUpAreaSqFt: null, bedrooms: 3, bathrooms: 2, balconies: null, floorNumber: 5, totalFloors: 15, amenities: [], notes: 'PRIVATE NOTE', ownerId: otherUser, brokerId: otherUser, sourcePartnerId: userId }
function context(db, body = {}, params = {}) { return { get: key => key === 'prisma' ? db : { id: userId }, env: { FRONTEND_URL: 'http://localhost:3000' }, req: { valid: () => body, param: key => ({ id: clientId, ...params })[key], query: () => ({}) }, header: () => {}, json: (body, status = 200) => ({ body, status }) } }

test('client creator and assignment actors come from authentication; inactive partners rejected', async () => {
  let saved
  const db = { user: { count: async () => 2 }, client: { create: async ({ data }) => { saved = data; return { id: clientId, ...data } } } }
  await controller.createClientController(context(db, schema.createClientSchema.parse({ name: 'Client', phone: '9876543210', assignedPartnerIds: [userId, otherUser] })))
  assert.equal(saved.createdById, userId)
  assert.deepEqual(saved.assignedPartners.create, [{ partnerId: userId, assignedById: userId }, { partnerId: otherUser, assignedById: userId }])
  db.user.count = async () => 1
  await assert.rejects(() => controller.createClientController(context(db, { name: 'Client', phone: '9876543210', assignedPartnerIds: [userId, otherUser] })), error => error.statusCode === 400 && error.code === 'INVALID_PARTNERS')
})
test('notes-only client edits preserve existing assignments; reassigning preserves remaining attribution', async () => {
  let data
  const db = { client: { findUnique: async () => ({ id: clientId }), update: async input => { data = input.data; return input.data } }, user: { count: async () => 1 } }
  await controller.updateClientController(context(db, schema.updateClientSchema.parse({ notes: 'Updated' })))
  assert.deepEqual(data, { notes: 'Updated' })
  await controller.updateClientController(context(db, { assignedPartnerIds: [otherUser] }))
  assert.deepEqual(data.assignedPartners.deleteMany, { partnerId: { notIn: [otherUser] } })
  assert.deepEqual(data.assignedPartners.upsert[0].update, {})
})
test('client deletion preserves sharing history and document records', async () => {
  const db = { client: { findUnique: async () => ({ id: clientId }), delete: async () => assert.fail('Must not delete') }, clientDocument: { count: async () => 1 }, clientPropertyShare: { count: async () => 0 } }
  await assert.rejects(() => controller.deleteClientController(context(db)), error => error.statusCode === 409 && error.code === 'CLIENT_HAS_HISTORY')
})
test('sharing snapshot strips contacts and internal details and accepts only selected photos/videos', () => {
  const snapshot = sharing.publicPropertySnapshot(property)
  for (const key of ['notes', 'ownerId', 'brokerId', 'sourcePartnerId', 'id']) assert.equal(key in snapshot, false)
  const photo = { id: userId, category: 'PHOTOGRAPH' }, video = { id: otherUser, category: 'VIDEO' }, document = { id: clientId, category: 'BROCHURE' }
  assert.deepEqual(sharing.selectShareMedia([photo, video, document], [otherUser, userId]), [video, photo])
  assert.throws(() => sharing.selectShareMedia([photo, video, document], [clientId]), /only photos and videos/)
  assert.throws(() => sharing.selectShareMedia([photo], [otherUser]), /only photos and videos/)
  const token = sharing.randomShareToken(); assert.match(token, /^[a-f0-9]{64}$/); assert.notEqual(token, sharing.randomShareToken())
})
test('public share response never exposes private share/client data or unselected media', async () => {
  const share = { propertyId, propertySnapshot: sharing.publicPropertySnapshot(property), recipient: 'PRIVATE EMAIL', message: 'PRIVATE MESSAGE', createdById: userId, clientId, selectedMediaSnapshot: [{ title: 'PRIVATE HISTORY' }], selectedMedia: [], shortlistedProperty: { property: { isDraft: false, isArchived: false, availabilityStatus: 'AVAILABLE' } } }
  const db = { clientPropertyShare: { findUnique: async () => share } }
  const result = await controller.publicClientShareController(context(db, {}, { token: 'a'.repeat(64) }))
  assert.deepEqual(Object.keys(result.body).sort(), ['success', 'property', 'availabilityStatus', 'media', 'company', 'contact'].sort())
  assert.equal(JSON.stringify(result.body).includes('PRIVATE'), false)
  assert.deepEqual(result.body.media, [])
  for (const change of [{ revokedAt: new Date() }, { expiresAt: new Date(Date.now() - 1000) }, { shortlistedProperty: { property: { isArchived: true } } }]) {
    db.clientPropertyShare.findUnique = async () => ({ ...share, ...change })
    await assert.rejects(() => controller.publicClientShareController(context(db)), error => error.statusCode === 410)
  }
})
test('composer reopening never downgrades sent status and confirmation does not downgrade visit feedback', async () => {
  const calls = [], share = { id: otherUser, clientId, shortlistedPropertyId: propertyId, status: 'SENT_CONFIRMED', publicToken: 'a'.repeat(64) }
  const tx = { clientPropertyShare: { updateMany: async args => { calls.push(args); return { count: 0 } } }, clientShortlistedProperty: { updateMany: async args => { calls.push(args); return { count: 0 } } } }
  const db = { clientPropertyShare: { findFirst: async () => share, findUniqueOrThrow: async () => share }, $transaction: async callback => callback(tx) }
  await controller.updateClientShareStatusController(context(db, { status: 'COMPOSER_OPENED' }, { shareId: otherUser }))
  assert.deepEqual(calls[0].where.status.in, ['PREPARED'])
  calls.length = 0
  await controller.updateClientShareStatusController(context(db, { status: 'SENT_CONFIRMED' }, { shareId: otherUser }))
  assert.equal(calls[1].where.status, 'SHORTLISTED')
})
test('document keys cannot cross client/category boundaries; real signatures are checked', () => {
  const key = `clients/${clientId}/documents/AADHAAR/${userId}.pdf`
  documents.validateClientDocumentKey(clientId, key, 'AADHAAR')
  assert.throws(() => documents.validateClientDocumentKey(otherUser, key), /does not belong/)
  assert.throws(() => documents.validateClientDocumentKey(clientId, key, 'KYC'), /does not belong/)
  assert.throws(() => documents.validateClientDocumentKey(clientId, `clients/${clientId}/documents/AADHAAR/../../secret.pdf`), /does not belong/)
  assert.equal(documents.matchesDocumentSignature(Buffer.from('%PDF-1.4\n'), 'application/pdf'), true)
  assert.equal(documents.matchesDocumentSignature(Buffer.from('<script>'), 'application/pdf'), false)
  assert.equal(documents.matchesDocumentSignature(Buffer.from([137,80,78,71,13,10,26,10]), 'image/png'), true)
  assert.equal(documents.matchesDocumentSignature(Buffer.from([255,216,255]), 'image/jpeg'), true)
  assert.equal(documents.matchesDocumentSignature(Buffer.from('RIFF0000WEBP'), 'image/webp'), true)
})
test('Zustand cache deduplicates in-flight requests, updates related views, and clears across users', async () => {
  const { create } = createRequire(path.join(root, 'frontend/package.json'))('zustand')
  const auth = create(() => ({ user: { id: userId } }))
  const loadStore = loader({ [path.join(root, 'frontend/store/useAuthStore.ts')]: { useAuthStore: auth }, [path.join(root, 'frontend/api/clients.ts')]: {} })
  const { useClientStore: store } = loadStore('frontend/store/useClientStore.ts')
  let resolve, calls = 0
  const request = () => { calls++; return new Promise(done => { resolve = done }) }
  const first = store.getState().fetch('test', request), second = store.getState().fetch('test', request)
  resolve({ count: 1 }); assert.deepEqual(await first, await second); assert.equal(calls, 1)
  await store.getState().fetch('test', request); assert.equal(calls, 1)
  store.setState({ cache: { 'detail:client': { data: { shares: [], documents: [], shortlistedProperties: [{ id: 'shortlist', status: 'VISITED' }] }, expiresAt: Date.now() + 60000 }, 'list:cached': { data: { clients: [{ id: 'client', _count: {} }] }, expiresAt: Date.now() + 60000 } } })
  store.getState().shareChanged('client', { id: 'share', shortlistedPropertyId: 'shortlist', status: 'SENT_CONFIRMED' })
  assert.equal(store.getState().cache['detail:client'].data.shortlistedProperties[0].status, 'VISITED')
  store.getState().documentChanged('client', { id: 'doc' })
  assert.equal(store.getState().cache['list:cached'].data.clients[0]._count.documents, 1)
  const pending = store.getState().fetch('late', request)
  auth.setState({ user: { id: otherUser } }); resolve({ private: true }); await pending
  assert.deepEqual(store.getState().cache, {})
})
test('editable templates escape composer URLs and always include the saved property link', () => {
  const templates = load('frontend/templates/client-property-message.ts')
  const message = templates.buildClientPropertyMessage('Amit & Family', sharing.publicPropertySnapshot(property), 'Jeet', 'WHATSAPP')
  assert(message.includes('{{propertyLink}}')); assert(message.includes('Amit & Family')); assert(!message.includes('PRIVATE'))
  const url = templates.propertyComposerUrl({ channel: 'WHATSAPP', recipient: '919876543210', subject: null, message: 'Hello & welcome', publicUrl: 'https://example.com/share/token' })
  const parsed = new URL(url); assert.equal(parsed.searchParams.get('text'), 'Hello & welcome\n\nhttps://example.com/share/token')
  assert(templates.propertyComposerUrl({ channel: 'EMAIL', recipient: 'user@example.com', subject: 'Test & Property', message: 'Hi', publicUrl: 'https://example.com/share/token' }).startsWith('mailto:'))
})
