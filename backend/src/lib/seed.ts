import type { PrismaClient } from '@prisma/client'

export const SYSTEM_PERMISSIONS = [
  // Super Admin Wildcard
  { name: '*:*', category: 'ALL', description: 'Full access to all system resources and actions' },

  // Leads
  { name: 'leads:read', category: 'LEADS', description: 'View and search leads' },
  { name: 'leads:create', category: 'LEADS', description: 'Create new leads' },
  { name: 'leads:update', category: 'LEADS', description: 'Edit existing leads' },
  { name: 'leads:delete', category: 'LEADS', description: 'Delete leads' },

  // Deals
  { name: 'deals:read', category: 'DEALS', description: 'View deals and pipelines' },
  { name: 'deals:create', category: 'DEALS', description: 'Create new deals' },
  { name: 'deals:update', category: 'DEALS', description: 'Edit deals and move stages' },
  { name: 'deals:delete', category: 'DEALS', description: 'Delete deals' },

  // Users & Staff
  { name: 'users:read', category: 'USERS', description: 'View staff members and profiles' },
  { name: 'users:create', category: 'USERS', description: 'Invite and create new users' },
  { name: 'users:update', category: 'USERS', description: 'Edit user accounts and statuses' },
  { name: 'users:delete', category: 'USERS', description: 'Deactivate or delete users' },

  // Roles & Permissions (RBAC)
  { name: 'roles:read', category: 'ROLES', description: 'View roles and their assigned permissions' },
  { name: 'roles:create', category: 'ROLES', description: 'Create custom roles' },
  { name: 'roles:update', category: 'ROLES', description: 'Modify role permissions' },
  { name: 'roles:delete', category: 'ROLES', description: 'Delete custom roles' },

  // Settings
  { name: 'settings:read', category: 'SETTINGS', description: 'View organization and CRM settings' },
  { name: 'settings:update', category: 'SETTINGS', description: 'Update CRM configurations and branding' },
]

/**
 * Seeds default system permissions and the SUPER_ADMIN / AGENT roles if they don't exist
 */
export async function seedSystemDefaults(prisma: PrismaClient) {
  // 1. Seed all permissions (upsert to avoid duplicates)
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { category: perm.category, description: perm.description },
      create: perm,
    })
  }

  // 2. Ensure SUPER_ADMIN role exists with *:* permission
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Full unrestricted administrative access across the CRM',
      isSystem: true,
    },
  })

  const superAdminPerm = await prisma.permission.findUnique({ where: { name: '*:*' } })
  if (superAdminPerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: superAdminPerm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: superAdminPerm.id,
      },
    })
  }

  // 3. Ensure a default SALES_AGENT role exists with standard lead/deal access
  const agentRole = await prisma.role.upsert({
    where: { name: 'SALES_AGENT' },
    update: {},
    create: {
      name: 'SALES_AGENT',
      description: 'Standard sales representative with lead and deal management access',
      isSystem: false,
    },
  })

  const agentPermNames = ['leads:read', 'leads:create', 'leads:update', 'deals:read', 'deals:create', 'deals:update']
  const agentPerms = await prisma.permission.findMany({
    where: { name: { in: agentPermNames } },
  })

  for (const perm of agentPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: agentRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: agentRole.id,
        permissionId: perm.id,
      },
    })
  }
}
