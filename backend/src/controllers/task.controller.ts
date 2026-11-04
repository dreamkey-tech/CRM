import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import type { AppEnv } from '../db'
import { logAudit } from '../lib/audit'
import { isAllowedRedirectUrl } from './oauth.controller'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  TaskQueryInput,
} from '../zod/task'
import {
  generateOneClickGoogleCalendarUrl,
  generateIcalFeed,
  syncTaskToGoogleCalendar,
  deleteTaskFromGoogleCalendar,
} from '../services/google-calendar.service'
import {
  notifyTaskAssigneesOnCreation,
  dispatchDueDateMorningReminders,
  dispatchDailyTaskDigests,
} from '../services/task-notification.service'

/**
 * Standard relational select for Task items
 */
const taskInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  completedBy: { select: { id: true, name: true, email: true } },
  client: { select: { id: true, name: true, phone: true, email: true } },
  property: {
    select: {
      id: true,
      societyBuildingName: true,
      locationArea: true,
      city: true,
      propertyType: true,
      askingPrice: true,
    },
  },
  assignees: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
}

function getBaseUrl(c: Context<AppEnv>): string {
  if (c.env?.FRONTEND_URL) return c.env.FRONTEND_URL.replace(/\/$/, '')
  try {
    const origin = new URL(c.req.url).origin
    return origin.replace(':8787', ':3000')
  } catch {
    return 'http://localhost:3000'
  }
}

/**
 * GET /v1/tasks
 * Filtered, paginated list of tasks
 */
export async function listTasksController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const query = c.req.valid('query' as never) as TaskQueryInput

  const where: any = {}

  if (query.status && query.status !== 'ALL') {
    where.status = query.status
  }

  if (query.priority && query.priority !== 'ALL') {
    where.priority = query.priority
  }

  if (query.category && query.category !== 'ALL') {
    where.category = query.category
  }

  if (query.scope === 'MINE' || query.partnerId === user.id) {
    where.assignees = { some: { userId: user.id } }
  } else if (query.partnerId) {
    where.assignees = { some: { userId: query.partnerId } }
  }

  if (query.startDate || query.endDate) {
    where.dueDate = {}
    if (query.startDate) where.dueDate.gte = new Date(query.startDate)
    if (query.endDate) where.dueDate.lte = new Date(query.endDate)
  }

  if (query.search) {
    const s = query.search.trim()
    where.OR = [
      { title: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { client: { name: { contains: s, mode: 'insensitive' } } },
      { property: { societyBuildingName: { contains: s, mode: 'insensitive' } } },
      { property: { locationArea: { contains: s, mode: 'insensitive' } } },
    ]
  }

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 15
  const skip = (page - 1) * limit

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      skip,
      take: limit,
    }),
  ])

  const baseUrl = getBaseUrl(c)
  const itemsWithGoogleUrl = tasks.map((t) => ({
    ...t,
    oneClickGoogleUrl: generateOneClickGoogleCalendarUrl(t as any, baseUrl),
  }))

  return c.json({
    success: true,
    tasks: itemsWithGoogleUrl,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  })
}

/**
 * GET /v1/tasks/calendar
 * Returns tasks for Day/Week/Month calendar views for all partners
 */
export async function getCalendarTasksController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const startDateStr = c.req.query('startDate')
  const endDateStr = c.req.query('endDate')
  const partnerId = c.req.query('partnerId')
  const scope = c.req.query('scope')

  const where: any = {}

  if (startDateStr || endDateStr) {
    where.dueDate = {}
    if (startDateStr) where.dueDate.gte = new Date(startDateStr)
    if (endDateStr) where.dueDate.lte = new Date(endDateStr)
  }

  if (scope === 'MINE' || partnerId === user.id) {
    where.assignees = { some: { userId: user.id } }
  } else if (partnerId && partnerId !== 'ALL') {
    where.assignees = { some: { userId: partnerId } }
  }

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: { dueDate: 'asc' },
  })

  const baseUrl = getBaseUrl(c)
  const calendarTasks = tasks.map((t) => ({
    ...t,
    oneClickGoogleUrl: generateOneClickGoogleCalendarUrl(t as any, baseUrl),
  }))

  return c.json({
    success: true,
    tasks: calendarTasks,
  })
}

/**
 * GET /v1/tasks/stats
 * Overview counters for tasks
 */
export async function getTaskStatsController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const now = new Date()

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const [total, dueToday, overdue, inProgress, completedThisWeek, myDueToday] =
    await Promise.all([
      prisma.task.count({ where: { status: { not: 'CANCELLED' } } }),
      prisma.task.count({
        where: {
          dueDate: { gte: startOfDay, lte: endOfDay },
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
      }),
      prisma.task.count({
        where: {
          dueDate: { lt: startOfDay },
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
      }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.task.count({
        where: {
          status: 'DONE',
          completedAt: { gte: startOfWeek },
        },
      }),
      prisma.task.count({
        where: {
          dueDate: { gte: startOfDay, lte: endOfDay },
          status: { in: ['TODO', 'IN_PROGRESS'] },
          assignees: { some: { userId: user.id } },
        },
      }),
    ])

  return c.json({
    success: true,
    stats: {
      total,
      dueToday,
      overdue,
      inProgress,
      completedThisWeek,
      myDueToday,
    },
  })
}

/**
 * GET /v1/tasks/history
 * FR-TK-07: Completed task history with timestamp of completion
 */
export async function getTaskHistoryController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const page = Number(c.req.query('page')) || 1
  const limit = Number(c.req.query('limit')) || 20
  const partnerId = c.req.query('partnerId')
  const skip = (page - 1) * limit

  const where: any = {
    status: 'DONE',
  }

  if (partnerId && partnerId !== 'ALL') {
    where.assignees = { some: { userId: partnerId } }
  }

  const [total, completedTasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: { completedAt: 'desc' },
      skip,
      take: limit,
    }),
  ])

  const history = completedTasks.map((t) => {
    const isOverdue = t.completedAt && t.dueDate ? t.completedAt > t.dueDate : false
    const timeToCompleteMs =
      t.completedAt && t.createdAt ? t.completedAt.getTime() - t.createdAt.getTime() : null

    return {
      ...t,
      isOverdue,
      timeToCompleteMs,
    }
  })

  return c.json({
    success: true,
    history,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  })
}

/**
 * GET /v1/tasks/:id
 */
export async function getTaskByIdController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const id = c.req.param('id')

  const task = await prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  })

  if (!task) {
    return c.json({ success: false, error: 'Task not found.' }, 404)
  }

  const baseUrl = getBaseUrl(c)
  return c.json({
    success: true,
    task: {
      ...task,
      oneClickGoogleUrl: generateOneClickGoogleCalendarUrl(task as any, baseUrl),
    },
  })
}

/**
 * POST /v1/tasks
 * FR-TK-01: Any partner can create a task and assign to one or more partners
 */
export async function createTaskController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const body = c.req.valid('json' as never) as CreateTaskInput

  // Verify assignees exist and are active
  const assignees = await prisma.user.findMany({
    where: {
      id: { in: body.assigneeIds },
      isActive: true,
    },
    select: { id: true, name: true, email: true },
  })

  if (assignees.length === 0) {
    return c.json(
      { success: false, error: 'Please select valid active partners for assignment.' },
      400
    )
  }

  // Create Task and Assignees in a transaction
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      dueDate: new Date(body.dueDate),
      priority: body.priority,
      category: body.category,
      createdById: user.id,
      clientId: body.clientId || null,
      propertyId: body.propertyId || null,
      assignees: {
        create: assignees.map((a) => ({
          userId: a.id,
        })),
      },
    },
    include: taskInclude,
  })

  // FR-TK-04: Push / in-app notification to all assignees
  await notifyTaskAssigneesOnCreation(
    prisma,
    {
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      createdById: user.id,
      creatorName: user.name,
    },
    assignees.map((a) => ({ userId: a.id, email: a.email, name: a.name })),
    user
  )

  // Sync to DreamKey Master Google Calendar (with assignees' personal emails as attendees)
  let googleEventId: string | null = null
  try {
    googleEventId = await syncTaskToGoogleCalendar(prisma, task as any, c.env)
    if (googleEventId) {
      await prisma.task.update({
        where: { id: task.id },
        data: { googleEventId, googleSyncedAt: new Date() },
      })
    }
  } catch (err) {
    console.error('Failed to sync newly created task to master calendar:', err)
  }

  // Audit Log
  await logAudit(c, {
    action: 'CREATE',
    module: 'TASKS',
    resourceId: task.id,
    resourceName: task.title,
    details: `Task created and assigned to ${assignees.map((a) => a.name || a.email).join(', ')}.`,
  })

  const baseUrl = getBaseUrl(c)
  return c.json(
    {
      success: true,
      message: 'Task created successfully.',
      task: {
        ...task,
        googleEventId: googleEventId || task.googleEventId,
        oneClickGoogleUrl: generateOneClickGoogleCalendarUrl(task as any, baseUrl),
      },
    },
    201
  )
}

/**
 * PATCH /v1/tasks/:id
 * Edit task details & update assignees
 */
export async function updateTaskController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const id = c.req.param('id')
  const body = c.req.valid('json' as never) as UpdateTaskInput

  const existing = await prisma.task.findUnique({
    where: { id },
    include: { assignees: true },
  })

  if (!existing) {
    return c.json({ success: false, error: 'Task not found.' }, 404)
  }

  const updateData: any = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description
  if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate)
  if (body.priority !== undefined) updateData.priority = body.priority
  if (body.category !== undefined) updateData.category = body.category
  if (body.status !== undefined) {
    updateData.status = body.status
    if (body.status === 'DONE' && existing.status !== 'DONE') {
      updateData.completedAt = new Date()
      updateData.completedById = user.id
    } else if (body.status !== 'DONE' && existing.status === 'DONE') {
      updateData.completedAt = null
      updateData.completedById = null
    }
  }
  if (body.clientId !== undefined) updateData.clientId = body.clientId
  if (body.propertyId !== undefined) updateData.propertyId = body.propertyId

  // Update assignees if provided
  if (body.assigneeIds && body.assigneeIds.length > 0) {
    const existingAssigneeIds = new Set(existing.assignees.map((a) => a.userId))
    const newAssigneeIds = new Set(body.assigneeIds)

    const toRemove = existing.assignees
      .filter((a) => !newAssigneeIds.has(a.userId))
      .map((a) => a.userId)

    const toAdd = body.assigneeIds.filter((aid) => !existingAssigneeIds.has(aid))

    if (toRemove.length > 0) {
      await prisma.taskAssignee.deleteMany({
        where: {
          taskId: id,
          userId: { in: toRemove },
        },
      })
    }

    if (toAdd.length > 0) {
      await prisma.taskAssignee.createMany({
        data: toAdd.map((uid) => ({
          taskId: id!,
          userId: uid,
        })),
        skipDuplicates: true,
      })

      // Notify newly assigned partners
      const newUsers = await prisma.user.findMany({
        where: { id: { in: toAdd } },
        select: { id: true, email: true, name: true },
      })
      await notifyTaskAssigneesOnCreation(
        prisma,
        {
          id: existing.id,
          title: body.title || existing.title,
          dueDate: updateData.dueDate || existing.dueDate,
          priority: updateData.priority || existing.priority,
          category: updateData.category || existing.category,
          createdById: user.id,
          creatorName: user.name,
        },
        newUsers.map((u) => ({ userId: u.id, email: u.email, name: u.name })),
        user
      )
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
    include: taskInclude,
  })

  // Sync updates to master Google Calendar event
  try {
    await syncTaskToGoogleCalendar(prisma, updatedTask as any, c.env)
  } catch (err) {
    console.error('Failed to sync updated task to master Google Calendar:', err)
  }

  await logAudit(c, {
    action: 'UPDATE',
    module: 'TASKS',
    resourceId: id,
    resourceName: updatedTask.title,
    details: `Task updated.`,
  })

  const baseUrl = getBaseUrl(c)
  return c.json({
    success: true,
    message: 'Task updated successfully.',
    task: {
      ...updatedTask,
      oneClickGoogleUrl: generateOneClickGoogleCalendarUrl(updatedTask as any, baseUrl),
    },
  })
}

/**
 * PATCH /v1/tasks/:id/status
 * FR-TK-03: Quick status change (TODO -> IN_PROGRESS -> DONE -> CANCELLED)
 * FR-TK-07: Records completion timestamp and completer when DONE
 */
export async function updateTaskStatusController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')!
  const id = c.req.param('id')
  const { status } = c.req.valid('json' as never) as UpdateTaskStatusInput

  const existing = await prisma.task.findUnique({
    where: { id },
  })

  if (!existing) {
    return c.json({ success: false, error: 'Task not found.' }, 404)
  }

  const isMarkingDone = status === 'DONE' && existing.status !== 'DONE'
  const isRevertingDone = status !== 'DONE' && existing.status === 'DONE'

  const task = await prisma.task.update({
    where: { id },
    data: {
      status,
      completedAt: isMarkingDone ? new Date() : isRevertingDone ? null : existing.completedAt,
      completedById: isMarkingDone ? user.id : isRevertingDone ? null : existing.completedById,
    },
    include: taskInclude,
  })

  // Sync to Google Calendar
  try {
    await syncTaskToGoogleCalendar(prisma, task as any, c.env)
  } catch (err) {}

  await logAudit(c, {
    action: 'UPDATE',
    module: 'TASKS',
    resourceId: id,
    resourceName: task.title,
    details: `Task status changed from ${existing.status} to ${status}.`,
  })

  const baseUrl = getBaseUrl(c)
  return c.json({
    success: true,
    message: `Task marked as ${status.replace(/_/g, ' ')}.`,
    task: {
      ...task,
      oneClickGoogleUrl: generateOneClickGoogleCalendarUrl(task as any, baseUrl),
    },
  })
}

/**
 * DELETE /v1/tasks/:id
 */
export async function deleteTaskController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const id = c.req.param('id')

  const existing = await prisma.task.findUnique({
    where: { id },
  })

  if (!existing) {
    return c.json({ success: false, error: 'Task not found.' }, 404)
  }

  // Delete from Google Calendar if synced
  if (existing.googleEventId) {
    await deleteTaskFromGoogleCalendar(prisma, existing.googleEventId, c.env)
  }

  await prisma.task.delete({
    where: { id },
  })

  await logAudit(c, {
    action: 'DELETE',
    module: 'TASKS',
    resourceId: id,
    resourceName: existing.title,
    details: `Task deleted.`,
  })

  return c.json({
    success: true,
    message: 'Task deleted successfully.',
  })
}

/**
 * POST /v1/tasks/cron/reminders
 * Executes morning reminders & daily task digests
 */
export async function runTaskRemindersController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const remindersSent = await dispatchDueDateMorningReminders(prisma)
  const digestsSent = await dispatchDailyTaskDigests(prisma)

  return c.json({
    success: true,
    message: 'Task reminders and digests processed.',
    remindersSent,
    digestsSent,
  })
}

/**
 * GET /v1/tasks/calendar-sync/status
 * Returns current master Google Calendar status and subscription feed URL
 */
export async function getCalendarSyncStatusController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const user = c.get('user')!

  const config = await prisma.organizationCalendarConfig.upsert({
    where: { id: 'dreamkey-master' },
    update: {},
    create: {
      id: 'dreamkey-master',
      connectedEmail: 'info@dreamkeykol.com',
      calendarId: 'primary',
      syncEnabled: true,
      masterFeedToken: crypto.randomUUID(),
    },
  })

  const backendUrl = c.env?.BACKEND_URL || new URL(c.req.url).origin
  const feedUrl = `${backendUrl.replace(/\/$/, '')}/v1/tasks/feed/${config.masterFeedToken}.ics`
  const myFeedUrl = `${backendUrl.replace(/\/$/, '')}/v1/tasks/feed/user-${user.id}.ics`

  return c.json({
    success: true,
    sync: {
      connectedEmail: config.connectedEmail,
      calendarId: config.calendarId,
      syncEnabled: config.syncEnabled,
      hasRefreshToken: Boolean(config.refreshToken),
      lastSyncedAt: config.lastSyncedAt,
      masterFeedUrl: feedUrl,
      myFeedUrl,
    },
  })
}

/**
 * GET /v1/tasks/feed/:feedToken.ics
 * Public authenticated iCal feed for Google Calendar / Apple Calendar subscription
 */
export async function getIcalFeedController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')
  const feedToken = c.req.param('feedToken') || ''

  let tasks: any[] = []
  let calendarName = 'DreamKey CRM Team Tasks'

  if (feedToken.startsWith('user-')) {
    const userId = feedToken.replace('user-', '').replace('.ics', '')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return c.text('Calendar feed not found.', 404)

    tasks = await prisma.task.findMany({
      where: {
        assignees: { some: { userId } },
        status: { not: 'CANCELLED' },
      },
      include: taskInclude,
      orderBy: { dueDate: 'asc' },
    })
    calendarName = `DreamKey Tasks — ${user.name || user.email}`
  } else {
    const cleanToken = feedToken.replace('.ics', '')
    const config = await prisma.organizationCalendarConfig.findUnique({
      where: { masterFeedToken: cleanToken },
    })

    if (!config) {
      return c.text('Invalid calendar feed token.', 404)
    }

    tasks = await prisma.task.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: taskInclude,
      orderBy: { dueDate: 'asc' },
    })
  }

  const ics = generateIcalFeed(tasks, calendarName)
  return c.text(ics, 200, {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': `attachment; filename="${calendarName.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics"`,
    'Cache-Control': 'max-age=300, must-revalidate',
  })
}

/**
 * POST /v1/tasks/calendar-sync/connect
 * Initiates the Google OAuth authorization flow for Master Google Calendar sync
 */
export async function initiateGoogleCalendarAuthController(c: Context<AppEnv>) {
  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return c.json(
      { error: 'GOOGLE_CLIENT_ID is not configured in backend environment.' },
      500
    )
  }

  const backendUrl = c.env?.BACKEND_URL
    ? c.env.BACKEND_URL.replace(/\/$/, '')
    : new URL(c.req.url).origin

  // Dynamic caller origin detection so auth returns to the active frontend (localhost or production domain)
  const reqBody = (await c.req.json<{ callbackURL?: string }>().catch(() => ({}))) as {
    callbackURL?: string
  }
  let frontendOrigin = ''

  if (reqBody?.callbackURL && isAllowedRedirectUrl(reqBody.callbackURL, c)) {
    try {
      frontendOrigin = new URL(reqBody.callbackURL).origin
    } catch {}
  }

  if (!frontendOrigin) {
    const originHeader = c.req.header('origin') || c.req.header('referer')
    if (originHeader) {
      try {
        const u = new URL(originHeader)
        if (isAllowedRedirectUrl(u.origin, c)) {
          frontendOrigin = u.origin
        }
      } catch {}
    }
  }

  if (!frontendOrigin) {
    frontendOrigin = c.env?.FRONTEND_URL ? c.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:3000'
  }

  const redirectUri = `${backendUrl}/api/auth/callback/google`

  const stateData = {
    csrf: crypto.randomUUID(),
    purpose: 'CALENDAR_SYNC',
    callbackURL: `${frontendOrigin}/dashboard/tasks`,
    errorCallbackURL: `${frontendOrigin}/dashboard/tasks`,
    redirectURI: redirectUri,
  }
  const stateString = btoa(JSON.stringify(stateData))

  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    (c.env?.BACKEND_URL && c.env.BACKEND_URL.startsWith('https://')) ||
    false

  setCookie(c, 'oauth_state', stateString, {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'None' : 'Lax',
    maxAge: 10 * 60, // 10 minutes
  })

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', clientId)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set(
    'scope',
    'openid email profile https://www.googleapis.com/auth/calendar.events'
  )
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent select_account')
  googleAuthUrl.searchParams.set('state', stateString)

  return c.json({ success: true, url: googleAuthUrl.toString() })
}

/**
 * POST /v1/tasks/calendar-sync/disconnect
 * Disables master calendar sync and removes stored tokens
 */
export async function disconnectGoogleCalendarController(c: Context<AppEnv>) {
  const prisma = c.get('prisma')

  await prisma.organizationCalendarConfig.updateMany({
    where: { id: 'dreamkey-master' },
    data: {
      syncEnabled: false,
      refreshToken: null,
      accessToken: null,
      tokenExpiry: null,
    },
  })

  return c.json({
    success: true,
    message: 'Master Google Calendar disconnected successfully.',
  })
}

