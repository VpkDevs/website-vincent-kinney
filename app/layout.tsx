import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getAbsoluteAssetUrl, getSiteUrl } from '@/lib/site'

const siteUrl = getSiteUrl()
const ogImageUrl = getAbsoluteAssetUrl('og-card.png')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Vincent Kinney | AI-Native Product Architect & Founder',
  description: 'AI-native product portfolio, public project atlas, and AI App Rescue Audit offer from Vincent Kinney.',
  authors: [{ name: 'Vincent Kinney' }],
  alternates: {
    canonical: siteUrl,
  },
  keywords: [
    'AI product architect',
    'AI app audit',
    'project portfolio',
    'software shipping',
    'founder tools',
  ],
  openGraph: {
    title: 'Vincent Kinney | AI-Native Product Architect',
    description: 'Public proof site, project atlas, and AI App Rescue Audit offer.',
    url: siteUrl,
    siteName: 'Vincent Kinney Portfolio',
    type: 'website',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Vincent Kinney portfolio: a dossier wall for the entire build surface.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vincent Kinney | AI-Native Product Architect',
    description: 'Public proof site, project atlas, and AI App Rescue Audit offer.',
    images: [ogImageUrl],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-text">
        <noscript>
          <style>{'.observe{opacity:1!important;transform:none!important;}'}</style>
        </noscript>
        {children}
      </body>
    </html>
  )
}
