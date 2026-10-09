import type { PublicPropertySnapshot } from '../types/client'
import dreamkey from '../config/dreamkey-public.json'

/** Edit these templates freely. {{propertyLink}} is replaced by the backend when a share is created. */
export const WHATSAPP_PROPERTY_TEMPLATE = `Hi {{clientName}},

I'd like to share this property with you:

🏡 *{{propertyName}}*
📍 {{location}}
{{bedrooms}}📐 Carpet area: {{area}} sq. ft.
💰 {{priceLabel}}: {{price}}
{{floor}}{{amenities}}
📷 *View the property and selected photos/videos:*
{{propertyLink}}

Would you like more details or to arrange a viewing? Please let me know a convenient time.

Regards,
{{partnerName}}
*DreamKey*
{{phone}}
{{website}}`

export const EMAIL_PROPERTY_TEMPLATE = `Hi {{clientName}},

I'd like to share {{propertyName}} in {{location}} with you.

{{bedrooms}}Carpet area: {{area}} sq. ft.
{{priceLabel}}: {{price}}
{{floor}}{{amenities}}
View the property and selected photos/videos:
{{propertyLink}}

Please let me know if you would like more details or to arrange a viewing.

Regards,
{{partnerName}}
DreamKey
{{phone}}
{{website}}`

export function buildClientPropertyMessage(clientName: string, property: PublicPropertySnapshot, partnerName: string, channel: 'WHATSAPP' | 'EMAIL' | 'LINK') {
  const values: Record<string, string> = {
    clientName, partnerName: partnerName || dreamkey.name, propertyName: property.societyBuildingName,
    location: `${property.locationArea}, ${property.city}`,
    bedrooms: property.bedrooms === null ? '' : `${property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BHK`} ${property.propertyType.toLowerCase()}\n`,
    area: property.carpetAreaSqFt.toLocaleString('en-IN'),
    priceLabel: property.pricingType === 'RENT' ? 'Monthly rent' : 'Asking price',
    price: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(property.askingPrice),
    floor: property.floorNumber === null ? '' : `Floor: ${property.floorNumber}${property.totalFloors === null ? '' : ` of ${property.totalFloors}`}\n`,
    amenities: property.amenities.length ? `Amenities: ${property.amenities.join(', ')}\n` : '',
    phone: dreamkey.phone, website: dreamkey.website,
    propertyLink: '{{propertyLink}}',
  }
  return (channel === 'EMAIL' ? EMAIL_PROPERTY_TEMPLATE : WHATSAPP_PROPERTY_TEMPLATE).replace(/\{\{(\w+)\}\}/g, (placeholder, key: string) => values[key] ?? placeholder)
}

export function propertyComposerUrl(share: { channel: string; recipient: string | null; subject: string | null; message: string; publicUrl: string }) {
  const message = share.message.includes(share.publicUrl) ? share.message : `${share.message}\n\n${share.publicUrl}`
  if (share.channel === 'WHATSAPP' && share.recipient) return `https://wa.me/${share.recipient}?text=${encodeURIComponent(message)}`
  if (share.channel === 'EMAIL' && share.recipient) return `mailto:${encodeURIComponent(share.recipient)}?subject=${encodeURIComponent(share.subject || 'Property details from DreamKey')}&body=${encodeURIComponent(message)}`
  return null
}
