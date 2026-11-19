export const REPO_SLUG = 'website-vincent-kinney'
export const GITHUB_OWNER = 'VpkDevs'
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_OWNER}`
export const REPO_URL = `${GITHUB_PROFILE_URL}/${REPO_SLUG}`
export const GITHUB_PAGES_BASE_PATH = `/${REPO_SLUG}`
export const GITHUB_PAGES_URL = `https://${GITHUB_OWNER.toLowerCase()}.github.io${GITHUB_PAGES_BASE_PATH}/`
export const DEFAULT_PRODUCTION_URL = 'https://vincentkinney.dev'
export const CONTACT_EMAIL = 'vincekinney1991@gmail.com'

export function normalizeBasePath(value?: string): string {
  const trimmed = (value ?? '').trim()
  if (!trimmed || trimmed === '/') {
    return ''
  }
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.replace(/\/+$/, '')
}

export function isGitHubPagesBuild(): boolean {
  return process.env.GITHUB_PAGES === 'true'
}

export function getBasePath(): string {
  if (process.env.NEXT_PUBLIC_BASE_PATH !== undefined) {
    return normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)
  }
  return isGitHubPagesBuild() ? GITHUB_PAGES_BASE_PATH : ''
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

function validateUrl(raw: string, sourceName: string): string {
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Unsupported protocol "${parsed.protocol}"`)
    }
    return ensureTrailingSlash(parsed.toString())
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`Invalid ${sourceName} value "${raw}": ${detail}`)
  }
}

export function getSiteUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicitUrl) {
    return validateUrl(explicitUrl, 'NEXT_PUBLIC_SITE_URL')
  }

  if (isGitHubPagesBuild()) {
    const basePath = getBasePath()
    return `https://${GITHUB_OWNER.toLowerCase()}.github.io${basePath}/`
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProd) {
    const normalized = vercelProd.startsWith('http') ? vercelProd : `https://${vercelProd}`
    return validateUrl(normalized, 'VERCEL_PROJECT_PRODUCTION_URL')
  }

  const vercelPreview = process.env.VERCEL_URL?.trim()
  if (vercelPreview) {
    const normalized = vercelPreview.startsWith('http') ? vercelPreview : `https://${vercelPreview}`
    return validateUrl(normalized, 'VERCEL_URL')
  }

  return ensureTrailingSlash(DEFAULT_PRODUCTION_URL)
}

export function getAbsoluteAssetUrl(relativePath: string): string {
  const cleanRelative = relativePath.replace(/^\/+/, '')
  return new URL(cleanRelative, getSiteUrl()).toString()
}
