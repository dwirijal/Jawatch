# M5 Library — Status (handoff)

Last updated: 2026-07-09. Main tip after this work: `88fb2bb`.

## DONE — M5 fully live on Supabase, verified end-to-end
- DB migrated (7 tables): auth `user/session/account/verification` + library `library_bookmark/library_progress/library_history`.
- TLS: pinned Supabase root CA via `sb_POSTGRES_CA_CERT` env, `rejectUnauthorized:true` (src/lib/db.ts). Strips `sslmode=require` from connString (pg/Bun ignores ssl object when present).
- Bugs fixed this session (found by live-testing, not unit tests):
  1. `isValidRef` required `~` but pages pass slash-form `type/slug` → every write silently no-op'd. Now accepts `/` or `~`. Regression test added.
  2. episode/chapter pages `await`-ed fire-and-forget writes → blocked render. Switched to `next/server` `after()`.
- Verified on live preview: real sign-up wrote a user to Supabase over verified TLS (200), then cleaned up.
- 66/66 tests, build green.
- PRs merged: #259 (M5 UI), #260 (routing tests), #261 (DB wiring + fixes).

## Vercel env state
- `sb_POSTGRES_URL` + most `sb_*`: Production, Preview, Development (owner set).
- `BETTER_AUTH_SECRET`, `sb_POSTGRES_CA_CERT`: **Preview + Development only** (added this session).
- `BETTER_AUTH_URL`: NOT set on preview (better-auth infers from request origin — correct for dynamic preview URLs).

## OWNER-GATED — prod cutover (do NOT do without approval)
Before `vercel deploy --prod`:
1. Add to **production** scope: `BETTER_AUTH_SECRET`, `sb_POSTGRES_CA_CERT` (values in .env.local).
2. Set production `BETTER_AUTH_URL=https://jawatch.web.id` (prod is not dynamic).
3. Then `vercel deploy --prod`.

## Local dev notes
- `.env.local` and `certs/` are gitignored (contain secrets).
- To run migrations/DB scripts locally: `set -a; source .env.local; set +a; export NODE_EXTRA_CA_CERTS="$PWD/certs/supabase-ca.crt"` then the bun command. (NODE_EXTRA_CA_CERTS needed for the better-auth CLI which bypasses our pool.)
- Latest preview: check `vercel deploy --yes`.

## Backlog after M5
- Empty. `lists` surface (library_list tables) is deliberate phase-2 stub. Do not build without new scope.
