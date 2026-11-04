import https from 'node:https'
import http from 'node:http'

const SESSION_TOKEN = 'd2c056f557de37a4d8c56fb475a60fa7743456b0c55ef4b2c10af8b6282ec113'
const PROD_BASE = 'https://admin.dreamkeykol.com/api/v1'
const WORKER_BASE = 'https://backend.dreamkey-crm.workers.dev/v1'

const ENDPOINTS = [
  { name: 'Dashboard Overview', path: '/dashboard/overview' },
  { name: 'Owner Stats', path: '/owners/stats' },
  { name: 'Broker Stats', path: '/brokers/stats' },
  { name: 'Client Stats', path: '/clients/stats' },
  { name: 'Property Stats', path: '/properties/stats' },
]

function measureRequest(url) {
  return new Promise((resolve) => {
    const start = performance.now()
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'Cookie': `auth_session=${SESSION_TOKEN}`,
        'Accept': 'application/json',
      },
    }

    const req = (parsed.protocol === 'https:' ? https : http).request(options, (res) => {
      let ttfb = performance.now() - start
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        const total = performance.now() - start
        resolve({
          statusCode: res.statusCode,
          ttfbMs: Math.round(ttfb),
          totalMs: Math.round(total),
          cacheControl: res.headers['cache-control'] || 'none',
          bytes: Buffer.byteLength(data),
        })
      })
    })

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        ttfbMs: -1,
        totalMs: Math.round(performance.now() - start),
        error: err.message,
      })
    })

    req.end()
  })
}

async function runBenchmark() {
  console.log('='.repeat(75))
  console.log(' DREAMKEY CRM API PERFORMANCE & CACHING BENCHMARK')
  console.log('='.repeat(75))
  console.log(`Target 1: Cloudflare Custom Domain (${PROD_BASE})`)
  console.log(`Target 2: Direct Worker Node      (${WORKER_BASE})\n`)

  const results = []

  for (const ep of ENDPOINTS) {
    console.log(`Testing [${ep.name}] (${ep.path})...`)
    const prodUrl = `${PROD_BASE}${ep.path}`
    const workerUrl = `${WORKER_BASE}${ep.path}`

    // 1. Direct worker cold
    const cold = await measureRequest(workerUrl)
    // 2. Direct worker warm #1
    const warm1 = await measureRequest(workerUrl)
    // 3. Direct worker warm #2
    const warm2 = await measureRequest(workerUrl)
    // 4. Via admin.dreamkeykol.com proxy
    const prodProxy = await measureRequest(prodUrl)

    results.push({
      endpoint: ep.name,
      path: ep.path,
      coldMs: cold.totalMs,
      warm1Ms: warm1.totalMs,
      warm2Ms: warm2.totalMs,
      prodProxyMs: prodProxy.totalMs,
      status: warm1.statusCode,
    })
  }

  console.log('\n' + '='.repeat(75))
  console.log(' BENCHMARK RESULTS SUMMARY TABLE')
  console.log('='.repeat(75))
  console.log(
    'Endpoint'.padEnd(22) +
    'Status'.padEnd(10) +
    'Cold (DB)'.padEnd(14) +
    'Warm #1'.padEnd(12) +
    'Warm #2 (L1)'.padEnd(15) +
    'Proxy (Admin)'
  )
  console.log('-'.repeat(75))

  for (const r of results) {
    console.log(
      r.endpoint.padEnd(22) +
      String(r.status).padEnd(10) +
      `${r.coldMs} ms`.padEnd(14) +
      `${r.warm1Ms} ms`.padEnd(12) +
      `${r.warm2Ms} ms`.padEnd(15) +
      `${r.prodProxyMs} ms`
    )
  }
  console.log('='.repeat(75))
}

runBenchmark().catch(console.error)
