export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type TaskCategory =
  | 'CLIENT_MEETING'
  | 'SITE_VISIT'
  | 'DOCUMENT_WORK'
  | 'ADMIN'
  | 'OTHER'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export interface TaskAssignee {
  taskId: string
  userId: string
  assignedAt: string
  reminderSentAt?: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
}

export interface TaskClientSnippet {
  id: string
  name: string
  phone: string
  email?: string | null
}

export interface TaskPropertySnippet {
  id: string
  societyBuildingName: string
  locationArea: string
  city: string
  propertyType: string
  askingPrice: number
}

export interface Task {
  id: string
  title: string
  description?: string | null
  dueDate: string
  priority: TaskPriority
  category: TaskCategory
  status: TaskStatus
  createdById: string
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  completedById?: string | null
  completedBy?: {
    id: string
    name: string | null
    email: string
  } | null
  completedAt?: string | null
  clientId?: string | null
  client?: TaskClientSnippet | null
  propertyId?: string | null
  property?: TaskPropertySnippet | null
  googleEventId?: string | null
  googleSyncedAt?: string | null
  oneClickGoogleUrl?: string
  assignees: TaskAssignee[]
  createdAt: string
  updatedAt: string
}

export interface TaskStats {
  total: number
  dueToday: number
  overdue: number
  inProgress: number
  completedThisWeek: number
  myDueToday: number
}

export interface TaskHistoryItem extends Task {
  isOverdue: boolean
  timeToCompleteMs: number | null
}

export interface TaskQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: TaskStatus | 'ALL'
  priority?: TaskPriority | 'ALL'
  category?: TaskCategory | 'ALL'
  partnerId?: string
  scope?: 'ALL' | 'MINE'
  startDate?: string
  endDate?: string
}

export interface TasksListResponse {
  success: boolean
  tasks: Task[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface TaskHistoryResponse {
  success: boolean
  history: TaskHistoryItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateTaskPayload {
  title: string
  description?: string | null
  dueDate: string
  priority: TaskPriority
  category: TaskCategory
  assigneeIds: string[]
  clientId?: string | null
  propertyId?: string | null
}

export interface UpdateTaskPayload {
  title?: string
  description?: string | null
  dueDate?: string
  priority?: TaskPriority
  category?: TaskCategory
  status?: TaskStatus
  assigneeIds?: string[]
  clientId?: string | null
  propertyId?: string | null
}

export interface CalendarSyncStatus {
  connectedEmail: string
  calendarId: string
  syncEnabled: boolean
  hasRefreshToken: boolean
  lastSyncedAt?: string | null
  masterFeedUrl: string
  myFeedUrl: string
}
