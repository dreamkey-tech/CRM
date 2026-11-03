import pg from 'pg'
import crypto from 'crypto'

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_2EVzjARl6DNP@ep-bold-sky-b3c1198e-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const PROPERTIES_DATA = [
  {
    societyBuildingName: 'DreamKey Altura',
    propertyType: 'FLAT',
    pricingType: 'SALE',
    locationArea: 'New Town Action Area II',
    city: 'Kolkata',
    pincode: '700156',
    floorNumber: 14,
    totalFloors: 28,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    carpetAreaSqFt: 1850,
    superBuiltUpAreaSqFt: 2450,
    askingPrice: 18500000, // ₹1.85 Cr
    availabilityStatus: 'AVAILABLE',
    builderName: 'DreamKey Infra',
    yearOfConstruction: 2024,
    totalUnits: 180,
    amenities: [
      'Lake Facing',
      'Sky Lounge',
      'Infinity Swimming Pool',
      'High Speed Elevators',
      '24x7 Security & CCTV',
      'Gymnasium',
      'Clubhouse',
      'Power Backup',
    ],
    reraNumber: 'WBRERA/P/NOR/2023/000412',
    notes: 'Premium lake-facing tower in Action Area II. High floor with uninterrupted view.',
    showInWebsite: true,
    isDraft: false,
    isArchived: false,
    images: [
      {
        title: 'DreamKey Altura - Architectural Elevation',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
      },
      {
        title: 'Ultra-Luxury Living & Dining Suite',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        isCover: false,
      },
      {
        title: 'Master Bedroom with Lake Panorama',
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        isCover: false,
      },
    ],
  },
  {
    societyBuildingName: 'The V - Ozone Urbana',
    propertyType: 'FLAT',
    pricingType: 'SALE',
    locationArea: 'New Town Action Area I',
    city: 'Kolkata',
    pincode: '700156',
    floorNumber: 19,
    totalFloors: 32,
    bedrooms: 4,
    bathrooms: 4,
    balconies: 3,
    carpetAreaSqFt: 2350,
    superBuiltUpAreaSqFt: 3100,
    askingPrice: 24500000, // ₹2.45 Cr
    availabilityStatus: 'AVAILABLE',
    builderName: 'Ozone Group',
    yearOfConstruction: 2023,
    totalUnits: 240,
    amenities: [
      'Private Elevator Lobby',
      'Olympic Size Pool',
      'Tennis Court',
      'Banquet Hall',
      'Power Backup',
      'Children Play Area',
      'Landscaped Gardens',
      '24x7 Security & CCTV',
    ],
    reraNumber: 'WBRERA/P/NOR/2022/000198',
    notes: 'Executive 4 BHK Penthouse-style unit with dual master suites and private elevator landing.',
    showInWebsite: true,
    isDraft: false,
    isArchived: false,
    images: [
      {
        title: 'The V - Sky High Towers',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
      },
      {
        title: 'Designer Italian Marble Living Room',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        isCover: false,
      },
    ],
  },
  {
    societyBuildingName: 'PS One10',
    propertyType: 'FLAT',
    pricingType: 'SALE',
    locationArea: 'New Town Action Area I',
    city: 'Kolkata',
    pincode: '700156',
    floorNumber: 8,
    totalFloors: 22,
    bedrooms: 3,
    bathrooms: 2,
    balconies: 1,
    carpetAreaSqFt: 1250,
    superBuiltUpAreaSqFt: 1680,
    askingPrice: 11500000, // ₹1.15 Cr
    availabilityStatus: 'AVAILABLE',
    builderName: 'PS Group',
    yearOfConstruction: 2024,
    totalUnits: 350,
    amenities: [
      'Olympic Size Lap Pool',
      'Badminton Court',
      'Day Care Center',
      'Co-working Lounge',
      'Gymnasium',
      'Power Backup',
      'High Speed Elevators',
    ],
    reraNumber: 'WBRERA/P/NOR/2021/000076',
    notes: 'Family-centric society directly opposite Eco Space IT Hub and Novotel.',
    showInWebsite: true,
    isDraft: false,
    isArchived: false,
    images: [
      {
        title: 'PS One10 - Podium Architecture',
        url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
      },
      {
        title: 'Chic Contemporary Interior',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        isCover: false,
      },
    ],
  },
  {
    societyBuildingName: 'Siddha Galaxia Phase II',
    propertyType: 'FLAT',
    pricingType: 'SALE',
    locationArea: 'Rajarhat Main Road',
    city: 'Kolkata',
    pincode: '700136',
    floorNumber: 11,
    totalFloors: 18,
    bedrooms: 3,
    bathrooms: 2,
    balconies: 2,
    carpetAreaSqFt: 1380,
    superBuiltUpAreaSqFt: 1820,
    askingPrice: 9500000, // ₹95 Lakhs
    availabilityStatus: 'AVAILABLE',
    builderName: 'Siddha Group',
    yearOfConstruction: 2023,
    totalUnits: 420,
    amenities: [
      'Worlds Longest Rooftop Skywalk',
      '43000 Sq Ft Club',
      'Multi-tier Security',
      'Swimming Pool',
      'High Speed Elevators',
      'Yoga & Meditation Deck',
    ],
    reraNumber: 'WBRERA/P/NOR/2020/000215',
    notes: 'Rajarhat expressway frontage with world record rooftop skywalk. Minutes to City Centre 2.',
    showInWebsite: true,
    isDraft: false,
    isArchived: false,
    images: [
      {
        title: 'Siddha Galaxia Skywalk Elevation',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
      },
      {
        title: 'Warm & Airy Living Room',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        isCover: false,
      },
    ],
  },
  {
    societyBuildingName: 'Mani Casadona Corporate Suite',
    propertyType: 'COMMERCIAL',
    pricingType: 'SALE',
    locationArea: 'New Town Action Area II',
    city: 'Kolkata',
    pincode: '700156',
    floorNumber: 7,
    totalFloors: 16,
    bedrooms: null,
    bathrooms: 2,
    balconies: null,
    carpetAreaSqFt: 2100,
    superBuiltUpAreaSqFt: 2950,
    askingPrice: 21000000, // ₹2.10 Cr
    availabilityStatus: 'AVAILABLE',
    builderName: 'Mani Group',
    yearOfConstruction: 2022,
    totalUnits: 90,
    amenities: [
      'Grade-A Commercial Tower',
      'Centralized HVAC',
      '100% DG Power Backup',
      'Multi-level Car Parking',
      'Food Court',
      'High-speed Elevators',
      '24x7 High-tech Surveillance',
    ],
    reraNumber: 'WBRERA/P/NOR/2019/000045',
    notes: 'Fully functional IT/ITES commercial office space in Action Area II financial district.',
    showInWebsite: true,
    isDraft: false,
    isArchived: false,
    images: [
      {
        title: 'Mani Casadona Commercial Facade',
        url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
      },
      {
        title: 'Furnished Executive Conference & Reception',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        isCover: false,
      },
    ],
  },
  {
    societyBuildingName: 'Uniworld City - Gardens',
    propertyType: 'FLAT',
    pricingType: 'RENT',
    locationArea: 'New Town Action Area III',
    city: 'Kolkata',
    pincode: '700160',
    floorNumber: 16,
    totalFloors: 24,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    carpetAreaSqFt: 1650,
    superBuiltUpAreaSqFt: 2150,
    askingPrice: 42000, // ₹42,000 / month
    availabilityStatus: 'AVAILABLE',
    builderName: 'Unitech Group',
    yearOfConstruction: 2021,
    totalUnits: 310,
    amenities: [
      '80% Green Open Spaces',
      'Clubhouse',
      'Tennis & Basketball Courts',
      'Jogging Track',
      'Central Park',
      '24x7 Security & CCTV',
      'Power Backup',
    ],
    reraNumber: 'WBRERA/P/NOR/2020/000189',
    notes: 'Furnished 3 BHK flat available for immediate rent in Action Area III near D.P.S. Megacity.',
    showInWebsite: true,
    isDraft: false,
    isArchived: false,
    images: [
      {
        title: 'Uniworld City Gardens Complex View',
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
      },
      {
        title: 'Spacious Park-Facing Living Room',
        url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        isCover: false,
      },
    ],
  },
]

async function seed() {
  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()
  console.log('Connected to Neon PostgreSQL...')

  // 1. Resolve source partner ID
  const partnerRes = await client.query(`SELECT id, email, name FROM "users" LIMIT 1`)
  if (partnerRes.rows.length === 0) {
    throw new Error('No user found in database. Please run superadmin creation first.')
  }
  const partnerId = partnerRes.rows[0].id
  console.log(`Using source partner: ${partnerRes.rows[0].name || partnerRes.rows[0].email} (${partnerId})`)

  let createdCount = 0

  for (const prop of PROPERTIES_DATA) {
    // Check if property with societyBuildingName already exists
    const existing = await client.query(
      `SELECT id FROM "properties" WHERE "societyBuildingName" = $1 LIMIT 1`,
      [prop.societyBuildingName]
    )

    let propertyId

    if (existing.rows.length > 0) {
      propertyId = existing.rows[0].id
      console.log(`Updating existing property: ${prop.societyBuildingName} (${propertyId})`)
      await client.query(
        `UPDATE "properties" SET
          "propertyType" = $1,
          "pricingType" = $2,
          "locationArea" = $3,
          "city" = $4,
          "pincode" = $5,
          "floorNumber" = $6,
          "totalFloors" = $7,
          "bedrooms" = $8,
          "bathrooms" = $9,
          "balconies" = $10,
          "carpetAreaSqFt" = $11,
          "superBuiltUpAreaSqFt" = $12,
          "askingPrice" = $13,
          "availabilityStatus" = $14,
          "builderName" = $15,
          "yearOfConstruction" = $16,
          "totalUnits" = $17,
          "amenities" = $18,
          "reraNumber" = $19,
          "notes" = $20,
          "showInWebsite" = $21,
          "isDraft" = $22,
          "isArchived" = $23,
          "updatedAt" = NOW()
        WHERE id = $24`,
        [
          prop.propertyType,
          prop.pricingType,
          prop.locationArea,
          prop.city,
          prop.pincode,
          prop.floorNumber,
          prop.totalFloors,
          prop.bedrooms,
          prop.bathrooms,
          prop.balconies,
          prop.carpetAreaSqFt,
          prop.superBuiltUpAreaSqFt,
          prop.askingPrice,
          prop.availabilityStatus,
          prop.builderName,
          prop.yearOfConstruction,
          prop.totalUnits,
          prop.amenities,
          prop.reraNumber,
          prop.notes,
          prop.showInWebsite,
          prop.isDraft,
          prop.isArchived,
          propertyId,
        ]
      )
    } else {
      propertyId = crypto.randomUUID()
      console.log(`Inserting new property: ${prop.societyBuildingName} (${propertyId})`)
      await client.query(
        `INSERT INTO "properties" (
          id,
          "isDraft",
          "isArchived",
          "showInWebsite",
          "propertyType",
          "societyBuildingName",
          "locationArea",
          "pincode",
          "city",
          "floorNumber",
          "totalFloors",
          "bedrooms",
          "bathrooms",
          "balconies",
          "carpetAreaSqFt",
          "superBuiltUpAreaSqFt",
          "pricingType",
          "askingPrice",
          "availabilityStatus",
          "accessType",
          "sourcePartnerId",
          "builderName",
          "yearOfConstruction",
          "totalUnits",
          "amenities",
          "reraNumber",
          "notes",
          "createdAt",
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, NOW(), NOW()
        )`,
        [
          propertyId,
          prop.isDraft,
          prop.isArchived,
          prop.showInWebsite,
          prop.propertyType,
          prop.societyBuildingName,
          prop.locationArea,
          prop.pincode,
          prop.city,
          prop.floorNumber,
          prop.totalFloors,
          prop.bedrooms,
          prop.bathrooms,
          prop.balconies,
          prop.carpetAreaSqFt,
          prop.superBuiltUpAreaSqFt,
          prop.pricingType,
          prop.askingPrice,
          prop.availabilityStatus,
          'DIRECT',
          partnerId,
          prop.builderName,
          prop.yearOfConstruction,
          prop.totalUnits,
          prop.amenities,
          prop.reraNumber,
          prop.notes,
        ]
      )
      createdCount++
    }

    // Clear old media if re-seeding
    await client.query(`DELETE FROM "property_media" WHERE "propertyId" = $1`, [propertyId])

    // Insert cool high-res images
    for (const [idx, img] of prop.images.entries()) {
      const mediaId = crypto.randomUUID()
      const storageKey = `properties/${propertyId}/photograph/${idx + 1}.jpg`
      await client.query(
        `INSERT INTO "property_media" (
          id,
          "propertyId",
          category,
          title,
          key,
          url,
          "thumbnailUrl",
          "mimeType",
          "sizeBytes",
          "order",
          "isCover",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          mediaId,
          propertyId,
          'PHOTOGRAPH',
          img.title,
          storageKey,
          img.url,
          img.url,
          'image/jpeg',
          1850000,
          idx,
          img.isCover,
        ]
      )
    }
  }

  console.log(`\n🎉 Seed finished! Populated ${PROPERTIES_DATA.length} realistic properties with photos.`)
  await client.end()
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
