import { renderBaseLayout } from './baseLayout'
import type { WebsiteLoginOtpEmailData } from '../types'

export function renderWebsiteLoginOtpEmail(data: WebsiteLoginOtpEmailData): {
  subject: string
  html: string
  text: string
} {
  const expiresIn = data.expiresInMinutes || 5
  const recipientName = data.name ? ` ${escapeHtml(data.name)}` : ''
  const subject = `${data.otp} is your DreamKey login verification code`

  const content = `
    <!-- Header Badge & Title -->
    <div style="border-b: 1px solid #262626; padding-bottom: 20px; margin-bottom: 24px;">
      <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #d4af37;">
        SECURITY VERIFICATION
      </span>
      <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 800; color: #f8f8f6; letter-spacing: -0.02em;">
        Sign In Verification Code
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
        Hello${recipientName}, please use the 4-digit verification code below to complete your login on the DreamKey website.
      </p>
    </div>

    <!-- OTP Code Display Card -->
    <div style="background-color: #171717; border: 1px solid #262626; padding: 28px 20px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #a1a1aa;">
        YOUR 4-DIGIT VERIFICATION CODE
      </p>

      <div style="display: inline-block; padding: 14px 32px; background-color: #0b0b0b; border: 1px solid #d4af37; letter-spacing: 0.35em; font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 900; color: #d4af37; border-radius: 4px;">
        ${escapeHtml(data.otp)}
      </div>

      <p style="margin: 14px 0 0 0; font-size: 11px; color: #71717a; letter-spacing: 0.05em;">
        EXPIRES IN <span style="color: #f8f8f6; font-weight: 700;">${expiresIn} MINUTES</span>
      </p>
    </div>

    <!-- User Information Notice -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; font-size: 12px; color: #9ca3af;">
      <tr>
        <td style="padding: 4px 0; width: 80px; color: #6b7280; font-weight: 700; text-transform: uppercase; font-size: 10px;">
          Account:
        </td>
        <td style="padding: 4px 0; color: #f8f8f6; font-family: ui-monospace, monospace;">
          ${escapeHtml(data.email)}
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6b7280; font-weight: 700; text-transform: uppercase; font-size: 10px;">
          Validity:
        </td>
        <td style="padding: 4px 0; color: #e6c75a;">
          Valid for single use within ${expiresIn} minutes
        </td>
      </tr>
    </table>

    <!-- Security Advisory Box -->
    <div style="border-left: 2px solid #d4af37; background-color: #1a160b; padding: 12px 14px; margin-top: 16px;">
      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #e6c75a;">
        <strong>Security Notice:</strong> DreamKey staff will never ask you for your verification code. If you did not attempt to log in to your account, please ignore this email.
      </p>
    </div>
  `

  const html = renderBaseLayout({
    title: subject,
    preheader: `${data.otp} is your 4-digit DreamKey login verification code. Valid for ${expiresIn} minutes.`,
    content,
  })

  const text = `
Hello${recipientName},

Your DreamKey login verification code is:
------------------------------------------
${data.otp}
------------------------------------------

This code is valid for ${expiresIn} minutes.

Account: ${data.email}

Security Notice:
DreamKey staff will never ask you for your verification code. If you did not attempt to log in, please ignore this email.

DreamKey Real Estate
`

  return { subject, html, text }
}

function escapeHtml(text?: string | null): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
