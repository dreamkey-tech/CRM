import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

/**
 * Custom application error with user-friendly message and HTTP status code
 */
export class AppError extends Error {
  public statusCode: ContentfulStatusCode
  public code?: string
  public details?: unknown

  constructor(message: string, statusCode: ContentfulStatusCode = 400, code?: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * Helper to create standard user-friendly JSON error responses
 */
export function errorResponse(
  c: Context,
  message: string,
  statusCode: ContentfulStatusCode = 400,
  code?: string,
  details?: unknown
) {
  return c.json(
    {
      success: false,
      error: message,
      code,
      details,
    },
    statusCode
  )
}

/**
 * Maps known Prisma & system errors to friendly non-technical messages
 */
export function formatSystemError(err: unknown): { message: string; statusCode: ContentfulStatusCode } {
  if (err instanceof AppError) {
    return { message: err.message, statusCode: err.statusCode }
  }

  if (err instanceof HTTPException) {
    return { message: err.message || 'The server encountered an error processing your request.', statusCode: err.status as ContentfulStatusCode }
  }

  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } }

    switch (prismaErr.code) {
      case 'P2002': {
        const target = prismaErr.meta?.target?.join(', ') || 'field'
        return {
          message: `A record with this ${target} already exists. Please choose a different value.`,
          statusCode: 409,
        }
      }
      case 'P2025':
        return {
          message: 'The requested record could not be found. It may have been deleted.',
          statusCode: 404,
        }
      case 'P2003':
        return {
          message: 'This action cannot be completed because related records depend on it.',
          statusCode: 400,
        }
      case 'P1001':
      case 'P1002':
        return {
          message: 'Unable to reach the database. Our servers may be undergoing maintenance. Please try again shortly.',
          statusCode: 503,
        }
    }
  }

  return {
    message: 'An unexpected error occurred while processing your request. Please try again in a moment.',
    statusCode: 500,
  }
}
