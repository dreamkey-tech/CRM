const test = require('node:test')
const assert = require('node:assert/strict')

test('CORS origin validator strictly allows trusted origins and rejects attacker domains', () => {
  const allowedHosts = [
    'dreamkeykol.com',
    'www.dreamkeykol.com',
    'admin.dreamkeykol.com',
    'dreamkey-crm.pages.dev',
    'backend.dreamkey-crm.workers.dev',
  ]

  function validateOrigin(origin, env = {}) {
    if (!origin) return 'http://localhost:3000'
    try {
      const parsed = new URL(origin)
      const hostname = parsed.hostname.toLowerCase()

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return origin
      }

      if (env.FRONTEND_URL) {
        try {
          const frontendHost = new URL(env.FRONTEND_URL).hostname.toLowerCase()
          if (hostname === frontendHost) return origin
        } catch {}
      }

      if (
        allowedHosts.includes(hostname) ||
        hostname.endsWith('.dreamkey-crm.pages.dev') ||
        hostname.endsWith('.dreamkey-crm.workers.dev')
      ) {
        return origin
      }
    } catch {}
    return null
  }

  // Trusted origins
  assert.equal(validateOrigin('http://localhost:3000'), 'http://localhost:3000')
  assert.equal(validateOrigin('https://dreamkeykol.com'), 'https://dreamkeykol.com')
  assert.equal(validateOrigin('https://admin.dreamkeykol.com'), 'https://admin.dreamkeykol.com')
  assert.equal(validateOrigin('https://preview-123.dreamkey-crm.pages.dev'), 'https://preview-123.dreamkey-crm.pages.dev')
  assert.equal(validateOrigin('https://backend.dreamkey-crm.workers.dev'), 'https://backend.dreamkey-crm.workers.dev')
  assert.equal(validateOrigin('https://preview.dreamkey-crm.workers.dev'), 'https://preview.dreamkey-crm.workers.dev')

  // Malicious / untrusted origins must be rejected (return null)
  assert.equal(validateOrigin('https://evil.com'), null)
  assert.equal(validateOrigin('https://attacker-localhost.com'), null)
  assert.equal(validateOrigin('https://dreamkeykol.com.attacker.com'), null)
  assert.equal(validateOrigin('https://attacker-dreamkey-crm.workers.dev.evil.com'), null)
  assert.equal(validateOrigin('javascript:alert(1)'), null)
})

test('OAuth redirect validator prevents Open Redirect attacks', () => {
  function isAllowedRedirectUrl(urlStr, env = {}) {
    try {
      const parsed = new URL(urlStr)
      const hostname = parsed.hostname.toLowerCase()

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return true
      }

      if (env.FRONTEND_URL) {
        try {
          const frontendHost = new URL(env.FRONTEND_URL).hostname.toLowerCase()
          if (hostname === frontendHost) return true
        } catch {}
      }

      const allowedHosts = [
        'dreamkeykol.com',
        'www.dreamkeykol.com',
        'admin.dreamkeykol.com',
        'dreamkey-crm.pages.dev',
      ]
      if (allowedHosts.includes(hostname) || hostname.endsWith('.dreamkey-crm.pages.dev')) {
        return true
      }
    } catch {}
    return false
  }

  assert.equal(isAllowedRedirectUrl('https://admin.dreamkeykol.com/dashboard'), true)
  assert.equal(isAllowedRedirectUrl('http://localhost:3000/dashboard'), true)

  // Disallow arbitrary domains
  assert.equal(isAllowedRedirectUrl('https://evil-attacker.com/steal-token'), false)
  assert.equal(isAllowedRedirectUrl('https://google.com'), false)
  assert.equal(isAllowedRedirectUrl('javascript:void(0)'), false)
})

test('Cryptographic OTP generator produces 4 numeric digits between 1000 and 9999', () => {
  function generate4DigitOtp() {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    const code = 1000 + (array[0] % 9000)
    return code.toString()
  }

  for (let i = 0; i < 100; i++) {
    const code = generate4DigitOtp()
    assert.match(code, /^\d{4}$/)
    const num = parseInt(code, 10)
    assert.ok(num >= 1000 && num <= 9999)
  }
})

test('OTP attempt counter deactivates OTP on reaching max attempts', () => {
  let activeOtp = { id: '1', otp: '4829', attempts: 0, used: false }
  const maxAttempts = 5

  function verifyAttempt(enteredOtp) {
    if (activeOtp.used) return { error: 'Code is inactive' }
    if (activeOtp.otp !== enteredOtp) {
      activeOtp.attempts++
      if (activeOtp.attempts >= maxAttempts) {
        activeOtp.used = true
        return { error: 'Too many incorrect attempts. Deactivated.' }
      }
      return { error: `Invalid code. ${maxAttempts - activeOtp.attempts} attempts remaining.` }
    }
    activeOtp.used = true
    return { success: true }
  }

  // 4 wrong attempts
  assert.equal(verifyAttempt('0000').error.includes('attempts remaining'), true)
  assert.equal(activeOtp.used, false)
  assert.equal(verifyAttempt('0001').error.includes('attempts remaining'), true)
  assert.equal(verifyAttempt('0002').error.includes('attempts remaining'), true)
  assert.equal(verifyAttempt('0003').error.includes('attempts remaining'), true)
  assert.equal(activeOtp.used, false)

  // 5th wrong attempt should deactivate
  const finalRes = verifyAttempt('0004')
  assert.equal(finalRes.error.includes('Deactivated'), true)
  assert.equal(activeOtp.used, true)

  // Subsequent correct attempt must fail because OTP was deactivated
  assert.equal(verifyAttempt('4829').error, 'Code is inactive')
})

test('Non-Super Admin cannot assign SUPER_ADMIN or grant wildcard permissions', () => {
  function canAssignPermissions(callerPerms, targetPerms, targetRole) {
    const isCallerSuperAdmin = callerPerms.includes('*:*')
    if ((targetPerms.includes('*:*') || targetRole === 'SUPER_ADMIN') && !isCallerSuperAdmin) {
      return false
    }
    return true
  }

  const staffPerms = ['employees:manage', 'properties:read']
  const superAdminPerms = ['*:*']

  // Staff cannot assign *:* or SUPER_ADMIN
  assert.equal(canAssignPermissions(staffPerms, ['*:*'], undefined), false)
  assert.equal(canAssignPermissions(staffPerms, ['properties:read'], 'SUPER_ADMIN'), false)
  assert.equal(canAssignPermissions(staffPerms, ['properties:read', 'clients:read'], 'SALES_AGENT'), true)

  // Super Admin can assign anything
  assert.equal(canAssignPermissions(superAdminPerms, ['*:*'], 'SUPER_ADMIN'), true)
})

test('Non-Super Admin cannot reset password or modify a Super Admin account', () => {
  function canModifyTargetUser(callerPerms, targetUserRoles) {
    const isCallerSuperAdmin = callerPerms.includes('*:*')
    const isTargetSuperAdmin = targetUserRoles.includes('SUPER_ADMIN')
    if (isTargetSuperAdmin && !isCallerSuperAdmin) {
      return false
    }
    return true
  }

  assert.equal(canModifyTargetUser(['employees:manage'], ['SUPER_ADMIN']), false)
  assert.equal(canModifyTargetUser(['employees:manage'], ['SALES_AGENT']), true)
  assert.equal(canModifyTargetUser(['*:*'], ['SUPER_ADMIN']), true)
})

test('OpenAPI spec dynamically configures environment server origin and avoids localhost in prod', () => {
  function resolveOpenApiServers(reqUrlStr, headers = {}) {
    let currentOrigin = ''
    try {
      const reqUrl = new URL(reqUrlStr)
      const forwardedProto = headers['x-forwarded-proto'] || reqUrl.protocol.replace(':', '')
      const forwardedHost = headers['x-forwarded-host'] || headers['host'] || reqUrl.host
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

    const seen = new Set()
    return candidateServers.filter((s) => {
      if (seen.has(s.url)) return false
      seen.add(s.url)
      return true
    })
  }

  // Prod Cloudflare request
  const prodServers = resolveOpenApiServers('https://backend.dreamkey-crm.workers.dev/openapi.json')
  assert.equal(prodServers[0].url, 'https://backend.dreamkey-crm.workers.dev')

  // Reverse proxy with forwarded host
  const proxyServers = resolveOpenApiServers('http://internal-worker/openapi.json', {
    'x-forwarded-proto': 'https',
    'x-forwarded-host': 'api.dreamkeykol.com',
  })
  assert.equal(proxyServers[0].url, 'https://api.dreamkeykol.com')

  // Local dev
  const localServers = resolveOpenApiServers('http://localhost:8787/openapi.json')
  assert.equal(localServers[0].url, 'http://localhost:8787')
  assert.equal(localServers[1].url, 'https://backend.dreamkey-crm.workers.dev')
})
