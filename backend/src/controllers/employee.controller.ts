import type { Context } from 'hono'
import type { AppEnv } from '../db'
import { hashPassword } from '../lib/auth'
import { logAudit } from '../lib/audit'
import { seedSystemDefaults } from '../lib/seed'
import { sendEmployeeWelcomeEmail, sendPasswordResetEmail } from '../services/email'
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  ResetEmployeePasswordInput,
  EmployeeQueryInput,
  ModuleAccessInput,
} from '../zod/employee'

export function moduleAccessToPermissions(access: ModuleAccessInput): string[] {
  const perms = new Set<string>()

  // Properties
  if (access.properties === 'VIEW') perms.add('properties:read')
  if (access.properties === 'FULL') {
    perms.add('properties:read')
    perms.add('properties:create')
    perms.add('properties:update')
    perms.add('properties:delete')
  }

  // Clients
  if (access.clients === 'VIEW') perms.add('clients:read')
  if (access.clients === 'FULL') {
    perms.add('clients:read')
    perms.add('clients:create')
    perms.add('clients:update')
    perms.add('clients:delete')
  }
  if (access.canViewSensitiveDocs) {
    perms.add('clients:documents:view_sensitive')
  }

  // Brokers
  if (access.brokers === 'VIEW') perms.add('brokers:read')
  if (access.brokers === 'FULL') {
    perms.add('brokers:read')
    perms.add('brokers:create')
    perms.add('brokers:update')
    perms.add('brokers:delete')
  }

  // Owners
  if (access.owners === 'VIEW') perms.add('owners:read')
  if (access.owners === 'FULL') {
    perms.add('owners:read')
    perms.add('owners:create')
    perms.add('owners:update')
    perms.add('owners:delete')
  }

  // Users (Website Users & Enquiries)
  if (access.users === 'VIEW') perms.add('users:read')
  if (access.users === 'FULL') {
    perms.add('users:read')
    perms.add('users:create')
    perms.add('users:update')
    perms.add('users:delete')
  }

  // Tasks
  if (access.tasks === 'VIEW') perms.add('tasks:read')
  if (access.tasks === 'FULL') {
    perms.add('tasks:read')
    perms.add('tasks:create')
    perms.add('tasks:update')
    perms.add('tasks:delete')
  }

  // Finance
  if (access.finance === 'VIEW') perms.add('finance:read')
  if (access.finance === 'FULL') {
    perms.add('finance:read')
    perms.add('finance:manage')
  }

  return Array.from(perms)
}

export function permissionsToModuleAccess(permissions: string[]): ModuleAccessInput {
  const isSuper = permissions.includes('*:*')
  const has = (p: string) => isSuper || permissions.includes(p)

  const calc = (read: string, create: string): 'NONE' | 'VIEW' | 'FULL' => {
    if (has(create)) return 'FULL'
    if (has(read)) return 'VIEW'
    return 'NONE'
  }

  return {
    properties: calc('properties:read', 'properties:create'),
    clients: calc('clients:read', 'clients:create'),
    brokers: calc('brokers:read', 'brokers:create'),
    owners: calc('owners:read', 'owners:create'),
    users: calc('users:read', 'users:create'),
    tasks: calc('tasks:read', 'tasks:create'),
    finance: has('finance:manage') ? 'FULL' : has('finance:read') ? 'VIEW' : 'NONE',
    canViewSensitiveDocs: has('clients:documents:view_sensitive'),
  }
}

/**
 * List employees with search, filter, pagination, roles, and computed module access
 */
export const listEmployeesController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const query = c.req.valid('query' as never) as EmployeeQueryInput

  const where: any = {}

  if (query.status === 'ACTIVE') where.isActive = true
  if (query.status === 'INACTIVE') where.isActive = false

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  const employees = users.map((u) => {
    const roleNames = u.roles.map((r) => r.role.name)
    const permsSet = new Set<string>()
    for (const r of u.roles) {
      for (const p of r.role.permissions) {
        permsSet.add(p.permission.name)
      }
    }
    const permissions = Array.from(permsSet)

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      isActive: u.isActive,
      roles: roleNames,
      permissions,
      moduleAccess: permissionsToModuleAccess(permissions),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }
  })

  return c.json({
    success: true,
    employees,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  })
}

/**
 * Get employee details by ID
 */
export const getEmployeeByIdController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return c.json({ success: false, error: 'Employee not found.', code: 'NOT_FOUND' }, 404)
  }

  const roleNames = user.roles.map((r) => r.role.name)
  const permsSet = new Set<string>()
  for (const r of user.roles) {
    for (const p of r.role.permissions) {
      permsSet.add(p.permission.name)
    }
  }
  const permissions = Array.from(permsSet)

  return c.json({
    success: true,
    employee: {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roles: roleNames,
      permissions,
      moduleAccess: permissionsToModuleAccess(permissions),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  })
}

/**
 * Create a new employee with surface-level module access or role
 */
export const createEmployeeController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = c.req.valid('json' as never) as CreateEmployeeInput

  // Ensure system permissions exist
  await seedSystemDefaults(prisma)

  const email = body.email.toLowerCase().trim()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return c.json(
      {
        success: false,
        error: 'An employee with this email address already exists. Please choose another email.',
        code: 'EMAIL_ALREADY_EXISTS',
      },
      400
    )
  }

  const passwordHash = await hashPassword(body.password)

  // Determine permissions
  let permissionNames: string[] = []
  if (body.customPermissions !== undefined) {
    permissionNames = body.customPermissions
  } else if (body.moduleAccess) {
    permissionNames = moduleAccessToPermissions(body.moduleAccess)
  } else if (body.roleName) {
    const templateRole = await prisma.role.findUnique({
      where: { name: body.roleName },
      include: { permissions: { include: { permission: true } } },
    })
    if (templateRole) {
      permissionNames = templateRole.permissions.map((p) => p.permission.name)
    }
  } else {
    // Default fallback if nothing specified
    permissionNames = ['properties:read', 'clients:read', 'brokers:read', 'owners:read']
  }

  // Prevent privilege escalation: Only Super Admins can assign the SUPER_ADMIN role or grant wildcard *:*
  const callerPerms = c.get('permissions') || []
  const isCallerSuperAdmin = callerPerms.includes('*:*')

  if ((permissionNames.includes('*:*') || body.roleName === 'SUPER_ADMIN') && !isCallerSuperAdmin) {
    return c.json(
      {
        success: false,
        error: 'Only Super Administrators can assign the SUPER_ADMIN role or grant wildcard permissions.',
        code: 'SUPER_ADMIN_REQUIRED',
      },
      403
    )
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name: body.name.trim(),
      passwordHash,
      isActive: true,
    },
  })

  // Create or assign role for this employee
  const roleName = body.roleName || `STAFF_${user.id.substring(0, 8).toUpperCase()}`
  let role = await prisma.role.findUnique({ where: { name: roleName } })

  if (!role || role.isSystem) {
    // If a system role is chosen, check if custom module access diverged
    const isMatchingSystemRole =
      role &&
      body.roleName &&
      !body.moduleAccess &&
      !body.customPermissions

    if (isMatchingSystemRole && role) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      })
    } else {
      // Create dedicated role with selected permissions
      const customRole = await prisma.role.create({
        data: {
          name: `STAFF_${user.id.substring(0, 8).toUpperCase()}`,
          description: `Custom permissions for ${user.name || user.email}`,
          isSystem: false,
        },
      })

      const perms = await prisma.permission.findMany({
        where: { name: { in: permissionNames } },
      })

      if (perms.length > 0) {
        await prisma.rolePermission.createMany({
          data: perms.map((p) => ({ roleId: customRole.id, permissionId: p.id })),
        })
      }

      await prisma.userRole.create({
        data: { userId: user.id, roleId: customRole.id },
      })
      role = customRole
    }
  } else {
    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    })
  }

  // Send onboarding welcome email with credentials
  const frontendUrl = c.env?.FRONTEND_URL || 'https://admin.dreamkeykol.com'
  const emailResult = await sendEmployeeWelcomeEmail(
    {
      to: user.email,
      name: user.name || user.email,
      email: user.email,
      password: body.password,
      loginUrl: `${frontendUrl}/login`,
    },
    c.env
  )

  // Audit Log
  await logAudit(c, {
    action: 'CREATE_EMPLOYEE',
    module: 'EMPLOYEES',
    resourceId: user.id,
    resourceName: user.name || user.email,
    details: `Created employee ${user.email} with permissions: ${permissionNames.join(', ')}. Email delivery: ${emailResult.success ? `SUCCESS (ID: ${emailResult.id})` : `NOT_DELIVERED (${emailResult.error || 'simulated'})`}`,
    status: 'SUCCESS',
  })

  return c.json(
    {
      success: true,
      message: `Employee "${user.name}" has been created successfully.${emailResult.success ? ' Account credentials have been emailed.' : ''}`,
      emailDelivered: emailResult.success,
      employee: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        roles: [role.name],
        permissions: permissionNames,
        moduleAccess: permissionsToModuleAccess(permissionNames),
      },
    },
    201
  )
}

/**
 * Update employee details, active status, or module access
 */
export const updateEmployeeController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  const body = c.req.valid('json' as never) as UpdateEmployeeInput

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  })

  if (!user) {
    return c.json({ success: false, error: 'Employee not found.', code: 'NOT_FOUND' }, 404)
  }

  const currentUser = c.get('user')
  const callerPerms = c.get('permissions') || []
  const isCallerSuperAdmin = callerPerms.includes('*:*')

  // Prevent modifying protected Super Admin accounts unless caller is Super Admin
  const isTargetSuperAdmin = user.roles.some((r) => r.role.name === 'SUPER_ADMIN')
  if (isTargetSuperAdmin && !isCallerSuperAdmin) {
    return c.json(
      {
        success: false,
        error: 'Super Admin accounts are protected and can only be modified by a Super Admin.',
        code: 'SUPER_ADMIN_PROTECTED',
      },
      403
    )
  }

  // Prevent non-Super Admins from altering their own administrative permissions
  if (currentUser?.id === id && (body.customPermissions || body.roleName || body.moduleAccess) && !isCallerSuperAdmin) {
    return c.json(
      {
        success: false,
        error: 'You cannot alter your own administrative permissions.',
        code: 'SELF_MODIFICATION_FORBIDDEN',
      },
      403
    )
  }

  // Update name / isActive
  await prisma.user.update({
    where: { id },
    data: {
      name: body.name !== undefined ? body.name.trim() : undefined,
      isActive: body.isActive !== undefined ? body.isActive : undefined,
    },
  })

  // If moduleAccess or customPermissions are updated
  if (body.moduleAccess || body.customPermissions || body.roleName) {
    let permissionNames: string[] = []
    if (body.customPermissions) {
      permissionNames = body.customPermissions
    } else if (body.moduleAccess) {
      permissionNames = moduleAccessToPermissions(body.moduleAccess)
    } else if (body.roleName) {
      const templateRole = await prisma.role.findUnique({
        where: { name: body.roleName },
        include: { permissions: { include: { permission: true } } },
      })
      if (templateRole) {
        permissionNames = templateRole.permissions.map((p) => p.permission.name)
      }
    }

    // Only Super Admins can assign the SUPER_ADMIN role or grant wildcard *:*
    if ((permissionNames.includes('*:*') || body.roleName === 'SUPER_ADMIN') && !isCallerSuperAdmin) {
      return c.json(
        {
          success: false,
          error: 'Only Super Administrators can assign the SUPER_ADMIN role or grant wildcard permissions.',
          code: 'SUPER_ADMIN_REQUIRED',
        },
        403
      )
    }

    // Upsert a custom role for this user or modify existing custom role
    const customRoleName = `STAFF_${user.id.substring(0, 8).toUpperCase()}`
    let targetRole = await prisma.role.findUnique({ where: { name: customRoleName } })

    if (!targetRole) {
      targetRole = await prisma.role.create({
        data: {
          name: customRoleName,
          description: `Custom permissions for ${user.name || user.email}`,
          isSystem: false,
        },
      })
    }

    // Replace role permissions
    await prisma.rolePermission.deleteMany({ where: { roleId: targetRole.id } })

    const perms = await prisma.permission.findMany({
      where: { name: { in: permissionNames } },
    })

    if (perms.length > 0) {
      await prisma.rolePermission.createMany({
        data: perms.map((p) => ({ roleId: targetRole.id, permissionId: p.id })),
      })
    }

    // Link user to this target role
    await prisma.userRole.deleteMany({ where: { userId: user.id } })
    await prisma.userRole.create({
      data: { userId: user.id, roleId: targetRole.id },
    })
  }

  // If deactivated, revoke all active sessions
  if (body.isActive === false) {
    await prisma.session.deleteMany({ where: { userId: user.id } })
  }

  await logAudit(c, {
    action: 'UPDATE_EMPLOYEE',
    module: 'EMPLOYEES',
    resourceId: user.id,
    resourceName: user.name || user.email,
    details: `Updated employee ${user.email} (active: ${body.isActive ?? user.isActive})`,
    status: 'SUCCESS',
  })

  return c.json({
    success: true,
    message: 'Employee updated successfully.',
  })
}

/**
 * Reset employee password by Super Admin
 */
export const resetEmployeePasswordController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const id = c.req.param('id')
  const body = c.req.valid('json' as never) as ResetEmployeePasswordInput

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: { role: true },
      },
    },
  })
  if (!user) {
    return c.json({ success: false, error: 'Employee not found.', code: 'NOT_FOUND' }, 404)
  }

  // Prevent resetting password of Super Admins by non-Super Admins
  const callerPerms = c.get('permissions') || []
  const isCallerSuperAdmin = callerPerms.includes('*:*')
  const isTargetSuperAdmin = user.roles.some((r) => r.role.name === 'SUPER_ADMIN')

  if (isTargetSuperAdmin && !isCallerSuperAdmin) {
    return c.json(
      {
        success: false,
        error: 'Super Admin account passwords can only be reset by a Super Admin.',
        code: 'SUPER_ADMIN_PROTECTED',
      },
      403
    )
  }

  const passwordHash = await hashPassword(body.password)

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  })

  // Invalidate previous sessions so employee must log in with new password
  await prisma.session.deleteMany({ where: { userId: id } })

  // Send password reset email
  const frontendUrl = c.env?.FRONTEND_URL || 'https://admin.dreamkeykol.com'
  const emailResult = await sendPasswordResetEmail(
    {
      to: user.email,
      name: user.name || user.email,
      email: user.email,
      newPassword: body.password,
      loginUrl: `${frontendUrl}/login`,
    },
    c.env
  )

  await logAudit(c, {
    action: 'RESET_PASSWORD',
    module: 'EMPLOYEES',
    resourceId: user.id,
    resourceName: user.name || user.email,
    details: `Super Admin reset password for ${user.email}. Email delivery: ${emailResult.success ? `SUCCESS (ID: ${emailResult.id})` : `NOT_DELIVERED (${emailResult.error || 'simulated'})`}`,
    status: 'SUCCESS',
  })

  return c.json({
    success: true,
    message: `Password for "${user.name || user.email}" has been reset successfully.${emailResult.success ? ' New credentials have been emailed.' : ''}`,
    emailDelivered: emailResult.success,
  })
}

/**
 * Permanently delete an employee account (Super Admin only)
 */
export const deleteEmployeeController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const currentUser = c.get('user')
  const id = c.req.param('id')

  // Prevent self-deletion
  if (currentUser?.id === id) {
    return c.json(
      {
        success: false,
        error: 'You cannot delete your own Super Admin account.',
        code: 'SELF_DELETION_FORBIDDEN',
      },
      400
    )
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: { role: true },
      },
    },
  })

  if (!targetUser) {
    return c.json({ success: false, error: 'Employee not found.', code: 'NOT_FOUND' }, 404)
  }

  // Prevent deleting other Super Admins
  const isSuperAdmin = targetUser.roles.some((r) => r.role.name === 'SUPER_ADMIN')
  if (isSuperAdmin) {
    return c.json(
      {
        success: false,
        error: 'Super Admin accounts are protected and cannot be deleted.',
        code: 'SUPER_ADMIN_PROTECTED',
      },
      400
    )
  }

  const currentUserId = currentUser?.id || 'system'

  // Safely execute deletion and historical attribution reassignments in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Reassign properties authored by this employee to the deleting super admin
    await tx.property.updateMany({
      where: { sourcePartnerId: id },
      data: { sourcePartnerId: currentUserId },
    })

    // 2. Reassign owners created by this employee
    await tx.owner.updateMany({
      where: { createdById: id },
      data: { createdById: currentUserId },
    })

    // 3. Nullify primary contact assignments on owners & brokers
    await tx.owner.updateMany({
      where: { primaryContactPartnerId: id },
      data: { primaryContactPartnerId: null },
    })
    await tx.broker.updateMany({
      where: { primaryContactPartnerId: id },
      data: { primaryContactPartnerId: null },
    })

    // 4. Reassign clients created by this employee
    await tx.client.updateMany({
      where: { createdById: id },
      data: { createdById: currentUserId },
    })

    // 5. Remove partner assignments to this employee and reassign assignments created by them
    await tx.clientPartnerAssignment.deleteMany({
      where: { partnerId: id },
    })
    await tx.clientPartnerAssignment.updateMany({
      where: { assignedById: id },
      data: { assignedById: currentUserId },
    })

    // 6. Reassign shortlists and shares
    await tx.clientShortlistedProperty.updateMany({
      where: { addedById: id },
      data: { addedById: currentUserId },
    })
    await tx.clientPropertyShare.updateMany({
      where: { createdById: id },
      data: { createdById: currentUserId },
    })

    // 7. Reassign client documents
    await tx.clientDocument.updateMany({
      where: { uploadedById: id },
      data: { uploadedById: currentUserId },
    })

    // 8. Delete user presets and property audit logs
    await tx.propertyFilterPreset.deleteMany({
      where: { userId: id },
    })
    await tx.propertyAuditLog.deleteMany({
      where: { userId: id },
    })

    // 9. Destroy all active sessions
    await tx.session.deleteMany({
      where: { userId: id },
    })

    // 10. Extract custom staff roles that might need cleanup
    const customRoleIds = targetUser.roles
      .filter((r) => !r.role.isSystem && r.role.name.startsWith('STAFF_'))
      .map((r) => r.roleId)

    // 11. Remove user_roles
    await tx.userRole.deleteMany({
      where: { userId: id },
    })

    // 12. Delete custom roles if no other users are assigned
    for (const roleId of customRoleIds) {
      const assignedCount = await tx.userRole.count({ where: { roleId } })
      if (assignedCount === 0) {
        await tx.rolePermission.deleteMany({ where: { roleId } })
        await tx.role.delete({ where: { id: roleId } })
      }
    }

    // 13. Delete the employee record
    await tx.user.delete({
      where: { id },
    })
  })

  // Audit Log
  await logAudit(c, {
    action: 'DELETE_EMPLOYEE',
    module: 'EMPLOYEES',
    resourceId: targetUser.id,
    resourceName: targetUser.name || targetUser.email,
    details: `Permanently deleted employee ${targetUser.email} (${targetUser.name || 'Unnamed'}). Associated records reassigned to Super Admin.`,
    status: 'SUCCESS',
  })

  return c.json({
    success: true,
    message: `Employee "${targetUser.name || targetUser.email}" has been permanently deleted.`,
  })
}

