# Vincent Kinney Portfolio

Public proof site for Vincent Kinney's AI-native product work, project catalog, and AI App Rescue Audit offer.

- Live site: https://vpkdevs.github.io/website-vincent-kinney/
- Source: https://github.com/VpkDevs/website-vincent-kinney
- Deployment runbook: [DEPLOYMENT.md](./DEPLOYMENT.md) (extended customization guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md))
- Status: deployed, hardened, public; distribution and first paid audit are the next proof targets.

## What This Site Does

This is not just a visual portfolio. It is a public operating asset for turning a large private project surface into shipped work and revenue.

- Presents three flagship directions: Shipwright, Narrative Engine, and Shadowlight.
- Publishes a searchable Project Atlas generated from the local project registry.
- Offers a paid AI App Rescue Audit with concrete deliverables and pricing.
- States the shipping status honestly: deployed and hardened, not yet fully distributed.
- Gives future AI agents a repeatable workflow for updating the project catalog.

## Tech Stack

- Next.js 16 (`^16.4.6`)
- React 19
- TypeScript 6
- Tailwind CSS 3
- Lucide React
- Dual-target deployment: Vercel (Next.js) and GitHub Pages (static export)

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project Atlas Workflow

The portfolio imports `data/projectAtlas.ts`. That file is generated from the broader project registry (`PROJECTS.md`).

```bash
npm run generate:atlas
```

The generator:

- Reads UTF-8 or UTF-16 project registry files.
- Parses the canonical markdown table.
- Adds category labels and focus descriptions.
- Marks projects as `Public repo` or `Private/local`.
- Preserves public repository links where available.

To use a different registry:

```bash
PROJECTS_REGISTRY=/path/to/PROJECTS.md npm run generate:atlas
```

## Build & Verification

Standard local / Vercel build:

```bash
npm run check
npm run build
```

GitHub Pages static export (writes to `out/` with `/website-vincent-kinney` base path):

```bash
GITHUB_PAGES=true npm run build
# or cross-platform:
npm run build:pages
```

Root-path static export (for Netlify / Cloudflare Pages / static hosts):

```bash
npm run build:static
```

Full automated verification (typecheck + standard build + GitHub Pages export + `node:test` suite):

```bash
npm run verify
```

## Social Preview

The Open Graph image is generated from `public/og-atlas-background.png` with exact text rendered by `scripts/render-og-card.mjs` (requires a platform with native `sharp` binaries: Linux, macOS, or Windows).

```bash
npm run generate:og
```

Launch copy is maintained in [`docs/launch-kit.md`](./docs/launch-kit.md).

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full verified step-by-step instructions covering:

- **Vercel** (zero-config Next.js + `vercel.json` security headers)
- **GitHub Pages** (`.github/workflows/deploy-pages.yml` automated deploy + manual `gh-pages` branch fallback)
- **Static hosts** (`npm run build:static` -> `out/`)
- **Environment variables** (documented in [`.env.example`](./.env.example))

## Contact Behavior

The contact form is static-safe. It opens a prefilled email draft instead of pretending to submit to a backend that does not exist.

Audit CTA:

```text
mailto:vincekinney1991@gmail.com?subject=AI%20App%20Rescue%20Audit
```

## Current Quality Bar

- `npm audit` reports zero known vulnerabilities.
- `npm run check` passes strict TypeScript validation.
- Both `npm run build` (Vercel/Node) and `GITHUB_PAGES=true npm run build` (GitHub Pages) succeed cleanly.
- `npm test` validates Project Atlas integrity, dual-target config, security headers, SEO metadata, and exported asset paths.
- The live site visibly includes Public Proof, Project Atlas, and AI App Rescue Audit sections.
- No copy claims revenue, customers, or shipped products before those are true.

## Next Proof Targets

- Publish the portfolio in public channels.
- Convert the AI App Rescue Audit into the first paid buyer.
- Pick one Project Atlas item and ship it to a live URL.
- Add case-study pages once there is real product usage or revenue.
