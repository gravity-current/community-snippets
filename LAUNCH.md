# Launch checklist — syn.fun → fun.synesthesia.live

Decisions made (2026-06-11):
- Hosting: **DigitalOcean App Platform** (static site, free tier).
- Seed content: **launch lean** — prune to 2–3 entries with real bodies.
- `snippet` type vs site naming: fine as is.
- Name: leaning **keep `syn.fun` brand at `fun.synesthesia.live`** (or `fun.syn.live` if
  `syn.live` is owned). "Synesthesia Snippets" is taken by the VS Code extension.

> **Status (2026-06-15): code & content are 100% done — build is clean (9 pages + sitemap).**
> Everything left below is infra/access: org transfer, DO App Platform, DNS.

## Code & content (in repo)

- [x] Delete stray empty dir `src/pages/[collection]/`
- [x] Prune seed entries: pick 2–3 keepers, delete the rest
- [x] Write real bodies for keepers; remove all `{/* PLACEHOLDER_CONTENT */}` markers
- [x] Homepage featured card: remove or make conditional the `PLACEHOLDER_CONTENT preview / gif` slot
      (`src/pages/index.astro`) — only render preview when `cover` exists
- [x] Confirm at least one keeper has `featured: true` so the homepage lead renders
- [x] Add `public/` with favicon (SVG) and `robots.txt`
- [x] Add an OG image (`public/og.png`, 1200×630) and wire `og:image` / `twitter:card=summary_large_image` in `BaseLayout` (2026-06-15)
- [x] Add `src/pages/404.astro`
- [x] Add SEO basics to `BaseLayout`: canonical URL, Open Graph + Twitter meta
- [x] Add `@astrojs/sitemap` integration
- [x] Clean up `site.ts` PR template wording (keep placeholders functional, polish copy)
- [x] README: update deployment notes (Coolify → DO App Platform), confirm name/domain

## Repo & org

- [ ] Move repo to the org (GitHub: Settings → Transfer ownership)
- [ ] Confirm `main` branch protection / PR review rules for community submissions
- [ ] Verify `buildNewEntryUrl` / `buildEditEntryUrl` work against the org repo
      (requires contributors to fork unless they have write access — GitHub handles
      this automatically in the new-file editor)

## DigitalOcean App Platform

- [ ] Create app from the org GitHub repo (type: Static Site)
- [ ] Build command: `npm run build` · Output dir: `dist`
- [ ] Env vars: `SITE_URL=https://fun.synesthesia.live`,
      `PUBLIC_REPO_URL=https://github.com/<org>/<repo>`, `PUBLIC_REPO_BRANCH=main` (if needed)
- [ ] Enable auto-deploy on push to `main`
- [ ] Add custom domain `fun.synesthesia.live` in App Platform settings

## DNS

- [ ] CNAME `fun.synesthesia.live` → the App Platform default hostname
- [ ] Verify cert issuance (App Platform auto-provisions Let's Encrypt)

## Post-launch sanity

- [ ] Click through: home, browse (+`?q=` deep link), each type page, an entry page, 404
- [ ] Global search overlay (`?`) works on production
- [ ] Submit via PR button opens the org repo's new-file editor with the template
- [ ] OG preview renders (paste link in Discord/Slack)
