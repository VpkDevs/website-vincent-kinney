function normalizeBasePath(value) {
  const trimmed = (value ?? '').trim()
  if (!trimmed || trimmed === '/') {
    return ''
  }
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.replace(/\/+$/, '')
}

const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const isStaticExport = isGitHubPages || process.env.NEXT_OUTPUT_EXPORT === 'true'
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)
    : isGitHubPages
      ? '/website-vincent-kinney'
      : ''

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  ...(isStaticExport
    ? {
        output: 'export',
        trailingSlash: true,
      }
    : {
        async headers() {
          return [
            {
              source: '/:path*',
              headers: securityHeaders,
            },
          ]
        },
      }),
  ...(basePath
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
      }
    : {}),
}

module.exports = nextConfig
