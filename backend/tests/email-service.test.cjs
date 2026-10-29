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
const { renderEmployeeWelcomeEmail } = load('services/email/templates/employeeWelcome.ts')
const { renderPasswordResetEmail } = load('services/email/templates/passwordReset.ts')
const { sendEmployeeWelcomeEmail, sendEmail } = load('services/email/email.service.ts')

test('renderEmployeeWelcomeEmail formats HTML and text with credentials', () => {
  const emailData = {
    to: 'agent@dreamkeykol.com',
    name: 'Rohit Sharma',
    email: 'agent@dreamkeykol.com',
    password: 'SecurePassword123!',
    loginUrl: 'https://admin.dreamkeykol.com/login',
  }

  const { subject, html, text } = renderEmployeeWelcomeEmail(emailData)

  assert.ok(subject.includes('DreamKey CRM'))
  assert.ok(html.includes('Rohit Sharma'))
  assert.ok(html.includes('agent@dreamkeykol.com'))
  assert.ok(html.includes('SecurePassword123!'))
  assert.ok(html.includes('https://admin.dreamkeykol.com/login'))
  assert.ok(text.includes('SecurePassword123!'))
})

test('renderPasswordResetEmail formats reset notification', () => {
  const resetData = {
    to: 'agent@dreamkeykol.com',
    name: 'Rohit Sharma',
    email: 'agent@dreamkeykol.com',
    newPassword: 'ResetPassword456#',
    loginUrl: 'https://admin.dreamkeykol.com/login',
  }

  const { subject, html, text } = renderPasswordResetEmail(resetData)

  assert.ok(subject.includes('Password Has Been Reset'))
  assert.ok(html.includes('ResetPassword456#'))
  assert.ok(text.includes('ResetPassword456#'))
})

test('sendEmail handles unconfigured API key gracefully via safe simulation', async () => {
  const result = await sendEmail(
    {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
    },
    { DATABASE_URL: 'dummy', RESEND_API_KEY: '' }
  )

  assert.equal(result.success, false)
  assert.ok(result.error.includes('not configured'))
})
