export interface BaseLayoutOptions {
  title: string
  preheader?: string
  content: string
  year?: number
}

/**
 * Responsive, bulletproof email layout conforming to DreamKey luxury aesthetic.
 * Tested across Gmail, Apple Mail, Outlook, iOS, and Android.
 */
export function renderBaseLayout({
  title,
  preheader = 'DreamKey Real Estate Management notification',
  content,
  year = new Date().getFullYear(),
}: BaseLayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0b0b0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8f8f6; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; padding: 16px !important; }
      .card { padding: 24px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0b; -webkit-font-smoothing: antialiased;">
  <!-- Preheader Text (hidden preview in inbox) -->
  <div style="display: none; font-size: 1px; color: #0b0b0b; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0b0b;">
    <tr>
      <td align="center" style="padding: 32px 12px 48px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="container">
          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; padding: 6px 14px; background-color: #171717; border: 1px solid #262626; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #d4af37;">
                      DREAMKEY CRM
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background-color: #121212; border: 1px solid #262626; padding: 36px 32px;" class="card">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #6b7280;">
                CONFIDENTIAL REAL ESTATE MANAGEMENT SYSTEM
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; line-height: 1.5; color: #9ca3af;">
                This automated transmission contains privileged login credentials intended exclusively for the addressed recipient. If you received this communication in error, please notify your administrator and delete this message.
              </p>
              <p style="margin: 0; font-size: 10px; color: #4b5563;">
                &copy; ${year} DreamKey Realty. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
