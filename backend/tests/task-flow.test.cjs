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
const { createTaskSchema, updateTaskStatusSchema } = load('zod/task.ts')
const {
  generateOneClickGoogleCalendarUrl,
  generateIcalFeed,
} = load('services/google-calendar.service.ts')
const { notifyTaskAssigneesOnCreation } = load('services/task-notification.service.ts')

test('createTaskSchema enforces valid fields, title length, and at least one assignee', () => {
  // Valid payload
  const valid = {
    title: 'Site Visit at South City Tower 2',
    description: 'Inspect 3BHK flat on 14th floor with client Mr. Roy',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: 'HIGH',
    category: 'SITE_VISIT',
    assigneeIds: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
  }
  const parsed = createTaskSchema.parse(valid)
  assert.equal(parsed.title, valid.title)
  assert.equal(parsed.priority, 'HIGH')
  assert.equal(parsed.category, 'SITE_VISIT')
  assert.equal(parsed.assigneeIds.length, 2)

  // Rejects empty title
  assert.throws(() => {
    createTaskSchema.parse({ ...valid, title: '  ' })
  })

  // Rejects missing assignees
  assert.throws(() => {
    createTaskSchema.parse({ ...valid, assigneeIds: [] })
  })

  // Rejects invalid due date
  assert.throws(() => {
    createTaskSchema.parse({ ...valid, dueDate: 'not-a-date' })
  })
})

test('generateOneClickGoogleCalendarUrl creates pre-populated URL with personal Gmail attendees', () => {
  const mockTask = {
    id: 'task-123',
    title: 'Client Meeting with Mr. Sharma',
    description: 'Discuss purchase token for Ballygunge flat',
    dueDate: new Date('2026-11-10T11:00:00.000Z'),
    priority: 'HIGH',
    category: 'CLIENT_MEETING',
    status: 'TODO',
    assignees: [
      { user: { email: 'partner.sales@gmail.com', name: 'Partner One' } },
      { user: { email: 'partner.leads@gmail.com', name: 'Partner Two' } },
    ],
    client: { name: 'Mr. Sharma', phone: '+919876543210' },
    property: {
      societyBuildingName: 'Ballygunge Heights',
      locationArea: 'Ballygunge',
      city: 'Kolkata',
    },
  }

  const urlStr = generateOneClickGoogleCalendarUrl(mockTask, 'https://crm.dreamkeykol.com')
  const url = new URL(urlStr)

  assert.equal(url.origin, 'https://calendar.google.com')
  assert.equal(url.searchParams.get('action'), 'TEMPLATE')
  assert.equal(url.searchParams.get('text'), '[CLIENT MEETING] Client Meeting with Mr. Sharma')
  assert.match(url.searchParams.get('location') || '', /Ballygunge Heights, Ballygunge, Kolkata/)
  assert.equal(
    url.searchParams.get('add'),
    'partner.sales@gmail.com,partner.leads@gmail.com'
  )
  assert.match(url.searchParams.get('details') || '', /Mr\. Sharma/)
  assert.match(url.searchParams.get('details') || '', /crm\.dreamkeykol\.com\/dashboard\/tasks\?id=task-123/)
})

test('generateIcalFeed creates RFC 5545 compliant calendar feed', () => {
  const mockTasks = [
    {
      id: 'task-abc',
      title: 'Documentation Verification',
      description: 'Check Aadhaar and Title deeds',
      dueDate: new Date('2026-11-15T10:00:00.000Z'),
      priority: 'MEDIUM',
      category: 'DOCUMENT_WORK',
      status: 'TODO',
      assignees: [],
    },
  ]

  const ics = generateIcalFeed(mockTasks, 'DreamKey Tasks')

  assert.match(ics, /BEGIN:VCALENDAR/)
  assert.match(ics, /VERSION:2\.0/)
  assert.match(ics, /X-WR-CALNAME:DreamKey Tasks/)
  assert.match(ics, /BEGIN:VEVENT/)
  assert.match(ics, /UID:task-task-abc@dreamkeykol\.com/)
  assert.match(ics, /SUMMARY:\[DOCUMENT WORK\] Documentation Verification/)
  assert.match(ics, /STATUS:TENTATIVE/)
  assert.match(ics, /END:VEVENT/)
  assert.match(ics, /END:VCALENDAR/)
})

test('Task creation dispatches in-app and push notification payloads to all assignees', async () => {
  const createdNotifications = []
  const mockPrisma = {
    notification: {
      create: async ({ data }) => {
        createdNotifications.push(data)
        return { id: 'notif-1', ...data }
      },
    },
  }

  const mockTask = {
    id: 'task-xyz',
    title: 'Site Inspection',
    dueDate: new Date('2026-11-05T14:00:00.000Z'),
    priority: 'HIGH',
    category: 'SITE_VISIT',
    createdById: 'user-creator',
    creatorName: 'Jeet Admin',
  }

  const assignees = [
    { userId: 'user-creator', email: 'jeet@dreamkeykol.com', name: 'Jeet' },
    { userId: 'user-partner2', email: 'sales.agent@gmail.com', name: 'Agent Smith' },
  ]

  await notifyTaskAssigneesOnCreation(
    mockPrisma,
    mockTask,
    assignees,
    { id: 'user-creator', name: 'Jeet Admin' }
  )

  assert.equal(createdNotifications.length, 2)
  // Creator's notification: "You scheduled a task"
  assert.equal(createdNotifications[0].userId, 'user-creator')
  assert.match(createdNotifications[0].message, /You scheduled a task/)
  assert.equal(createdNotifications[0].type, 'TASK_ASSIGNED')

  // Other assignee's notification: "Jeet Admin assigned you a task"
  assert.equal(createdNotifications[1].userId, 'user-partner2')
  assert.match(createdNotifications[1].message, /Jeet Admin assigned you a task/)
  assert.equal(createdNotifications[1].type, 'TASK_ASSIGNED')
})
