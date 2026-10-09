import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import { createMiddleware } from 'hono/factory'

export type Bindings = {
  DATABASE_URL: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  BACKEND_URL?: string
  FRONTEND_URL?: string
  R2_ACCOUNT_ID?: string
  R2_ACCESS_KEY_ID?: string
  R2_SECRET_ACCESS_KEY?: string
  R2_BUCKET_NAME?: string
  R2_PUBLIC_DOMAIN?: string
  R2_PUBLIC_URL?: string
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
  // Prisma may start transactions internally for writes and relation includes.
  // Workers and current Node versions supply a native WebSocket constructor.
  if (typeof WebSocket !== 'undefined') neonConfig.webSocketConstructor = WebSocket
  const adapter = new PrismaNeon({ connectionString: databaseUrl })
  return new PrismaClient({ adapter })
}

/** Create and close the database pool within one Worker request. */
export const prismaMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const prisma = getPrisma(c.env.DATABASE_URL)
  c.set('prisma', prisma)
  try {
    await next()
  } finally {
    await prisma.$disconnect()
  }
})
