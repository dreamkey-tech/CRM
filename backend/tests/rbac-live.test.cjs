const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { randomUUID } = require('node:crypto')
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
const dbModule = load('db.ts')
const { seedSystemDefaults } = load('lib/seed.ts')
const { createEmployeeController, listEmployeesController } = load('controllers/employee.controller.ts')
const { listAuditLogsController } = load('controllers/audit.controller.ts')

test('live database integration: seed system defaults, create employee, verify permissions & audit logs', async () => {
  const envContent = fs.readFileSync(path.resolve(root, '.env'), 'utf8')
  const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)
  if (!dbUrlMatch) {
    console.log('Skipping live test: DATABASE_URL not found')
    return
  }
  const dbUrl = dbUrlMatch[1]
  const prisma = dbModule.getPrisma(dbUrl)

  const testEmail = `test-emp-${randomUUID()}@dreamkey.in`
  let createdUserId = null
  let adminUser = null

  try {
    // 1. Seed defaults
    await seedSystemDefaults(prisma)

    adminUser = await prisma.user.create({
      data: {
        email: `admin-${randomUUID()}@dreamkey.in`,
        name: 'Super Admin Test',
        passwordHash: 'test-hash-unusable',
      },
    })

    // 2. Mock context for creating employee with View-Only on Brokers and No Access on Finance
    const mockContext = {
      get: (key) => {
        if (key === 'prisma') return prisma
        if (key === 'user') return adminUser
        return null
      },
      req: {
        valid: () => ({
          name: 'Rohan Telecaller',
          email: testEmail,
          password: 'RohanSecure123!#',
          moduleAccess: {
            properties: 'VIEW',
            clients: 'VIEW',
            brokers: 'VIEW', // View-only
            owners: 'VIEW',
            finance: 'NONE', // No finance
            canViewSensitiveDocs: false,
          },
        }),
        header: (h) => (h === 'user-agent' ? 'TestRunner' : '127.0.0.1'),
      },
      json: (body, status = 200) => ({ body, status }),
    }

    const res = await createEmployeeController(mockContext)
    assert.equal(res.status, 201)
    assert.equal(res.body.success, true)
    createdUserId = res.body.employee.id

    // Check moduleAccess returned
    assert.equal(res.body.employee.moduleAccess.brokers, 'VIEW')
    assert.equal(res.body.employee.moduleAccess.finance, 'NONE')
    assert.equal(res.body.employee.moduleAccess.canViewSensitiveDocs, false)

    // 3. Verify user exists in database and has roles/permissions
    const dbUser = await prisma.user.findUnique({
      where: { id: createdUserId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    assert.ok(dbUser)
    assert.equal(dbUser.email, testEmail)
    const perms = dbUser.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.name))

    // Must have brokers:read
    assert.equal(perms.includes('brokers:read'), true)
    // Must NOT have brokers:create or finance:read or clients:documents:view_sensitive
    assert.equal(perms.includes('brokers:create'), false)
    assert.equal(perms.includes('finance:read'), false)
    assert.equal(perms.includes('clients:documents:view_sensitive'), false)

    // 4. Verify audit log was written
    const auditLogs = await prisma.auditLog.findMany({
      where: { resourceId: createdUserId },
    })
    assert.ok(auditLogs.length > 0)
    assert.equal(auditLogs[0].action, 'CREATE_EMPLOYEE')
    assert.equal(auditLogs[0].module, 'EMPLOYEES')

    // 5. Test listEmployeesController finds the created employee
    const listContext = {
      get: (key) => (key === 'prisma' ? prisma : null),
      req: {
        valid: () => ({ search: testEmail, status: 'ALL', page: 1, limit: 10 }),
      },
      json: (body, status = 200) => ({ body, status }),
    }
    const listRes = await listEmployeesController(listContext)
    assert.equal(listRes.body.success, true)
    assert.equal(listRes.body.employees.some((e) => e.email === testEmail), true)

    // 6. Test listAuditLogsController retrieves the audit logs
    const auditListContext = {
      get: (key) => (key === 'prisma' ? prisma : null),
      req: {
        valid: () => ({ module: 'EMPLOYEES', status: 'ALL', page: 1, limit: 10 }),
      },
      json: (body, status = 200) => ({ body, status }),
    }
    const auditListRes = await listAuditLogsController(auditListContext)
    assert.equal(auditListRes.body.success, true)
    assert.ok(auditListRes.body.logs.length > 0)
  } finally {
    // Clean up test employee, roles and audit logs
    if (createdUserId) {
      await prisma.auditLog.deleteMany({ where: { resourceId: createdUserId } })
      await prisma.userRole.deleteMany({ where: { userId: createdUserId } })
      await prisma.role.deleteMany({ where: { name: `STAFF_${createdUserId.substring(0, 8).toUpperCase()}` } })
      await prisma.user.deleteMany({ where: { id: createdUserId } })
    }
    if (adminUser) {
      await prisma.auditLog.deleteMany({ where: { userId: adminUser.id } })
      await prisma.user.deleteMany({ where: { id: adminUser.id } })
    }
    await prisma.$disconnect()
  }
})
