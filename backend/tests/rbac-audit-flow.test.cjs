const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

const root = path.resolve(__dirname, '..')

function loader() {
  const cache = new Map()
  function read(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const req = createRequire(filename)
    new Function(
      'require',
      'module',
      'exports',
      transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code
    )(
      (name) =>
        name.endsWith('.json')
          ? JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), name), 'utf8'))
          : name.startsWith('.')
          ? read(path.resolve(path.dirname(filename), name + '.ts'))
          : req(name),
      module,
      module.exports
    )
    return module.exports
  }
  return (relative) => read(path.resolve(root, 'src', relative))
}

const load = loader()
const { moduleAccessToPermissions, permissionsToModuleAccess, deleteEmployeeController } = load('controllers/employee.controller.ts')
const { requirePermission } = load('middleware/auth.ts')
const employeeSchemas = load('zod/employee.ts')
const auditSchemas = load('zod/audit.ts')

test('moduleAccessToPermissions correctly translates surface-level selections to atomic permissions', () => {
  // Telecaller surface selection: View-only brokers, view-only properties, full clients, NO finance, NO sensitive docs
  const telecallerAccess = {
    properties: 'VIEW',
    clients: 'FULL',
    brokers: 'VIEW',
    owners: 'VIEW',
    finance: 'NONE',
    canViewSensitiveDocs: false,
  }

  const perms = moduleAccessToPermissions(telecallerAccess)

  // Brokers: only read
  assert.equal(perms.includes('brokers:read'), true)
  assert.equal(perms.includes('brokers:create'), false)
  assert.equal(perms.includes('brokers:update'), false)
  assert.equal(perms.includes('brokers:delete'), false)

  // Clients: full CRUD
  assert.equal(perms.includes('clients:read'), true)
  assert.equal(perms.includes('clients:create'), true)
  assert.equal(perms.includes('clients:update'), true)
  assert.equal(perms.includes('clients:delete'), true)

  // Sensitive docs & finance: strictly absent
  assert.equal(perms.includes('clients:documents:view_sensitive'), false)
  assert.equal(perms.includes('finance:read'), false)
  assert.equal(perms.includes('finance:manage'), false)

  // Convert back to surface access
  const roundTrip = permissionsToModuleAccess(perms)
  assert.equal(roundTrip.brokers, 'VIEW')
  assert.equal(roundTrip.clients, 'FULL')
  assert.equal(roundTrip.properties, 'VIEW')
  assert.equal(roundTrip.finance, 'NONE')
  assert.equal(roundTrip.canViewSensitiveDocs, false)
})

test('permissionsToModuleAccess detects Full Access and Sensitive Docs clearance', () => {
  const adminPerms = [
    'properties:read',
    'properties:create',
    'properties:update',
    'properties:delete',
    'clients:read',
    'clients:create',
    'clients:documents:view_sensitive',
    'finance:read',
    'finance:manage',
  ]

  const access = permissionsToModuleAccess(adminPerms)
  assert.equal(access.properties, 'FULL')
  assert.equal(access.clients, 'FULL')
  assert.equal(access.canViewSensitiveDocs, true)
  assert.equal(access.finance, 'FULL')
  assert.equal(access.brokers, 'NONE')
})

test('employee zod schema enforces validation and generates defaults', () => {
  // Missing email
  const bad1 = employeeSchemas.createEmployeeSchema.safeParse({
    name: 'Priya',
    password: 'password123',
  })
  assert.equal(bad1.success, false)

  // Password too short
  const bad2 = employeeSchemas.createEmployeeSchema.safeParse({
    name: 'Priya',
    email: 'priya@dreamkey.in',
    password: '123',
  })
  assert.equal(bad2.success, false)

  // Valid employee
  const good = employeeSchemas.createEmployeeSchema.parse({
    name: 'Priya Sharma',
    email: 'priya@dreamkey.in',
    password: 'StrongPassword123#',
    moduleAccess: {
      brokers: 'VIEW',
      finance: 'NONE',
    },
  })
  assert.equal(good.email, 'priya@dreamkey.in')
  assert.equal(good.moduleAccess.brokers, 'VIEW')
  assert.equal(good.moduleAccess.finance, 'NONE')
  assert.equal(good.moduleAccess.canViewSensitiveDocs, false)
})

test('requirePermission middleware allows Super Admin wildcard *:*', async () => {
  let nextCalled = false
  const middleware = requirePermission('finance:read')

  const c = {
    get: (key) => {
      if (key === 'permissions') return ['*:*']
      return null
    },
    json: () => assert.fail('Should not deny Super Admin'),
  }

  await middleware(c, async () => {
    nextCalled = true
  })

  assert.equal(nextCalled, true)
})

test('requirePermission middleware allows exact permission match', async () => {
  let nextCalled = false
  const middleware = requirePermission('brokers:read')

  const c = {
    get: (key) => {
      if (key === 'permissions') return ['brokers:read', 'properties:read']
      return null
    },
    json: () => assert.fail('Should not deny permitted user'),
  }

  await middleware(c, async () => {
    nextCalled = true
  })

  assert.equal(nextCalled, true)
})

test('requirePermission middleware blocks unauthorized user with 403 PERMISSION_DENIED', async () => {
  let nextCalled = false
  let deniedStatus = 0
  let deniedBody = null

  const middleware = requirePermission('finance:read')

  const c = {
    get: (key) => {
      if (key === 'permissions') return ['brokers:read', 'clients:read'] // No finance!
      return null
    },
    json: (body, status) => {
      deniedBody = body
      deniedStatus = status
      return { body, status }
    },
  }

  await middleware(c, async () => {
    nextCalled = true
  })

  assert.equal(nextCalled, false)
  assert.equal(deniedStatus, 403)
  assert.equal(deniedBody.code, 'PERMISSION_DENIED')
  assert.equal(deniedBody.requiredPermission, 'finance:read')
})

test('audit log query validation handles search, filters and pagination', () => {
  const parsed = auditSchemas.auditQuerySchema.parse({
    module: 'EMPLOYEES',
    status: 'DENIED',
    page: '2',
    limit: '50',
  })

  assert.equal(parsed.module, 'EMPLOYEES')
  assert.equal(parsed.status, 'DENIED')
  assert.equal(parsed.page, 2)
  assert.equal(parsed.limit, 50)
})

test('downloadClientDocumentController blocks telecaller from downloading sensitive Aadhaar/KYC', async () => {
  const clientController = load('controllers/client.controller.ts')

  // Mock confidential KYC document
  const mockAadhaar = {
    id: 'doc-aadhaar-123',
    clientId: 'cli-1',
    category: 'AADHAAR',
    originalName: 'Aadhaar_Card.pdf',
    key: 'cli-1/docs/aadhaar.pdf',
    sizeBytes: 1024,
    mimeType: 'application/pdf',
  }

  const auditEvents = []
  const mockPrisma = {
    clientDocument: {
      findFirst: async () => mockAadhaar,
    },
    auditLog: {
      create: async ({ data }) => {
        auditEvents.push(data)
        return { id: 'audit-1', ...data }
      },
    },
  }

  // Telecaller context without clients:documents:view_sensitive
  const telecallerContext = {
    get: (key) => {
      if (key === 'prisma') return mockPrisma
      if (key === 'user') return { id: 'telecaller-1', name: 'Priya Telecaller', email: 'priya@dreamkey.in' }
      if (key === 'permissions') return ['clients:read', 'brokers:read'] // Missing clients:documents:view_sensitive
      return null
    },
    req: {
      param: (k) => (k === 'documentId' ? 'doc-aadhaar-123' : 'cli-1'),
      header: () => '192.168.1.1',
      query: () => ({}),
    },
    header: () => {},
    json: (body, status = 200) => ({ body, status }),
  }

  // Expect downloadClientDocumentController to reject with 403
  await assert.rejects(
    () => clientController.downloadClientDocumentController(telecallerContext),
    (err) => {
      assert.equal(err.statusCode, 403)
      assert.equal(err.code, 'PERMISSION_DENIED')
      return true
    }
  )

  // Assert audit event was recorded as DENIED
  const accessDeniedAudit = auditEvents.find((e) => e.status === 'DENIED')
  assert.ok(accessDeniedAudit)
  assert.equal(accessDeniedAudit.action, 'ACCESS_DENIED')
  assert.equal(accessDeniedAudit.module, 'DOCUMENTS')
  assert.equal(accessDeniedAudit.resourceName, 'Aadhaar_Card.pdf')
})

test('deleteEmployeeController blocks self-deletion', async () => {
  const c = {
    get: (k) => (k === 'user' ? { id: 'admin-1', email: 'admin@dreamkey.com' } : null),
    req: { param: () => 'admin-1' },
    json: (body, status) => {
      assert.equal(status, 400)
      assert.equal(body.code, 'SELF_DELETION_FORBIDDEN')
      return body
    },
  }
  await deleteEmployeeController(c)
})

test('deleteEmployeeController blocks deleting other Super Admin accounts', async () => {
  const c = {
    get: (k) => {
      if (k === 'user') return { id: 'admin-1', email: 'admin@dreamkey.com' }
      if (k === 'prisma') {
        return {
          user: {
            findUnique: async () => ({
              id: 'admin-2',
              email: 'admin2@dreamkey.com',
              roles: [{ role: { name: 'SUPER_ADMIN' } }],
            }),
          },
        }
      }
      return null
    },
    req: { param: () => 'admin-2' },
    json: (body, status) => {
      assert.equal(status, 400)
      assert.equal(body.code, 'SUPER_ADMIN_PROTECTED')
      return body
    },
  }
  await deleteEmployeeController(c)
})

