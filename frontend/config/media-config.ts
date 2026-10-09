import propertyMediaConfig from './property-media.json'

export interface MediaCategoryRule {
  key: string
  category: 'PHOTOGRAPH' | 'VIDEO' | 'FLOOR_PLAN' | 'BROCHURE' | 'OTHER'
  label: string
  description?: string
  maxCount: number
  maxMb: number
  allowedMimeTypes: string[]
}

export interface PropertyMediaRules {
  photographs: MediaCategoryRule
  videos: MediaCategoryRule
  floorPlans: MediaCategoryRule
  documents: MediaCategoryRule[]
}

export const PROPERTY_MEDIA_CONFIG = propertyMediaConfig as {
  property: PropertyMediaRules
}

/**
 * Returns rule for a given media category or custom key
 */
export function getMediaRuleForCategory(
  category: 'PHOTOGRAPH' | 'VIDEO' | 'FLOOR_PLAN' | 'BROCHURE' | 'OTHER',
  customKey?: string
): MediaCategoryRule | undefined {
  const { photographs, videos, floorPlans, documents } = PROPERTY_MEDIA_CONFIG.property

  if (category === 'PHOTOGRAPH') return photographs
  if (category === 'VIDEO') return videos
  if (category === 'FLOOR_PLAN') return floorPlans

  if (category === 'BROCHURE') {
    return documents.find((d) => d.key === 'brochure') || documents[0]
  }

  if (customKey) {
    const docRule = documents.find((d) => d.key === customKey)
    if (docRule) return docRule
  }

  return documents.find((d) => d.category === category) || documents[documents.length - 1]
}

// Client documents have independent rules and private storage.
export { CLIENT_MEDIA_CONFIG, getClientDocumentRule, getClientDocumentFileErrors } from './client-media-config'
export type { ClientDocumentCategory, ClientDocumentRule } from './client-media-config'
