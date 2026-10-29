import { renderBaseLayout } from './baseLayout'
import type { EmployeeWelcomeEmailData } from '../types'

export function renderEmployeeWelcomeEmail(data: EmployeeWelcomeEmailData): {
  subject: string
  html: string
  text: string
} {
  const portalUrl = data.loginUrl || 'https://admin.dreamkeykol.com/login'
  const subject = `Welcome to DreamKey CRM — Your Account Credentials`

  const content = `
    <!-- Greeting & Title -->
    <div style="border-b: 1px solid #262626; padding-bottom: 20px; margin-bottom: 24px;">
      <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #d4af37;">
        STAFF ONBOARDING
      </span>
      <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 800; color: #f8f8f6; letter-spacing: -0.02em;">
        Welcome to the Team, ${escapeHtml(data.name)}
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
        Your administrative CRM account has been created by your Super Admin. Use the credentials below to access the DreamKey portal.
      </p>
    </div>

    <!-- Credentials Table Card -->
    <div style="background-color: #171717; border: 1px solid #262626; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 14px 0; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #d4af37;">
        ACCOUNT ACCESS CREDENTIALS
      </p>
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6b7280; width: 110px;">
            Login Email:
          </td>
          <td style="padding: 6px 0; font-size: 13px; font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-weight: 700; color: #f8f8f6;">
            ${escapeHtml(data.email)}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6b7280;">
            Initial Password:
          </td>
          <td style="padding: 6px 0;">
            <span style="display: inline-block; padding: 4px 10px; background-color: #0b0b0b; border: 1px solid #333333; font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 14px; font-weight: 800; color: #d4af37; letter-spacing: 0.05em;">
              ${escapeHtml(data.password)}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6b7280;">
            Portal URL:
          </td>
          <td style="padding: 6px 0; font-size: 12px; color: #9ca3af;">
            <a href="${portalUrl}" style="color: #d4af37; text-decoration: none; word-break: break-all;">
              ${portalUrl}
            </a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${portalUrl}" target="_blank" style="display: inline-block; background-color: #f8f8f6; color: #0b0b0b; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border: 1px solid #ffffff;">
        SIGN IN TO CRM PORTAL &rarr;
      </a>
    </div>

    <!-- Security Advisory Box -->
    <div style="border-left: 2px solid #d4af37; background-color: #1a160b; padding: 12px 14px; margin-top: 16px;">
      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #e6c75a;">
        <strong>Security Notice:</strong> Please sign in and update your password under your profile settings. Never share these credentials with unauthorized individuals.
      </p>
    </div>
  `

  const html = renderBaseLayout({
    title: subject,
    preheader: `Your DreamKey CRM account credentials for ${data.email}`,
    content,
  })

  const text = `
Welcome to DreamKey CRM, ${data.name}!

Your administrative staff account has been created by your Super Admin.

Account Access Credentials:
---------------------------
Login Email:      ${data.email}
Initial Password: ${data.password}
Portal URL:       ${portalUrl}

Direct Login Link:
${portalUrl}

Security Notice:
Please sign in and update your password immediately. Never share these credentials with unauthorized individuals.

DreamKey Real Estate Management
`

  return { subject, html, text }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
