import type { PrismaClient } from '@prisma/client'

export interface CreateNotificationParams {
  userId?: string | null
  requiredPermission?: string | null
  targetRole?: string | null
  title: string
  message: string
  type: string
  link?: string | null
  metadata?: Record<string, any>
}

/**
 * Creates an in-system notification record with capability-based or recipient routing.
 * Silently catches errors so notification dispatch never breaks critical business transactions.
 */
export async function createNotification(
  prisma: PrismaClient,
  params: CreateNotificationParams
): Promise<void> {
  try {
    if (!prisma || !prisma.notification || typeof prisma.notification.create !== 'function') {
      return
    }

    await prisma.notification.create({
      data: {
        userId: params.userId || null,
        requiredPermission: params.requiredPermission || null,
        targetRole: params.targetRole || null,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link || null,
        ...(params.metadata ? { metadata: params.metadata } : {}),
      },
    })
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}
