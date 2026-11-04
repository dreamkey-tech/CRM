import type { PrismaClient } from '@prisma/client'
import { createNotification } from '../lib/notifications'

export interface TaskNotificationPayload {
  id: string
  title: string
  dueDate: Date
  priority: string
  category: string
  createdById: string
  creatorName?: string | null
}

export interface TaskAssigneeInfo {
  userId: string
  email?: string
  name?: string | null
}

/**
 * FR-TK-04: Push notification to assignee(s) at task creation
 */
export async function notifyTaskAssigneesOnCreation(
  prisma: PrismaClient,
  task: TaskNotificationPayload,
  assignees: TaskAssigneeInfo[],
  creator: { id: string; name?: string | null }
): Promise<void> {
  const categoryLabel = task.category.replace(/_/g, ' ')
  const formattedDate = new Date(task.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  for (const assignee of assignees) {
    const isSelfAssigned = assignee.userId === creator.id
    const message = isSelfAssigned
      ? `You scheduled a task: "${task.title}" (${categoryLabel}) due on ${formattedDate}.`
      : `${creator.name || 'A partner'} assigned you a task: "${task.title}" (${categoryLabel}) due on ${formattedDate}.`

    await createNotification(prisma, {
      userId: assignee.userId,
      title: isSelfAssigned ? `Task Scheduled: ${task.title}` : `New Task Assigned: ${task.title}`,
      message,
      type: 'TASK_ASSIGNED',
      link: `/dashboard/tasks?id=${task.id}`,
      metadata: {
        taskId: task.id,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate.toISOString(),
      },
    })
  }
}

/**
 * FR-TK-04: Morning reminder notification on the due date
 * Scans tasks due today that are not completed/cancelled and sends a morning reminder
 * to assignees who haven't yet received it for today.
 */
export async function dispatchDueDateMorningReminders(prisma: PrismaClient): Promise<number> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  // Find assignees for pending tasks due today who haven't received reminder
  const dueAssignees = await prisma.taskAssignee.findMany({
    where: {
      reminderSentAt: null,
      task: {
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
    },
    include: {
      task: true,
      user: { select: { id: true, name: true, email: true } },
    },
  })

  let count = 0
  for (const item of dueAssignees) {
    const formattedTime = new Date(item.task.dueDate).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })

    await createNotification(prisma, {
      userId: item.userId,
      title: `Task Due Today: ${item.task.title}`,
      message: `Reminder: "${item.task.title}" (${item.task.category.replace(/_/g, ' ')}) is due today at ${formattedTime}.`,
      type: 'TASK_DUE_REMINDER',
      link: `/dashboard/tasks?id=${item.task.id}`,
      metadata: {
        taskId: item.task.id,
        dueDate: item.task.dueDate.toISOString(),
        priority: item.task.priority,
      },
    })

    await prisma.taskAssignee.update({
      where: {
        taskId_userId: { taskId: item.taskId, userId: item.userId },
      },
      data: {
        reminderSentAt: now,
      },
    })

    count++
  }

  return count
}

/**
 * FR-TK-05: Daily digest notification: each morning partners receive a list of their tasks due today
 */
export async function dispatchDailyTaskDigests(prisma: PrismaClient): Promise<number> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  // Find all active partners
  const partners = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true },
  })

  let digestsSent = 0

  for (const partner of partners) {
    // Check if digest already sent today
    const existingDigest = await prisma.notification.findFirst({
      where: {
        userId: partner.id,
        type: 'TASK_DAILY_DIGEST',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    })

    if (existingDigest) continue

    // Find tasks due today for this partner
    const tasksDue = await prisma.task.findMany({
      where: {
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { gte: startOfDay, lte: endOfDay },
        assignees: { some: { userId: partner.id } },
      },
      select: { id: true, title: true, priority: true, category: true, dueDate: true },
      orderBy: { dueDate: 'asc' },
    })

    if (tasksDue.length === 0) continue

    const taskTitles = tasksDue.map((t) => `• ${t.title} (${t.category.replace(/_/g, ' ')})`).join('\n')
    const message = `Good morning ${partner.name || 'Partner'}! You have ${tasksDue.length} task${
      tasksDue.length > 1 ? 's' : ''
    } scheduled for today:\n${taskTitles}`

    await createNotification(prisma, {
      userId: partner.id,
      title: `Daily Briefing: ${tasksDue.length} Task${tasksDue.length > 1 ? 's' : ''} Due Today`,
      message,
      type: 'TASK_DAILY_DIGEST',
      link: '/dashboard/tasks?filter=today',
      metadata: {
        count: tasksDue.length,
        taskIds: tasksDue.map((t) => t.id),
      },
    })

    digestsSent++
  }

  return digestsSent
}
