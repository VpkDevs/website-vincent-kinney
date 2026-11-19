# Deployment Guide — `VpkDevs/website-vincent-kinney`

Production deployment runbook for Vincent Kinney's portfolio & Project Atlas. For extended customization, analytics, and optional form-backend recipes, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Stack Summary

- **Framework:** Next.js 16 (`next@^16.4.6`), React 19, TypeScript 6, Tailwind CSS 3, Lucide React
- **Architecture:** 100% statically prerendered App Router site (`/` + `/_not-found` + `/icon.svg` + `/robots.txt` + `/sitemap.xml`). Contact forms open prefilled `mailto:` drafts (zero fake backend endpoints).
- **Dual Deployment Targets:**
  1. **Vercel (Recommended Primary):** Standard Next.js build at root path `/` (`https://vincentkinney.dev` or `.vercel.app`) with production security headers configured in both `vercel.json` and `next.config.js`.
  2. **GitHub Pages (Static Export):** Static HTML/CSS/JS export to `out/` with `basePath: '/website-vincent-kinney'`, `.nojekyll`, and automated deployment via `.github/workflows/deploy-pages.yml`.

## Prerequisites

- **Node.js:** `>= 20.9.0` (Node 22 recommended; pinned in `.nvmrc`)
- **npm:** bundled with Node.js

## Environment Variables

All environment variables are optional and documented in [`.env.example`](./.env.example).

| Variable | Default | Purpose |
| --- | --- | --- |
| `GITHUB_PAGES` | unset | Set to `true` to enable `output: 'export'`, `trailingSlash: true`, and `/website-vincent-kinney` base path for GitHub Pages. |
| `NEXT_OUTPUT_EXPORT` | unset | Set to `true` for a root-path static export in `out/` (Netlify, Cloudflare Pages, S3, etc.). |
| `NEXT_PUBLIC_SITE_URL` | Auto-resolved (`GITHUB_PAGES` -> `https://vpkdevs.github.io/website-vincent-kinney/`, Vercel -> `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`, else `https://vincentkinney.dev`) | Canonical origin used in `<link rel="canonical">`, Open Graph / Twitter image URLs, `robots.txt`, and `sitemap.xml`. Must start with `http://` or `https://`. |
| `NEXT_PUBLIC_BASE_PATH` | `/website-vincent-kinney` when `GITHUB_PAGES=true`, else empty | Overrides `basePath` and `assetPrefix` for subpath hosting. |
| `NEXT_USE_WEBPACK` | `false` (`true` auto-selected on `android/arm64`) | Forces `next build --webpack` on platforms without native Turbopack bindings. |
| `PROJECTS_REGISTRY` | `../PROJECTS.md` | Local maintenance only (`npm run generate:atlas`). Not required to build or deploy. |
| `OG_DISPLAY_URL` | `vpkdevs.github.io/website-vincent-kinney` | Local maintenance only (`npm run generate:og`). URL footer rendered onto `public/og-card.png`. |

## Local Verification Commands

Run these before shipping any change:

```bash
# 1. Install dependencies
npm ci

# 2. Typecheck
npm run check

# 3. Full verification (typecheck + Vercel build + GitHub Pages export + smoke tests)
npm run verify

# 4. Security dependency check
npm audit
```

### Local HTTP Smoke Tests

**Verify standard Next.js / Vercel production server:**

```bash
npm run build
npx next start -H 127.0.0.1 -p 3000
# In another shell:
curl -sI http://127.0.0.1:3000/ | grep -iE 'HTTP/|x-content-type-options|x-frame-options|referrer-policy|permissions-policy|strict-transport-security'
curl -s http://127.0.0.1:3000/robots.txt
curl -s http://127.0.0.1:3000/sitemap.xml
```

**Verify GitHub Pages static export (`out/`):**

```bash
GITHUB_PAGES=true npm run build
# Equivalent cross-platform npm script:
npm run build:pages
npm test
```

## Deploy Option 1: Vercel (Recommended)

### Via Vercel Dashboard

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. Click **Add New → Project** and import `VpkDevs/website-vincent-kinney`.
3. Keep the detected **Next.js** preset:
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install` (or `npm ci`)
   - **Output Directory:** `.next` (default)
4. *(Optional)* Under **Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL=https://vincentkinney.dev` once your custom domain is attached. Do **not** set `GITHUB_PAGES=true` on Vercel.
5. Click **Deploy**. `vercel.json` automatically enforces `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`, and `Strict-Transport-Security`.

### Via Vercel CLI

```bash
npx vercel login
npx vercel --prod
```

## Deploy Option 2: GitHub Pages

### Automated (GitHub Actions — Recommended)

`.github/workflows/deploy-pages.yml` builds `GITHUB_PAGES=true npm run build`, runs `npm test`, and publishes `out/` to `https://vpkdevs.github.io/website-vincent-kinney/` on every push to `main` or manual **workflow_dispatch** trigger.

1. In GitHub, open **Settings → Pages** for `VpkDevs/website-vincent-kinney`.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` or trigger **Actions → Deploy GitHub Pages → Run workflow**.

### Fallback (Manual `gh-pages` Branch Push)

If GitHub Actions is paused or billing-limited on the account, deploy `out/` directly to the `gh-pages` branch from any machine:

```bash
GITHUB_PAGES=true npm run build
npm test
git worktree add "${TMPDIR:-/tmp}/gh-pages-deploy" gh-pages
find "${TMPDIR:-/tmp}/gh-pages-deploy" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R out/. "${TMPDIR:-/tmp}/gh-pages-deploy/"
cd "${TMPDIR:-/tmp}/gh-pages-deploy"
git add -A
git commit -m "Deploy static build for website-vincent-kinney"
git push origin gh-pages
cd -
git worktree remove "${TMPDIR:-/tmp}/gh-pages-deploy"
```

## Deploy Option 3: Netlify / Cloudflare Pages / Generic Static Host

```bash
NEXT_OUTPUT_EXPORT=true npm run build
# Equivalent:
npm run build:static
```

Publish the generated `out/` directory as your static site root.

## Honest Readiness & Remaining Owner Steps

What is already verified and ready in this repository:
- Zero `npm audit` vulnerabilities (`next@16.4.6`, `react@19.2.6`, `postcss@8.5.33`).
- Both Vercel/Node (`npm run build`) and GitHub Pages (`GITHUB_PAGES=true npm run build`) builds pass cleanly with accurate `/website-vincent-kinney` basePath, `robots.txt`, `sitemap.xml`, `og:image`, and SVG favicon.
- Automated `node:test` integrity & export verification suite (`npm test`) and CI workflows (`.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`) are in place.

What still requires Vincent's account access to finish going live:
1. **Refresh the live GitHub Pages deployment (High Priority):** The existing `gh-pages` branch still serves an older build with broken `/vincent-kinney-portfolio/_next/...` asset URLs from before the repo rename. Either switch **Settings → Pages → Source** to **GitHub Actions** (and confirm Actions billing is unblocked) so `.github/workflows/deploy-pages.yml` deploys `main`, **or** run the manual `gh-pages` branch fallback above to overwrite the stale build immediately.
2. **Connect Vercel + Custom Domain (Optional):** Import `VpkDevs/website-vincent-kinney` in Vercel and attach `vincentkinney.dev` (plus set `NEXT_PUBLIC_SITE_URL=https://vincentkinney.dev` once DNS resolves).
3. **Optional OG Card Footer Refresh:** `scripts/render-og-card.mjs` is updated to render `vpkdevs.github.io/website-vincent-kinney` with live counts from `data/projectAtlas.ts`, but `sharp` requires native `libvips` binaries unavailable on Android/Termux. Run `npm run generate:og` once on a Linux/macOS/Windows machine (or CI) if you want the footer text baked into `public/og-card.png` refreshed to the renamed slug.
4. **Distribution & First Paid Audit:** Share the live URL using [`docs/launch-kit.md`](./docs/launch-kit.md) once step 1 or 2 is live.
