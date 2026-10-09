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
import { propertyRoutes } from './routes/property'
import { authMiddleware, requirePermission } from './middleware/auth'
import { openApiSpec } from './lib/openapi'
import { formatSystemError } from './lib/errors'

import { createWebsiteEnquirySchema } from './zod/website-enquiry'
import { createWebsiteEnquiryController } from './controllers/website-enquiry.controller'
import { zValidator } from '@hono/zod-validator'
import { zodValidationHook } from './lib/validator'

const app = new Hono<AppEnv>()

// 1. Configure CORS to allow frontend with cookies
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow localhost in development or specific domain in production
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin || 'http://localhost:3000'
      }
      return origin
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
)

// 2. Attach request-scoped Prisma client
app.use('*', prismaMiddleware)

// 3. Public Website Enquiry Endpoints
app.post(
  '/v1/website/enquiry',
  zValidator('json', createWebsiteEnquirySchema, zodValidationHook),
  createWebsiteEnquiryController
)

// 4. Swagger UI Documentation
app.get('/openapi.json', (c) => c.json(openApiSpec))
app.get('/docs', swaggerUI({ url: '/openapi.json' }))

// 5. Mount API routes (/v1/auth/..., /v1/admin/..., /v1/user/..., /v1/brokers, /v1/properties, /api/auth/...)
app.route('/v1/auth', authRoutes)
app.route('/v1/admin/website-users', adminWebsiteUserRoutes)
app.route('/v1/admin', roleRoutes)
app.route('/v1/user', userRoutes)
app.route('/v1/brokers', brokerRoutes)
app.route('/v1/properties', propertyRoutes)
app.route('/api/auth', oauthRoutes)


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
  console.error('Unhandled Application Error:', err)
  const { message, statusCode } = formatSystemError(err)

  return c.json(
    {
      success: false,
      error: message,
      code: 'INTERNAL_SERVER_ERROR',
    },
    statusCode
  )
})

export default app
