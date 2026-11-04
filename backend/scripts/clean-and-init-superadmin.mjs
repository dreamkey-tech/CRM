import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in .env')
  process.exit(1)
}

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const SYSTEM_PERMISSIONS = [
  // Super Admin Wildcard
  { name: '*:*', category: 'ALL', description: 'Full access to all system resources and actions' },

  // Properties
  { name: 'properties:read', category: 'PROPERTIES', description: 'View property listings and details' },
  { name: 'properties:create', category: 'PROPERTIES', description: 'Create new properties and drafts' },
  { name: 'properties:update', category: 'PROPERTIES', description: 'Edit property details, media, and status' },
  { name: 'properties:delete', category: 'PROPERTIES', description: 'Delete or archive property records' },

  // Clients
  { name: 'clients:read', category: 'CLIENTS', description: 'View client directory and records' },
  { name: 'clients:create', category: 'CLIENTS', description: 'Register new clients' },
  { name: 'clients:update', category: 'CLIENTS', description: 'Edit client info, shortlists, and shares' },
  { name: 'clients:delete', category: 'CLIENTS', description: 'Delete client records and attachments' },
  { name: 'clients:documents:view_sensitive', category: 'CLIENTS', description: 'View and download confidential client documents (KYC, Aadhaar, Bank receipts)' },

  // Brokers
  { name: 'brokers:read', category: 'BROKERS', description: 'View broker directory' },
  { name: 'brokers:create', category: 'BROKERS', description: 'Create new broker records' },
  { name: 'brokers:update', category: 'BROKERS', description: 'Edit broker details and expertise' },
  { name: 'brokers:delete', category: 'BROKERS', description: 'Delete broker records' },

  // Owners
  { name: 'owners:read', category: 'OWNERS', description: 'View property owner records' },
  { name: 'owners:create', category: 'OWNERS', description: 'Create new property owner records' },
  { name: 'owners:update', category: 'OWNERS', description: 'Edit owner details and assignments' },
  { name: 'owners:delete', category: 'OWNERS', description: 'Delete owner records' },

  // User Management (Website Users & Enquiries)
  { name: 'users:read', category: 'USERS', description: 'View website users, user analytics, and customer enquiries' },
  { name: 'users:create', category: 'USERS', description: 'Register or onboard website user accounts and enquiries' },
  { name: 'users:update', category: 'USERS', description: 'Update website user status and resolve customer enquiries' },
  { name: 'users:delete', category: 'USERS', description: 'Delete website user records and customer enquiries' },

  // Finance
  { name: 'finance:read', category: 'FINANCE', description: 'View financial reports, brokerage ledgers, and transactions' },
  { name: 'finance:manage', category: 'FINANCE', description: 'Create and edit financial records and commissions' },

  // Tasks
  { name: 'tasks:read', category: 'TASKS', description: 'View assigned and team tasks' },
  { name: 'tasks:create', category: 'TASKS', description: 'Create and assign tasks' },
  { name: 'tasks:update', category: 'TASKS', description: 'Update task details and status' },
  { name: 'tasks:delete', category: 'TASKS', description: 'Delete tasks' },

  // Employees & Organization (RBAC)
  { name: 'employees:read', category: 'ORGANIZATION', description: 'View staff members and access profiles' },
  { name: 'employees:manage', category: 'ORGANIZATION', description: 'Create, update, deactivate staff, and configure module permissions' },

  // Audit Logs
  { name: 'audit:read', category: 'AUDIT', description: 'Inspect audit logs and employee activity tracking' },

  // Roles & Permissions
  { name: 'roles:read', category: 'ROLES', description: 'View roles and their assigned permissions' },
  { name: 'roles:create', category: 'ROLES', description: 'Create custom roles' },
  { name: 'roles:update', category: 'ROLES', description: 'Modify role permissions' },
  { name: 'roles:delete', category: 'ROLES', description: 'Delete custom roles' },

  // Settings
  { name: 'settings:read', category: 'SETTINGS', description: 'View organization and CRM settings' },
  { name: 'settings:update', category: 'SETTINGS', description: 'Update CRM configurations and branding' },
]

async function cleanDatabase() {
  console.log('>>> [1/4] Cleaning existing records from database in foreign key dependency order...')

  // Step 1: Child tables of clients & properties
  await prisma.clientPropertyShareMedia.deleteMany()
  await prisma.clientPropertyShare.deleteMany()
  await prisma.clientShortlistedProperty.deleteMany()
  await prisma.clientPartnerAssignment.deleteMany()
  await prisma.clientDocument.deleteMany()
  await prisma.propertyMedia.deleteMany()
  await prisma.propertyAuditLog.deleteMany()
  await prisma.propertyFilterPreset.deleteMany()

  // Step 2: Main domain tables
  await prisma.property.deleteMany()
  await prisma.client.deleteMany()
  await prisma.owner.deleteMany()
  await prisma.broker.deleteMany()

  // Step 3: Audit, sessions, website records
  await prisma.auditLog.deleteMany()
  await prisma.session.deleteMany()
  await prisma.websiteUserSession.deleteMany()
  await prisma.websiteEnquiry.deleteMany()
  await prisma.websiteUser.deleteMany()

  // Step 4: Auth & RBAC tables
  await prisma.userRole.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()

  console.log('✓ All database tables successfully cleared.')
}

async function seedRbac() {
  console.log('>>> [2/4] Seeding system permissions and default roles...')

  // Insert permissions
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

  await ensureRole(
    'SALES_AGENT',
    'Standard sales representative with property and client management access',
    [
      'properties:read',
      'properties:create',
      'properties:update',
      'clients:read',
      'clients:create',
      'clients:update',
      'brokers:read',
      'owners:read',
    ],
    true
  )

  await ensureRole(
    'TELECALLER',
    'Telecalling representative with limited view access and client management',
    [
      'properties:read',
      'brokers:read',
      'owners:read',
      'clients:read',
      'clients:create',
      'clients:update',
    ],
    true
  )

  await ensureRole(
    'VIEW_ONLY',
    'Read-only access to properties, clients, brokers, and owners',
    ['properties:read', 'clients:read', 'brokers:read', 'owners:read'],
    true
  )

  console.log('✓ System permissions and roles created.')
  return superAdminRole
}

async function createSuperAdmin(superAdminRole) {
  console.log('>>> [3/4] Creating single Super Admin user (jeet)...')

  const email = 'admin@dreamkey.com'
  const name = 'jeet'
  const rawPassword = 'admin@123'
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(rawPassword, salt)

  const superAdminUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      isActive: true,
    },
  })

  // Assign SUPER_ADMIN role
  await prisma.userRole.create({
    data: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  })

  // Log audit entry
  await prisma.auditLog.create({
    data: {
      userId: superAdminUser.id,
      action: 'SYSTEM_INITIALIZED',
      module: 'AUTH',
      resourceId: superAdminUser.id,
      resourceName: 'jeet',
      details: 'Cleaned database and created initial Super Admin account for jeet.',
      status: 'SUCCESS',
    },
  })

  console.log('✓ Super Admin created successfully.')
  return { superAdminUser, email, rawPassword }
}

async function verifyState() {
  console.log('>>> [4/4] Verifying clean database state...')

  const users = await prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  })

  const counts = {
    totalUsers: await prisma.user.count(),
    totalProperties: await prisma.property.count(),
    totalClients: await prisma.client.count(),
    totalBrokers: await prisma.broker.count(),
    totalOwners: await prisma.owner.count(),
    totalWebsiteUsers: await prisma.websiteUser.count(),
    totalSessions: await prisma.session.count(),
    totalRoles: await prisma.role.count(),
    totalPermissions: await prisma.permission.count(),
    totalAuditLogs: await prisma.auditLog.count(),
  }

  console.log('Database Counts:', JSON.stringify(counts, null, 2))
  console.log('Active Users:', JSON.stringify(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles.map((r) => r.role.name),
      permissions: u.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.name)),
    })),
    null,
    2
  ))
}

async function run() {
  try {
    await cleanDatabase()
    const superAdminRole = await seedRbac()
    const { email, rawPassword } = await createSuperAdmin(superAdminRole)
    await verifyState()

    console.log('\n======================================================')
    console.log('🎉 DATABASE CLEANUP & SUPER ADMIN CREATION COMPLETE!')
    console.log('======================================================')
    console.log(`Email:    ${email}`)
    console.log(`Password: ${rawPassword}`)
    console.log(`Name:     jeet`)
    console.log(`Role:     SUPER_ADMIN (*:*)`)
    console.log('======================================================\n')
  } catch (error) {
    console.error('Fatal error during database cleanup & setup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

run()
