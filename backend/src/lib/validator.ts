import type { Hook } from '@hono/zod-validator'
import type { Env } from 'hono'

/**
 * Custom Zod validation error handler for Hono zValidator
 * Returns clean, human-readable error messages for CRM end-users
 */
export const zodValidationHook: Hook<any, Env, any, any, any, any> = (result, c) => {
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    const customMessage = firstIssue?.message || 'Please check the information you entered and try again.'

    return c.json(
      {
        success: false,
        error: customMessage,
        code: 'VALIDATION_ERROR',
        details: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
      400
    )
  }
}
