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
          ? read(path.resolve(path.dirname(filename), name.endsWith('.ts') ? name : name + '.ts'))
          : req(name),
      module,
      module.exports
    )
    return module.exports
  }
  return (relative) => read(path.resolve(root, 'src', relative))
}

const load = loader()

const { parseDeviceInfo } = load('lib/device.ts')
const { computeEntityDiff, formatFieldLabel, formatDiffValue } = load('lib/audit.ts')
const { auditQuerySchema } = load('zod/audit.ts')
const { listAuditLogsController } = load('controllers/audit.controller.ts')

test('device parser accurately identifies phone vs laptop/desktop vs tablet', () => {
  // 1. Laptop / Desktop (Windows Chrome)
  const windowsLaptopUA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  const winDevice = parseDeviceInfo(windowsLaptopUA)
  assert.equal(winDevice.deviceType, 'DESKTOP')
  assert.equal(winDevice.os, 'Windows 10/11')
  assert.equal(winDevice.browser, 'Chrome')
  assert.match(winDevice.deviceName, /Laptop\/PC \(Windows 10\/11 • Chrome\)/)

  // 2. Laptop (macOS Safari)
  const macLaptopUA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15'
  const macDevice = parseDeviceInfo(macLaptopUA)
  assert.equal(macDevice.deviceType, 'DESKTOP')
  assert.equal(macDevice.os, 'macOS')
  assert.equal(macDevice.browser, 'Safari')
  assert.match(macDevice.deviceName, /Laptop\/Mac/)

  // 3. Mobile Phone (iPhone Safari)
  const iphoneUA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  const iphoneDevice = parseDeviceInfo(iphoneUA)
  assert.equal(iphoneDevice.deviceType, 'MOBILE')
  assert.match(iphoneDevice.os, /iOS/)
  assert.equal(iphoneDevice.browser, 'Safari')
  assert.match(iphoneDevice.deviceName, /Phone \(iPhone • Safari\)/)

  // 4. Mobile Phone (Android Chrome)
  const androidUA =
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36'
  const androidDevice = parseDeviceInfo(androidUA)
  assert.equal(androidDevice.deviceType, 'MOBILE')
  assert.equal(androidDevice.os, 'Android 14')
  assert.equal(androidDevice.browser, 'Chrome')
  assert.match(androidDevice.deviceName, /Phone \(Android 14 • Chrome\)/)

  // 5. Tablet (iPad)
  const ipadUA =
    'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
  const ipadDevice = parseDeviceInfo(ipadUA)
  assert.equal(ipadDevice.deviceType, 'TABLET')
  assert.match(ipadDevice.deviceName, /Tablet/)
})

test('computeEntityDiff correctly generates detailed field diffs and human summaries', () => {
  const before = {
    id: 'client-1',
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    status: 'ACTIVE',
    notes: 'Initial discussion',
  }

  const after = {
    id: 'client-1',
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    status: 'INACTIVE',
    notes: 'Budget increased, waiting for site visit',
  }

  const { diffs, summary } = computeEntityDiff(before, after)

  assert.equal(diffs.length, 2)
  assert.equal(diffs[0].field, 'status')
  assert.equal(diffs[0].from, 'ACTIVE')
  assert.equal(diffs[0].to, 'INACTIVE')
  assert.equal(diffs[1].field, 'notes')
  assert.match(summary, /Status: 'ACTIVE' ➔ 'INACTIVE'/)
})

test('auditQuerySchema validates userId, deviceType, action and modules', () => {
  const parsed = auditQuerySchema.parse({
    userId: '11111111-1111-4111-8111-111111111111',
    deviceType: 'MOBILE',
    action: 'LOGIN',
    module: 'AUTH',
  })

  assert.equal(parsed.userId, '11111111-1111-4111-8111-111111111111')
  assert.equal(parsed.deviceType, 'MOBILE')
  assert.equal(parsed.action, 'LOGIN')
  assert.equal(parsed.module, 'AUTH')
})

test('listAuditLogsController compiles employee userSummary with device spotlight', async () => {
  const mockUser = {
    id: 'user-telecaller-1',
    name: 'Rakesh Telecaller',
    email: 'rakesh@dreamkey.in',
    isActive: true,
    roles: [{ role: { name: 'TELECALLER' } }],
  }

  const mockLogs = [
    {
      id: 'log-1',
      action: 'LOGIN',
      module: 'AUTH',
      details: 'Signed in successfully',
      deviceType: 'DESKTOP',
      deviceName: 'Laptop/PC (Windows 10/11 • Chrome)',
      ipAddress: '103.22.45.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      status: 'SUCCESS',
      createdAt: new Date(),
      user: mockUser,
      changes: null,
    },
    {
      id: 'log-2',
      action: 'UPDATE',
      module: 'CLIENTS',
      details: "Updated client 'Sunil': Status changed from 'NEW' to 'CONTACTED'",
      deviceType: 'MOBILE',
      deviceName: 'Phone (Android 14 • Chrome)',
      ipAddress: '103.22.45.10',
      userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0',
      status: 'SUCCESS',
      createdAt: new Date(),
      user: mockUser,
      changes: [{ field: 'status', label: 'Status', from: 'NEW', to: 'CONTACTED' }],
    },
  ]

  const mockPrisma = {
    auditLog: {
      count: async () => 2,
      findMany: async () => mockLogs,
      findFirst: async () => mockLogs[0],
    },
    user: {
      findUnique: async () => mockUser,
    },
  }

  const context = {
    get: (key) => (key === 'prisma' ? mockPrisma : null),
    req: {
      valid: () => ({
        userId: 'user-telecaller-1',
        status: 'ALL',
        page: 1,
        limit: 25,
      }),
    },
    json: (data) => data,
  }

  const response = await listAuditLogsController(context)
  assert.equal(response.success, true)
  assert.equal(response.logs.length, 2)
  assert.ok(response.userSummary)
  assert.equal(response.userSummary.employee.name, 'Rakesh Telecaller')
  assert.equal(response.userSummary.employee.role, 'TELECALLER')
  assert.equal(response.userSummary.lastLogin.deviceType, 'DESKTOP')
  assert.equal(response.userSummary.lastLogin.deviceName, 'Laptop/PC (Windows 10/11 • Chrome)')
  assert.equal(response.logs[1].changes.length, 1)
  assert.equal(response.logs[1].changes[0].field, 'status')
})
