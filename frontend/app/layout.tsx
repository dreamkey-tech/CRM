import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../utils/AuthProvider'
import { NavigationLoaderProvider } from '../context/NavigationLoaderContext'
import { MediaUploadProvider } from '../context/MediaUploadContext'
import { GlobalUploadDock } from '../components/properties/GlobalUploadDock'
import { ClientDocumentDock } from '../components/clients/ClientDocumentDock'
import { Toaster } from '../components/ui/sonner'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DreamKey CRM',
  description: 'Enterprise Real Estate & Deals CRM',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans transition-colors duration-200">
        <AuthProvider>
          <NavigationLoaderProvider>
            <MediaUploadProvider>
              {children}
              <GlobalUploadDock />
              <ClientDocumentDock />
              <Toaster />
            </MediaUploadProvider>
          </NavigationLoaderProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
