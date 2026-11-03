import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { AppEnv, prismaMiddleware } from './db'
import { authRoutes } from './routes/auth'
import {userRoutes} from "./routes/website-user"
import { roleRoutes } from './routes/roles'
import { adminWebsiteUserRoutes } from './routes/admin-website-users'
import { oauthRoutes } from './routes/oauth'
import { brokerRoutes } from './routes/broker'
import { ownerRoutes } from './routes/owner'
import { clientRoutes, publicClientShareRoutes } from './routes/client'
import { propertyRoutes } from './routes/property'
import { websitePropertyRoutes } from './routes/website-property'
import { employeeRoutes } from './routes/employee'
import { auditRoutes } from './routes/audit'
import { authMiddleware, requirePermission } from './middleware/auth'
import { openApiSpec } from './lib/openapi'
import { AppError, formatSystemError } from './lib/errors'

import { createWebsiteEnquirySchema } from './zod/website-enquiry'
import { createWebsiteEnquiryController } from './controllers/website-enquiry.controller'
import { listBestPropertiesController } from './controllers/website-property.controller'
import { zValidator } from '@hono/zod-validator'
import { zodValidationHook } from './lib/validator'

const app = new Hono<AppEnv>()

// 1. Global Security Headers Middleware
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})

// 2. Configure strict CORS to only allow trusted frontend origins with credentials
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      if (!origin) return 'http://localhost:3000'

      try {
        const parsed = new URL(origin)
        const hostname = parsed.hostname.toLowerCase()

        // Allow localhost and loopback for local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return origin
        }

        // Allow self-origin / current backend host (e.g. Swagger UI or same-domain API queries)
        try {
          const reqHost = new URL(c.req.url).hostname.toLowerCase()
          if (hostname === reqHost) {
            return origin
          }
        } catch {}

        // Allow explicitly configured FRONTEND_URL
        if (c.env?.FRONTEND_URL) {
          try {
            const frontendHost = new URL(c.env.FRONTEND_URL).hostname.toLowerCase()
            if (hostname === frontendHost) return origin
          } catch {}
        }

        // Allow official DreamKey domains, Workers domains, and Cloudflare Pages deployments
        const allowedHosts = [
          'dreamkeykol.com',
          'www.dreamkeykol.com',
          'admin.dreamkeykol.com',
          'dreamkey-crm.pages.dev',
          'backend.dreamkey-crm.workers.dev',
        ]
        if (
          allowedHosts.includes(hostname) ||
          hostname.endsWith('.dreamkey-crm.pages.dev') ||
          hostname.endsWith('.dreamkey-crm.workers.dev')
        ) {
          return origin
        }
      } catch {}

      // Reject untrusted cross-origin requests
      return null
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept', 'X-Requested-With'],
  })
)

// 3. Attach request-scoped Prisma client
app.use('*', prismaMiddleware)

// 3. Public Website Enquiry Endpoints
app.post(
  '/v1/website/enquiry',
  zValidator('json', createWebsiteEnquirySchema, zodValidationHook),
  createWebsiteEnquiryController
)

// 3.1 Public Best Properties Showcase Endpoints (Unauthenticated)
app.get('/best-properties', listBestPropertiesController)
app.get('/v1/best-properties', listBestPropertiesController)

// 4. Swagger UI Documentation
app.get('/openapi.json', (c) => {
  let currentOrigin = ''
  try {
    const reqUrl = new URL(c.req.url)
    const forwardedProto = c.req.header('x-forwarded-proto') || reqUrl.protocol.replace(':', '')
    const forwardedHost = c.req.header('x-forwarded-host') || c.req.header('host') || reqUrl.host
    if (forwardedHost) {
      currentOrigin = `${forwardedProto}://${forwardedHost}`
    }
  } catch {}

  const candidateServers = [
    ...(currentOrigin
      ? [
          {
            url: currentOrigin,
            description: 'Current Environment (Auto-detected)',
          },
        ]
      : []),
    {
      url: 'https://backend.dreamkey-crm.workers.dev',
      description: 'Production Cloudflare Worker',
    },
    {
      url: 'http://localhost:8787',
      description: 'Local Development Server',
    },
  ]

  const seen = new Set<string>()
  const servers = candidateServers.filter((s) => {
    if (seen.has(s.url)) return false
    seen.add(s.url)
    return true
  })

  return c.json({
    ...openApiSpec,
    servers,
  })
})
app.get(
  '/docs',
  swaggerUI({
    url: '/openapi.json',
    persistAuthorization: true,
  })
)

// 5. Mount API routes (/v1/auth/..., /v1/admin/..., /v1/user/..., /v1/brokers, /v1/properties, /api/auth/...)
app.route('/v1/auth', authRoutes)
app.route('/v1/admin/website-users', adminWebsiteUserRoutes)
app.route('/v1/admin/employees', employeeRoutes)
app.route('/v1/admin/audit-logs', auditRoutes)
app.route('/v1/admin', roleRoutes)
app.route('/v1/user', userRoutes)
app.route('/v1/brokers', brokerRoutes)
app.route('/v1/properties', propertyRoutes)
app.route('/v1/website/properties', websitePropertyRoutes)
app.route('/website/properties', websitePropertyRoutes)
app.route('/v1/owners', ownerRoutes)
app.route('/v1/clients', clientRoutes)
app.route('/v1/public/property-shares', publicClientShareRoutes)
app.route('/api/auth', oauthRoutes)

// Finance module endpoint (guarded by finance:read)
app.get('/v1/finance', authMiddleware, requirePermission('finance:read'), (c) => {
  return c.json({
    success: true,
    data: {
      totalRevenue: 2450000,
      pendingCommissions: 180000,
      clearedCommissions: 2270000,
    },
  })
})


app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'DreamKey CRM Backend',
    docs: '/docs',
    version: 'v1',
  })
})

// 6. Example Protected Routes under v1 demonstrating RBAC
// View Leads (Requires 'leads:read' permission)
app.get('/v1/leads', authMiddleware, requirePermission('leads:read'), async (c) => {
  return c.json({
    success: true,
    leads: [
      { id: '1', name: 'Acme Corp', value: '$50,000', status: 'NEW' },
      { id: '2', name: 'Stark Industries', value: '$120,000', status: 'QUALIFIED' },
    ],
  })
})

// Create Lead (Requires 'leads:create' permission)
app.post('/v1/leads', authMiddleware, requirePermission('leads:create'), async (c) => {
  const body = await c.req.json()
  return c.json(
    {
      success: true,
      message: 'Lead created successfully.',
      lead: body,
    },
    201
  )
})

// 7. Global 404 Handler with friendly message
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'The requested resource or endpoint was not found. Please verify the URL.',
      code: 'NOT_FOUND',
    },
    404
  )
})

// 8. Global Error Handler: Catches unexpected exceptions and formats user-friendly error responses
app.onError((err, c) => {
  if (!(err instanceof AppError)) console.error('Unhandled Application Error:', err)
  const { message, statusCode } = formatSystemError(err)

  return c.json(
    {
      success: false,
      error: message,
      code: err instanceof AppError ? err.code || 'REQUEST_ERROR' : 'INTERNAL_SERVER_ERROR',
      ...(err instanceof AppError && err.details ? { details: err.details } : {}),
    },
    statusCode
  )
})

export default app
