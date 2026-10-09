import { Context } from 'hono'
import { AppEnv, AuthUser } from '../db'
import {
  GenerateUploadUrlsInput,
  CreatePropertyInput,
  CreatePropertyDraftInput,
  UpdatePropertyInput,
  UpdatePropertyStatusInput,
  ReorderPropertyMediaInput,
  PropertyFilterQuery,
  createPropertySchema,
  generateUploadUrlsItemSchema,
} from '../zod/property'
import {
  generatePresignedUploadUrl,
  deleteR2Object,
  deleteR2Objects,
  buildPropertyMediaKey,
  verifyR2Object,
  getR2PublicUrl,
} from '../lib/r2'
import { PROPERTY_MEDIA_CONFIG } from '../config/media-config'
import { Prisma, PrismaClient } from '@prisma/client'

/**
 * Resolve the source partner exclusively from the authenticated CRM session
 */
async function resolveSourcePartnerId(
  prisma: PrismaClient,
  authUser?: AuthUser,
): Promise<string> {
  if (!authUser?.id) throw new Error('Please sign in before managing properties.')
  const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { id: true } })
  if (!user) throw new Error('Your CRM account was not found. Please sign in again.')
  return user.id
}

/**
 * 1. Get Public Media Upload Limits & Rules
 */
export async function getPropertyMediaConfigController(c: Context<AppEnv>) {
  return c.json({
    success: true,
    config: PROPERTY_MEDIA_CONFIG.property,
  })
}

/**
 * 2. Generate Presigned Upload URLs for Direct R2 Upload
 */
export async function generatePropertyUploadUrlsController(c: Context<AppEnv>) {
  const body = c.req.valid('json' as never) as GenerateUploadUrlsInput
  const env = c.env

  const targetPropertyId = body.propertyId || crypto.randomUUID()

  try {
    const property = await c.get('prisma').property.findUnique({ where: { id: targetPropertyId } })
    if (!property) return c.json({ success: false, error: 'Create a property draft before uploading.', code: 'PROPERTY_NOT_FOUND' }, 404)

    const uploadItems = await Promise.all(
      body.files.map(async (file) => {
        if (file.existingKey) {
          if (!file.existingKey.startsWith(`properties/${targetPropertyId}/`)) throw new Error('Invalid retry upload key.')
          const attached = await c.get('prisma').propertyMedia.findFirst({ where: { key: file.existingKey } })
          if (attached) throw new Error('This file is already attached and cannot be overwritten.')
        }
        const key = file.existingKey || buildPropertyMediaKey({
          propertyId: targetPropertyId,
          category: file.category,
          filename: file.filename,
        })

        const presigned = await generatePresignedUploadUrl(env, {
          key,
          contentType: file.contentType,
          contentLength: file.sizeBytes,
          expiresIn: 300, // 5 minutes
        })

        return {
          filename: file.filename,
          category: file.category,
          key: presigned.key,
          uploadUrl: presigned.uploadUrl,
          publicUrl: presigned.publicUrl,
          mimeType: file.contentType,
          sizeBytes: file.sizeBytes,
        }
      })
    )

    return c.json({
      success: true,
      propertyId: targetPropertyId,
      urls: uploadItems,
    })
  } catch (error: any) {
    console.error('Failed to generate presigned upload URLs:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to generate presigned upload URLs',
        code: 'R2_PRESIGN_ERROR',
      },
      500
    )
  }
}

/**
 * 3. Create a Lightweight Property Draft (For instant background uploads)
 */
export async function createPropertyDraftController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const body = c.req.valid('json' as never) as CreatePropertyDraftInput

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    // If broker is specified, verify existence
    if (body.ownerId) {
      const owner = await prisma.owner.findUnique({ where: { id: body.ownerId } })
      if (!owner) return c.json({ success: false, error: 'Selected owner does not exist.', code: 'OWNER_NOT_FOUND', details: [{ field: 'ownerId', message: 'Please select an existing owner.' }] }, 400)
    }
    if (body.brokerId) {
      const brokerExists = await prisma.broker.findUnique({
        where: { id: body.brokerId },
      })
      if (!brokerExists) {
        return c.json(
          {
            success: false,
            error: 'Selected broker does not exist.',
            code: 'BROKER_NOT_FOUND',
          },
          404
        )
      }
    }

    // Reuse the same draft across file selections and request retries.
    if (body.id) {
      const existing = await prisma.property.findUnique({
        where: { id: body.id },
        include: { media: { orderBy: { order: 'asc' } } },
      })
      if (existing) return c.json({ success: true, property: existing })
    }

    const draftProperty = await prisma.property.create({
      data: {
        ...(body.id ? { id: body.id } : {}),
        isDraft: true,
        sourcePartnerId: partnerId,
        societyBuildingName: body.societyBuildingName || 'Untitled Draft',
        locationArea: body.locationArea || 'Draft Location',
        pincode: body.pincode || '400001',
        carpetAreaSqFt: body.carpetAreaSqFt || 0,
        askingPrice: body.askingPrice || 0,
        propertyType: body.propertyType || 'FLAT',
        pricingType: body.pricingType || 'SALE',
        availabilityStatus: body.availabilityStatus || 'AVAILABLE',
        accessType: body.accessType || 'DIRECT',
        brokerId: body.accessType === 'BROKER' ? body.brokerId || null : null,
        ownerId: body.accessType !== 'BROKER' ? body.ownerId || null : null,
        notes: body.notes || null,
      },
    })

    if (body.media && body.media.length > 0) {
      for (const [idx, m] of body.media.entries()) {
        await prisma.propertyMedia.create({
          data: {
            propertyId: draftProperty.id,
            category: m.category,
            title: m.title || null,
            key: m.key,
            url: m.url,
            thumbnailUrl: m.thumbnailUrl || null,
            mimeType: m.mimeType,
            sizeBytes: m.sizeBytes,
            order: m.order ?? idx,
            isCover: m.isCover ?? idx === 0,
          },
        })
      }
    }

    await prisma.propertyAuditLog.create({
      data: {
        propertyId: draftProperty.id,
        userId: partnerId,
        action: 'DRAFT_CREATED',
        description: 'Draft property created',
      },
    })

    const finalDraft = await prisma.property.findUnique({
      where: { id: draftProperty.id },
      include: {
        media: { orderBy: { order: 'asc' } },
        owner: { select: { id: true, name: true, phone: true, email: true, whatsappNumber: true, address: true } },
        broker: {
          select: { id: true, name: true, phone: true, email: true },
        },
        sourcePartner: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return c.json(
      {
        success: true,
        message: 'Draft property created successfully.',
        property: finalDraft,
      },
      201
    )
  } catch (error: any) {
    console.error('Failed to create draft property:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to create draft property',
        code: 'PROPERTY_DRAFT_ERROR',
      },
      500
    )
  }
}

/**
 * 4. Create Full Property Listing
 */
export async function createPropertyController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const body = c.req.valid('json' as never) as CreatePropertyInput

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    if (body.ownerId) {
      const owner = await prisma.owner.findUnique({ where: { id: body.ownerId } })
      if (!owner) return c.json({ success: false, error: 'Selected owner does not exist.', code: 'OWNER_NOT_FOUND', details: [{ field: 'ownerId', message: 'Please select an existing owner.' }] }, 400)
    }
    if (body.brokerId) {
      const broker = await prisma.broker.findUnique({
        where: { id: body.brokerId },
      })
      if (!broker) {
        return c.json(
          {
            success: false,
            error: 'Selected broker does not exist.',
            code: 'BROKER_NOT_FOUND',
          },
          404
        )
      }
    }

    const newProperty = await prisma.property.create({
      data: {
        isDraft: body.isDraft ?? false,
        sourcePartnerId: partnerId,
        propertyType: body.propertyType,
        societyBuildingName: body.societyBuildingName,
        locationArea: body.locationArea,
        pincode: body.pincode,
        city: body.city || 'Mumbai',
        floorNumber: body.floorNumber ?? null,
        totalFloors: body.totalFloors ?? null,
        bedrooms: body.bedrooms ?? null,
        bathrooms: body.bathrooms ?? null,
        balconies: body.balconies ?? null,
        carpetAreaSqFt: body.carpetAreaSqFt,
        superBuiltUpAreaSqFt: body.superBuiltUpAreaSqFt ?? null,
        pricingType: body.pricingType,
        askingPrice: body.askingPrice,
        availabilityStatus: body.availabilityStatus,
        availabilityDate: body.availabilityDate
          ? new Date(body.availabilityDate)
          : null,
        accessType: body.accessType,
        brokerId: body.accessType === 'BROKER' ? body.brokerId ?? null : null,
        ownerId: body.accessType !== 'BROKER' ? body.ownerId ?? null : null,
        builderName: body.builderName ?? null,
        yearOfConstruction: body.yearOfConstruction ?? null,
        totalUnits: body.totalUnits ?? null,
        amenities: body.amenities ?? [],
        reraNumber: body.reraNumber ?? null,
        notes: body.notes ?? null,
      },
    })

    if (body.media && body.media.length > 0) {
      for (const [idx, m] of body.media.entries()) {
        await prisma.propertyMedia.create({
          data: {
            propertyId: newProperty.id,
            category: m.category,
            title: m.title || null,
            key: m.key,
            url: m.url,
            thumbnailUrl: m.thumbnailUrl || null,
            mimeType: m.mimeType,
            sizeBytes: m.sizeBytes,
            order: m.order ?? idx,
            isCover: m.isCover ?? idx === 0,
          },
        })
      }
    }

    await prisma.propertyAuditLog.create({
      data: {
        propertyId: newProperty.id,
        userId: partnerId,
        action: 'CREATED',
        description: 'Listing created',
      },
    })

    const finalProperty = await prisma.property.findUnique({
      where: { id: newProperty.id },
      include: {
        media: { orderBy: { order: 'asc' } },
        owner: { select: { id: true, name: true, phone: true, email: true, whatsappNumber: true, address: true } },
        broker: {
          select: { id: true, name: true, phone: true, email: true },
        },
        sourcePartner: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return c.json(
      {
        success: true,
        message: 'Property listing created successfully.',
        property: finalProperty,
      },
      201
    )
  } catch (error: any) {
    console.error('Failed to create property:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to create property',
        code: 'PROPERTY_CREATE_ERROR',
      },
      500
    )
  }
}

/**
 * 5. List Properties with Advanced Filters & Full-Text Search (FR-SF-01 to FR-SF-08)
 */
export async function listPropertiesController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const query = c.req.valid('query' as never) as PropertyFilterQuery

  const {
    page = 1,
    limit = 20,
    search,
    propertyType,
    pricingType,
    availabilityStatus,
    accessType,
    locationArea,
    pincode,
    brokerId,
    ownerId,
    sourcePartnerId,
    minPrice,
    maxPrice,
    minCarpetArea,
    maxCarpetArea,
    bedrooms,
    bedroomTypes,
    minBedrooms,
    maxBedrooms,
    isDraft,
    isArchived,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query

  const skip = (page - 1) * limit

  const whereConditions: Prisma.PropertyWhereInput[] = []

  // Filter archived & draft states
  if (isArchived !== undefined) {
    whereConditions.push({ isArchived })
  }
  if (isDraft !== undefined) {
    whereConditions.push({ isDraft })
  }

  // FR-SF-01: Filter by Property Type (supports comma-separated list e.g. "FLAT,COMMERCIAL,OTHER")
  if (propertyType) {
    const types = propertyType
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean) as Prisma.EnumPropertyTypeFilter['in']
    if (types && types.length > 0) {
      whereConditions.push({ propertyType: { in: types as any } })
    }
  }

  // Pricing Type (SALE, RENT)
  if (pricingType) {
    const pTypes = pricingType
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean)
    if (pTypes.length > 0) {
      whereConditions.push({ pricingType: { in: pTypes as any } })
    }
  }

  // FR-SF-05: Filter by Availability Status (e.g. "AVAILABLE,UNDER_NEGOTIATION,TOKEN_PAID")
  if (availabilityStatus) {
    const statuses = availabilityStatus
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
    if (statuses.length > 0) {
      whereConditions.push({ availabilityStatus: { in: statuses as any } })
    }
  }

  // FR-SF-06: Filter by Access Type (DIRECT or BROKER / +1)
  if (accessType) {
    const aTypes = accessType
      .split(',')
      .map((a) => {
        const clean = a.trim().toUpperCase()
        if (clean === '+1' || clean === '1' || clean === 'BROKER') return 'BROKER'
        if (clean === 'DIRECT') return 'DIRECT'
        return clean
      })
      .filter(Boolean)
    if (aTypes.length > 0) {
      whereConditions.push({ accessType: { in: aTypes as any } })
    }
  }

  // FR-SF-07: Filter by Source Partner (who added the stock)
  if (sourcePartnerId) {
    const partners = sourcePartnerId
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
    if (partners.length > 0) {
      whereConditions.push({ sourcePartnerId: { in: partners } })
    }
  }

  // Broker filter
  if (ownerId) whereConditions.push({ ownerId })
  if (brokerId) {
    const brokers = brokerId
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
    if (brokers.length > 0) {
      whereConditions.push({ brokerId: { in: brokers } })
    }
  }

  // FR-SF-03: Filter by Location / Area Name & PIN code
  if (locationArea) {
    const areas = locationArea
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
    if (areas.length === 1) {
      whereConditions.push({
        locationArea: { contains: areas[0], mode: 'insensitive' },
      })
    } else if (areas.length > 1) {
      whereConditions.push({
        OR: areas.map((area) => ({
          locationArea: { contains: area, mode: 'insensitive' },
        })),
      })
    }
  }

  if (pincode) {
    const pins = pincode
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    if (pins.length === 1) {
      whereConditions.push({ pincode: pins[0] })
    } else if (pins.length > 1) {
      whereConditions.push({ pincode: { in: pins } })
    }
  }

  // FR-SF-02: Filter by Budget Range (minPrice - maxPrice in INR)
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: Prisma.FloatFilter = {}
    if (minPrice !== undefined) priceCondition.gte = minPrice
    if (maxPrice !== undefined) priceCondition.lte = maxPrice
    whereConditions.push({ askingPrice: priceCondition })
  }

  // Carpet Area Range Filter
  if (minCarpetArea !== undefined || maxCarpetArea !== undefined) {
    const areaCondition: Prisma.FloatFilter = {}
    if (minCarpetArea !== undefined) areaCondition.gte = minCarpetArea
    if (maxCarpetArea !== undefined) areaCondition.lte = maxCarpetArea
    whereConditions.push({ carpetAreaSqFt: areaCondition })
  }

  // FR-SF-04: Filter by Number of Bedrooms (Studio, 1BHK, 2BHK, 3BHK, 4BHK+)
  const bedroomClauses: Prisma.PropertyWhereInput[] = []

  if (bedroomTypes || bedrooms) {
    const rawTokens = `${bedroomTypes || ''},${bedrooms || ''}`
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)

    for (const token of rawTokens) {
      if (token === 'STUDIO' || token === '0') {
        bedroomClauses.push({ bedrooms: 0 })
      } else if (token === '1BHK' || token === '1') {
        bedroomClauses.push({ bedrooms: 1 })
      } else if (token === '2BHK' || token === '2') {
        bedroomClauses.push({ bedrooms: 2 })
      } else if (token === '3BHK' || token === '3') {
        bedroomClauses.push({ bedrooms: 3 })
      } else if (token === '4BHK_PLUS' || token === '4BHK' || token === '4+' || token === '4') {
        bedroomClauses.push({ bedrooms: { gte: 4 } })
      } else {
        const parsedNum = parseInt(token, 10)
        if (!isNaN(parsedNum)) {
          bedroomClauses.push({ bedrooms: parsedNum })
        }
      }
    }
  }

  if (minBedrooms !== undefined || maxBedrooms !== undefined) {
    const rangeCondition: Prisma.IntNullableFilter = {}
    if (minBedrooms !== undefined) rangeCondition.gte = minBedrooms
    if (maxBedrooms !== undefined) rangeCondition.lte = maxBedrooms
    bedroomClauses.push({ bedrooms: rangeCondition })
  }

  if (bedroomClauses.length > 0) {
    whereConditions.push({ OR: bedroomClauses })
  }

  // FR-SF-08: Full-text search across society name, location, remarks, builder, rera
  if (search && search.trim()) {
    const term = search.trim()
    whereConditions.push({
      OR: [
        { societyBuildingName: { contains: term, mode: 'insensitive' } },
        { locationArea: { contains: term, mode: 'insensitive' } },
        { pincode: { contains: term, mode: 'insensitive' } },
        { notes: { contains: term, mode: 'insensitive' } },
        { builderName: { contains: term, mode: 'insensitive' } },
        { reraNumber: { contains: term, mode: 'insensitive' } },
      ],
    })
  }

  const where: Prisma.PropertyWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {}

  try {
    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          media: {
            orderBy: { order: 'asc' },
          },
          owner: { select: { id: true, name: true, phone: true, email: true, whatsappNumber: true, address: true } },
        broker: {
            select: { id: true, name: true, phone: true, email: true },
          },
          sourcePartner: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ])

    return c.json({
      success: true,
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Failed to list properties:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to list properties',
        code: 'PROPERTY_LIST_ERROR',
      },
      500
    )
  }
}

/**
 * 6. Get Property by ID (Full detail with media, broker, audit logs)
 */
export async function getPropertyByIdController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        media: { orderBy: { order: 'asc' } },
        owner: { select: { id: true, name: true, phone: true, email: true, whatsappNumber: true, address: true } },
        broker: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            whatsappNumber: true,
            areaOfOperation: true,
          },
        },
        sourcePartner: {
          select: { id: true, name: true, email: true },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!property) {
      return c.json(
        {
          success: false,
          error: 'Property not found.',
          code: 'PROPERTY_NOT_FOUND',
        },
        404
      )
    }

    return c.json({
      success: true,
      property,
    })
  } catch (error: any) {
    console.error('Failed to get property:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve property',
        code: 'PROPERTY_GET_ERROR',
      },
      500
    )
  }
}

/**
 * 7. Update Property Details & Record Audit Log
 */
export async function updatePropertyController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)
  const body = c.req.valid('json' as never) as UpdatePropertyInput

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    const existing = await prisma.property.findUnique({
      where: { id },
    })

    if (!existing) {
      return c.json(
        {
          success: false,
          error: 'Property not found.',
          code: 'PROPERTY_NOT_FOUND',
        },
        404
      )
    }

    if (body.ownerId) {
      const owner = await prisma.owner.findUnique({ where: { id: body.ownerId } })
      if (!owner) return c.json({ success: false, error: 'Selected owner does not exist.', code: 'OWNER_NOT_FOUND', details: [{ field: 'ownerId', message: 'Please select an existing owner.' }] }, 400)
    }
    if (body.brokerId) {
      const broker = await prisma.broker.findUnique({
        where: { id: body.brokerId },
      })
      if (!broker) {
        return c.json(
          {
            success: false,
            error: 'Selected broker does not exist.',
            code: 'BROKER_NOT_FOUND',
          },
          404
        )
      }
    }

    const nextAccessType = body.accessType ?? existing.accessType
    if ((body.ownerId && nextAccessType !== 'DIRECT') || (body.brokerId && nextAccessType !== 'BROKER')) return c.json({ success: false, error: 'Select the matching owner or broker contact type before linking this contact.', code: 'INVALID_CONTACT', details: [{ field: body.ownerId ? 'ownerId' : 'brokerId', message: 'Contact type does not match this listing.' }] }, 400)
    const contactData = {
      ...existing, ...body,
      brokerId: nextAccessType === 'BROKER' ? body.brokerId !== undefined ? body.brokerId : existing.brokerId : null,
      ownerId: nextAccessType === 'DIRECT' ? body.ownerId !== undefined ? body.ownerId : existing.ownerId : null,
    }
    if (body.ownerId && body.brokerId) return c.json({ success: false, error: 'Link either an owner or a broker, not both.', code: 'INVALID_CONTACT' }, 400)
    if (contactData.isDraft === false) {
      const validation = createPropertySchema.safeParse({
        ...contactData,
        availabilityDate: body.availabilityDate !== undefined ? body.availabilityDate : existing.availabilityDate?.toISOString() ?? null,
      })
      if (!validation.success) return c.json({ success: false, error: validation.error.issues[0]?.message || 'Complete the required property details.', details: validation.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })), code: 'VALIDATION_ERROR' }, 400)
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        isDraft: body.isDraft !== undefined ? body.isDraft : existing.isDraft,
        propertyType: body.propertyType ?? existing.propertyType,
        societyBuildingName:
          body.societyBuildingName ?? existing.societyBuildingName,
        locationArea: body.locationArea ?? existing.locationArea,
        pincode: body.pincode ?? existing.pincode,
        city: body.city ?? existing.city,
        floorNumber:
          body.floorNumber !== undefined
            ? body.floorNumber
            : existing.floorNumber,
        totalFloors:
          body.totalFloors !== undefined
            ? body.totalFloors
            : existing.totalFloors,
        bedrooms:
          body.bedrooms !== undefined ? body.bedrooms : existing.bedrooms,
        bathrooms:
          body.bathrooms !== undefined ? body.bathrooms : existing.bathrooms,
        balconies:
          body.balconies !== undefined ? body.balconies : existing.balconies,
        carpetAreaSqFt: body.carpetAreaSqFt ?? existing.carpetAreaSqFt,
        superBuiltUpAreaSqFt:
          body.superBuiltUpAreaSqFt !== undefined
            ? body.superBuiltUpAreaSqFt
            : existing.superBuiltUpAreaSqFt,
        pricingType: body.pricingType ?? existing.pricingType,
        askingPrice: body.askingPrice ?? existing.askingPrice,
        availabilityStatus:
          body.availabilityStatus ?? existing.availabilityStatus,
        availabilityDate:
          body.availabilityDate !== undefined
            ? body.availabilityDate
              ? new Date(body.availabilityDate)
              : null
            : existing.availabilityDate,
        accessType: body.accessType ?? existing.accessType,
        brokerId: (body.accessType ?? existing.accessType) === 'BROKER'
          ? body.brokerId !== undefined ? body.brokerId : existing.brokerId : null,
        ownerId: (body.accessType ?? existing.accessType) === 'DIRECT'
          ? body.ownerId !== undefined ? body.ownerId : existing.ownerId : null,
        builderName:
          body.builderName !== undefined
            ? body.builderName
            : existing.builderName,
        yearOfConstruction:
          body.yearOfConstruction !== undefined
            ? body.yearOfConstruction
            : existing.yearOfConstruction,
        totalUnits:
          body.totalUnits !== undefined
            ? body.totalUnits
            : existing.totalUnits,
        amenities: body.amenities ?? existing.amenities,
        reraNumber:
          body.reraNumber !== undefined
            ? body.reraNumber
            : existing.reraNumber,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
      include: {
        media: { orderBy: { order: 'asc' } },
        owner: { select: { id: true, name: true, phone: true, email: true, whatsappNumber: true, address: true } },
        broker: {
          select: { id: true, name: true, phone: true, email: true },
        },
        sourcePartner: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    await prisma.propertyAuditLog.create({
      data: {
        propertyId: id,
        userId: partnerId,
        action: 'UPDATED',
        description: 'Listing updated',
        changes: body as any,
      },
    })

    return c.json({
      success: true,
      message: 'Property updated successfully.',
      property: updated,
    })
  } catch (error: any) {
    console.error('Failed to update property:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to update property',
        code: 'PROPERTY_UPDATE_ERROR',
      },
      500
    )
  }
}

/**
 * 8. Update Property Listing Status (Quick Status Action)
 */
export async function updatePropertyStatusController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)
  const body = c.req.valid('json' as never) as UpdatePropertyStatusInput

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    const existing = await prisma.property.findUnique({
      where: { id },
    })

    if (!existing) {
      return c.json(
        {
          success: false,
          error: 'Property not found.',
          code: 'PROPERTY_NOT_FOUND',
        },
        404
      )
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        availabilityStatus: body.availabilityStatus,
        availabilityDate: body.availabilityDate
          ? new Date(body.availabilityDate)
          : existing.availabilityDate,
      },
    })

    await prisma.propertyAuditLog.create({
      data: {
        propertyId: id,
        userId: partnerId,
        action: 'STATUS_CHANGED',
        description: `Status changed from ${existing.availabilityStatus} to ${body.availabilityStatus}${body.note ? ` (Note: ${body.note})` : ''}`,
        changes: {
          oldStatus: existing.availabilityStatus,
          newStatus: body.availabilityStatus,
          note: body.note,
        },
      },
    })

    return c.json({
      success: true,
      message: `Property status updated to ${body.availabilityStatus}.`,
      property: updated,
    })
  } catch (error: any) {
    console.error('Failed to update property status:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to update property status',
        code: 'PROPERTY_STATUS_ERROR',
      },
      500
    )
  }
}

/**
 * 9. Attach Newly Uploaded Media to Property / Draft (Background Upload Hook)
 */
export async function attachPropertyMediaController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)
  const body = await c.req.json()

  const mediaList = Array.isArray(body.media) ? body.media : [body]

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    const property = await prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      return c.json(
        {
          success: false,
          error: 'Property not found.',
          code: 'PROPERTY_NOT_FOUND',
        },
        404
      )
    }

    const currentCount = await prisma.propertyMedia.count({
      where: { propertyId: id },
    })

    const createdMedia = []
    for (let idx = 0; idx < mediaList.length; idx++) {
      const m = mediaList[idx]
      if (!m.key.startsWith(`properties/${id}/`)) {
        return c.json({ success: false, error: 'This upload belongs to a different property.', code: 'INVALID_MEDIA_KEY' }, 400)
      }
      // Attachment retries reuse the existing record instead of duplicating it.
      const existingMedia = await prisma.propertyMedia.findFirst({ where: { propertyId: id, key: m.key } })
      if (existingMedia) {
        createdMedia.push(existingMedia)
        continue
      }
      const validation = generateUploadUrlsItemSchema.safeParse({ filename: m.key, contentType: m.mimeType, sizeBytes: m.sizeBytes, category: m.category })
      if (!validation.success) return c.json({ success: false, error: 'File type or size is not allowed.', code: 'INVALID_MEDIA' }, 400)
      if (!(await verifyR2Object(c.env, m.key, m.sizeBytes, m.mimeType))) {
        return c.json({ success: false, error: 'Uploaded file does not match its details. Please retry.', code: 'INVALID_UPLOAD' }, 400)
      }
      const rule = PROPERTY_MEDIA_CONFIG.property
      const categoryRule = m.category === 'PHOTOGRAPH' ? rule.photographs
        : m.category === 'VIDEO' ? rule.videos
        : m.category === 'FLOOR_PLAN' ? rule.floorPlans
        : rule.documents.find((r) => r.category === m.category)
      if (categoryRule?.maxCount) {
        const count = await prisma.propertyMedia.count({ where: { propertyId: id, category: m.category } })
        if (count >= categoryRule.maxCount) return c.json({ success: false, error: `Maximum ${categoryRule.maxCount} files allowed for ${categoryRule.label}.`, code: 'MEDIA_LIMIT' }, 400)
      }
      const item = await prisma.propertyMedia.create({
        data: {
          propertyId: id,
          category: m.category || 'PHOTOGRAPH',
          title: m.title || null,
          key: m.key,
          url: getR2PublicUrl(c.env, m.key),
          thumbnailUrl: m.thumbnailUrl || null,
          mimeType: m.mimeType || 'application/octet-stream',
          sizeBytes: m.sizeBytes || 0,
          order: currentCount + idx,
          isCover: m.category === 'PHOTOGRAPH' && !(await prisma.propertyMedia.findFirst({ where: { propertyId: id, isCover: true } })),
        },
      })
      createdMedia.push(item)
    }

    await prisma.propertyAuditLog.create({
      data: {
        propertyId: id,
        userId: partnerId,
        action: 'MEDIA_ADDED',
        description: `Added ${createdMedia.length} media file(s)`,
      },
    })

    return c.json({
      success: true,
      message: 'Media attached successfully.',
      media: createdMedia,
    })
  } catch (error: any) {
    console.error('Failed to attach property media:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to attach media',
        code: 'MEDIA_ATTACH_ERROR',
      },
      500
    )
  }
}

/**
 * 10. Delete a Single Media Item (Deletes from DB & Deletes from R2)
 */
export async function deletePropertyMediaController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const env = c.env
  const { id, mediaId } = c.req.param()

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    const media = await prisma.propertyMedia.findFirst({
      where: { id: mediaId, propertyId: id },
    })

    if (!media) {
      return c.json(
        {
          success: false,
          error: 'Media record not found.',
          code: 'MEDIA_NOT_FOUND',
        },
        404
      )
    }

    // 1. Delete from Cloudflare R2
    if (!(await deleteR2Object(env, media.key))) {
      return c.json({ success: false, error: 'Could not remove the file from storage. Please retry.', code: 'R2_DELETE_ERROR' }, 502)
    }

    // 2. Delete from Database
    await prisma.propertyMedia.delete({
      where: { id: mediaId },
    })

    // Keep a usable cover when the previous cover is removed.
    if (media.isCover) {
      const replacement = await prisma.propertyMedia.findFirst({ where: { propertyId: id, category: 'PHOTOGRAPH' }, orderBy: { order: 'asc' } })
      if (replacement) await prisma.propertyMedia.update({ where: { id: replacement.id }, data: { isCover: true } })
    }

    // 3. Record Audit Log
    await prisma.propertyAuditLog.create({
      data: {
        propertyId: id,
        userId: partnerId,
        action: 'MEDIA_REMOVED',
        description: `Removed ${media.category.toLowerCase()} (${media.key})`,
      },
    })

    return c.json({
      success: true,
      message: 'Media deleted successfully from storage and database.',
    })
  } catch (error: any) {
    console.error('Failed to delete media:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to delete media',
        code: 'MEDIA_DELETE_ERROR',
      },
      500
    )
  }
}

/**
 * 11. Reorder Media Items and Set Cover Image
 */
export async function reorderPropertyMediaController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)
  const body = c.req.valid('json' as never) as ReorderPropertyMediaInput

  try {
    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) return c.json({ success: false, error: 'Property not found.' }, 404)
    const media = await prisma.propertyMedia.findMany({ where: { propertyId: id } })
    if (body.mediaOrders.some((item) => !media.some((m) => m.id === item.id))) {
      return c.json({ success: false, error: 'Media does not belong to this property.' }, 400)
    }
    const covers = body.mediaOrders.filter((item) => item.isCover)
    if (covers.length > 1 || covers.some((item) => media.find((m) => m.id === item.id)?.category !== 'PHOTOGRAPH')) {
      return c.json({ success: false, error: 'Choose one photograph as the cover.' }, 400)
    }
    if (covers.length) await prisma.propertyMedia.updateMany({ where: { propertyId: id, isCover: true }, data: { isCover: false } })
    for (const item of body.mediaOrders) {
      await prisma.propertyMedia.updateMany({
        where: { id: item.id, propertyId: id },
        data: {
          order: item.order,
          ...(item.isCover !== undefined ? { isCover: item.isCover } : {}),
        },
      })
    }

    const updatedMedia = await prisma.propertyMedia.findMany({
      where: { propertyId: id },
      orderBy: { order: 'asc' },
    })

    return c.json({
      success: true,
      message: 'Media order updated successfully.',
      media: updatedMedia,
    })
  } catch (error: any) {
    console.error('Failed to reorder media:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to reorder media',
        code: 'MEDIA_REORDER_ERROR',
      },
      500
    )
  }
}

/**
 * 12. Archive / Restore Property
 */
export async function toggleArchivePropertyController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    const property = await prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      return c.json(
        {
          success: false,
          error: 'Property not found.',
          code: 'PROPERTY_NOT_FOUND',
        },
        404
      )
    }

    const nextArchived = !property.isArchived
    const updated = await prisma.property.update({
      where: { id },
      data: {
        isArchived: nextArchived,
        archivedAt: nextArchived ? new Date() : null,
      },
    })

    await prisma.propertyAuditLog.create({
      data: {
        propertyId: id,
        userId: partnerId,
        action: nextArchived ? 'ARCHIVED' : 'RESTORED',
        description: `Listing ${nextArchived ? 'archived' : 'restored'}`,
      },
    })

    return c.json({
      success: true,
      message: `Property ${nextArchived ? 'archived' : 'restored'} successfully.`,
      property: updated,
    })
  } catch (error: any) {
    console.error('Failed to toggle archive property:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to toggle archive state',
        code: 'PROPERTY_ARCHIVE_ERROR',
      },
      500
    )
  }
}

/**
 * 13. Full Delete Property (Purges all files from R2 and removes DB record)
 */
export async function deletePropertyController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const env = c.env
  const id = c.req.param('id')
  if (!id) return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        media: { select: { key: true } },
      },
    })

    if (!property) {
      return c.json(
        {
          success: false,
          error: 'Property not found.',
          code: 'PROPERTY_NOT_FOUND',
        },
        404
      )
    }

    // 1. Delete all media files in Cloudflare R2
    const keysToDelete = property.media.map((m) => m.key).filter(Boolean)
    if (keysToDelete.length > 0) {
      if (!(await deleteR2Objects(env, keysToDelete))) {
        return c.json({ success: false, error: 'Could not remove property files from storage. Please retry.', code: 'R2_DELETE_ERROR' }, 502)
      }
    }

    // 2. Delete Property from PostgreSQL (Cascade deletes media and audit logs in DB)
    await prisma.property.delete({
      where: { id },
    })

    return c.json({
      success: true,
      message: 'Property and all associated media files permanently deleted.',
    })
  } catch (error: any) {
    console.error('Failed to delete property:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to delete property',
        code: 'PROPERTY_DELETE_ERROR',
      },
      500
    )
  }
}

// ==========================================
// FILTER PRESETS CONTROLLERS (FR-SF-09)
// ==========================================

/**
 * 14. List Saved Filter Presets
 */
export async function listPropertyFilterPresetsController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    const presets = await prisma.propertyFilterPreset.findMany({
      where: { userId: partnerId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })

    return c.json({
      success: true,
      presets,
    })
  } catch (error: any) {
    console.error('Failed to list filter presets:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve filter presets',
        code: 'PRESETS_GET_ERROR',
      },
      500
    )
  }
}

/**
 * 15. Create / Save Filter Preset
 */
export async function createPropertyFilterPresetController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const body = await c.req.json()

  if (!body.name || !body.filters) {
    return c.json(
      {
        success: false,
        error: 'Preset name and filters object are required.',
        code: 'INVALID_INPUT',
      },
      400
    )
  }

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.propertyFilterPreset.updateMany({
        where: { userId: partnerId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const preset = await prisma.propertyFilterPreset.create({
      data: {
        userId: partnerId,
        name: body.name.trim(),
        filters: body.filters,
        isDefault: body.isDefault ?? false,
      },
    })

    return c.json(
      {
        success: true,
        message: 'Filter preset saved successfully.',
        preset,
      },
      201
    )
  } catch (error: any) {
    console.error('Failed to save filter preset:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to save filter preset',
        code: 'PRESET_CREATE_ERROR',
      },
      500
    )
  }
}

/**
 * 16. Delete Filter Preset
 */
export async function deletePropertyFilterPresetController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')
  const id = c.req.param('presetId')

  try {
    const partnerId = await resolveSourcePartnerId(prisma, user)

    const preset = await prisma.propertyFilterPreset.findFirst({
      where: { id, userId: partnerId },
    })

    if (!preset) {
      return c.json(
        {
          success: false,
          error: 'Filter preset not found.',
          code: 'PRESET_NOT_FOUND',
        },
        404
      )
    }

    await prisma.propertyFilterPreset.delete({
      where: { id },
    })

    return c.json({
      success: true,
      message: 'Filter preset deleted successfully.',
    })
  } catch (error: any) {
    console.error('Failed to delete filter preset:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to delete filter preset',
        code: 'PRESET_DELETE_ERROR',
      },
      500
    )
  }
}

/**
 * 17. Get High-Level Property Statistics
 */
export async function getPropertyStatsController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')

  try {
    const [
      totalProperties,
      availableCount,
      underNegotiationCount,
      dealDoneCount,
      directCount,
      brokerCount,
    ] = await Promise.all([
      prisma.property.count({ where: { isArchived: false, isDraft: false } }),
      prisma.property.count({
        where: { isArchived: false, isDraft: false, availabilityStatus: 'AVAILABLE' },
      }),
      prisma.property.count({
        where: {
          isArchived: false,
          isDraft: false,
          availabilityStatus: { in: ['UNDER_NEGOTIATION', 'TOKEN_PAID'] },
        },
      }),
      prisma.property.count({
        where: {
          isArchived: false,
          isDraft: false,
          availabilityStatus: { in: ['DEAL_DONE', 'SOLD', 'RENTED_OUT'] },
        },
      }),
      prisma.property.count({
        where: { isArchived: false, isDraft: false, accessType: 'DIRECT' },
      }),
      prisma.property.count({
        where: { isArchived: false, isDraft: false, accessType: 'BROKER' },
      }),
    ])

    return c.json({
      success: true,
      stats: {
        totalProperties,
        availableCount,
        underNegotiationCount,
        dealDoneCount,
        directCount,
        brokerCount,
      },
    })
  } catch (error: any) {
    console.error('Failed to calculate property statistics:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to calculate property statistics',
        code: 'STATS_ERROR',
      },
      500
    )
  }
}


/** Remove an uploaded file that could not be attached, without deleting attached media. */
export async function discardPropertyUploadController(c: Context<AppEnv>) {
  const id = c.req.param('id')
  const { key } = await c.req.json<{ key: string }>()
  if (!id || typeof key !== 'string' || !key.startsWith(`properties/${id}/`)) {
    return c.json({ success: false, error: 'Invalid upload key.' }, 400)
  }
  const prisma = c.get('prisma')
  const attached = await prisma.propertyMedia.findFirst({ where: { key } })
  if (attached) return c.json({ success: false, error: 'This file is already attached. Retry to restore it in the form, then remove it.' }, 409)
  if (!(await deleteR2Object(c.env, key))) return c.json({ success: false, error: 'Could not discard upload. Please retry.' }, 502)
  return c.json({ success: true })
}
