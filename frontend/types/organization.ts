export type AccessLevel = 'NONE' | 'VIEW' | 'FULL'

export interface ModuleAccess {
  properties: AccessLevel
  clients: AccessLevel
  brokers: AccessLevel
  owners: AccessLevel
  finance: AccessLevel
  canViewSensitiveDocs: boolean
  users?: AccessLevel
  tasks?: AccessLevel
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

export interface AuditLogChange {
  field: string
  label: string
  from: any
  to: any
}

export interface AuditLogItem {
  id: string
  action: string
  module: string
  details: string | null
  changes: AuditLogChange[] | null
  resourceId: string | null
  resourceName: string | null
  status: 'SUCCESS' | 'DENIED'
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN'
  deviceName: string
  city: string | null
  country: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  actor: {
    id: string
    name: string
    email: string
    role: string
    roles: string[]
  } | null
}

export interface AuditUserSummary {
  employee: {
    id: string
    name: string
    email: string
    isActive: boolean
    role: string
    roles: string[]
  }
  lastLogin: {
    createdAt: string
    deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN'
    deviceName: string
    ipAddress: string | null
    city: string | null
    country: string | null
  } | null
  totalActions: number
  actionBreakdown: {
    logins: number
    creations: number
    updates: number
    deletions: number
    views: number
  }
}

export interface AuditStats {
  totalLogs: number
  actionsToday: number
  securityDenials: number
  sensitiveDocViews: number
  mobileActions?: number
  desktopActions?: number
}
