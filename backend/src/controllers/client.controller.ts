import type { Context } from 'hono'
import type { Prisma, ClientPropertyShare, ClientShareStatus } from '@prisma/client'
import type { AppEnv } from '../db'
import { AppError } from '../lib/errors'
import { partnerSelect } from '../lib/directory'
import { clientQuerySchema, type CreateClientInput, type UpdateClientInput, type AddClientShortlistInput, type UpdateClientShortlistInput, type CreateClientPropertyShareInput, type GenerateClientDocumentUploadUrlsInput, type AttachClientDocumentInput } from '../zod/client'
import { publicPropertySnapshot, selectShareMedia, mediaSnapshot, randomShareToken, normalizeWhatsappNumber } from '../lib/client-sharing'
import { signClientDocumentUpload, validateClientDocumentKey, verifyClientDocument, signClientDocumentDownload, removeClientDocumentObject } from '../lib/client-documents'
import { getR2PublicUrl } from '../lib/r2'
import { publicPropertySnapshotSchema } from '../zod/client'
import dreamkey from '../../../frontend/config/dreamkey-public.json'
import { getClientDocumentRule } from '../config/media-config'

const clientInclude = {
  createdBy: { select: partnerSelect },
  assignedPartners: { include: { partner: { select: partnerSelect }, assignedBy: { select: partnerSelect } } },
  _count: { select: { shortlistedProperties: true, documents: true } },
} as const
export const clientPropertySelect = {
  id: true, societyBuildingName: true, propertyType: true, locationArea: true, city: true, pricingType: true,
  askingPrice: true, availabilityStatus: true, isArchived: true, isDraft: true, carpetAreaSqFt: true,
  superBuiltUpAreaSqFt: true, bedrooms: true, bathrooms: true, balconies: true, floorNumber: true, totalFloors: true, amenities: true,
  media: { where: { category: { in: ['PHOTOGRAPH', 'VIDEO'] as ('PHOTOGRAPH' | 'VIDEO')[] } }, orderBy: [{ isCover: 'desc' as const }, { order: 'asc' as const }],
    select: { id: true, category: true, title: true, url: true, thumbnailUrl: true, mimeType: true, sizeBytes: true, order: true, isCover: true } },
} satisfies Prisma.PropertySelect
const documentSelect = { id: true, clientId: true, category: true, title: true, originalName: true, mimeType: true, sizeBytes: true, uploadedById: true, createdAt: true, updatedAt: true, uploadedBy: { select: partnerSelect } } as const
const detailInclude = {
  ...clientInclude,
  shortlistedProperties: { orderBy: { createdAt: 'desc' as const }, include: { addedBy: { select: partnerSelect }, property: { select: clientPropertySelect } } },
  documents: { orderBy: { createdAt: 'desc' as const }, select: documentSelect },
} as const
const id = (c: Context<AppEnv>) => c.req.param('id')!
const actor = (c: Context<AppEnv>) => {
  const user = c.get('user')
  if (!user) throw new AppError('Please sign in to continue.', 401, 'AUTH_REQUIRED')
  return user
}
async function requireClient(c: Context<AppEnv>) {
  const client = await c.get('prisma').client.findUnique({ where: { id: id(c) } })
  if (!client) throw new AppError('Client not found. Please refresh your directory.', 404, 'CLIENT_NOT_FOUND')
  return client
}
async function validatePartners(c: Context<AppEnv>, partnerIds: string[] | undefined) {
  if (partnerIds === undefined) return
  const count = await c.get('prisma').user.count({ where: { id: { in: partnerIds }, isActive: true } })
  if (count !== partnerIds.length) throw new AppError('Please choose active CRM partners.', 400, 'INVALID_PARTNERS', [{ field: 'assignedPartnerIds', message: 'One or more partners are unavailable. Refresh the partner list.' }])
}
function cleanFields(body: CreateClientInput | UpdateClientInput) {
  const { assignedPartnerIds, ...fields } = body
  return { assignedPartnerIds, data: { ...fields, ...Object.fromEntries(['email', 'whatsappNumber', 'address', 'notes'].filter(key => fields[key as keyof typeof fields] === '').map(key => [key, null])) } }
}
function getFrontendOrigin(c: Context<AppEnv>): string {
  if (c.env.FRONTEND_URL && !c.env.FRONTEND_URL.includes('localhost')) {
    return c.env.FRONTEND_URL
  }
  const originHeader = typeof c.req?.header === 'function'
    ? (c.req.header('origin') || c.req.header('referer'))
    : undefined
  if (originHeader) {
    try {
      const parsed = new URL(originHeader)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin
      }
    } catch {
      // ignore
    }
  }
  return c.env.FRONTEND_URL || 'http://localhost:3000'
}

function publicUrl(c: Context<AppEnv>, token: string) {
  const origin = new URL(getFrontendOrigin(c))
  return new URL(`/share/${token}`, origin).toString()
}

function shareResponse(c: Context<AppEnv>, share: ClientPropertyShare & { createdBy?: unknown }) {
  const { publicToken, ...record } = share
  const activeUrl = publicUrl(c, publicToken)
  const normalizedMessage = record.message
    ? record.message.replace(/https?:\/\/[^\s/]+\/share\/[a-f0-9]{64}/g, activeUrl)
    : record.message
  return { ...record, message: normalizedMessage, publicUrl: activeUrl }
}
export async function createClientController(c: Context<AppEnv>) {
  const user = actor(c), { assignedPartnerIds, data } = cleanFields(c.req.valid('json' as never) as CreateClientInput)
  await validatePartners(c, assignedPartnerIds)
  const client = await c.get('prisma').client.create({ data: { ...data, name: data.name!, phone: data.phone!, createdById: user.id,
    assignedPartners: { create: (assignedPartnerIds || []).map(partnerId => ({ partnerId, assignedById: user.id })) },
  }, include: clientInclude })
  return c.json({ success: true, client, message: 'Client added.' }, 201)
}
export async function listClientsController(c: Context<AppEnv>) {
  const { page, limit, search, scope, status, partnerId, sortBy, sortOrder } = clientQuerySchema.parse(c.req.query())
  const where: Prisma.ClientWhereInput = {
    ...(status !== 'ALL' ? { status } : {}),
    ...(scope === 'MINE' ? { assignedPartners: { some: { partnerId: actor(c).id } } } : partnerId ? { assignedPartners: { some: { partnerId } } } : {}),
    ...(search ? { OR: ['name', 'phone', 'email', 'whatsappNumber', 'address'].map(field => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}),
  }
  const db = c.get('prisma')
  const [total, clients] = await Promise.all([db.client.count({ where }), db.client.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: [{ [sortBy]: sortOrder }, { id: 'asc' }], include: clientInclude })])
  return c.json({ success: true, clients, pagination: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), hasNextPage: page * limit < total, hasPrevPage: page > 1 } })
}
export async function getClientStatsController(c: Context<AppEnv>) {
  const db = c.get('prisma'), user = actor(c)
  const [totalClients, activeClients, inactiveClients, myClientsCount] = await Promise.all([db.client.count(), db.client.count({ where: { status: 'ACTIVE' } }), db.client.count({ where: { status: 'INACTIVE' } }), db.client.count({ where: { assignedPartners: { some: { partnerId: user.id } } } })])
  return c.json({ success: true, stats: { totalClients, activeClients, inactiveClients, myClientsCount } })
}
export async function getClientController(c: Context<AppEnv>) {
  const db = c.get('prisma')
  const client = await db.client.findUnique({ where: { id: id(c) }, include: detailInclude })
  if (!client) throw new AppError('Client not found.', 404, 'CLIENT_NOT_FOUND')
  const shares = await db.clientPropertyShare.findMany({ where: { clientId: client.id }, include: { createdBy: { select: partnerSelect } }, orderBy: { createdAt: 'desc' } })
  return c.json({ success: true, client: { ...client, shares: shares.map(share => shareResponse(c, share)) } })
}
export async function updateClientController(c: Context<AppEnv>) {
  await requireClient(c)
  const user = actor(c), { assignedPartnerIds, data } = cleanFields(c.req.valid('json' as never) as UpdateClientInput)
  await validatePartners(c, assignedPartnerIds)
  const client = await c.get('prisma').client.update({ where: { id: id(c) }, data: { ...data,
    ...(assignedPartnerIds === undefined ? {} : { assignedPartners: {
      deleteMany: { partnerId: { notIn: assignedPartnerIds } },
      upsert: assignedPartnerIds.map(partnerId => ({ where: { clientId_partnerId: { clientId: id(c), partnerId } }, update: {}, create: { partnerId, assignedById: user.id } })),
    } }),
  }, include: clientInclude })
  return c.json({ success: true, client, message: 'Client details saved.' })
}
export async function deleteClientController(c: Context<AppEnv>) {
  await requireClient(c)
  const db = c.get('prisma')
  const [documents, shares] = await Promise.all([db.clientDocument.count({ where: { clientId: id(c) } }), db.clientPropertyShare.count({ where: { clientId: id(c) } })])
  if (documents || shares) throw new AppError('This client has documents or sharing history. Mark the client Inactive to preserve these records.', 409, 'CLIENT_HAS_HISTORY')
  await db.client.delete({ where: { id: id(c) } })
  return c.json({ success: true, message: 'Client removed. Properties have been kept.' })
}
export async function clientPropertyOptionsController(c: Context<AppEnv>) {
  const search = c.req.query('search')?.trim() || '', page = Number(c.req.query('page') || 1)
  const where: Prisma.PropertyWhereInput = { isDraft: false, isArchived: false, ...(search ? { OR: ['societyBuildingName', 'locationArea', 'city'].map(field => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}) }
  const db = c.get('prisma')
  const [total, properties] = await Promise.all([db.property.count({ where }), db.property.findMany({ where, select: clientPropertySelect, take: 12, skip: (page - 1) * 12, orderBy: { updatedAt: 'desc' } })])
  return c.json({ success: true, properties, pagination: { total, page, hasNextPage: page * 12 < total } })
}
export async function addClientShortlistController(c: Context<AppEnv>) {
  await requireClient(c)
  const body = c.req.valid('json' as never) as AddClientShortlistInput, db = c.get('prisma')
  const property = await db.property.findFirst({ where: { id: body.propertyId, isDraft: false, isArchived: false }, select: { id: true } })
  if (!property) throw new AppError('This property is unavailable or still a draft.', 400, 'PROPERTY_UNAVAILABLE')
  const shortlist = await db.clientShortlistedProperty.upsert({ where: { clientId_propertyId: { clientId: id(c), propertyId: body.propertyId } }, update: {},
    create: { clientId: id(c), propertyId: body.propertyId, notes: body.notes || null, addedById: actor(c).id },
    include: { property: { select: clientPropertySelect }, addedBy: { select: partnerSelect } },
  })
  return c.json({ success: true, shortlist }, 201)
}
export async function updateClientShortlistController(c: Context<AppEnv>) {
  const db = c.get('prisma'), shortlistId = c.req.param('shortlistId')!
  if (!(await db.clientShortlistedProperty.findFirst({ where: { id: shortlistId, clientId: id(c) } }))) throw new AppError('Shortlisted property not found.', 404)
  const body = c.req.valid('json' as never) as UpdateClientShortlistInput
  const shortlist = await db.clientShortlistedProperty.update({ where: { id: shortlistId }, data: { ...body, ...(body.notes === '' ? { notes: null } : {}) }, include: { property: { select: clientPropertySelect }, addedBy: { select: partnerSelect } } })
  return c.json({ success: true, shortlist })
}
export async function removeClientShortlistController(c: Context<AppEnv>) {
  const db = c.get('prisma'), shortlistId = c.req.param('shortlistId')!
  const shortlist = await db.clientShortlistedProperty.findFirst({ where: { id: shortlistId, clientId: id(c) }, include: { _count: { select: { shares: true } } } })
  if (!shortlist) throw new AppError('Shortlisted property not found.', 404)
  if (shortlist._count.shares) throw new AppError('This property has sharing history. Mark it Not Interested to preserve that history.', 409, 'SHORTLIST_HAS_HISTORY')
  await db.clientShortlistedProperty.delete({ where: { id: shortlistId } })
  return c.json({ success: true })
}
export async function createClientShareController(c: Context<AppEnv>) {
  const client = await requireClient(c), db = c.get('prisma'), body = c.req.valid('json' as never) as CreateClientPropertyShareInput
  const shortlist = await db.clientShortlistedProperty.findFirst({ where: { id: body.shortlistedPropertyId, clientId: client.id }, include: { property: { include: { media: true } } } })
  if (!shortlist) throw new AppError('Please shortlist this property before sharing.', 404)
  if (shortlist.property.isDraft || shortlist.property.isArchived) throw new AppError('Draft or archived properties cannot be shared.', 400, 'PROPERTY_UNAVAILABLE')
  if (body.expiresAt && new Date(body.expiresAt) <= new Date()) throw new AppError('Choose an expiry time in the future.', 400, 'INVALID_EXPIRY')
  const selected = selectShareMedia(shortlist.property.media, body.selectedMediaIds)
  const recipient = body.channel === 'WHATSAPP' ? normalizeWhatsappNumber(client.whatsappNumber || client.phone) : body.channel === 'EMAIL' ? client.email : null
  if (body.channel === 'EMAIL' && !recipient) throw new AppError('Add an email address to this client before sharing by email.', 400, 'CLIENT_EMAIL_REQUIRED')
  const publicToken = randomShareToken()
  const share = await db.clientPropertyShare.create({ data: {
    shortlistedPropertyId: shortlist.id, clientId: client.id, propertyId: shortlist.propertyId,
    publicToken, channel: body.channel, recipient, subject: body.subject || null, message: body.message.replaceAll('{{propertyLink}}', publicUrl(c, publicToken)),
    propertySnapshot: publicPropertySnapshot(shortlist.property), selectedMediaSnapshot: mediaSnapshot(selected),
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null, createdById: actor(c).id,
    selectedMedia: { create: selected.map((item, order) => ({ propertyMediaId: item.id, order })) },
  }, include: { createdBy: { select: partnerSelect } } })
  return c.json({ success: true, share: shareResponse(c, share) }, 201)
}
export async function updateClientShareStatusController(c: Context<AppEnv>) {
  const db = c.get('prisma'), shareId = c.req.param('shareId')!
  const share = await db.clientPropertyShare.findFirst({ where: { id: shareId, clientId: id(c) } })
  if (!share) throw new AppError('Sharing record not found.', 404)
  if (share.revokedAt || (share.expiresAt && share.expiresAt <= new Date())) throw new AppError('This link is revoked or expired. Create a new share.', 409, 'SHARE_UNAVAILABLE')
  const { status } = c.req.valid('json' as never) as { status: Exclude<ClientShareStatus, 'PREPARED'> }
  const allowed: ClientShareStatus[] = status === 'COMPOSER_OPENED' ? ['PREPARED'] : ['PREPARED', 'COMPOSER_OPENED']
  await db.$transaction(async tx => {
    await tx.clientPropertyShare.updateMany({ where: { id: share.id, status: { in: allowed } }, data: { status, ...(status === 'COMPOSER_OPENED' ? { composerOpenedAt: new Date() } : { sentConfirmedAt: new Date() }) } })
    if (status === 'SENT_CONFIRMED') await tx.clientShortlistedProperty.updateMany({ where: { id: share.shortlistedPropertyId, status: 'SHORTLISTED' }, data: { status: 'SHARED' } })
  })
  return c.json({ success: true, share: shareResponse(c, (await db.clientPropertyShare.findUniqueOrThrow({ where: { id: share.id }, include: { createdBy: { select: partnerSelect } } }))) })
}
export async function revokeClientShareController(c: Context<AppEnv>) {
  const db = c.get('prisma'), shareId = c.req.param('shareId')!
  const result = await db.clientPropertyShare.updateMany({ where: { id: shareId, clientId: id(c), revokedAt: null }, data: { revokedAt: new Date() } })
  if (!result.count && !(await db.clientPropertyShare.findFirst({ where: { id: shareId, clientId: id(c) } }))) throw new AppError('Sharing record not found.', 404)
  return c.json({ success: true })
}
export async function publicClientShareController(c: Context<AppEnv>) {
  c.header('Cache-Control', 'no-store')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  const db = c.get('prisma')
  const share = await db.clientPropertyShare.findUnique({ where: { publicToken: c.req.param('token')! }, include: {
    shortlistedProperty: { include: { property: { select: { isDraft: true, isArchived: true, availabilityStatus: true } } } },
    selectedMedia: { orderBy: { order: 'asc' }, include: { media: true } },
  } })
  if (!share) throw new AppError('This property link could not be found.', 404, 'SHARE_NOT_FOUND')
  if (share.revokedAt || (share.expiresAt && share.expiresAt <= new Date()) || share.shortlistedProperty.property.isDraft || share.shortlistedProperty.property.isArchived) throw new AppError('This property link is no longer available. Please contact DreamKey for an updated listing.', 410, 'SHARE_UNAVAILABLE')
  const media = share.selectedMedia
    .filter(item => item.media.propertyId === share.propertyId && ['PHOTOGRAPH', 'VIDEO'].includes(item.media.category))
    .map(item => ({
      propertyMediaId: item.media.id,
      category: item.media.category,
      title: item.media.title,
      url: item.media.url || ((c.env.R2_PUBLIC_URL || c.env.R2_PUBLIC_DOMAIN) && item.media.key ? getR2PublicUrl(c.env, item.media.key) : item.media.url),
      thumbnailUrl: item.media.thumbnailUrl,
      mimeType: item.media.mimeType,
      sizeBytes: item.media.sizeBytes,
      order: item.order,
    }))
  return c.json({ success: true, property: publicPropertySnapshotSchema.parse(share.propertySnapshot), availabilityStatus: share.shortlistedProperty.property.availabilityStatus,
    media, company: dreamkey, contact: { name: dreamkey.name, phone: dreamkey.phone, email: dreamkey.email },
  })
}
export async function generateClientDocumentUploadController(c: Context<AppEnv>) {
  const body = c.req.valid('json' as never) as GenerateClientDocumentUploadUrlsInput
  if (body.clientId !== id(c)) throw new AppError('Please upload documents to the selected client.', 400)
  await requireClient(c)
  const counts = new Map<string, number>()
  for (const file of body.files) counts.set(file.category, (counts.get(file.category) || 0) + 1)
  for (const [category, requested] of counts) {
    const rule = getClientDocumentRule(category as AttachClientDocumentInput['category'])
    const existing = await c.get('prisma').clientDocument.count({ where: { clientId: id(c), category: rule.category } })
    if (rule.maxCount > 0 && existing + requested > rule.maxCount) throw new AppError(`${rule.label} allows ${rule.maxCount} file(s). Remove an existing document before adding another.`, 400, 'DOCUMENT_LIMIT_REACHED')
  }
  const files = await Promise.all(body.files.map(async file => ({ ...file, ...await signClientDocumentUpload(c.env, id(c), file) })))
  return c.json({ success: true, files })
}
export async function attachClientDocumentController(c: Context<AppEnv>) {
  await requireClient(c)
  const body = c.req.valid('json' as never) as AttachClientDocumentInput
  validateClientDocumentKey(id(c), body.key, body.category)
  const db = c.get('prisma'), existing = await db.clientDocument.findUnique({ where: { key: body.key }, select: { ...documentSelect, key: true } })
  if (existing) {
    if (existing.clientId !== id(c) || existing.category !== body.category || existing.sizeBytes !== body.sizeBytes || existing.mimeType !== body.mimeType || existing.originalName !== body.originalName) throw new AppError('This document is already linked with different details.', 409)
    const { key: _key, ...document } = existing
    return c.json({ success: true, document })
  }
  await verifyClientDocument(c.env, body.key, body.sizeBytes, body.mimeType)
  const document = await db.$transaction(async tx => {
    // Lock the client row so concurrent attachments cannot exceed configured counts.
    await tx.$queryRaw`SELECT "id" FROM "clients" WHERE "id" = ${id(c)} FOR UPDATE`
    const attached = await tx.clientDocument.findUnique({ where: { key: body.key }, select: documentSelect })
    if (attached) return attached
    const rule = getClientDocumentRule(body.category)
    if (rule.maxCount > 0 && await tx.clientDocument.count({ where: { clientId: id(c), category: body.category } }) >= rule.maxCount) {
      throw new AppError(`${rule.label} allows ${rule.maxCount} file(s). Remove an existing document before adding another.`, 400, 'DOCUMENT_LIMIT_REACHED')
    }
    return tx.clientDocument.create({ data: { ...body, title: body.title || null, clientId: id(c), uploadedById: actor(c).id }, select: documentSelect })
  })
  return c.json({ success: true, document }, 201)
}
export async function downloadClientDocumentController(c: Context<AppEnv>) {
  const document = await c.get('prisma').clientDocument.findFirst({ where: { id: c.req.param('documentId')!, clientId: id(c) } })
  if (!document) throw new AppError('Document not found.', 404)
  c.header('Cache-Control', 'no-store')
  return c.json({ success: true, url: await signClientDocumentDownload(c.env, document, c.req.query('inline') === 'true') })
}
export async function deleteClientDocumentController(c: Context<AppEnv>) {
  const db = c.get('prisma'), document = await db.clientDocument.findFirst({ where: { id: c.req.param('documentId')!, clientId: id(c) } })
  if (!document) throw new AppError('Document not found.', 404)
  await removeClientDocumentObject(c.env, document.key)
  await db.clientDocument.delete({ where: { id: document.id } })
  return c.json({ success: true })
}
export async function discardClientDocumentUploadController(c: Context<AppEnv>) {
  await requireClient(c)
  const { key } = c.req.valid('json' as never) as { key: string }
  validateClientDocumentKey(id(c), key)
  if (await c.get('prisma').clientDocument.findUnique({ where: { key } })) throw new AppError('This document is already saved. Delete it from the document list.', 409)
  await removeClientDocumentObject(c.env, key)
  return c.json({ success: true })
}
