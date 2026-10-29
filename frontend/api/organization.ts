import { apiClient } from './client'
import type {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  AuditLogItem,
  AuditStats,
} from '../types/organization'

export async function listEmployeesApi(params?: {
  search?: string
  status?: string
  page?: number
  limit?: number
}): Promise<{
  success: boolean
  employees: Employee[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}> {
  const response = await apiClient.get('/admin/employees', { params })
  return response.data
}

export async function createEmployeeApi(
  payload: CreateEmployeePayload
): Promise<{ success: boolean; message: string; employee: Employee }> {
  const response = await apiClient.post('/admin/employees', payload)
  return response.data
}

export async function updateEmployeeApi(
  id: string,
  payload: UpdateEmployeePayload
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.patch(`/admin/employees/${id}`, payload)
  return response.data
}

export async function resetEmployeePasswordApi(
  id: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/admin/employees/${id}/reset-password`, { password })
  return response.data
}

export async function deleteEmployeeApi(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete(`/admin/employees/${id}`)
  return response.data
}

export async function listAuditLogsApi(params?: {
  module?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{
  success: boolean
  logs: AuditLogItem[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}> {
  const response = await apiClient.get('/admin/audit-logs', { params })
  return response.data
}

export async function getAuditStatsApi(): Promise<{
  success: boolean
  stats: AuditStats
}> {
  const response = await apiClient.get('/admin/audit-logs/stats')
  return response.data
}
