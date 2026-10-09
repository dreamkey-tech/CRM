import type { Metadata, Viewport } from 'next'
import { PublicPropertyPage, DreamKeyPublicFooter } from '../../../components/clients/PublicPropertyPage'
import type { PublicPropertyShare } from '../../../types/client'
import company from '../../../config/dreamkey-public.json'
import { Building2 } from 'lucide-react'
export const metadata: Metadata = { title: 'A property selected for you | DreamKey', description: 'Explore your selected property, photos and videos with DreamKey.', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 5, userScalable: true, viewportFit: 'cover' }
export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  let data: PublicPropertyShare | null = null, message = 'This property link is no longer available. Please contact DreamKey for an updated listing.'
  if (/^[a-f0-9]{64}$/.test(token)) {
    try {
      const response = await fetch(`${(process.env.API_URL || 'http://localhost:8787').replace(/\/$/, '')}/v1/public/property-shares/${token}`, { cache: 'no-store' })
      if (response.ok) data = await response.json()
      else if (response.status >= 500) message = 'We could not load the property right now. Please refresh the page or contact DreamKey.'
    } catch { message = 'We could not load the property right now. Please refresh the page or contact DreamKey.' }
  }
  if (data) return <PublicPropertyPage data={data} />
  return <div className="min-h-screen bg-background text-foreground"><main className="mx-auto max-w-xl px-5 py-20 text-center"><Building2 className="mx-auto mb-5 h-12 w-12 text-gold" /><h1 className="text-2xl font-black">Property link unavailable</h1><p className="mt-4 text-sm leading-relaxed text-muted-text">{message}</p><a href={`tel:${company.phone.replace(/\s/g, '')}`} className="mt-6 inline-block bg-gold px-5 py-3 text-xs font-bold text-background">Call DreamKey</a></main><DreamKeyPublicFooter company={company} /></div>
}
