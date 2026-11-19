import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(testDir, '..')
const require = createRequire(import.meta.url)

function readText(relPath) {
  return fs.readFileSync(path.join(rootDir, relPath), 'utf8')
}

function loadNextConfigWithEnv(envOverrides) {
  const configPath = path.join(rootDir, 'next.config.js')
  const prev = {}
  const keys = ['GITHUB_PAGES', 'NEXT_OUTPUT_EXPORT', 'NEXT_PUBLIC_BASE_PATH']
  for (const key of keys) {
    prev[key] = process.env[key]
    if (envOverrides[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = envOverrides[key]
    }
  }

  try {
    delete require.cache[require.resolve(configPath)]
    return require(configPath)
  } finally {
    for (const key of keys) {
      if (prev[key] === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = prev[key]
      }
    }
    delete require.cache[require.resolve(configPath)]
  }
}

function collectSourceFiles(dirs) {
  const results = []
  for (const dir of dirs) {
    const absDir = path.join(rootDir, dir)
    if (!fs.existsSync(absDir)) continue
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const relPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...collectSourceFiles([relPath]))
      } else if (/\.(ts|tsx|js|mjs|json)$/.test(entry.name)) {
        results.push(relPath)
      }
    }
  }
  return results
}

test('projectAtlas data is valid, unique, and has well-formed repository URLs', () => {
  const raw = readText('data/projectAtlas.ts')
  const match = raw.match(/export const projectAtlas = (\[[\s\S]*?\]) satisfies ProjectAtlasItem\[\]/)
  assert.ok(match, 'projectAtlas array export must be parseable')

  const items = JSON.parse(match[1])
  assert.ok(Array.isArray(items) && items.length >= 100, `expected >= 100 atlas items, got ${items.length}`)

  const ids = new Set()
  const categories = new Set()
  let publicRepoCount = 0

  for (const item of items) {
    assert.ok(item.id && typeof item.id === 'string', 'each item needs a string id')
    assert.ok(!ids.has(item.id), `duplicate projectAtlas id: ${item.id}`)
    ids.add(item.id)

    for (const field of ['name', 'slug', 'category', 'categoryLabel', 'focus', 'description', 'bestUse', 'nextAction', 'lastActive']) {
      assert.ok(typeof item[field] === 'string' && item[field].trim().length > 0, `${item.id} missing ${field}`)
    }

    assert.ok(
      item.status === 'Public repo' || item.status === 'Private/local',
      `${item.id} has unexpected status: ${item.status}`
    )

    categories.add(item.category)

    if (item.status === 'Public repo') {
      publicRepoCount += 1
      assert.ok(typeof item.remote === 'string', `${item.id} marked Public repo without remote URL`)
      const parsed = new URL(item.remote)
      assert.equal(parsed.protocol, 'https:', `${item.id} remote must use https`)
    }
  }

  assert.ok(publicRepoCount >= 50, `expected >= 50 public repo entries, got ${publicRepoCount}`)
  assert.ok(categories.size >= 5, `expected >= 5 product lanes, got ${categories.size}`)
})

test('source code has no stale vincent-kinney-portfolio URLs or hardcoded localhost references', () => {
  const files = [
    ...collectSourceFiles(['app', 'components', 'lib', 'scripts']),
    'next.config.js',
    'vercel.json',
  ]

  for (const relPath of files) {
    const content = readText(relPath)
    assert.equal(
      content.includes('vincent-kinney-portfolio'),
      false,
      `Found stale repo slug "vincent-kinney-portfolio" in ${relPath}`
    )
    assert.equal(
      /https?:\/\/localhost(?::\d+)?/i.test(content),
      false,
      `Found hardcoded localhost URL in ${relPath}`
    )
  }
})

test('next.config.js supports Vercel/Node mode, GitHub Pages mode, and root static export mode', async () => {
  const defaultConfig = loadNextConfigWithEnv({})
  assert.equal(defaultConfig.output, undefined, 'default Vercel/Node build should not force static export')
  assert.equal(defaultConfig.basePath, undefined, 'default build should serve from root path')
  assert.equal(defaultConfig.poweredByHeader, false, 'X-Powered-By header should be disabled')
  assert.equal(typeof defaultConfig.headers, 'function', 'default build should attach security headers')
  const headerRules = await defaultConfig.headers()
  const headerKeys = new Set(headerRules.flatMap((rule) => rule.headers.map((h) => h.key)))
  for (const required of ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.ok(headerKeys.has(required), `next.config.js headers missing ${required}`)
  }

  const pagesConfig = loadNextConfigWithEnv({ GITHUB_PAGES: 'true' })
  assert.equal(pagesConfig.output, 'export')
  assert.equal(pagesConfig.trailingSlash, true)
  assert.equal(pagesConfig.basePath, '/website-vincent-kinney')
  assert.equal(pagesConfig.assetPrefix, '/website-vincent-kinney/')
  assert.equal(pagesConfig.headers, undefined, 'static export should omit headers() to avoid Next.js warning')

  const staticConfig = loadNextConfigWithEnv({ NEXT_OUTPUT_EXPORT: 'true' })
  assert.equal(staticConfig.output, 'export')
  assert.equal(staticConfig.basePath, undefined)
})

test('deployment configs, static assets, and .env.example are complete', () => {
  for (const requiredFile of [
    'public/og-card.png',
    'public/og-atlas-background.png',
    'public/.nojekyll',
    'app/icon.svg',
    'app/robots.ts',
    'app/sitemap.ts',
    'vercel.json',
    '.env.example',
    '.nvmrc',
  ]) {
    assert.ok(fs.existsSync(path.join(rootDir, requiredFile)), `Missing required file: ${requiredFile}`)
  }

  const vercelConfig = JSON.parse(readText('vercel.json'))
  assert.equal(vercelConfig.framework, 'nextjs')
  const vercelHeaders = new Set(
    (vercelConfig.headers ?? []).flatMap((rule) => (rule.headers ?? []).map((h) => h.key))
  )
  for (const required of ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.ok(vercelHeaders.has(required), `vercel.json missing security header: ${required}`)
  }

  const envExample = readText('.env.example')
  for (const envVar of [
    'GITHUB_PAGES',
    'NEXT_OUTPUT_EXPORT',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_BASE_PATH',
    'NEXT_USE_WEBPACK',
    'PROJECTS_REGISTRY',
    'OG_DISPLAY_URL',
  ]) {
    assert.ok(envExample.includes(envVar), `.env.example missing documentation for ${envVar}`)
  }
})

test('static export output (out/) renders core sections, SEO metadata, and valid asset paths', (t) => {
  const outDir = path.join(rootDir, 'out')
  if (!fs.existsSync(outDir)) {
    t.skip('out/ not present (run `npm run build:pages` or `npm run build:static` to exercise export assertions)')
    return
  }

  for (const artifact of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'og-card.png', '.nojekyll']) {
    assert.ok(fs.existsSync(path.join(outDir, artifact)), `Missing exported artifact: out/${artifact}`)
  }

  const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
  for (const sectionHeading of [
    'Vincent Kinney',
    'Public Proof',
    'Featured Work',
    'Project Atlas',
    'AI App Rescue Audit',
    'Shipwright',
    'Narrative Engine',
    'Shadowlight',
  ]) {
    assert.ok(html.includes(sectionHeading), `out/index.html missing expected content: ${sectionHeading}`)
  }

  assert.equal(
    html.includes('vincent-kinney-portfolio'),
    false,
    'out/index.html must not contain stale vincent-kinney-portfolio URLs'
  )

  const ogMatch = html.match(/property="og:image" content="([^"]+)"/)
  assert.ok(ogMatch, 'out/index.html missing og:image meta tag')
  assert.match(ogMatch[1], /^https:\/\/.+\/og-card\.png$/, `unexpected og:image URL: ${ogMatch[1]}`)

  const robotsTxt = fs.readFileSync(path.join(outDir, 'robots.txt'), 'utf8')
  assert.match(robotsTxt, /Sitemap:\s*https:\/\/.+\/sitemap\.xml/, 'out/robots.txt missing valid Sitemap directive')
  assert.equal(robotsTxt.includes('vincent-kinney-portfolio'), false)

  const sitemapXml = fs.readFileSync(path.join(outDir, 'sitemap.xml'), 'utf8')
  assert.match(sitemapXml, /<loc>https:\/\/.+<\/loc>/, 'out/sitemap.xml missing <loc> entry')
  assert.equal(sitemapXml.includes('vincent-kinney-portfolio'), false)

  // Verify every _next/static asset referenced in out/index.html actually exists on disk
  const assetRefs = [...html.matchAll(/(?:href|src)="([^"]*\/_next\/static\/[^"]+)"/g)].map((m) => m[1])
  assert.ok(assetRefs.length > 0, 'out/index.html should reference at least one _next/static asset')

  for (const assetUrl of assetRefs) {
    const cleanUrl = assetUrl.split('?')[0]
    const nextIdx = cleanUrl.indexOf('/_next/static/')
    const relFromOut = cleanUrl.slice(nextIdx + 1)
    assert.ok(
      fs.existsSync(path.join(outDir, relFromOut)),
      `Referenced asset "${assetUrl}" missing on disk at out/${relFromOut}`
    )
  }
})
