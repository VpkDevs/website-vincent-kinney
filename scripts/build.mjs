import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')

const rawArgs = process.argv.slice(2)
const env = { ...process.env }
const nextArgs = ['build']

for (const arg of rawArgs) {
  if (arg === '--pages') {
    env.GITHUB_PAGES = 'true'
  } else if (arg === '--static') {
    env.NEXT_OUTPUT_EXPORT = 'true'
  } else {
    nextArgs.push(arg)
  }
}

if (env.NEXT_PUBLIC_SITE_URL) {
  try {
    const parsed = new URL(env.NEXT_PUBLIC_SITE_URL)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Unsupported protocol "${parsed.protocol}"`)
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error(`Invalid NEXT_PUBLIC_SITE_URL="${env.NEXT_PUBLIC_SITE_URL}": ${detail}`)
    process.exit(1)
  }
}

const wantsWebpack =
  env.NEXT_USE_WEBPACK === 'true' ||
  process.platform === 'android' ||
  nextArgs.includes('--webpack')

if (wantsWebpack && !nextArgs.includes('--webpack')) {
  nextArgs.push('--webpack')
}

const isExport = env.GITHUB_PAGES === 'true' || env.NEXT_OUTPUT_EXPORT === 'true'
if (isExport) {
  fs.rmSync(path.join(projectRoot, 'out'), { recursive: true, force: true })
}

const nextBin = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
if (!fs.existsSync(nextBin)) {
  console.error('Next.js binary not found. Run `npm install` first.')
  process.exit(1)
}

const result = spawnSync(process.execPath, [nextBin, ...nextArgs], {
  cwd: projectRoot,
  env,
  stdio: 'inherit',
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
