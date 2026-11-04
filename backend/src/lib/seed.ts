import type { PrismaClient } from '@prisma/client'

export const SYSTEM_PERMISSIONS = [
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

  // Tasks (FR-TK-01: Any partner can create and manage tasks)
  { name: 'tasks:read', category: 'TASKS', description: 'View assigned and team tasks' },
  { name: 'tasks:create', category: 'TASKS', description: 'Create and assign tasks' },
  { name: 'tasks:update', category: 'TASKS', description: 'Update task details and status' },
  { name: 'tasks:delete', category: 'TASKS', description: 'Delete tasks' },

  // Employees & Organization (RBAC)
  { name: 'employees:read', category: 'ORGANIZATION', description: 'View staff members and access profiles' },
  { name: 'employees:manage', category: 'ORGANIZATION', description: 'Create, update, deactivate staff, and configure module permissions' },

  // Audit Logs
  { name: 'audit:read', category: 'AUDIT', description: 'Inspect audit logs and employee activity tracking' },

  // Roles & Permissions (Legacy / Low-level)
  { name: 'roles:read', category: 'ROLES', description: 'View roles and their assigned permissions' },
  { name: 'roles:create', category: 'ROLES', description: 'Create custom roles' },
  { name: 'roles:update', category: 'ROLES', description: 'Modify role permissions' },
  { name: 'roles:delete', category: 'ROLES', description: 'Delete custom roles' },

  // Settings
  { name: 'settings:read', category: 'SETTINGS', description: 'View organization and CRM settings' },
  { name: 'settings:update', category: 'SETTINGS', description: 'Update CRM configurations and branding' },
]

let systemDefaultsSeeded = false

/**
 * Seeds default system permissions and pre-configured roles if they don't exist
 */
export async function seedSystemDefaults(prisma: PrismaClient) {
  if (systemDefaultsSeeded) return

  // Fast check: If permissions already exist, skip running serial database upserts
  const count = await prisma.permission.count()
  if (count >= SYSTEM_PERMISSIONS.length) {
    const existing = await prisma.permission.findMany({ select: { name: true } })
    const existingSet = new Set(existing.map((p) => p.name))
    const missing = SYSTEM_PERMISSIONS.filter((p) => !existingSet.has(p.name))
    if (missing.length === 0) {
      systemDefaultsSeeded = true
      return
    }
  }

  // 1. Seed all permissions (upsert to avoid duplicates)
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { category: perm.category, description: perm.description },
      create: perm,
    })
  }

  // Helper to sync role with a list of permission names
  async function ensureRole(roleName: string, description: string, permissionNames: string[], isSystem = false) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: { description, isSystem },
      create: {
        name: roleName,
        description,
        isSystem,
      },
    })

    const permissions = await prisma.permission.findMany({
      where: { name: { in: permissionNames } },
    })

    for (const perm of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
      })
    }

    return role
  }

  // 2. Ensure SUPER_ADMIN role exists with *:* permission
  await ensureRole('SUPER_ADMIN', 'Full unrestricted administrative access across the CRM', ['*:*'], true)

  // 3. Ensure SALES_AGENT role exists
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
      'tasks:read',
      'tasks:create',
      'tasks:update',
    ],
    true
  )

  // 4. Ensure TELECALLER role exists (No finance, no sensitive docs, view-only on brokers/owners)
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
      'tasks:read',
      'tasks:create',
      'tasks:update',
    ],
    true
  )

  // 5. Ensure VIEW_ONLY role exists
  await ensureRole(
    'VIEW_ONLY',
    'Read-only access to properties, clients, brokers, owners, users, and tasks',
    ['properties:read', 'clients:read', 'brokers:read', 'owners:read', 'users:read', 'tasks:read'],
    true
  )

  systemDefaultsSeeded = true
}
