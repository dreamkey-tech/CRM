import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in .env')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper for random choice
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pickMulti = (arr, min = 1, max = 3) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randFloat = (min, max, decimals = 2) => +(Math.random() * (max - min) + min).toFixed(decimals)

const SYSTEM_PERMISSIONS = [
  { name: '*:*', category: 'ALL', description: 'Full access to all system resources and actions' },
  { name: 'properties:read', category: 'PROPERTIES', description: 'View property listings and details' },
  { name: 'properties:create', category: 'PROPERTIES', description: 'Create new properties and drafts' },
  { name: 'properties:update', category: 'PROPERTIES', description: 'Edit property details, media, and status' },
  { name: 'properties:delete', category: 'PROPERTIES', description: 'Delete or archive property records' },
  { name: 'clients:read', category: 'CLIENTS', description: 'View client directory and records' },
  { name: 'clients:create', category: 'CLIENTS', description: 'Register new clients' },
  { name: 'clients:update', category: 'CLIENTS', description: 'Edit client info, shortlists, and shares' },
  { name: 'clients:delete', category: 'CLIENTS', description: 'Delete client records and attachments' },
  { name: 'clients:documents:view_sensitive', category: 'CLIENTS', description: 'View and download confidential client documents (KYC, Aadhaar, Bank receipts)' },
  { name: 'brokers:read', category: 'BROKERS', description: 'View broker directory' },
  { name: 'brokers:create', category: 'BROKERS', description: 'Create new broker records' },
  { name: 'brokers:update', category: 'BROKERS', description: 'Edit broker details and expertise' },
  { name: 'brokers:delete', category: 'BROKERS', description: 'Delete broker records' },
  { name: 'owners:read', category: 'OWNERS', description: 'View property owner records' },
  { name: 'owners:create', category: 'OWNERS', description: 'Create new property owner records' },
  { name: 'owners:update', category: 'OWNERS', description: 'Edit owner details and assignments' },
  { name: 'owners:delete', category: 'OWNERS', description: 'Delete owner records' },
  { name: 'users:read', category: 'USERS', description: 'View website users, user analytics, and customer enquiries' },
  { name: 'users:create', category: 'USERS', description: 'Register or onboard website user accounts and enquiries' },
  { name: 'users:update', category: 'USERS', description: 'Update website user status and resolve customer enquiries' },
  { name: 'users:delete', category: 'USERS', description: 'Delete website user records and customer enquiries' },
  { name: 'finance:read', category: 'FINANCE', description: 'View financial reports, brokerage ledgers, and transactions' },
  { name: 'finance:manage', category: 'FINANCE', description: 'Create and edit financial records and commissions' },
  { name: 'tasks:read', category: 'TASKS', description: 'View assigned and team tasks' },
  { name: 'tasks:create', category: 'TASKS', description: 'Create and assign tasks' },
  { name: 'tasks:update', category: 'TASKS', description: 'Update task details and status' },
  { name: 'tasks:delete', category: 'TASKS', description: 'Delete tasks' },
  { name: 'employees:read', category: 'ORGANIZATION', description: 'View staff members and access profiles' },
  { name: 'employees:manage', category: 'ORGANIZATION', description: 'Create, update, deactivate staff, and configure module permissions' },
  { name: 'audit:read', category: 'AUDIT', description: 'Inspect audit logs and employee activity tracking' },
  { name: 'roles:read', category: 'ROLES', description: 'View roles and their assigned permissions' },
  { name: 'roles:create', category: 'ROLES', description: 'Create custom roles' },
  { name: 'roles:update', category: 'ROLES', description: 'Modify role permissions' },
  { name: 'roles:delete', category: 'ROLES', description: 'Delete custom roles' },
  { name: 'settings:read', category: 'SETTINGS', description: 'View organization and CRM settings' },
  { name: 'settings:update', category: 'SETTINGS', description: 'Update CRM configurations and branding' },
]

// Kolkata Locations & Pincodes
const LOCATIONS = [
  { area: 'New Town Action Area I', pincode: '700156' },
  { area: 'New Town Action Area II', pincode: '700157' },
  { area: 'New Town Action Area III', pincode: '700160' },
  { area: 'Rajarhat Main Road', pincode: '700135' },
  { area: 'Chinar Park', pincode: '700136' },
  { area: 'Salt Lake Sector V', pincode: '700091' },
  { area: 'Salt Lake Sector I', pincode: '700064' },
  { area: 'Salt Lake Sector III', pincode: '700098' },
  { area: 'EM Bypass - South City', pincode: '700068' },
  { area: 'EM Bypass - Silver Spring Area', pincode: '700105' },
  { area: 'EM Bypass - Mukundapur', pincode: '700099' },
  { area: 'Alipore', pincode: '700027' },
  { area: 'Ballygunge Circular Road', pincode: '700019' },
  { area: 'Park Street', pincode: '700016' },
  { area: 'Tollygunge Circular Road', pincode: '700033' },
  { area: 'Jadavpur', pincode: '700032' },
  { area: 'Behala Chowrasta', pincode: '700034' },
  { area: 'Garia Station Road', pincode: '700084' },
  { area: 'Kasba', pincode: '700042' },
  { area: 'Howrah Foreshore Road', pincode: '711102' },
  { area: 'Dankuni Logistics Hub', pincode: '712311' },
  { area: 'Vedic Village Enclave', pincode: '700135' },
]

const REAL_ESTATE_PROJECTS = [
  { name: 'DreamKey Altura', builder: 'DreamKey Infra', type: 'FLAT', areas: ['New Town Action Area II', 'New Town Action Area I'] },
  { name: 'The V - Ozone Urbana', builder: 'Ozone Group', type: 'FLAT', areas: ['New Town Action Area I'] },
  { name: 'Uniworld City - Heights', builder: 'Unitech', type: 'FLAT', areas: ['New Town Action Area III'] },
  { name: 'Uniworld City - Horizons', builder: 'Unitech', type: 'FLAT', areas: ['New Town Action Area III'] },
  { name: 'Tata Avenida', builder: 'Tata Housing', type: 'FLAT', areas: ['New Town Action Area II'] },
  { name: 'Tata Eden Court', builder: 'Tata Housing', type: 'FLAT', areas: ['New Town Action Area II'] },
  { name: 'Rosedale Garden', builder: 'Rosedale Developers', type: 'FLAT', areas: ['New Town Action Area III'] },
  { name: 'Elita Garden Vista', builder: 'Keppel Magus / Sureka Group', type: 'FLAT', areas: ['New Town Action Area III'] },
  { name: 'South City Towers', builder: 'South City Projects', type: 'FLAT', areas: ['EM Bypass - South City'] },
  { name: 'Silver Spring', builder: 'Silver Spring Group', type: 'FLAT', areas: ['EM Bypass - Silver Spring Area'] },
  { name: 'PS Aurus', builder: 'PS Group', type: 'FLAT', areas: ['EM Bypass - Silver Spring Area'] },
  { name: 'PS Navyom', builder: 'PS Group', type: 'FLAT', areas: ['Alipore'] },
  { name: 'PS Anassa', builder: 'PS Group', type: 'FLAT', areas: ['EM Bypass - Silver Spring Area'] },
  { name: 'Mani Imperial', builder: 'Mani Group', type: 'FLAT', areas: ['EM Bypass - Mukundapur'] },
  { name: 'Siddha Sky', builder: 'Siddha Group', type: 'FLAT', areas: ['EM Bypass - Silver Spring Area'] },
  { name: 'Siddha Suburbia', builder: 'Siddha Group', type: 'FLAT', areas: ['Garia Station Road'] },
  { name: 'Hiland Park', builder: 'Hiland Group', type: 'FLAT', areas: ['EM Bypass - Mukundapur'] },
  { name: 'Godrej Prakriti', builder: 'Godrej Properties', type: 'FLAT', areas: ['Rajarhat Main Road'] },
  { name: 'Godrej Platinum', builder: 'Godrej Properties', type: 'FLAT', areas: ['Alipore'] },
  { name: 'Utalika Luxury Living', builder: 'Ambuja Neotia', type: 'FLAT', areas: ['EM Bypass - Mukundapur'] },
  { name: 'Active Acres', builder: 'Ruchi Group', type: 'FLAT', areas: ['EM Bypass - Silver Spring Area'] },
  { name: 'Diamond City South', builder: 'Diamond Group', type: 'FLAT', areas: ['Tollygunge Circular Road'] },
  { name: 'Ideal Greens', builder: 'Ideal Group', type: 'FLAT', areas: ['Tollygunge Circular Road'] },
  { name: 'Ideal Unique Centre', builder: 'Ideal Group', type: 'COMMERCIAL', areas: ['Salt Lake Sector V', 'EM Bypass - Silver Spring Area'] },
  { name: 'Merlin 5th Avenue', builder: 'Merlin Group', type: 'FLAT', areas: ['Salt Lake Sector V'] },
  { name: 'Merlin Cambridge', builder: 'Merlin Group', type: 'FLAT', areas: ['Alipore'] },
  { name: 'Ambuja Upohar', builder: 'Ambuja Neotia', type: 'FLAT', areas: ['EM Bypass - Mukundapur'] },
  { name: 'Genexx Valley', builder: 'Paharpur Cooling Towers', type: 'FLAT', areas: ['Jadavpur', 'Behala Chowrasta'] },
  { name: 'Shrachi Greenwood Park', builder: 'Shrachi Realty', type: 'FLAT', areas: ['New Town Action Area I'] },
  { name: 'Orbit Sky View', builder: 'Orbit Group', type: 'FLAT', areas: ['Rajarhat Main Road'] },
  { name: 'Space Club Town Courtyard', builder: 'Space Group', type: 'FLAT', areas: ['Chinar Park'] },
  { name: 'Jain Dream Excellency', builder: 'Jain Group', type: 'FLAT', areas: ['Rajarhat Main Road'] },
  { name: 'Infinity Think Tank', builder: 'Infinity Infotech Parks', type: 'COMMERCIAL', areas: ['Salt Lake Sector V'] },
  { name: 'Godrej Genesis', builder: 'Godrej Properties', type: 'COMMERCIAL', areas: ['Salt Lake Sector V'] },
  { name: 'Mani Casadona', builder: 'Mani Group', type: 'COMMERCIAL', areas: ['New Town Action Area II'] },
  { name: 'Astra Towers', builder: 'Astra Group', type: 'COMMERCIAL', areas: ['New Town Action Area II'] },
  { name: 'DLF IT Park Tower 1', builder: 'DLF', type: 'COMMERCIAL', areas: ['New Town Action Area I'] },
  { name: 'Martin Burn Business Park', builder: 'Martin Burn', type: 'COMMERCIAL', areas: ['Salt Lake Sector V'] },
  { name: 'Vedic Sanjeevani Eco Plots', builder: 'Vedic Realty', type: 'LAND', areas: ['Vedic Village Enclave'] },
  { name: 'New Town Green Plotted Estate', builder: 'WBHIDCO Allottee', type: 'LAND', areas: ['New Town Action Area II', 'New Town Action Area III'] },
  { name: 'Rajarhat North Acres', builder: 'Private Landholder', type: 'LAND', areas: ['Rajarhat Main Road'] },
  { name: 'Dankuni Central Logistics Park', builder: 'Eastern Warehousing Corp', type: 'WAREHOUSE', areas: ['Dankuni Logistics Hub'] },
  { name: 'NH-6 Freight Terminal', builder: 'Bengal Logistics Ltd', type: 'WAREHOUSE', areas: ['Dankuni Logistics Hub', 'Howrah Foreshore Road'] },
]

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
]

const AMENITIES_POOL = [
  'Lake Facing',
  'Swimming Pool',
  'Gymnasium',
  'Clubhouse',
  'Power Backup',
  '24x7 Security & CCTV',
  'Covered Car Parking',
  'EV Charging Station',
  'High Speed Elevators',
  'Landscaped Gardens',
  'Children Play Area',
  'Intercom Facility',
  'Badminton Court',
  'Tennis Court',
  'Banquet Hall',
  'Rooftop Lounge',
  'Vastu Compliant',
  'Rainwater Harvesting',
  'Jogging Track',
  'Fire Fighting System',
]

const FIRST_NAMES = [
  'Debashis', 'Subir', 'Anirban', 'Sourav', 'Abhijit', 'Tanmay', 'Vikramaditya', 'Siddharth', 'Pradip', 'Somnath',
  'Aparna', 'Mousumi', 'Debolina', 'Ritabrata', 'Swati', 'Poulomi', 'Sunita', 'Pooja', 'Madhurima', 'Arpita',
  'Koushik', 'Mainak', 'Arindam', 'Amit', 'Rajesh', 'Sujit', 'Subrata', 'Kalyan', 'Tathagata', 'Sanjay',
  'Rohit', 'Farhan', 'Manish', 'Naveen', 'Rakesh', 'Deepak', 'Gautam', 'Kunal', 'Dev', 'Shubham',
  'Sharmistha', 'Indrani', 'Suchandra', 'Barnali', 'Rhea', 'Ananya', 'Sneha', 'Tania', 'Sonali', 'Keya'
]

const LAST_NAMES = [
  'Mukherjee', 'Banerjee', 'Chatterjee', 'Chakraborty', 'Bhattacharya', 'Ganguly', 'Ghosh', 'Bose', 'Mitra', 'Dutta',
  'Sen', 'Gupta', 'Roy', 'Sarkar', 'Das', 'Majumdar', 'Bhowmick', 'Saha', 'Basu', 'Pal',
  'Agarwal', 'Jain', 'Singhania', 'Choudhury', 'Mondal', 'Poddar', 'Khanna', 'Mehta', 'Sharma', 'Verma'
]

function getRandomName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
}

function getRandomPhone() {
  const prefix = pick(['9830', '9831', '9836', '9874', '9433', '9051', '7003', '8910', '9163'])
  const suffix = randInt(100000, 999999)
  return `+91 ${prefix}${suffix}`
}

async function cleanDomainTables() {
  console.log('>>> [1/7] Cleaning existing domain records (keeping users & auth intact)...')

  // Clean child tables first
  await prisma.clientPropertyShareMedia.deleteMany()
  await prisma.clientPropertyShare.deleteMany()
  await prisma.clientShortlistedProperty.deleteMany()
  await prisma.clientPartnerAssignment.deleteMany()
  await prisma.clientDocument.deleteMany()
  await prisma.propertyMedia.deleteMany()
  await prisma.propertyAuditLog.deleteMany()
  await prisma.propertyFilterPreset.deleteMany()
  await prisma.websitePropertyClick.deleteMany()

  // Clean finance tables
  await prisma.dueAndAdvanceRecord.deleteMany()
  await prisma.upcomingFinanceItem.deleteMany()
  await prisma.salaryDisbursement.deleteMany()
  await prisma.financeTransaction.deleteMany()

  // Clean task tables
  await prisma.taskAssignee.deleteMany()
  await prisma.task.deleteMany()

  // Clean notification & audit
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.websiteEnquiry.deleteMany()

  // Clean domain records
  await prisma.property.deleteMany()
  await prisma.client.deleteMany()
  await prisma.owner.deleteMany()
  await prisma.broker.deleteMany()

  console.log('✓ Cleaned domain tables.')
}

async function ensureRolesAndPermissions() {
  console.log('>>> [2/7] Seeding permissions and ensuring system roles...')

  // Seed all permissions
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { category: perm.category, description: perm.description },
      create: perm,
    })
  }

  async function ensureRole(roleName, description, permissionNames, isSystem = true) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: { description, isSystem },
      create: { name: roleName, description, isSystem },
    })

    const perms = await prisma.permission.findMany({
      where: { name: { in: permissionNames } },
    })

    for (const p of perms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: p.id,
        },
      })
    }
    return role
  }

  const superAdminRole = await ensureRole(
    'SUPER_ADMIN',
    'Full unrestricted administrative access across the CRM',
    ['*:*'],
    true
  )

  const salesAgentRole = await ensureRole(
    'SALES_AGENT',
    'Standard sales representative with property and client management access',
    [
      'properties:read', 'properties:create', 'properties:update',
      'clients:read', 'clients:create', 'clients:update',
      'brokers:read', 'owners:read', 'tasks:read', 'tasks:create', 'tasks:update'
    ],
    true
  )

  const telecallerRole = await ensureRole(
    'TELECALLER',
    'Telecalling representative with limited view access and client management',
    ['properties:read', 'brokers:read', 'owners:read', 'clients:read', 'clients:create', 'clients:update', 'tasks:read'],
    true
  )

  const viewOnlyRole = await ensureRole(
    'VIEW_ONLY',
    'Read-only access to properties, clients, brokers, and owners',
    ['properties:read', 'clients:read', 'brokers:read', 'owners:read', 'tasks:read'],
    true
  )

  console.log('✓ Permissions and default roles initialized.')
  return { superAdminRole, salesAgentRole, telecallerRole, viewOnlyRole }
}

async function ensureUsers({ superAdminRole, salesAgentRole, telecallerRole }) {
  console.log('>>> [3/7] Ensuring active users and team members...')

  const defaultPassword = 'admin@123'
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(defaultPassword, salt)

  // Map known users
  const userConfigs = [
    { email: 'admin@dreamkey.com', name: 'jeet', role: superAdminRole },
    { email: 'jeet999dev@gmail.com', name: 'Priya Sharma', role: superAdminRole },
    { email: 'mainak@dreamkeykol.com', name: 'Mainak Mukherjee', role: salesAgentRole },
    { email: 'koushik02269@gmail.com', name: 'Koushik Roy', role: telecallerRole },
    // Additional realistic team members
    { email: 'vikram.s@dreamkeykol.com', name: 'Vikram Sengupta (Sr. Consultant)', role: salesAgentRole },
    { email: 'ananya.m@dreamkeykol.com', name: 'Ananya Mukherjee (Key Accounts)', role: salesAgentRole },
    { email: 'rajesh.d@dreamkeykol.com', name: 'Rajesh Das (Field Agent)', role: salesAgentRole },
    { email: 'sneha.r@dreamkeykol.com', name: 'Sneha Roy (Finance & Billing)', role: superAdminRole },
  ]

  const users = []
  for (const uc of userConfigs) {
    let u = await prisma.user.findUnique({ where: { email: uc.email } })
    if (!u) {
      u = await prisma.user.create({
        data: {
          email: uc.email,
          name: uc.name,
          passwordHash,
          isActive: true,
        },
      })
    } else {
      await prisma.user.update({
        where: { id: u.id },
        data: { isActive: true, name: uc.name },
      })
    }

    // Assign role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: u.id,
          roleId: uc.role.id,
        },
      },
      update: {},
      create: {
        userId: u.id,
        roleId: uc.role.id,
      },
    })

    users.push(u)
  }

  console.log(`✓ Configured ${users.length} active team members.`)
  return users
}

async function seedBrokersAndOwners(users) {
  console.log('>>> [4/7] Seeding 60 brokers and 75 property owners...')

  const brokers = []
  for (let i = 1; i <= 60; i++) {
    const loc = pick(LOCATIONS)
    const partner = pick(users)
    const name = getRandomName()
    const agencyName = `${name.split(' ')[1]} ${pick(['Realtors', 'Real Estate', 'Properties', 'Associates', 'Housing Consult', 'Estates'])}`
    const broker = await prisma.broker.create({
      data: {
        name: `${name} (${agencyName})`,
        phone: getRandomPhone(),
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${i}@gmail.com`,
        whatsappNumber: getRandomPhone(),
        areaOfOperation: loc.area,
        primaryContactPartnerId: partner.id,
        minDealValue: pick([2500000, 4000000, 6000000, 10000000, 15000000, 25000000]),
        societyExpertise: pickMulti(['Uniworld City', 'Tata Avenida', 'South City', 'Urbana', 'Silver Spring', 'Rosedale', 'Elita Vista', 'PS Aurus'], 2, 4),
        status: i > 55 ? 'INACTIVE' : 'ACTIVE',
        notes: `Established channel partner specializing in ${loc.area}. Has high network of NRI buyers and commercial tenants.`,
      },
    })
    brokers.push(broker)
  }

  const owners = []
  for (let i = 1; i <= 75; i++) {
    const partner = pick(users)
    const name = getRandomName()
    const isNRI = i % 5 === 0
    const address = isNRI
      ? pick(['Dubai Marina, UAE', 'London SW1, UK', 'Downtown Singapore', 'Sunnyvale, California, USA'])
      : `${randInt(12, 180)} ${pick(['Southern Avenue', 'Salt Lake Block CD', 'Lake Gardens', 'New Town Action Area II', 'Alipore Park Road', 'Ballygunge Circular Road'])}, Kolkata`

    const owner = await prisma.owner.create({
      data: {
        name,
        phone: getRandomPhone(),
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${i}@yahoo.com`,
        whatsappNumber: getRandomPhone(),
        address,
        primaryContactPartnerId: partner.id,
        createdById: partner.id,
        status: i > 70 ? 'INACTIVE' : 'ACTIVE',
        notes: isNRI
          ? 'NRI investor owner. Prefers communication over WhatsApp and email. Requires digital signing & rental deposit management.'
          : 'High Networth Individual. Looking for serious buyers with immediate bank loan approval.',
      },
    })
    owners.push(owner)
  }

  console.log(`✓ Seeded ${brokers.length} brokers and ${owners.length} owners.`)
  return { brokers, owners }
}

async function seedProperties({ users, brokers, owners }) {
  console.log('>>> [5/7] Seeding 160 realistic properties with media...')

  const properties = []
  const statuses = [
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    'UNDER_NEGOTIATION', 'UNDER_NEGOTIATION',
    'TOKEN_PAID', 'DEAL_DONE', 'RENTED_OUT', 'SOLD', 'UPCOMING'
  ]

  for (let i = 0; i < 160; i++) {
    const proj = pick(REAL_ESTATE_PROJECTS)
    const locArea = pick(proj.areas)
    const matchedLoc = LOCATIONS.find(l => l.area === locArea) || pick(LOCATIONS)
    const partner = pick(users)
    const isBrokerAccess = i % 2 === 0
    const broker = isBrokerAccess ? pick(brokers) : null
    const owner = isBrokerAccess ? null : pick(owners)

    const isRent = i % 4 === 0
    const propType = proj.type

    let bedrooms = 3
    let bathrooms = 3
    let balconies = 2
    let carpet = 1450
    let superBuilt = 1950
    let askingPrice = 13500000 // ₹1.35 Cr

    if (propType === 'FLAT') {
      const bhk = pick([1, 2, 2, 3, 3, 3, 4, 4, 5])
      bedrooms = bhk
      bathrooms = bhk === 1 ? 1 : bhk === 2 ? 2 : bhk === 3 ? randInt(2, 3) : randInt(3, 4)
      balconies = randInt(1, 3)
      carpet = bhk === 1 ? randInt(450, 620) : bhk === 2 ? randInt(720, 950) : bhk === 3 ? randInt(1150, 1600) : randInt(1800, 2800)
      superBuilt = Math.round(carpet * randFloat(1.3, 1.4))

      if (isRent) {
        askingPrice = bhk === 1 ? randInt(15, 22) * 1000 : bhk === 2 ? randInt(22, 38) * 1000 : bhk === 3 ? randInt(38, 75) * 1000 : randInt(80, 160) * 1000
      } else {
        const sqftRate = locArea.includes('Alipore') ? randInt(14000, 22000) : locArea.includes('South City') || locArea.includes('Silver Spring') ? randInt(9000, 14000) : randInt(5500, 9500)
        askingPrice = Math.round((superBuilt * sqftRate) / 50000) * 50000
      }
    } else if (propType === 'COMMERCIAL') {
      bedrooms = null
      bathrooms = randInt(2, 6)
      balconies = null
      carpet = randInt(850, 5000)
      superBuilt = Math.round(carpet * 1.4)
      askingPrice = isRent ? Math.round(superBuilt * randInt(65, 120)) : Math.round(superBuilt * randInt(8000, 15000))
    } else if (propType === 'LAND') {
      bedrooms = null
      bathrooms = null
      balconies = null
      carpet = randInt(2160, 7200) // 3 to 10 Kottahs
      superBuilt = carpet
      askingPrice = randInt(45, 250) * 100000
    } else if (propType === 'WAREHOUSE') {
      bedrooms = null
      bathrooms = randInt(2, 4)
      balconies = null
      carpet = randInt(5000, 35000)
      superBuilt = carpet
      askingPrice = isRent ? Math.round(carpet * randInt(22, 38)) : Math.round(carpet * randInt(2800, 4500))
    }

    const floorNum = propType === 'FLAT' || propType === 'COMMERCIAL' ? randInt(1, 30) : null
    const totalFlr = floorNum ? randInt(floorNum, 32) : null
    const status = pick(statuses)
    const showInWebsite = i < 40 // First 40 visible on website
    const isBestProp = showInWebsite && i % 3 === 0

    const unitNo = propType === 'FLAT' ? `Tower ${randInt(1, 6)}, Flat ${randInt(10, 28)}${pick(['A', 'B', 'C', 'D'])}` : `Unit ${randInt(101, 804)}`

    const prop = await prisma.property.create({
      data: {
        societyBuildingName: `${proj.name} (${unitNo})`,
        propertyType: propType,
        pricingType: isRent ? 'RENT' : 'SALE',
        locationArea: matchedLoc.area,
        city: 'Kolkata',
        pincode: matchedLoc.pincode,
        floorNumber: floorNum,
        totalFloors: totalFlr,
        bedrooms,
        bathrooms,
        balconies,
        carpetAreaSqFt: carpet,
        superBuiltUpAreaSqFt: superBuilt,
        askingPrice,
        availabilityStatus: status,
        availabilityDate: new Date(),
        accessType: isBrokerAccess ? 'BROKER' : 'DIRECT',
        brokerId: broker ? broker.id : null,
        ownerId: owner ? owner.id : null,
        sourcePartnerId: partner.id,
        builderName: proj.builder,
        yearOfConstruction: randInt(2018, 2024),
        totalUnits: randInt(60, 450),
        amenities: pickMulti(AMENITIES_POOL, 4, 8),
        reraNumber: `WBRERA/P/KOL/${randInt(2021, 2024)}/${randInt(100100, 999999)}`,
        showInWebsite,
        isBestProperty: isBestProp,
        isDraft: false,
        isArchived: status === 'SOLD' && i % 4 === 0,
        notes: `High potential listing in ${matchedLoc.area}. Direct connectivity to major transit corridors, IT hubs, and metro.`,
      },
    })

    // Attach 1 to 3 images for the property
    const imageCount = (showInWebsite || i < 60) ? randInt(2, 3) : 1
    for (let imgIdx = 0; imgIdx < imageCount; imgIdx++) {
      const imgUrl = pick(PROPERTY_IMAGES)
      await prisma.propertyMedia.create({
        data: {
          propertyId: prop.id,
          category: 'PHOTOGRAPH',
          title: `${prop.societyBuildingName} - View ${imgIdx + 1}`,
          key: `properties/${prop.id}/photo_${imgIdx + 1}.jpg`,
          url: imgUrl,
          mimeType: 'image/jpeg',
          sizeBytes: randInt(1200000, 4500000),
          order: imgIdx,
          isCover: imgIdx === 0,
        },
      })
    }

    properties.push(prop)
  }

  console.log(`✓ Seeded ${properties.length} properties with full media portfolios.`)
  return properties
}

async function seedClientsAndShortlists({ users, properties }) {
  console.log('>>> [6/7] Seeding 170 clients, assignments, shortlists, and documents...')

  const clients = []
  const docCategories = ['KYC', 'AADHAAR', 'PAYMENT_RECEIPT', 'CLIENT_DOCUMENT']

  for (let i = 1; i <= 170; i++) {
    const creator = pick(users)
    const name = getRandomName()
    const client = await prisma.client.create({
      data: {
        name,
        phone: getRandomPhone(),
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${i}@gmail.com`,
        whatsappNumber: getRandomPhone(),
        address: `${randInt(1, 100)}, ${pick(['Salt Lake Sector 1', 'New Town Action Area 1', 'Southern Avenue', 'Gariahat', 'Howrah'])}`,
        status: i > 155 ? 'INACTIVE' : 'ACTIVE',
        createdById: creator.id,
        notes: `Client looking for 2-4BHK premium property in New Town / EM Bypass. Budget: ₹80L - ₹2.5Cr. Priority: Ready to Move / Near IT Hub.`,
      },
    })

    // Assign to 1-2 partners
    const assignedPartners = pickMulti(users, 1, 2)
    for (const p of assignedPartners) {
      await prisma.clientPartnerAssignment.upsert({
        where: {
          clientId_partnerId: {
            clientId: client.id,
            partnerId: p.id,
          },
        },
        update: {},
        create: {
          clientId: client.id,
          partnerId: p.id,
          assignedById: creator.id,
        },
      })
    }

    // Shortlist 1-3 properties for ~80% of clients
    if (i <= 140) {
      const shortlistedProps = pickMulti(properties, 1, 3)
      for (const sp of shortlistedProps) {
        await prisma.clientShortlistedProperty.create({
          data: {
            clientId: client.id,
            propertyId: sp.id,
            status: pick(['SHORTLISTED', 'SHARED', 'VISITED', 'INTERESTED', 'NOT_INTERESTED']),
            notes: 'Client reviewed brochure and requested private site visit.',
            addedById: creator.id,
          },
        })
      }
    }

    // Upload mock KYC document for ~40% of clients
    if (i <= 70) {
      const cat = pick(docCategories)
      await prisma.clientDocument.create({
        data: {
          clientId: client.id,
          category: cat,
          title: `${name} - Verified ${cat} Document`,
          originalName: `${name.toLowerCase().replace(/\s+/g, '_')}_${cat.toLowerCase()}.pdf`,
          key: `clients/${client.id}/docs/${cat.toLowerCase()}_${Date.now()}.pdf`,
          mimeType: 'application/pdf',
          sizeBytes: randInt(250000, 1800000),
          uploadedById: creator.id,
        },
      })
    }

    clients.push(client)
  }

  console.log(`✓ Seeded ${clients.length} clients with partner assignments and shortlists.`)
  return clients
}

async function seedTasks({ users, clients, properties }) {
  console.log('>>> [7/7 part a] Seeding 130 operational tasks & assignees...')

  const taskTemplates = [
    { title: 'Site visit with client at {property}', category: 'SITE_VISIT', priority: 'HIGH' },
    { title: 'Physical key handover & inventory checklist for {property}', category: 'SITE_VISIT', priority: 'MEDIUM' },
    { title: 'Collect agreement advance token cheque from {client}', category: 'DOCUMENT_WORK', priority: 'HIGH' },
    { title: 'Verify title deed and mutation clearance for {property}', category: 'DOCUMENT_WORK', priority: 'HIGH' },
    { title: 'Preliminary investor meeting with {client}', category: 'CLIENT_MEETING', priority: 'MEDIUM' },
    { title: 'Price negotiation conference with Owner & {client}', category: 'CLIENT_MEETING', priority: 'HIGH' },
    { title: 'Follow-up on SBI home loan sanction letter for {client}', category: 'DOCUMENT_WORK', priority: 'MEDIUM' },
    { title: 'Quarterly channel partner brokerage reconciliation', category: 'ADMIN', priority: 'LOW' },
    { title: 'Renew online property portal ads and social campaigns', category: 'ADMIN', priority: 'MEDIUM' },
    { title: 'Draft Deed of Conveyance with legal counsel for {property}', category: 'DOCUMENT_WORK', priority: 'HIGH' },
    { title: 'Property inspection & professional photography at {property}', category: 'SITE_VISIT', priority: 'MEDIUM' },
  ]

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  for (let i = 0; i < 130; i++) {
    const tmpl = pick(taskTemplates)
    const client = pick(clients)
    const prop = pick(properties)
    const creator = pick(users)

    const title = tmpl.title
      .replace('{property}', prop.societyBuildingName.split('(')[0].trim())
      .replace('{client}', client.name)

    // Dates spread from -15 days to +30 days
    const dayOffset = randInt(-15, 30)
    const dueDate = new Date(now + dayOffset * dayMs)

    let status = 'TODO'
    let completedAt = null
    let completedBy = null

    if (dayOffset < 0) {
      status = pick(['DONE', 'DONE', 'DONE', 'CANCELLED'])
      if (status === 'DONE') {
        completedAt = new Date(dueDate.getTime() + randInt(1, 5) * 3600 * 1000)
        completedBy = pick(users).id
      }
    } else if (dayOffset === 0 || dayOffset < 3) {
      status = pick(['TODO', 'IN_PROGRESS', 'IN_PROGRESS'])
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: `Ensure complete verification of client preferences and timely coordination. Reference property: ${prop.societyBuildingName}.`,
        dueDate,
        priority: tmpl.priority,
        category: tmpl.category,
        status,
        createdById: creator.id,
        completedById: completedBy,
        completedAt,
        clientId: client.id,
        propertyId: prop.id,
      },
    })

    // Assign 1-2 users
    const assignees = pickMulti(users, 1, 2)
    for (const u of assignees) {
      await prisma.taskAssignee.create({
        data: {
          taskId: task.id,
          userId: u.id,
        },
      })
    }
  }

  console.log('✓ Seeded 130 operational tasks across team members.')
}

async function seedFinance({ users, clients, properties, brokers, owners }) {
  console.log('>>> [7/7 part b] Seeding finance ledger, salaries, dues, and pipeline forecasts...')

  const incomeCategories = ['BROKERAGE_RECEIVED', 'SALE_COMMISSION', 'RENTAL_COMMISSION', 'CONSULTATION_FEES']
  const expenseCategories = ['OFFICE_RENT', 'MARKETING', 'TRAVEL_FUEL', 'SALARY', 'UTILITIES', 'LEGAL_PROFESSIONAL', 'OFFICE_SUPPLIES', 'MISCELLANEOUS']
  const paymentModes = ['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH']

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  // 1. Transactions (160 transactions over past 6 months)
  for (let i = 0; i < 160; i++) {
    const isIncome = i % 3 !== 0 // 66% income, 34% expense
    const creator = pick(users)
    const partner = pick(users)
    const prop = pick(properties)
    const client = pick(clients)

    const daysAgo = randInt(1, 180)
    const txDate = new Date(now - daysAgo * dayMs)
    const mode = pick(paymentModes)
    const refNum = mode === 'CASH' ? null : `TXN${randInt(10000000, 99999999)}`

    if (isIncome) {
      const incCat = pick(incomeCategories)
      const amount = incCat === 'SALE_COMMISSION' || incCat === 'BROKERAGE_RECEIVED'
        ? randInt(150, 950) * 1000
        : incCat === 'RENTAL_COMMISSION'
          ? randInt(25, 120) * 1000
          : randInt(15, 60) * 1000

      await prisma.financeTransaction.create({
        data: {
          type: 'INCOME',
          incomeCategory: incCat,
          amount,
          transactionDate: txDate,
          paymentMode: mode,
          referenceNumber: refNum,
          description: `${incCat.replace(/_/g, ' ')} received from ${client.name} for ${prop.societyBuildingName.split('(')[0].trim()}`,
          partnerId: partner.id,
          propertyId: prop.id,
          clientId: client.id,
          createdById: creator.id,
        },
      })
    } else {
      const expCat = pick(expenseCategories)
      const amount = expCat === 'OFFICE_RENT'
        ? 85000
        : expCat === 'MARKETING'
          ? randInt(25, 75) * 1000
          : expCat === 'LEGAL_PROFESSIONAL'
            ? randInt(15, 45) * 1000
            : expCat === 'SALARY'
              ? randInt(40, 90) * 1000
              : randInt(3, 20) * 1000

      await prisma.financeTransaction.create({
        data: {
          type: 'EXPENSE',
          expenseCategory: expCat,
          amount,
          transactionDate: txDate,
          paymentMode: mode,
          referenceNumber: refNum,
          description: `${expCat.replace(/_/g, ' ')} - Monthly settlement & operations expense`,
          partnerId: partner.id,
          createdById: creator.id,
        },
      })
    }
  }

  // 2. Salary Disbursements for the 8 active staff members (months 8, 9, 10 of 2026)
  const salaryMonths = [8, 9, 10]
  for (const m of salaryMonths) {
    for (const emp of users) {
      const baseSalary = randInt(45, 95) * 1000
      const bonus = randInt(0, 25) * 1000
      const deductions = randInt(0, 5) * 1000
      const netPaid = baseSalary + bonus - deductions
      const payDate = new Date(2026, m - 1, 28)

      // Create linked finance transaction first
      const tx = await prisma.financeTransaction.create({
        data: {
          type: 'EXPENSE',
          expenseCategory: 'SALARY',
          amount: netPaid,
          transactionDate: payDate,
          paymentMode: 'BANK_TRANSFER',
          referenceNumber: `SAL${m}2026-${emp.id.slice(0, 6).toUpperCase()}`,
          description: `Monthly salary disbursement for ${emp.name} (${m}/2026)`,
          partnerId: emp.id,
          createdById: users[0].id,
        },
      })

      await prisma.salaryDisbursement.create({
        data: {
          employeeId: emp.id,
          month: m,
          year: 2026,
          baseSalary,
          bonusIncentive: bonus,
          deductions,
          netPaid,
          paymentDate: payDate,
          paymentMode: 'BANK_TRANSFER',
          referenceNumber: tx.referenceNumber,
          notes: 'Standard electronic NEFT salary transfer with performance incentive.',
          transactionId: tx.id,
          disbursedById: users[0].id,
        },
      })
    }
  }

  // 3. Upcoming Finance Items / Pipeline forecasts (45 forecasts)
  for (let i = 0; i < 45; i++) {
    const isIncome = i % 2 === 0
    const daysAhead = randInt(3, 60)
    const expDate = new Date(now + daysAhead * dayMs)
    const creator = pick(users)
    const partner = pick(users)
    const prop = pick(properties)
    const client = pick(clients)

    if (isIncome) {
      const amount = randInt(120, 850) * 1000
      await prisma.upcomingFinanceItem.create({
        data: {
          type: 'INCOME',
          category: 'BROKERAGE_RECEIVED',
          title: `Expected closing commission for ${prop.societyBuildingName.split('(')[0].trim()}`,
          expectedAmount: amount,
          expectedDate: expDate,
          status: 'PENDING',
          notes: 'Agreement drafting in progress. Token paid, awaiting bank disbursement.',
          propertyId: prop.id,
          clientId: client.id,
          partnerId: partner.id,
          createdById: creator.id,
        },
      })
    } else {
      const amount = randInt(25, 85) * 1000
      await prisma.upcomingFinanceItem.create({
        data: {
          type: 'EXPENSE',
          category: pick(['OFFICE_RENT', 'MARKETING', 'LEGAL_PROFESSIONAL']),
          title: `Upcoming scheduled vendor billing & media campaign`,
          expectedAmount: amount,
          expectedDate: expDate,
          status: 'PENDING',
          notes: 'Scheduled monthly operational commitment.',
          partnerId: partner.id,
          createdById: creator.id,
        },
      })
    }
  }

  // 4. Dues and Advances (50 records)
  const dueTypes = ['RECEIVABLE', 'PAYABLE', 'ADVANCE_GIVEN', 'ADVANCE_RECEIVED']
  for (let i = 0; i < 50; i++) {
    const creator = pick(users)
    const dType = pick(dueTypes)
    const totalAmount = randInt(20, 350) * 1000
    const settledAmount = i % 3 === 0 ? Math.round(totalAmount * randFloat(0.3, 0.7)) : 0
    const remainingAmount = totalAmount - settledAmount
    const status = remainingAmount === 0 ? 'SETTLED' : settledAmount > 0 ? 'PARTIALLY_SETTLED' : 'PENDING'

    let partyName = ''
    let partyType = 'CLIENT'
    let brokerId = null
    let ownerId = null
    let clientId = null

    if (dType === 'RECEIVABLE') {
      const client = pick(clients)
      partyName = client.name
      partyType = 'CLIENT'
      clientId = client.id
    } else if (dType === 'PAYABLE') {
      const broker = pick(brokers)
      partyName = broker.name
      partyType = 'BROKER'
      brokerId = broker.id
    } else if (dType === 'ADVANCE_RECEIVED') {
      const client = pick(clients)
      partyName = client.name
      partyType = 'CLIENT'
      clientId = client.id
    } else {
      const owner = pick(owners)
      partyName = owner.name
      partyType = 'OWNER'
      ownerId = owner.id
    }

    await prisma.dueAndAdvanceRecord.create({
      data: {
        type: dType,
        partyName,
        partyType,
        totalAmount,
        settledAmount,
        remainingAmount,
        dueDate: new Date(now + randInt(5, 45) * dayMs),
        status,
        notes: `Ledger entry for ${partyName} under ${dType}. Formal invoice / receipt generated.`,
        clientId,
        brokerId,
        ownerId,
        createdById: creator.id,
      },
    })
  }

  console.log('✓ Seeded complete Finance ledger: 160 transactions, 24 salary disbursements, 45 forecasts, and 50 dues/advances.')
}

async function seedWebsiteEnquiriesAndUsers({ properties }) {
  console.log('>>> [7/7 part c] Seeding 65 website enquiries, portal users, and property clicks...')

  const enquiryStatuses = ['NEW', 'IN_PROGRESS', 'CONTACTED', 'RESOLVED', 'CLOSED']
  const budgetBands = [
    '₹35 Lakhs - ₹50 Lakhs',
    '₹50 Lakhs - ₹80 Lakhs',
    '₹80 Lakhs - ₹1.2 Crore',
    '₹1.2 Crore - ₹2.0 Crore',
    '₹2.0 Crore - ₹4.5 Crore',
    'Above ₹4.5 Crore'
  ]

  for (let i = 1; i <= 65; i++) {
    const name = getRandomName()
    const loc = pick(LOCATIONS)
    const pType = pick(['3 BHK Flat', '2 BHK Flat', '4 BHK Luxury Penthouse', 'Commercial Office Space', 'Residential Villa Plot'])

    await prisma.websiteEnquiry.create({
      data: {
        fullName: name,
        mobileNo: getRandomPhone(),
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${i}@outlook.com`,
        propertyType: pType,
        preferredLocation: loc.area,
        estimatedBudgetBand: pick(budgetBands),
        specificRequirements: `Need immediate possession property with lake view or high floor corner unit. Must have 2 car parking spaces and gym.`,
        status: pick(enquiryStatuses),
        notes: `Enquiry submitted via DreamKey Portal property discovery landing page.`,
      },
    })
  }

  // Seed 30 portal users with property clicks
  for (let i = 1; i <= 30; i++) {
    const name = getRandomName()
    const webUser = await prisma.websiteUser.create({
      data: {
        email: `buyer.${name.toLowerCase().replace(/\s+/g, '')}${i}@gmail.com`,
        name,
        emailVerified: true,
        authProvider: 'EMAIL',
        loginCount: randInt(2, 28),
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    })

    // Add clicks for 2-5 properties
    const clickedProps = pickMulti(properties, 2, 5)
    for (const cp of clickedProps) {
      await prisma.websitePropertyClick.create({
        data: {
          userId: webUser.id,
          propertyId: cp.id,
          ipAddress: `103.21.${randInt(10, 240)}.${randInt(1, 254)}`,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
        },
      })
    }
  }

  console.log('✓ Seeded 65 website enquiries and 30 active portal users with click analytics.')
}

async function seedNotificationsAndAuditLogs({ users, properties, clients }) {
  console.log('>>> [7/7 part d] Seeding notifications and audit logs...')

  const notificationTypes = [
    { type: 'NEW_ENQUIRY', title: 'New High-Value Website Enquiry', msg: 'A prospective buyer submitted an enquiry for 3BHK in New Town Action Area II.' },
    { type: 'LEAD_ASSIGNED', title: 'New Client Assigned', msg: 'You have been assigned as primary relationship partner for a new verified lead.' },
    { type: 'SECURITY_ALERT', title: 'Role Permissions Updated', msg: 'System permissions synchronized with RBAC master policy.' },
    { type: 'CLIENT_UPDATE', title: 'Document Verified', msg: 'Client KYC and Aadhaar verification completed and archived.' },
    { type: 'SYSTEM', title: 'Monthly Revenue Target Achieved', msg: 'DreamKey CRM team has surpassed the quarterly gross commission projection!' },
  ]

  for (let i = 0; i < 60; i++) {
    const tmpl = pick(notificationTypes)
    const targetUser = pick(users)
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        requiredPermission: null,
        title: tmpl.title,
        message: tmpl.msg,
        type: tmpl.type,
        isRead: i > 25,
        readAt: i > 25 ? new Date() : null,
      },
    })
  }

  // Audit Logs
  const auditActions = [
    { action: 'LOGIN', module: 'AUTH', details: 'Successful sign-in via session credentials' },
    { action: 'CREATE', module: 'PROPERTIES', details: 'Added new verified property listing to directory' },
    { action: 'UPDATE', module: 'CLIENTS', details: 'Updated client requirement status to VISITED' },
    { action: 'CREATE', module: 'FINANCE', details: 'Recorded incoming brokerage payment invoice' },
    { action: 'CREATE', module: 'TASKS', details: 'Scheduled site visit with key stakeholders' },
  ]

  for (let i = 0; i < 90; i++) {
    const act = pick(auditActions)
    const user = pick(users)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: act.action,
        module: act.module,
        details: `${act.details} by ${user.name}`,
        status: 'SUCCESS',
      },
    })
  }

  console.log('✓ Seeded 60 notifications and 90 system audit logs.')
}

async function main() {
  console.log('====================================================')
  console.log('🚀 DREAMKEY CRM RIGID TEST DATA SEEDER')
  console.log('====================================================\n')

  try {
    await cleanDomainTables()
    const roles = await ensureRolesAndPermissions()
    const users = await ensureUsers(roles)
    const { brokers, owners } = await seedBrokersAndOwners(users)
    const properties = await seedProperties({ users, brokers, owners })
    const clients = await seedClientsAndShortlists({ users, properties })
    await seedTasks({ users, clients, properties })
    await seedFinance({ users, clients, properties, brokers, owners })
    await seedWebsiteEnquiriesAndUsers({ properties })
    await seedNotificationsAndAuditLogs({ users, properties, clients })

    console.log('\n====================================================')
    console.log('✨ RIGID SEED COMPLETED SUCCESSFULLY!')
    console.log('====================================================')
  } catch (error) {
    console.error('\n❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
