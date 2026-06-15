# Launch checklist — fun.syn.live

Decisions made (2026-06-11):
- Hosting: **DigitalOcean App Platform** (static site, free tier).
- Seed content: **launch lean** — prune to 2–3 entries with real bodies.
- `snippet` type vs site naming: fine as is.

Domain — settled (2026-06-15) on **`fun.syn.live`** for now (keeps the playful "fun" brand). In-app
brand, OG meta (title + url), header, README, robots/sitemap now all read `fun.syn.live`. Needs
carving out of the `syn.live`→`synesthesia.live` redirect (see DNS). The real Synesthesia logo is
now the header mark + favicon, and `public/og.png` has been regenerated with the logo, the
`fun.syn.live` wordmark, and brand-color waves.

Open decisions (for the 6/15 meeting):
- **Approach:** static / GitHub-PR contribution (as built) vs app-server login. Recommend staying
  static for launch — the whole submission flow is GitHub-based; login is a future option, not needed now.

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

- [x] Move repo to the org — done (2026-06-15): now **`gravity-current/community-snippets`**, local remote updated.
      ⚠️ Launch-ready commit (`bb99fbc` OG + meta) is **local, 1 ahead, not yet pushed** to the org repo.
- [ ] Confirm `main` branch protection / PR review rules for community submissions
- [ ] Verify `buildNewEntryUrl` / `buildEditEntryUrl` work against the org repo
      (requires contributors to fork unless they have write access — GitHub handles
      this automatically in the new-file editor). `site.ts` default repoUrl now points at the org repo.

## DigitalOcean App Platform

- [ ] Create app from the org GitHub repo (type: Static Site)
- [ ] Build command: `npm run build` · Output dir: `dist`
- [ ] Env vars: `SITE_URL=https://<chosen-domain>`,
      `PUBLIC_REPO_URL=https://github.com/gravity-current/community-snippets`, `PUBLIC_REPO_BRANCH=main` (if needed)
- [ ] Enable auto-deploy on push to `main`
- [ ] Add custom domain (chosen above) in App Platform settings

## DNS

- [ ] CNAME the chosen domain → the App Platform default hostname (if `fun.syn.live`, carve it out
      of the `syn.live`→`synesthesia.live` redirect first)
- [ ] Verify cert issuance (App Platform auto-provisions Let's Encrypt)

## Post-launch sanity

- [ ] Click through: home, browse (+`?q=` deep link), each type page, an entry page, 404
- [ ] Global search overlay (`?`) works on production
- [ ] Submit via PR button opens the org repo's new-file editor with the template
- [ ] OG preview renders (paste link in Discord/Slack)
