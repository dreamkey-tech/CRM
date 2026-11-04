import type { Context } from 'hono'
import type { AppEnv } from '../db'
import { parseDeviceInfo, type DeviceInfo } from './device'

export { parseDeviceInfo }

export interface FieldDiff {
  field: string
  label: string
  from: any
  to: any
}

export type AuditEventInput = {
  action: string
  module: string
  details?: string | null
  resourceId?: string | null
  resourceName?: string | null
  status?: 'SUCCESS' | 'DENIED'
  changes?: FieldDiff[] | null
  userId?: string | null
  deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN'
  deviceName?: string | null
}

/**
 * Format raw database field names into clean, readable labels for humans
 */
export function formatFieldLabel(key: string): string {
  const customMap: Record<string, string> = {
    budgetMin: 'Min Budget',
    budgetMax: 'Max Budget',
    propertyType: 'Property Type',
    possessionStatus: 'Possession Status',
    furnishingStatus: 'Furnishing Status',
    parkingSpaces: 'Parking Spaces',
    coveredAreaSqft: 'Covered Area (sqft)',
    carpetAreaSqft: 'Carpet Area (sqft)',
    price: 'Total Price',
    pricePerSqft: 'Price per sqft',
    isActive: 'Account Status',
    assignedPartners: 'Assigned Partner(s)',
    leadSource: 'Lead Source',
    locality: 'Preferred Locality',
    address: 'Address / Location',
    phone: 'Phone Number',
    whatsappNumber: 'WhatsApp Number',
    whatsappStatus: 'WhatsApp Status',
    requirementDescription: 'Requirement Details',
    isBestProperty: 'Best Property Highlight',
    isPublished: 'Website Published Status',
  }

  if (customMap[key]) return customMap[key]

  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

/**
 * Human-friendly value formatting (currency, numbers, booleans)
 */
export function formatDiffValue(val: any): string {
  if (val === null || val === undefined || val === '') return 'None'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'number') {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(2).replace(/\.00$/, '')} L`
    return val.toLocaleString('en-IN')
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return 'None'
    return val.map((v) => (typeof v === 'object' && v !== null ? v.name || v.id || JSON.stringify(v) : String(v))).join(', ')
  }
  if (typeof val === 'object') {
    return JSON.stringify(val)
  }
  return String(val)
}

/**
 * Compute the diff between an existing entity and incoming updates
 */
export function computeEntityDiff(
  before: Record<string, any> | null | undefined,
  after: Record<string, any> | null | undefined,
  labels: Record<string, string> = {}
): { diffs: FieldDiff[]; summary: string } {
  if (!before && !after) {
    return { diffs: [], summary: '' }
  }

  const ignoredKeys = new Set([
    'id',
    'createdAt',
    'updatedAt',
    'passwordHash',
    'createdById',
    'updatedById',
    'assignedPartners',
    'shares',
    'shortlists',
    'documents',
    'media',
    'auditLogs',
  ])

  const diffs: FieldDiff[] = []

  // If entity is freshly created
  if (!before && after) {
    const keys = Object.keys(after).filter(
      (k) => !ignoredKeys.has(k) && after[k] !== null && after[k] !== undefined && after[k] !== ''
    )
    for (const key of keys) {
      diffs.push({
        field: key,
        label: labels[key] || formatFieldLabel(key),
        from: null,
        to: after[key],
      })
    }
    const notable = diffs.slice(0, 3).map((d) => `${d.label}: ${formatDiffValue(d.to)}`).join(' | ')
    return { diffs, summary: notable ? `Added with details: ${notable}` : 'Created record' }
  }

  // If entity was deleted
  if (before && !after) {
    return { diffs: [], summary: `Deleted record (${before.name || before.title || before.id})` }
  }

  const b = before!
  const a = after!
  const allKeys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)])).filter(
    (k) => !ignoredKeys.has(k)
  )

  for (const key of allKeys) {
    const valBefore = b[key]
    const valAfter = a[key]

    // Skip if incoming is undefined (partial update where field was not specified)
    if (valAfter === undefined) continue

    if (JSON.stringify(valBefore) !== JSON.stringify(valAfter)) {
      // Treat null and empty string as equivalent
      if (
        (valBefore === null || valBefore === undefined || valBefore === '') &&
        (valAfter === null || valAfter === undefined || valAfter === '')
      ) {
        continue
      }

      diffs.push({
        field: key,
        label: labels[key] || formatFieldLabel(key),
        from: valBefore ?? null,
        to: valAfter ?? null,
      })
    }
  }

  if (diffs.length === 0) {
    return { diffs: [], summary: 'No fields modified' }
  }

  const summary = diffs
    .map((d) => `${d.label}: '${formatDiffValue(d.from)}' ➔ '${formatDiffValue(d.to)}'`)
    .join('; ')

  return { diffs, summary }
}

/**
 * Log an audit event to the audit_logs table.
 * Automatically captures device type (Phone vs Laptop), OS, Browser, IP address, and Location.
 */
export async function logAudit(c: Context<AppEnv>, event: AuditEventInput) {
  try {
    const prisma = c.get('prisma')
    if (!prisma || !prisma.auditLog || typeof prisma.auditLog.create !== 'function') return

    const user = c.get('user')
    const userId = event.userId !== undefined ? event.userId : user?.id || null

    const getHeader = (name: string): string | null => {
      if (c.req && typeof c.req.header === 'function') {
        return c.req.header(name) || null
      }
      return null
    }

    const ipAddress =
      getHeader('cf-connecting-ip') ||
      getHeader('x-forwarded-for')?.split(',')[0]?.trim() ||
      getHeader('x-real-ip') ||
      null

    const userAgent = getHeader('user-agent') || null
    const deviceInfo: DeviceInfo = parseDeviceInfo(userAgent)

    // Location headers from Cloudflare
    const rawCity = getHeader('cf-ipcity') || null
    const city = rawCity ? decodeURIComponent(rawCity) : null
    const country = getHeader('cf-ipcountry') || null

    const finalDeviceType = event.deviceType || deviceInfo.deviceType
    const finalDeviceName = event.deviceName || deviceInfo.deviceName

    const promise = prisma.auditLog
      .create({
        data: {
          userId,
          action: event.action,
          module: event.module,
          details: event.details || null,
          changes: event.changes && event.changes.length > 0 ? (event.changes as any) : undefined,
          resourceId: event.resourceId || null,
          resourceName: event.resourceName || null,
          deviceType: finalDeviceType,
          deviceName: finalDeviceName,
          city,
          country,
          ipAddress,
          userAgent,
          status: event.status || 'SUCCESS',
        },
      })
      .catch((err) => {
        console.error('Failed to write audit log:', err)
      })

    if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
      c.executionCtx.waitUntil(promise)
    } else {
      await promise
    }
  } catch (err) {
    console.error('Audit logging error:', err)
  }
}
