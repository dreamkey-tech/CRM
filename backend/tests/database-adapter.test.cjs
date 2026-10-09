const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

function loadDatabase() {
  const clients = [], neonConfig = {}
  class TransactionCapableAdapter {
    constructor(config) { this.config = config }
  }
  class PrismaClient {
    constructor({ adapter }) { this.adapter = adapter; this.disconnected = false; clients.push(this) }
    async $disconnect() { this.disconnected = true }
  }
  const code = transformSync(fs.readFileSync(path.resolve(__dirname, '../src/db.ts'), 'utf8'), { loader: 'ts', format: 'cjs' }).code
  const module = { exports: {} }
  new Function('require', 'module', 'exports', code)((name) => {
    if (name === '@prisma/client') return { PrismaClient }
    if (name === '@prisma/adapter-neon') return { PrismaNeon: TransactionCapableAdapter }
    if (name === '@neondatabase/serverless') return { neonConfig }
    if (name === 'hono/factory') return { createMiddleware: (middleware) => middleware }
    throw new Error(`Unexpected dependency: ${name}`)
  }, module, module.exports)
  return { ...module.exports, clients, neonConfig, TransactionCapableAdapter }
}
const connection = 'postgresql://test:test@database.example.com/test'
const context = () => ({ env: { DATABASE_URL: connection }, set(name, value) { this[name] = value } })

test('database client uses the transaction-capable Neon adapter', () => {
  const db = loadDatabase(), client = db.getPrisma(connection)
  assert.ok(client.adapter instanceof db.TransactionCapableAdapter)
  assert.equal(client.adapter.config.connectionString, connection)
})
test('request completes before its database pool is closed', async () => {
  const db = loadDatabase(), c = context()
  await db.prismaMiddleware(c, async () => { assert.equal(c.prisma.disconnected, false) })
  assert.equal(c.prisma.disconnected, true)
})
test('database pool closes even if the handler fails', async () => {
  const db = loadDatabase(), c = context()
  await assert.rejects(db.prismaMiddleware(c, async () => { throw new Error('Handler failed') }), /Handler failed/)
  assert.equal(c.prisma.disconnected, true)
})
test('each Worker request has its own database client', async () => {
  const db = loadDatabase(), first = context(), second = context()
  await db.prismaMiddleware(first, async () => {})
  await db.prismaMiddleware(second, async () => {})
  assert.notEqual(first.prisma, second.prisma)
  assert.ok(db.clients.every((client) => client.disconnected))
})
