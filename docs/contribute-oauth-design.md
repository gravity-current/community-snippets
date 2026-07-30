# One-flow contribution: sign in with GitHub, form opens the PR

**Status: design + skeleton, 2026-07-30. Not deployed. Nothing here is live.**

Goal: contributor fills out `/contribute`, clicks one button, and a PR exists —
no manual fork, no manually creating a branch, no separate PR screen.

## Why this needs a backend at all

fun.syn.live is a static site (DO App Platform, no server). GitHub's OAuth
code→token exchange requires a `client_secret`. A secret cannot live in
browser JS — anyone could read it out of the request. So the exchange step
has to happen somewhere the secret is not exposed: one small serverless
function. Nothing else in this design needs a backend — once the browser has
a token, it talks to `api.github.com` directly.

## Components

1. **A GitHub App** (not a classic OAuth App) owned by `gravity-current`.
   Scoped narrowly: `contents:write`, `pull_requests:write`, `metadata:read`.
   A classic OAuth App would work too and is less setup, but grants the
   coarser `public_repo` scope across every repo the user can touch. The App
   is more setup for a better story to show contributors ("this only touches
   community-snippets").

2. **One DigitalOcean Function** — `oauth-exchange`. Takes the `code` GitHub
   redirects back with, exchanges it server-side for a short-lived user
   access token using the App's client secret, returns the token to the
   browser. That's its entire job. No repo calls happen here.

3. **Frontend changes to `ContributeBuilder.svelte`** — a "Sign in with
   GitHub" button before the form (or next to the existing submit button).
   Once signed in, the browser holds the token in memory /
   `sessionStorage` (not `localStorage` — this should not outlive the tab)
   and, on submit, calls the GitHub REST API directly:
   - `POST /repos/{owner}/{repo}/forks` (idempotent if a fork already exists)
   - `GET` the fork's default branch SHA, `POST
     /repos/{user}/{repo}/git/refs` to cut a new branch
   - `PUT /repos/{user}/{repo}/contents/{path}` to commit the `.mdx` file
   - `POST /repos/{owner}/{repo}/pulls` — head is `{user}:{branch}`, base is
     `main`

   The existing prefill-URL path (`buildPrefillUrl` in `site.ts`) stays as
   the fallback for anyone who skips sign-in — this is additive, not a
   replacement.

## Sequence

```
contributor                 browser (fun.syn.live)         DO Function            GitHub
    |--- click "Sign in" -------->|                              |                   |
    |                              |--- redirect to ------------------------------->|
    |                              |    github.com/login/oauth/authorize            |
    |                              |    (App client_id, state, redirect_uri)        |
    |<----------------------------------------- redirects back with ?code&state ----|
    |                              |                              |                   |
    |                              |--- POST /oauth-exchange {code} ---------------->|
    |                              |                              |--- exchange ----->|
    |                              |                              |<-- access_token --|
    |                              |<---- { access_token } ------|                   |
    |                              |                              |                   |
    |--- fills form, submits ---->|                              |                   |
    |                              |--- fork / branch / commit / PR, all direct ---->|
    |                              |    to api.github.com with access_token          |
    |<------------------- shows "PR opened" + link -------------------------------- |
```

## Security notes

- `state` param: generate a random value client-side before the redirect,
  store it in `sessionStorage`, verify it matches on return. Prevents CSRF
  on the callback.
- `client_secret` lives only in the DO Function's environment (DO
  Functions/App Platform secret, never committed).
- `client_id` is not secret — fine to inline in the frontend.
- Token scope is whatever the GitHub App's permissions declare, not
  requested per-session — the contributor sees exactly what the App can do
  at install time.
- GitHub App user-to-server tokens expire (currently 8h) and support
  refresh tokens; for a one-shot "submit a snippet" flow, expiry can just
  mean "sign in again" rather than implementing refresh.

## Manual setup steps (need an org admin logged into github.com — I can't do this via API)

1. `github.com/organizations/gravity-current/settings/apps/new`
2. Name: e.g. `synfun-contribute`. Homepage URL: `https://fun.syn.live`.
3. Callback URL: `https://fun.syn.live/contribute` (or a dedicated
   `/contribute/callback` route if we want to keep the redirect handling
   separate from the form page).
4. **Webhook: uncheck "Active"** — this App doesn't need webhook events.
5. Permissions → Repository permissions: **Contents: Read & write**,
   **Pull requests: Read & write**, **Metadata: Read-only** (mandatory,
   auto-selected). Leave everything else as No access.
6. "Where can this GitHub App be installed?" → **Any account** — the whole
   point is contributors installing it to their own personal account so it
   can act on their fork.
7. Create App → note the **App ID** and **Client ID**, generate a **Client
   secret** (shown once — save it to the DO Function's env, not to any file
   in this repo).

## Skeleton

See `serverless/oauth-exchange/` in this repo — a stub DO Function, not
deployed. Fill in the App's client ID/secret as environment config when
this actually gets built out.

## Explicitly out of scope for now

- Refresh-token handling (expiry just means "sign in again").
- Editing existing entries (this only covers creating new ones).
- Any UI for reviewing/approving PRs beyond what GitHub already gives you.
