# fun.syn.live

Minimal Astro site for a GitHub-backed community library around Synesthesia coding.
Planned home: `fun.syn.live`.

## What this is

- Static Astro site.
- Content lives in MDX files.
- People contribute through pull requests.
- Search-first UI: a global search overlay (press `?` anywhere) over a preloaded
  index of all entries and site pages, plus a faceted browse view with full-text
  body search.
- Every entry keeps attribution visible: who submitted it, who authored it, where
  it came from, and what license applies.

## Routes

- `/`: home feed with featured entries and recent submissions.
- `/browse`: search and facet view (`?q=` deep links supported).
- `/functions`: function-only list.
- `/snippets`: snippet-only list.
- `/write-ups`: write-up index.
- `/e/[slug]`: entry detail page.
- `/404`: not-found page.

## Content model

All content lives in a single collection under `src/content/entries` with a `type`
discriminator, defined in `src/content.config.ts`.

Each MDX entry should include frontmatter like this:

```md
---
title: myFunction
type: function
lang: glsl
summary: One-line explanation.
excerpt:
tags: []
submittedBy: your-handle
originalAuthor:
source:
license: Unlicensed
example:
date: 2026-05-28
featured: false
cover:
---
```

## Entry types

- `function`: singular reusable helpers.
- `snippet`: multi-part code drops, mixed-language examples, or small recipes.
- `write-up`: guides, tutorials, and tips.

## Search architecture

- `src/lib/search.ts`: shared substring scorer (title > tags > summary > excerpt >
  authors > body) used by both surfaces.
- `src/components/GlobalSearch.svelte`: overlay island mounted in `BaseLayout`,
  searches entries and nav pages.
- `src/components/BrowseIndex.svelte`: faceted view on `/browse`.
- Entry bodies are flattened to plain text at build time (`toSearchText` in
  `src/lib/entries.ts`) and shipped with the page. Upgrade trigger: when the
  payload gets heavy (hundreds of entries), switch to Pagefind.

## Contribution flow

- The top-bar submit button opens GitHub's new-file editor with a prefilled MDX template.
- Entry detail pages link directly to the matching GitHub edit URL.
- Attribution is surfaced in the UI through submitted by, author, source, and license fields.

## Run locally

```bash
npm install
npm run dev
```

## Deployment (DigitalOcean App Platform, static site)

- Create the app from this repo: type **Static Site**, build command `npm run build`,
  output directory `dist`, auto-deploy on push to `main`.
- Env vars:
  - `SITE_URL=https://fun.syn.live` (canonical URLs + sitemap)
  - `PUBLIC_REPO_URL=https://github.com/gravity-current/community-snippets` (submit/edit buttons)
  - `PUBLIC_REPO_BRANCH=main` (only if not `main`)
- Add the custom domain in App Platform and CNAME it to the app's default hostname.

See `LAUNCH.md` for the full launch checklist.
