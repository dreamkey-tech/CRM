import type { PrismaClient } from '@prisma/client'
import type { Bindings } from '../db'

export interface TaskCalendarPayload {
  id: string
  title: string
  description?: string | null
  dueDate: Date | string
  priority: string
  category: string
  status: string
  assignees?: Array<{ user: { email: string; name: string | null } }>
  client?: { name: string; phone: string } | null
  property?: {
    societyBuildingName: string
    locationArea: string
    city: string
  } | null
}

/**
 * Generates an instant, zero-setup 1-Click "Add to Google Calendar" link
 * Pre-populates title, times, description, location, and assignee guest emails.
 */
export function generateOneClickGoogleCalendarUrl(task: TaskCalendarPayload, crmBaseUrl?: string): string {
  const start = new Date(task.dueDate)
  const end = new Date(start.getTime() + 60 * 60 * 1000) // Default 1 hour duration

  const formatGoogleDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '')

  const datesParam = `${formatGoogleDate(start)}/${formatGoogleDate(end)}`

  const categoryLabel = task.category.replace(/_/g, ' ')
  const title = `[${categoryLabel}] ${task.title}`

  const detailsLines: string[] = []
  if (task.description) {
    detailsLines.push(task.description)
    detailsLines.push('')
  }
  if (task.client) {
    detailsLines.push(`Client: ${task.client.name} (${task.client.phone})`)
  }
  if (task.property) {
    detailsLines.push(`Property: ${task.property.societyBuildingName}, ${task.property.locationArea}`)
  }
  detailsLines.push(`Priority: ${task.priority}`)
  detailsLines.push(`Status: ${task.status}`)
  if (crmBaseUrl) {
    detailsLines.push(`DreamKey CRM Task: ${crmBaseUrl}/dashboard/tasks?id=${task.id}`)
  }

  const location = task.property
    ? `${task.property.societyBuildingName}, ${task.property.locationArea}, ${task.property.city || 'Kolkata'}`
    : ''

  const guestEmails = (task.assignees || [])
    .map((a) => a.user.email)
    .filter(Boolean)
    .join(',')

  const url = new URL('https://calendar.google.com/calendar/render')
  url.searchParams.set('action', 'TEMPLATE')
  url.searchParams.set('text', title)
  url.searchParams.set('dates', datesParam)
  url.searchParams.set('details', detailsLines.join('\n'))
  if (location) {
    url.searchParams.set('location', location)
  }
  if (guestEmails) {
    url.searchParams.set('add', guestEmails)
  }

  return url.toString()
}

/**
 * Formats RFC 5545 iCalendar (.ics) string for live calendar subscription feeds.
 */
export function generateIcalFeed(
  tasks: TaskCalendarPayload[],
  calendarName = 'DreamKey CRM Team Tasks'
): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  const formatIcalDate = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours()
    )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DreamKey CRM//Task Management//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ]

  for (const t of tasks) {
    const start = new Date(t.dueDate)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const category = t.category.replace(/_/g, ' ')
    const summary = `[${category}] ${t.title}`
    const location = t.property
      ? `${t.property.societyBuildingName}, ${t.property.locationArea}, ${t.property.city || 'Kolkata'}`
      : ''

    const descParts: string[] = []
    if (t.description) descParts.push(t.description)
    if (t.client) descParts.push(`Client: ${t.client.name} (${t.client.phone})`)
    descParts.push(`Priority: ${t.priority} | Status: ${t.status}`)

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:task-${t.id}@dreamkeykol.com`)
    lines.push(`DTSTAMP:${formatIcalDate(new Date())}`)
    lines.push(`DTSTART:${formatIcalDate(start)}`)
    lines.push(`DTEND:${formatIcalDate(end)}`)
    lines.push(`SUMMARY:${summary.replace(/\n/g, ' ')}`)
    if (descParts.length > 0) {
      lines.push(`DESCRIPTION:${descParts.join('\\n')}`)
    }
    if (location) {
      lines.push(`LOCATION:${location.replace(/\n/g, ' ')}`)
    }
    lines.push(`STATUS:${t.status === 'DONE' ? 'CONFIRMED' : t.status === 'CANCELLED' ? 'CANCELLED' : 'TENTATIVE'}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/**
 * Sync task to the master dreamkeykol.com Google Calendar.
 * Resilient fallback: logs simulation if Google credentials or tokens aren't configured yet.
 */
export async function syncTaskToGoogleCalendar(
  prisma: PrismaClient,
  task: TaskCalendarPayload,
  env: Bindings
): Promise<string | null> {
  try {
    const config = await prisma.organizationCalendarConfig.findUnique({
      where: { id: 'dreamkey-master' },
    })

    if (!config || !config.syncEnabled || !config.refreshToken) {
      // Safe simulation notice
      return null
    }

    const clientId = env.GOOGLE_CLIENT_ID
    const clientSecret = env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) return null

    // Refresh access token if expired
    let accessToken = config.accessToken
    const now = new Date()
    if (!accessToken || !config.tokenExpiry || config.tokenExpiry < now) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: config.refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!tokenRes.ok) {
        console.error('Failed to refresh Google Calendar token:', await tokenRes.text())
        return null
      }

      const tokenData = (await tokenRes.json()) as {
        access_token: string
        expires_in: number
      }
      accessToken = tokenData.access_token

      await prisma.organizationCalendarConfig.update({
        where: { id: 'dreamkey-master' },
        data: {
          accessToken,
          tokenExpiry: new Date(Date.now() + (tokenData.expires_in - 60) * 1000),
          lastSyncedAt: new Date(),
        },
      })
    }

    const start = new Date(task.dueDate)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const category = task.category.replace(/_/g, ' ')

    const location = task.property
      ? `${task.property.societyBuildingName}, ${task.property.locationArea}, ${task.property.city || 'Kolkata'}`
      : undefined

    const attendees = (task.assignees || [])
      .map((a) => ({ email: a.user.email, displayName: a.user.name || undefined }))
      .filter((a) => Boolean(a.email))

    const eventPayload: Record<string, any> = {
      summary: `[${category}] ${task.title}`,
      description: task.description || undefined,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      location,
      attendees: attendees.length > 0 ? attendees : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 120 },
        ],
      },
    }

    const calendarId = encodeURIComponent(config.calendarId || 'primary')

    let response: Response
    const existingEvent = (task as any).googleEventId
    if (existingEvent) {
      // Update existing event
      response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${existingEvent}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventPayload),
        }
      )
    } else {
      // Create new event
      response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventPayload),
        }
      )
    }

    if (!response.ok) {
      console.error('Google Calendar API error:', await response.text())
      return null
    }

    const result = (await response.json()) as { id: string }
    return result.id
  } catch (err) {
    console.error('Failed to sync event to Google Calendar:', err)
    return null
  }
}

/**
 * Remove an event from the master Google Calendar if cancelled or deleted.
 */
export async function deleteTaskFromGoogleCalendar(
  prisma: PrismaClient,
  googleEventId: string,
  env: Bindings
): Promise<void> {
  try {
    const config = await prisma.organizationCalendarConfig.findUnique({
      where: { id: 'dreamkey-master' },
    })

    if (!config || !config.syncEnabled || !config.refreshToken) return

    const clientId = env.GOOGLE_CLIENT_ID
    const clientSecret = env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) return

    // Refresh if needed
    let accessToken = config.accessToken
    if (!accessToken || !config.tokenExpiry || config.tokenExpiry < new Date()) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: config.refreshToken,
          grant_type: 'refresh_token',
        }),
      })
      if (!tokenRes.ok) return
      const tokenData = (await tokenRes.json()) as { access_token: string }
      accessToken = tokenData.access_token
    }

    const calendarId = encodeURIComponent(config.calendarId || 'primary')
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${googleEventId}?sendUpdates=all`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
  } catch (err) {
    console.error('Failed to delete Google Calendar event:', err)
  }
}
