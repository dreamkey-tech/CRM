import { Resend } from 'resend'
import type { Bindings } from '../../db'
import type {
  SendEmailOptions,
  SendEmailResult,
  EmployeeWelcomeEmailData,
  PasswordResetEmailData,
} from './types'
import { renderEmployeeWelcomeEmail } from './templates/employeeWelcome'
import { renderPasswordResetEmail } from './templates/passwordReset'

/**
 * Returns a configured Resend SDK instance if RESEND_API_KEY is present
 */
export function getResendClient(env?: Bindings): Resend | null {
  let apiKey = env?.RESEND_API_KEY || (typeof process !== 'undefined' ? process.env?.RESEND_API_KEY : undefined)
  if (!apiKey) {
    return null
  }
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim()
  if (!apiKey || apiKey.includes('your_api_key_here')) {
    return null
  }
  return new Resend(apiKey)
}

/**
 * Determines the default sender address for outgoing CRM emails
 */
export function getDefaultFromAddress(env?: Bindings): string {
  let customFrom = env?.EMAIL_FROM || (typeof process !== 'undefined' ? process.env?.EMAIL_FROM : undefined)
  if (customFrom) {
    customFrom = customFrom.replace(/^["']|["']$/g, '').trim()
  }
  if (customFrom && customFrom !== '') {
    return customFrom
  }
  // Default verified domain pattern or Resend dev testing fallback
  return 'DreamKey CRM <onboarding@dreamkeykol.com>'
}

/**
 * Sends a generic email via Resend with fallback logging in dev mode
 */
export async function sendEmail(
  options: SendEmailOptions,
  env?: Bindings
): Promise<SendEmailResult> {
  const resend = getResendClient(env)
  const fromAddress = options.from || getDefaultFromAddress(env)
  const recipients = Array.isArray(options.to) ? options.to : [options.to]

  // If Resend API key is not yet configured, simulate sending safely in dev mode
  if (!resend) {
    console.warn(
      `[EMAIL SERVICE (SIMULATION)] RESEND_API_KEY is not configured.\n` +
      `  To:      ${recipients.join(', ')}\n` +
      `  From:    ${fromAddress}\n` +
      `  Subject: ${options.subject}\n` +
      `  (Add RESEND_API_KEY in .env to deliver real emails)`
    )
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured. Email simulated in console.',
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      tags: options.tags,
    })

    if (error) {
      console.error(`[EMAIL SERVICE] Failed to send email to ${recipients.join(', ')}:`, error)
      return {
        success: false,
        error: error.message || 'Resend API returned an error.',
      }
    }

    console.log(`[EMAIL SERVICE] Email dispatched successfully. Resend ID: ${data?.id}`)
    return {
      success: true,
      id: data?.id,
    }
  } catch (err: any) {
    console.error(`[EMAIL SERVICE] Unexpected exception during dispatch:`, err)
    return {
      success: false,
      error: err.message || 'Unknown network error during email dispatch.',
    }
  }
}

/**
 * Dispatches the Welcome / Onboarding credentials email to a new employee
 */
export async function sendEmployeeWelcomeEmail(
  data: EmployeeWelcomeEmailData,
  env?: Bindings
): Promise<SendEmailResult> {
  const { subject, html, text } = renderEmployeeWelcomeEmail(data)
  return sendEmail(
    {
      to: data.to,
      from: data.from,
      subject,
      html,
      text,
      tags: [{ name: 'category', value: 'employee_welcome' }],
    },
    env
  )
}

/**
 * Dispatches the Password Reset email to an employee
 */
export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
  env?: Bindings
): Promise<SendEmailResult> {
  const { subject, html, text } = renderPasswordResetEmail(data)
  return sendEmail(
    {
      to: data.to,
      from: data.from,
      subject,
      html,
      text,
      tags: [{ name: 'category', value: 'password_reset' }],
    },
    env
  )
}
