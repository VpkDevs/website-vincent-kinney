import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(),
      lastModified: new Date('2026-11-19'),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
