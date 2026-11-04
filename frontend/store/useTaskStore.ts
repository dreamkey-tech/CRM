import { create } from 'zustand'
import {
  getTasks,
  getCalendarTasks,
  getTaskStats,
  getTaskHistory,
  updateTaskStatus as apiUpdateStatus,
  deleteTask as apiDeleteTask,
} from '../api/tasks'
import type {
  Task,
  TaskStats,
  TaskQueryParams,
  TaskHistoryItem,
  TaskStatus,
} from '../types/task'

interface TaskState {
  tasks: Task[]
  calendarTasks: Task[]
  history: TaskHistoryItem[]
  stats: TaskStats | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  historyPagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  isLoading: boolean
  calendarLoading: boolean
  historyLoading: boolean
  statsLoading: boolean

  // UI View state
  activeTab: 'list' | 'calendar' | 'history'
  calendarViewMode: 'month' | 'week' | 'day'
  selectedPartnerFilter: string // 'ALL' or partnerId

  // Actions
  setActiveTab: (tab: 'list' | 'calendar' | 'history') => void
  setCalendarViewMode: (mode: 'month' | 'week' | 'day') => void
  setSelectedPartnerFilter: (partnerId: string) => void

  loadTasks: (params?: TaskQueryParams) => Promise<void>
  loadCalendarTasks: (params?: {
    startDate?: string
    endDate?: string
    partnerId?: string
    scope?: string
  }) => Promise<void>
  loadStats: () => Promise<void>
  loadHistory: (page?: number, partnerId?: string) => Promise<void>
  updateStatus: (id: string, newStatus: TaskStatus) => Promise<void>
  removeTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  calendarTasks: [],
  history: [],
  stats: null,
  pagination: { total: 0, page: 1, limit: 15, totalPages: 1 },
  historyPagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
  isLoading: false,
  calendarLoading: false,
  historyLoading: false,
  statsLoading: false,

  activeTab: 'list',
  calendarViewMode: 'month',
  selectedPartnerFilter: 'ALL',

  setActiveTab: (activeTab) => set({ activeTab }),
  setCalendarViewMode: (calendarViewMode) => set({ calendarViewMode }),
  setSelectedPartnerFilter: (selectedPartnerFilter) => set({ selectedPartnerFilter }),

  loadTasks: async (params) => {
    set({ isLoading: true })
    try {
      const data = await getTasks(params)
      set({
        tasks: data.tasks || [],
        pagination: data.pagination,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  loadCalendarTasks: async (params) => {
    set({ calendarLoading: true })
    try {
      const tasks = await getCalendarTasks(params)
      set({ calendarTasks: tasks || [] })
    } finally {
      set({ calendarLoading: false })
    }
  },

  loadStats: async () => {
    set({ statsLoading: true })
    try {
      const stats = await getTaskStats()
      set({ stats })
    } finally {
      set({ statsLoading: false })
    }
  },

  loadHistory: async (page = 1, partnerId = 'ALL') => {
    set({ historyLoading: true })
    try {
      const data = await getTaskHistory({ page, partnerId })
      set({
        history: data.history || [],
        historyPagination: data.pagination,
      })
    } finally {
      set({ historyLoading: false })
    }
  },

  updateStatus: async (id: string, newStatus: TaskStatus) => {
    const prevTasks = get().tasks
    const prevCalendar = get().calendarTasks

    // Optimistic update
    set({
      tasks: prevTasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
      calendarTasks: prevCalendar.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t
      ),
    })

    try {
      const updated = await apiUpdateStatus(id, newStatus)
      set({
        tasks: get().tasks.map((t) => (t.id === id ? updated : t)),
        calendarTasks: get().calendarTasks.map((t) => (t.id === id ? updated : t)),
      })
      // Refresh stats
      void get().loadStats()
    } catch (err) {
      // Rollback
      set({ tasks: prevTasks, calendarTasks: prevCalendar })
      throw err
    }
  },

  removeTask: async (id: string) => {
    await apiDeleteTask(id)
    set({
      tasks: get().tasks.filter((t) => t.id !== id),
      calendarTasks: get().calendarTasks.filter((t) => t.id !== id),
    })
    void get().loadStats()
  },
}))
