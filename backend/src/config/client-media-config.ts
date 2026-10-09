import clientMediaConfig from './client-media.json'

export type ClientDocumentCategory =
  | 'AADHAAR'
  | 'PAYMENT_RECEIPT'
  | 'CLIENT_DOCUMENT'
  | 'PCC_APPLICATION'
  | 'CERTIFICATE'
  | 'KYC'

export interface ClientDocumentRule {
  key: string
  category: ClientDocumentCategory
  label: string
  description?: string
  /** Zero means unlimited documents, consistent with property media rules. */
  maxCount: number
  maxMb: number
  allowedMimeTypes: string[]
}

export const CLIENT_MEDIA_CONFIG = clientMediaConfig as {
  client: { storage: 'PRIVATE'; documents: ClientDocumentRule[] }
}

export function getClientDocumentRule(category: ClientDocumentCategory): ClientDocumentRule {
  const rule = CLIENT_MEDIA_CONFIG.client.documents.find((item) => item.category === category)
  if (!rule) throw new Error('Unsupported client document category.')
  return rule
}

export function getClientDocumentFileErrors(file: {
  category: ClientDocumentCategory
  mimeType: string
  sizeBytes: number
}): Array<{ field: 'mimeType' | 'sizeBytes'; message: string }> {
  const rule = getClientDocumentRule(file.category)
  const errors: Array<{ field: 'mimeType' | 'sizeBytes'; message: string }> = []
  if (!rule.allowedMimeTypes.includes(file.mimeType.trim().toLowerCase())) {
    errors.push({ field: 'mimeType', message: `${rule.label} must be a PDF, JPEG, PNG, or WebP image.` })
  }
  if (!Number.isInteger(file.sizeBytes) || file.sizeBytes <= 0) {
    errors.push({ field: 'sizeBytes', message: 'Please choose a non-empty file.' })
  } else if (file.sizeBytes > rule.maxMb * 1024 * 1024) {
    errors.push({ field: 'sizeBytes', message: `${rule.label} must be ${rule.maxMb} MB or smaller.` })
  }
  return errors
}
