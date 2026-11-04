import type { Context } from 'hono'
import type { AppEnv } from '../db'

/**
 * Helper to build the capability-based visibility filter for notifications.
 * - Wildcard (*:*) users (Super Admin) see all notifications across the company.
 * - Staff users with custom roles only see notifications targeted to their userId,
 *   broadcast notifications matching permissions they possess, or open public broadcasts.
 */
function buildNotificationVisibilityFilter(user: { id: string }, roles: string[], permissions: string[]): any {
  const hasWildcard = permissions.includes('*:*')
  if (hasWildcard) {
    return {}
  }

  return {
    OR: [
      // 1. Direct 1-to-1 notifications for this user
      { userId: user.id },

      // 2. Broadcast notifications requiring a permission the caller holds
      {
        userId: null,
        requiredPermission: { in: permissions },
      },

      // 3. Open broadcasts with no special permission or targeting current roles / ALL
      {
        userId: null,
        requiredPermission: null,
        targetRole: { in: ['ALL', ...roles] },
      },
      {
        userId: null,
        requiredPermission: null,
        targetRole: null,
      },
    ],
  }
}

/**
 * GET /v1/notifications
 * Lists notifications visible to the authenticated user and calculates unread count.
 */
export async function listNotificationsController(c: Context<AppEnv>) {
  const user = c.get('user')!
  const roles = c.get('roles') || []
  const permissions = c.get('permissions') || []
  const prisma = c.get('prisma')

  const whereClause = buildNotificationVisibilityFilter(user, roles, permissions)

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.notification.count({
      where: {
        ...whereClause,
        isRead: false,
      },
    }),
  ])

  return c.json({
    success: true,
    notifications,
    unreadCount,
  })
}

/**
 * PATCH /v1/notifications/:id/read
 * Marks a single notification as read if visible to the caller.
 */
export async function markNotificationReadController(c: Context<AppEnv>) {
  const user = c.get('user')!
  const roles = c.get('roles') || []
  const permissions = c.get('permissions') || []
  const prisma = c.get('prisma')
  const id = c.req.param('id')

  const hasWildcard = permissions.includes('*:*')
  const whereClause = hasWildcard
    ? { id }
    : {
        id,
        ...buildNotificationVisibilityFilter(user, roles, permissions),
      }

  const existing = await prisma.notification.findFirst({
    where: whereClause,
  })

  if (!existing) {
    return c.json(
      {
        success: false,
        error: 'Notification not found or access denied.',
        code: 'NOT_FOUND',
      },
      404
    )
  }

  const updated = await prisma.notification.update({
    where: { id: existing.id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return c.json({
    success: true,
    message: 'Notification marked as read.',
    notification: updated,
  })
}

/**
 * PATCH /v1/notifications/read-all
 * Marks all unread notifications visible to the caller as read.
 */
export async function markAllNotificationsReadController(c: Context<AppEnv>) {
  const user = c.get('user')!
  const roles = c.get('roles') || []
  const permissions = c.get('permissions') || []
  const prisma = c.get('prisma')

  const whereClause = buildNotificationVisibilityFilter(user, roles, permissions)

  const result = await prisma.notification.updateMany({
    where: {
      ...whereClause,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return c.json({
    success: true,
    message: 'All notifications marked as read.',
    count: result.count,
  })
}
