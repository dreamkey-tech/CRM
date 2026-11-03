import type { Context } from 'hono'
import type { Prisma } from '@prisma/client'
import type { AppEnv } from '../db'
import type { WebsitePropertyListQuery } from '../zod/website-property'

/**
 * 1. Public Website Property List API
 * Endpoint: GET /v1/website/properties/list (and GET /v1/website/properties)
 * Returns public property listings where `showInWebsite` is true, excluding all sensitive info.
 */
export async function listWebsitePropertiesController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const query = c.req.valid('query' as never) as WebsitePropertyListQuery

  const {
    page = 1,
    limit = 12,
    search,
    locationArea,
    city,
    propertyType,
    pricingType,
    minPrice,
    maxPrice,
    bedrooms,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query

  const skip = (page - 1) * limit
  const whereConditions: Prisma.PropertyWhereInput[] = [
    { showInWebsite: true },
    { isDraft: false },
    { isArchived: false },
  ]

  // Filter by Property Type (e.g. FLAT, COMMERCIAL, LAND, etc.)
  if (propertyType) {
    whereConditions.push({ propertyType })
  }

  // Filter by Pricing Type (SALE, RENT)
  if (pricingType) {
    whereConditions.push({ pricingType })
  }

  // Filter by Location / Area
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

  // Filter by City
  if (city) {
    whereConditions.push({
      city: { contains: city.trim(), mode: 'insensitive' },
    })
  }

  // Filter by Price / Budget range
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: Prisma.FloatFilter = {}
    if (minPrice !== undefined) priceCondition.gte = minPrice
    if (maxPrice !== undefined) priceCondition.lte = maxPrice
    whereConditions.push({ askingPrice: priceCondition })
  }

  // Filter by Bedrooms (e.g. "2", "3", "4", "2,3")
  if (bedrooms) {
    const tokens = bedrooms.split(',').map((b) => b.trim()).filter(Boolean)
    const bedroomClauses: Prisma.PropertyWhereInput[] = []
    for (const token of tokens) {
      if (token === '4+' || token === '4BHK_PLUS') {
        bedroomClauses.push({ bedrooms: { gte: 4 } })
      } else {
        const num = parseInt(token, 10)
        if (!isNaN(num)) {
          bedroomClauses.push({ bedrooms: num })
        }
      }
    }
    if (bedroomClauses.length > 0) {
      whereConditions.push({ OR: bedroomClauses })
    }
  }

  // Search keyword (society name, location, city)
  if (search && search.trim()) {
    const term = search.trim()
    whereConditions.push({
      OR: [
        { societyBuildingName: { contains: term, mode: 'insensitive' } },
        { locationArea: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
        { builderName: { contains: term, mode: 'insensitive' } },
      ],
    })
  }

  const where: Prisma.PropertyWhereInput = { AND: whereConditions }

  try {
    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          propertyType: true,
          societyBuildingName: true,
          locationArea: true,
          city: true,
          carpetAreaSqFt: true,
          superBuiltUpAreaSqFt: true,
          askingPrice: true,
          pricingType: true,
          bedrooms: true,
          bathrooms: true,
          amenities: true,
          availabilityStatus: true,
          createdAt: true,
          media: {
            where: {
              category: 'PHOTOGRAPH',
            },
            orderBy: [
              { isCover: 'desc' },
              { order: 'asc' },
            ],
            take: 3,
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              isCover: true,
              title: true,
            },
          },
        },
      }),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    const formattedProperties = properties.map((p) => {
      // Find designated cover image or fallback to the first photograph
      const cover = p.media.find((m) => m.isCover) || p.media[0] || null

      return {
        id: p.id,
        propertyType: p.propertyType,
        societyBuildingName: p.societyBuildingName,
        locationArea: p.locationArea,
        city: p.city,
        carpetAreaSqFt: p.carpetAreaSqFt,
        superBuiltUpAreaSqFt: p.superBuiltUpAreaSqFt,
        askingPrice: p.askingPrice,
        pricingType: p.pricingType,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        amenities: p.amenities,
        availabilityStatus: p.availabilityStatus,
        coverImage: cover ? cover.url : null,
        previewImages: p.media.map((m) => m.url),
      }
    })

    return c.json({
      success: true,
      properties: formattedProperties,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error: any) {
    console.error('Failed to list website properties:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to list website properties',
        code: 'WEBSITE_PROPERTIES_LIST_ERROR',
      },
      500
    )
  }
}

/**
 * Public Best Properties API
 * Endpoint: GET /best-properties (also GET /v1/website/properties/best-properties)
 * Public endpoint - no authentication required.
 * Returns public property listings where `isBestProperty` is true and `showInWebsite` is true,
 * excluding drafts, archived listings, and sensitive internal CRM fields.
 * Format is identical to the public listing endpoint (/website/properties/list).
 */
export async function listBestPropertiesController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')

  try {
    const properties = await prisma.property.findMany({
      where: {
        isBestProperty: true,
        showInWebsite: true,
        isDraft: false,
        isArchived: false,
      },
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        propertyType: true,
        societyBuildingName: true,
        locationArea: true,
        city: true,
        carpetAreaSqFt: true,
        superBuiltUpAreaSqFt: true,
        askingPrice: true,
        pricingType: true,
        bedrooms: true,
        bathrooms: true,
        amenities: true,
        availabilityStatus: true,
        createdAt: true,
        media: {
          where: {
            category: 'PHOTOGRAPH',
          },
          orderBy: [
            { isCover: 'desc' },
            { order: 'asc' },
          ],
          take: 3,
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            isCover: true,
            title: true,
          },
        },
      },
    })

    const formattedProperties = properties.map((p) => {
      const cover = p.media.find((m) => m.isCover) || p.media[0] || null

      return {
        id: p.id,
        propertyType: p.propertyType,
        societyBuildingName: p.societyBuildingName,
        locationArea: p.locationArea,
        city: p.city,
        carpetAreaSqFt: p.carpetAreaSqFt,
        superBuiltUpAreaSqFt: p.superBuiltUpAreaSqFt,
        askingPrice: p.askingPrice,
        pricingType: p.pricingType,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        amenities: p.amenities,
        availabilityStatus: p.availabilityStatus,
        coverImage: cover ? cover.url : null,
        previewImages: p.media.map((m) => m.url),
        isBestProperty: true,
      }
    })

    return c.json({
      success: true,
      properties: formattedProperties,
      total: formattedProperties.length,
    })
  } catch (error: any) {
    console.error('Failed to list best properties:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to list best properties',
        code: 'BEST_PROPERTIES_LIST_ERROR',
      },
      500
    )
  }
}

/**
 * 2. Record Website User Property Click / Interest
 * Endpoint: POST /v1/website/properties/:id/click (and /v1/website/properties/list/:id/click)
 * Guarded by `websiteAuthMiddleware`
 */
export async function trackWebsitePropertyClickController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const websiteUser = c.get('websiteUser')
  const id = c.req.param('id')

  if (!websiteUser) {
    return c.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  if (!id) {
    return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        societyBuildingName: true,
        showInWebsite: true,
        isDraft: true,
        isArchived: true,
      },
    })

    if (!property || property.isDraft || property.isArchived || !property.showInWebsite) {
      return c.json(
        {
          success: false,
          error: 'Property not found or not published on website',
          code: 'PROPERTY_NOT_FOUND',
        },
        404
      )
    }

    const ipAddress =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for') ||
      null
    const userAgent = c.req.header('user-agent') || null

    const click = await prisma.websitePropertyClick.create({
      data: {
        userId: websiteUser.id,
        propertyId: property.id,
        ipAddress,
        userAgent,
      },
    })

    return c.json(
      {
        success: true,
        message: 'Property click recorded successfully',
        data: {
          clickId: click.id,
          propertyId: property.id,
          societyBuildingName: property.societyBuildingName,
          userId: websiteUser.id,
          userEmail: websiteUser.email,
          recordedAt: click.createdAt,
        },
      },
      201
    )
  } catch (error: any) {
    console.error('Failed to record website property click:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to record click',
        code: 'TRACK_CLICK_ERROR',
      },
      500
    )
  }
}

/**
 * 3. Authenticated Property Details API
 * Endpoint: GET /v1/website/properties/list/:id (and GET /v1/website/properties/:id)
 * Guarded by `websiteAuthMiddleware`
 * Returns sanitized property details, excluding internal CRM notes, broker/owner contacts, and sensitive PDFs.
 */
export async function getWebsitePropertyDetailController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const websiteUser = c.get('websiteUser')
  const id = c.req.param('id')

  if (!websiteUser) {
    return c.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  if (!id) {
    return c.json({ success: false, error: 'Property ID is required', code: 'INVALID_ID' }, 400)
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        media: {
          where: {
            category: { in: ['PHOTOGRAPH', 'VIDEO', 'FLOOR_PLAN'] },
          },
          orderBy: [
            { isCover: 'desc' },
            { order: 'asc' },
          ],
          select: {
            id: true,
            category: true,
            title: true,
            url: true,
            thumbnailUrl: true,
            mimeType: true,
            sizeBytes: true,
            order: true,
            isCover: true,
          },
        },
      },
    })

    if (!property || property.isDraft || property.isArchived || !property.showInWebsite) {
      return c.json(
        {
          success: false,
          error: 'Property not found or not published on website',
          code: 'PROPERTY_NOT_FOUND',
        },
        404
      )
    }

    // Auto-record interaction if user hasn't clicked in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    const recentClick = await prisma.websitePropertyClick.findFirst({
      where: {
        userId: websiteUser.id,
        propertyId: property.id,
        createdAt: { gte: twoMinutesAgo },
      },
    })

    if (!recentClick) {
      const ipAddress =
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-forwarded-for') ||
        null
      const userAgent = c.req.header('user-agent') || null

      await prisma.websitePropertyClick.create({
        data: {
          userId: websiteUser.id,
          propertyId: property.id,
          ipAddress,
          userAgent,
        },
      }).catch((err) => {
        console.error('Non-blocking click record error in details:', err)
      })
    }

    const cover = property.media.find((m) => m.isCover) || property.media[0] || null

    // Sanitized payload excluding all sensitive CRM information
    const sanitizedProperty = {
      id: property.id,
      propertyType: property.propertyType,
      societyBuildingName: property.societyBuildingName,
      locationArea: property.locationArea,
      city: property.city,
      pincode: property.pincode,
      floorNumber: property.floorNumber,
      totalFloors: property.totalFloors,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      balconies: property.balconies,
      carpetAreaSqFt: property.carpetAreaSqFt,
      superBuiltUpAreaSqFt: property.superBuiltUpAreaSqFt,
      pricingType: property.pricingType,
      askingPrice: property.askingPrice,
      availabilityStatus: property.availabilityStatus,
      availabilityDate: property.availabilityDate,
      builderName: property.builderName,
      yearOfConstruction: property.yearOfConstruction,
      totalUnits: property.totalUnits,
      amenities: property.amenities,
      reraNumber: property.reraNumber,
      coverImage: cover ? cover.url : null,
      media: property.media,
      createdAt: property.createdAt,
    }

    return c.json({
      success: true,
      property: sanitizedProperty,
    })
  } catch (error: any) {
    console.error('Failed to get website property detail:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to get property detail',
        code: 'WEBSITE_PROPERTY_DETAIL_ERROR',
      },
      500
    )
  }
}
