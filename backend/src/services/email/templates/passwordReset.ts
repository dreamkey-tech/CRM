import { renderBaseLayout } from './baseLayout'
import type { PasswordResetEmailData } from '../types'

export function renderPasswordResetEmail(data: PasswordResetEmailData): {
  subject: string
  html: string
  text: string
} {
  const portalUrl = data.loginUrl || 'https://admin.dreamkeykol.com/login'
  const subject = `Your DreamKey CRM Password Has Been Reset`

  const content = `
    <!-- Greeting & Title -->
    <div style="border-b: 1px solid #262626; padding-bottom: 20px; margin-bottom: 24px;">
      <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #d4af37;">
        SECURITY CREDENTIAL UPDATE
      </span>
      <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 800; color: #f8f8f6; letter-spacing: -0.02em;">
        Password Reset for ${escapeHtml(data.name)}
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
        Your CRM password has been updated by an administrator. Please use the temporary credentials below to regain access.
      </p>
    </div>

    <!-- Credentials Table Card -->
    <div style="background-color: #171717; border: 1px solid #262626; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 14px 0; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #d4af37;">
        NEW TEMPORARY CREDENTIALS
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
            New Password:
          </td>
          <td style="padding: 6px 0;">
            <span style="display: inline-block; padding: 4px 10px; background-color: #0b0b0b; border: 1px solid #333333; font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 14px; font-weight: 800; color: #d4af37; letter-spacing: 0.05em;">
              ${escapeHtml(data.newPassword)}
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
        SIGN IN WITH NEW PASSWORD &rarr;
      </a>
    </div>

    <!-- Security Advisory Box -->
    <div style="border-left: 2px solid #d4af37; background-color: #1a160b; padding: 12px 14px; margin-top: 16px;">
      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #e6c75a;">
        <strong>Security Notice:</strong> If you did not request this password reset, contact your CRM Super Admin immediately.
      </p>
    </div>
  `

  const html = renderBaseLayout({
    title: subject,
    preheader: `Your DreamKey CRM password has been reset`,
    content,
  })

  const text = `
Hello ${data.name},

Your DreamKey CRM password has been reset by an administrator.

New Temporary Credentials:
---------------------------
Login Email:  ${data.email}
New Password: ${data.newPassword}
Portal URL:   ${portalUrl}

Direct Login Link:
${portalUrl}

Security Notice:
If you did not request this password reset, please contact your Super Admin immediately.

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
