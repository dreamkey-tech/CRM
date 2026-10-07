import type { Context } from 'hono'
import type { AppEnv } from '../db'

/**
 * List all available atomic permissions
 */
export const getPermissionsController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const permissions = await prisma.permission.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return c.json({
    success: true,
    permissions,
  })
}

/**
 * List all roles with their assigned permissions
 */
export const getRolesController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const formatted = roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    userCount: role._count.users,
    permissions: role.permissions.map((p) => p.permission),
  }))

  return c.json({
    success: true,
    roles: formatted,
  })
}

/**
 * Create a new custom role with selected permissions
 */
export const createRoleController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{
    name: string
    description?: string
    permissionIds: string[]
  }>()

  if (!body.name) {
    return c.json(
      {
        success: false,
        error: 'Please enter a name for the new role.',
        code: 'MISSING_ROLE_NAME',
      },
      400
    )
  }

  const existingRole = await prisma.role.findUnique({
    where: { name: body.name.toUpperCase().trim() },
  })

  if (existingRole) {
    return c.json(
      {
        success: false,
        error: `A role named "${body.name.toUpperCase().trim()}" already exists. Please choose a different name.`,
        code: 'ROLE_ALREADY_EXISTS',
      },
      400
    )
  }

  const role = await prisma.role.create({
    data: {
      name: body.name.toUpperCase().trim(),
      description: body.description || null,
      permissions: {
        create: (body.permissionIds || []).map((permissionId) => ({
          permissionId,
        })),
      },
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  return c.json(
    {
      success: true,
      message: `Role "${role.name}" has been created successfully.`,
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p) => p.permission),
      },
    },
    201
  )
}

/**
 * Update permissions assigned to a role
 */
export const updateRoleController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const roleId = c.req.param('id')
  const body = await c.req.json<{
    name?: string
    description?: string
    permissionIds: string[]
  }>()

  if (!roleId) {
    return c.json(
      {
        success: false,
        error: 'Role ID is required to update a role.',
        code: 'MISSING_ROLE_ID',
      },
      400
    )
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } })
  if (!role) {
    return c.json(
      {
        success: false,
        error: 'The role you are trying to update could not be found. It may have been deleted.',
        code: 'ROLE_NOT_FOUND',
      },
      404
    )
  }

  // Prevent modifying the system SUPER_ADMIN role name
  if (role.isSystem && body.name && body.name !== role.name) {
    return c.json(
      {
        success: false,
        error: 'Default system roles (such as SUPER_ADMIN) cannot be renamed.',
        code: 'SYSTEM_ROLE_IMMUTABLE',
      },
      400
    )
  }

  // Transaction: update details & replace permissions
  await prisma.$transaction(async (tx) => {
    if (body.name || body.description !== undefined) {
      await tx.role.update({
        where: { id: roleId },
        data: {
          name: body.name ? body.name.toUpperCase().trim() : undefined,
          description: body.description,
        },
      })
    }

    if (body.permissionIds) {
      // Delete existing role permissions
      await tx.rolePermission.deleteMany({
        where: { roleId },
      })

      // Insert new role permissions
      if (body.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: body.permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        })
      }
    }
  })

  const updatedRole = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  return c.json({
    success: true,
    message: 'Role updated successfully.',
    role: updatedRole,
  })
}

/**
 * Assign roles to a user
 */
export const assignUserRolesController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const userId = c.req.param('id')
  const body = await c.req.json<{ roleIds: string[] }>()

  if (!userId) {
    return c.json(
      {
        success: false,
        error: 'User ID is required to assign roles.',
        code: 'MISSING_USER_ID',
      },
      400
    )
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return c.json(
      {
        success: false,
        error: 'The user you are trying to assign roles to could not be found.',
        code: 'USER_NOT_FOUND',
      },
      404
    )
  }

  await prisma.$transaction(async (tx) => {
    // Remove current user roles
    await tx.userRole.deleteMany({ where: { userId } })

    // Assign new roles
    if (body.roleIds && body.roleIds.length > 0) {
      await tx.userRole.createMany({
        data: body.roleIds.map((roleId) => ({
          userId,
          roleId,
        })),
      })
    }
  })

  return c.json({
    success: true,
    message: 'User roles updated successfully.',
  })
}
