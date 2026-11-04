import { taskApiClient } from './client'
import type {
  Task,
  TaskStats,
  TaskQueryParams,
  TasksListResponse,
  TaskHistoryResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatus,
  CalendarSyncStatus,
} from '../types/task'

export async function getTasks(params?: TaskQueryParams): Promise<TasksListResponse> {
  const res = await taskApiClient.get<TasksListResponse>('', { params })
  return res.data
}

export async function getCalendarTasks(params?: {
  startDate?: string
  endDate?: string
  partnerId?: string
  scope?: string
}): Promise<Task[]> {
  const res = await taskApiClient.get<{ success: boolean; tasks: Task[] }>('/calendar', {
    params,
  })
  return res.data.tasks || []
}

export async function getTaskStats(): Promise<TaskStats> {
  const res = await taskApiClient.get<{ success: boolean; stats: TaskStats }>('/stats')
  return res.data.stats
}

export async function getTaskHistory(params?: {
  page?: number
  limit?: number
  partnerId?: string
}): Promise<TaskHistoryResponse> {
  const res = await taskApiClient.get<TaskHistoryResponse>('/history', { params })
  return res.data
}

export async function getTask(id: string): Promise<Task> {
  const res = await taskApiClient.get<{ success: boolean; task: Task }>(`/${id}`)
  return res.data.task
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await taskApiClient.post<{ success: boolean; task: Task }>('', payload)
  return res.data.task
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const res = await taskApiClient.patch<{ success: boolean; task: Task }>(`/${id}`, payload)
  return res.data.task
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const res = await taskApiClient.patch<{ success: boolean; task: Task }>(`/${id}/status`, {
    status,
  })
  return res.data.task
}

export async function deleteTask(id: string): Promise<void> {
  await taskApiClient.delete(`/${id}`)
}

export async function getCalendarSyncStatus(): Promise<CalendarSyncStatus> {
  const res = await taskApiClient.get<{ success: boolean; sync: CalendarSyncStatus }>(
    '/calendar-sync/status'
  )
  return res.data.sync
}

export async function connectGoogleCalendar(callbackURL?: string): Promise<{ url: string }> {
  const targetCallback =
    callbackURL || (typeof window !== 'undefined' ? `${window.location.origin}/dashboard/tasks` : undefined)
  const res = await taskApiClient.post<{ success: boolean; url: string }>(
    '/calendar-sync/connect',
    { callbackURL: targetCallback }
  )
  return res.data
}

export async function disconnectGoogleCalendar(): Promise<void> {
  await taskApiClient.post('/calendar-sync/disconnect')
}

export async function triggerTaskReminders(): Promise<{
  remindersSent: number
  digestsSent: number
}> {
  const res = await taskApiClient.post<{
    success: boolean
    remindersSent: number
    digestsSent: number
  }>('/cron/reminders')
  return res.data
}
