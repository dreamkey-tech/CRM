import type { Context } from 'hono'
import type { AppEnv } from '../db'

export type AuditEventInput = {
  action: string
  module: string
  details?: string | null
  resourceId?: string | null
  resourceName?: string | null
  status?: 'SUCCESS' | 'DENIED'
}

/**
 * Log an audit event to the audit_logs table.
 * Captures the authenticated user, IP address, and user agent.
 */
export async function logAudit(c: Context<AppEnv>, event: AuditEventInput) {
  try {
    const prisma = c.get('prisma')
    if (!prisma) return

    const user = c.get('user')
    const ipAddress =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      null
    const userAgent = c.req.header('user-agent') || null

    const promise = prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        action: event.action,
        module: event.module,
        details: event.details || null,
        resourceId: event.resourceId || null,
        resourceName: event.resourceName || null,
        ipAddress,
        userAgent,
        status: event.status || 'SUCCESS',
      },
    }).catch((err) => {
      console.error('Failed to write audit log:', err)
    })

    if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
      c.executionCtx.waitUntil(promise)
    } else {
      await promise
    }
  } catch (err) {
    console.error('Audit logging error:', err)
  }
}
