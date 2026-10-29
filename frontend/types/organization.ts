export type AccessLevel = 'NONE' | 'VIEW' | 'FULL'

export interface ModuleAccess {
  properties: AccessLevel
  clients: AccessLevel
  brokers: AccessLevel
  owners: AccessLevel
  finance: AccessLevel
  canViewSensitiveDocs: boolean
}

export interface Employee {
  id: string
  name: string | null
  email: string
  isActive: boolean
  roles: string[]
  permissions: string[]
  moduleAccess: ModuleAccess
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeePayload {
  name: string
  email: string
  password: string
  roleName?: string
  moduleAccess?: ModuleAccess
  customPermissions?: string[]
}

export interface UpdateEmployeePayload {
  name?: string
  isActive?: boolean
  moduleAccess?: ModuleAccess
  customPermissions?: string[]
}

export interface AuditLogItem {
  id: string
  action: string
  module: string
  details: string | null
  resourceId: string | null
  resourceName: string | null
  status: 'SUCCESS' | 'DENIED'
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  actor: {
    id: string
    name: string
    email: string
  } | null
}

export interface AuditStats {
  totalLogs: number
  actionsToday: number
  securityDenials: number
  sensitiveDocViews: number
}
