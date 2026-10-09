const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { createRequire } = require('node:module'), { randomUUID } = require('node:crypto')
const root = path.resolve(__dirname, '../..'), req = createRequire(root + '/package.json')
if (process.env.RUN_LIVE_API_TESTS !== '1') throw Error('Set RUN_LIVE_API_TESTS=1 to test the configured development database and R2 bucket.')
const env = req('dotenv').parse(fs.readFileSync(root + '/.dev.vars'))
const esbuild = createRequire(req.resolve('wrangler/package.json'))('esbuild')
const bundle = esbuild.buildSync({ entryPoints: [root + '/src/index.ts'], bundle: true, platform: 'node', format: 'cjs', packages: 'external', write: false }).outputFiles[0].text
const mod = { exports: {} }; new Function('require', 'module', 'exports', bundle)(req, mod, mod.exports); const app = mod.exports.default
const dbmod = { exports: {} }; new Function('require', 'module', 'exports', esbuild.transformSync(fs.readFileSync(root + '/src/db.ts', 'utf8'), { loader: 'ts', format: 'cjs' }).code)(req, dbmod, dbmod.exports)
const db = dbmod.exports.getPrisma(env.DATABASE_URL)
const { S3Client, PutObjectCommand, DeleteObjectCommand } = req('@aws-sdk/client-s3')
const storage = new S3Client({ region: 'auto', endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY } })
const objects = [], ids = { users: [], clients: [], owners: [], properties: [] }, tokens = [randomUUID(), randomUUID()]; let checks = 0
async function call(method, route, body, status = 200, auth = 0) {
  const response = await app.request('http://localhost/v1' + route, { method, headers: { 'Content-Type': 'application/json', ...(auth === false ? {} : { Cookie: `auth_session=${tokens[auth]}` }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, env)
  const data = await response.json(); assert.equal(response.status, status, `${method} ${route}: ${data.error || 'unexpected response'}`); checks++; return data
}
async function cleanup() {
  for (const object of objects) await storage.send(new DeleteObjectCommand(object))
  await db.clientPropertyShare.deleteMany({ where: { clientId: { in: ids.clients } } })
  await db.clientDocument.deleteMany({ where: { clientId: { in: ids.clients } } })
  await db.client.deleteMany({ where: { id: { in: ids.clients } } })
  await db.property.deleteMany({ where: { id: { in: ids.properties } } })
  await db.owner.deleteMany({ where: { id: { in: ids.owners } } })
  await db.user.deleteMany({ where: { id: { in: ids.users } } })
  await db.$disconnect(); console.log('Disposable client API records and R2 objects cleaned up.')
}
async function main() { try {
  for (let i = 0; i < 2; i++) {
    const user = await db.user.create({ data: { email: `codex-client-${randomUUID()}@example.invalid`, name: `Client Test Partner ${i}`, passwordHash: 'unusable' } }); ids.users.push(user.id)
    await db.session.create({ data: { userId: user.id, token: tokens[i], expiresAt: new Date(Date.now() + 900000) } })
  }
  const inactive = await db.user.create({ data: { email: `codex-client-${randomUUID()}@example.invalid`, name: 'Inactive Partner', passwordHash: 'unusable', isActive: false } }); ids.users.push(inactive.id)
  await call('GET', '/clients', undefined, 401, false)
  await call('POST', '/clients', { name: 'Client', phone: '9876543210', createdById: inactive.id }, 400)
  await call('POST', '/clients', { name: 'Client', phone: '9876543210', assignedPartnerIds: [inactive.id] }, 400)
  let client = (await call('POST', '/clients', { name: 'Codex Client Flow', phone: '9876543210', email: 'buyer@example.invalid', assignedPartnerIds: ids.users.slice(0, 2), notes: 'PRIVATE CLIENT NOTE' }, 201)).client; ids.clients.push(client.id)
  assert.equal(client.createdById, ids.users[0]); assert.equal(client.assignedPartners.length, 2)
  assert((await call('GET', `/clients?scope=MINE&search=Codex%20Client%20Flow`, undefined, 200, 1)).clients.some(item => item.id === client.id))
  client = (await call('PATCH', `/clients/${client.id}`, { notes: 'PRIVATE UPDATED NOTE' })).client; assert.equal(client.assignedPartners.length, 2)
  await call('PUT', `/clients/${client.id}/partners`, { assignedPartnerIds: [ids.users[0]] })
  assert.equal((await call('GET', '/clients?scope=MINE&search=Codex%20Client%20Flow', undefined, 200, 1)).clients.some(item => item.id === client.id), false)
  await call('PUT', `/clients/${client.id}/partners`, { assignedPartnerIds: ids.users.slice(0, 2) })
  await call('GET', '/clients/stats'); await call('GET', '/clients/partners'); await call('GET', '/clients/not-a-uuid', undefined, 400)
  const owner = await db.owner.create({ data: { name: 'Codex Client Test Owner', phone: '9876543211', createdById: ids.users[0] } }); ids.owners.push(owner.id)
  const listing = { societyBuildingName: 'Codex Client Test Property', locationArea: 'New Town', city: 'Kolkata', pincode: '700156', carpetAreaSqFt: 1200, askingPrice: 9500000, ownerId: owner.id, sourcePartnerId: ids.users[0], notes: 'PRIVATE PROPERTY NOTE', amenities: ['Parking', 'Security'] }
  const property = await db.property.create({ data: listing }); ids.properties.push(property.id)
  const otherProperty = await db.property.create({ data: { ...listing, societyBuildingName: 'Codex Other Property' } }); ids.properties.push(otherProperty.id)
  const draft = await db.property.create({ data: { ...listing, societyBuildingName: 'Codex Draft Property', isDraft: true } }); ids.properties.push(draft.id)
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5WQAAAAASUVORK5CYII=', 'base64')
  const key = `properties/${property.id}/photograph/codex-test-${randomUUID()}.png`
  objects.push({ Bucket: env.R2_BUCKET_NAME, Key: key }); await storage.send(new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, Body: png, ContentType: 'image/png' }))
  const photo = await db.propertyMedia.create({ data: { propertyId: property.id, key, url: `${env.R2_PUBLIC_DOMAIN || env.R2_PUBLIC_URL}/${key}`, category: 'PHOTOGRAPH', mimeType: 'image/png', sizeBytes: png.length } })
  const unselected = await db.propertyMedia.create({ data: { propertyId: property.id, key: 'unused-test-key', url: 'https://example.invalid/unselected', category: 'PHOTOGRAPH', mimeType: 'image/png', sizeBytes: png.length } })
  const otherMedia = await db.propertyMedia.create({ data: { propertyId: otherProperty.id, key: 'unused-other', url: 'https://example.invalid/other', category: 'PHOTOGRAPH', mimeType: 'image/png', sizeBytes: 10 } })
  const brochure = await db.propertyMedia.create({ data: { propertyId: property.id, key: 'unused-brochure', url: 'https://example.invalid/brochure', category: 'BROCHURE', mimeType: 'application/pdf', sizeBytes: 10 } })
  await call('GET', '/clients/property-options?search=Codex%20Client%20Test')
  await call('POST', `/clients/${client.id}/shortlist`, { propertyId: draft.id }, 400)
  const shortlist = (await call('POST', `/clients/${client.id}/shortlist`, { propertyId: property.id, notes: 'PRIVATE SHORTLIST NOTE' }, 201)).shortlist
  assert.equal((await call('POST', `/clients/${client.id}/shortlist`, { propertyId: property.id }, 201)).shortlist.id, shortlist.id)
  assert.equal(shortlist.addedById, ids.users[0])
  const sharePayload = { shortlistedPropertyId: shortlist.id, channel: 'WHATSAPP', message: 'Hi buyer, view {{propertyLink}}', selectedMediaIds: [photo.id] }
  await call('POST', `/clients/${client.id}/shares`, { ...sharePayload, selectedMediaIds: [otherMedia.id] }, 400)
  await call('POST', `/clients/${client.id}/shares`, { ...sharePayload, selectedMediaIds: [brochure.id] }, 400)
  await call('POST', `/clients/${client.id}/shares`, { ...sharePayload, expiresAt: new Date(Date.now() - 1000).toISOString() }, 400)
  let share = (await call('POST', `/clients/${client.id}/shares`, sharePayload, 201)).share
  assert.equal(share.createdById, ids.users[0]); assert.equal(share.recipient, '919876543210'); assert(share.message.includes(share.publicUrl)); assert(!('publicToken' in share))
  const token = share.publicUrl.split('/').pop()
  let publicData = await call('GET', `/public/property-shares/${token}`, undefined, 200, false)
  assert.equal(publicData.media.length, 1); assert.equal(publicData.media[0].propertyMediaId, photo.id); assert(!JSON.stringify(publicData).includes('PRIVATE'))
  for (const field of ['clientId', 'recipient', 'message', 'createdById', 'ownerId', 'brokerId', 'documents', 'notes']) assert(!JSON.stringify(publicData).includes(`"${field}"`))
  const get = await fetch(publicData.media[0].url); assert.equal(get.status, 200); checks++
  await call('PATCH', `/clients/${client.id}/shares/${share.id}/status`, { status: 'COMPOSER_OPENED' })
  share = (await call('PATCH', `/clients/${client.id}/shares/${share.id}/status`, { status: 'SENT_CONFIRMED' })).share; assert(share.sentConfirmedAt)
  share = (await call('PATCH', `/clients/${client.id}/shares/${share.id}/status`, { status: 'COMPOSER_OPENED' })).share; assert.equal(share.status, 'SENT_CONFIRMED')
  await call('PATCH', `/clients/${client.id}/shortlist/${shortlist.id}`, { status: 'VISITED', notes: 'PRIVATE VISIT FEEDBACK' })
  await call('PATCH', `/clients/${client.id}/shares/${share.id}/status`, { status: 'SENT_CONFIRMED' })
  assert.equal((await call('GET', `/clients/${client.id}`)).client.shortlistedProperties[0].status, 'VISITED')
  await call('DELETE', `/clients/${client.id}/shortlist/${shortlist.id}`, undefined, 409)
  const emailShare = (await call('POST', `/clients/${client.id}/shares`, { ...sharePayload, channel: 'EMAIL', subject: 'Property information' }, 201)).share; assert.equal(emailShare.recipient, 'buyer@example.invalid')
  const metadata = { category: 'AADHAAR', title: 'Disposable test document', originalName: 'codex-test.pdf', mimeType: 'application/pdf', sizeBytes: 40 }
  await call('POST', `/clients/${client.id}/documents/upload-urls`, { clientId: client.id, files: [{ ...metadata, mimeType: 'text/html' }] }, 400)
  const pdf = Buffer.from('%PDF-1.4\nDisposable client API test file\n')
  metadata.sizeBytes = pdf.length
  const signed = (await call('POST', `/clients/${client.id}/documents/upload-urls`, { clientId: client.id, files: [metadata] })).files[0]
  objects.push({ Bucket: env.R2_CLIENT_DOCUMENTS_BUCKET || env.R2_BUCKET_NAME, Key: signed.key })
  const put = await fetch(signed.uploadUrl, { method: 'PUT', headers: { 'Content-Type': metadata.mimeType }, body: pdf }); assert.equal(put.status, 200); checks++
  const document = (await call('POST', `/clients/${client.id}/documents`, { ...metadata, key: signed.key }, 201)).document
  assert.equal(document.uploadedById, ids.users[0]); assert(!('url' in document)); assert(!('key' in document))
  assert.equal((await call('POST', `/clients/${client.id}/documents`, { ...metadata, key: signed.key })).document.id, document.id)
  await call('POST', `/clients/${client.id}/documents`, { ...metadata, key: signed.key.replace(client.id, randomUUID()) }, 400)
  await call('DELETE', `/clients/${client.id}/documents/uploads`, { key: signed.key }, 409)
  await call('GET', `/clients/${client.id}/documents/${document.id}/download`, undefined, 401, false)
  const download = await call('GET', `/clients/${client.id}/documents/${document.id}/download`); assert.equal((await fetch(download.url)).status, 200); checks++
  const detail = (await call('GET', `/clients/${client.id}`)).client; assert.equal(detail.documents.length, 1); assert.equal(detail.shares.length, 2)
  await call('DELETE', `/clients/${client.id}`, undefined, 409)
  await call('DELETE', `/clients/${client.id}/documents/${document.id}`)
  await call('DELETE', `/clients/${client.id}/shares/${share.id}`)
  await call('GET', `/public/property-shares/${token}`, undefined, 410, false)
  const empty = (await call('POST', '/clients', { name: 'Codex Empty Client', phone: '9876543214' }, 201)).client; ids.clients.push(empty.id)
  await call('DELETE', `/clients/${empty.id}`)
  console.log(`Live client API/R2 checks passed: ${checks}. Assignments, shorts lists, public privacy, selected media, sharing outcomes, documents, and revocation verified.`)
} finally { await cleanup() } }
main().catch(error => { console.error(error.message); process.exitCode = 1 })
