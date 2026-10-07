import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { createMiddleware } from 'hono/factory'

export type Bindings = {
  DATABASE_URL: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  BACKEND_URL?: string
  FRONTEND_URL?: string
}

export type AuthUser = {
  id: string
  email: string
  name: string | null
  isActive: boolean
}

export type WebsiteAuthUser = {
  id: string
  email: string
  name: string | null
  isActive: boolean
}

export type Variables = {
  prisma: PrismaClient
  user?: AuthUser
  roles?: string[]
  permissions?: string[]
  sessionId?: string
  websiteUser?: WebsiteAuthUser
  websiteSessionId?: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}

export function getPrisma(databaseUrl: string): PrismaClient {
  const adapter = new PrismaNeonHttp(databaseUrl, {})
  return new PrismaClient({ adapter })
}

/**
 * Hono middleware to automatically inject the singleton `prisma` client into `c.var.prisma` / `c.get('prisma')`
 */
export const prismaMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.var.prisma) {
    c.set('prisma', getPrisma(c.env.DATABASE_URL))
  }
  await next()
})