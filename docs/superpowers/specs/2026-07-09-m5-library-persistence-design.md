# M5: Library Persistence — Design

Status: **PLANNED — blocked on owner infra approval** (Supabase Postgres + Vercel Blob env vars). No code until approved.
Date: 2026-07-09
Author: CTO (autonomous)

## Goal

Turn the 6 stubbed `/library/*` surfaces into working, per-user persistent features:
bookmarks, watch progress, reading progress, history, custom lists. Auth already
merged (better-auth + pg). This milestone adds the app-owned data layer and wires
the existing stub pages to it.

## Current state (verified)

- `src/lib/db.ts` — `pg` Pool on `sb_POSTGRES_URL`.
- `src/lib/auth.ts` — better-auth, email+password, optional Google. Kysely adapter
  auto-manages its own `user`/`session`/`account` tables.
- `src/app/library/{page,bookmarks,history,reading-progress,watch-progress,lists}/page.tsx`
  — all render static placeholder tiles, `robots: noindex`.
- Media identity: canonical `MediaRef` string (`type~provider~slug`) already used everywhere.

## Blocked on (owner)

1. Supabase Postgres provisioned + `sb_POSTGRES_URL` in Vercel preview & prod env.
2. `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` set.
3. (optional) `GOOGLE_CLIENT_ID/SECRET` for OAuth.
4. Vercel Blob (`BLOB_READ_WRITE_TOKEN`) — only if list cover uploads wanted; **defer**, not needed for MVP.

## Schema (app-owned, additive — never touch better-auth tables)

```sql
-- one row per (user, media) bookmark
create table if not exists library_bookmark (
  user_id     text not null,
  media_ref   text not null,          -- canonical type~provider~slug
  media_type  text not null,          -- denormalized for filter without upstream call
  title       text not null,
  cover_image text,
  created_at  timestamptz not null default now(),
  primary key (user_id, media_ref)
);

-- last position per (user, media); one row, upserted
create table if not exists library_progress (
  user_id      text not null,
  media_ref    text not null,
  media_type   text not null,          -- video vs read -> which /library surface
  item_slug    text not null,          -- episode/chapter slug
  item_number  int  not null,
  title        text,
  updated_at   timestamptz not null default now(),
  primary key (user_id, media_ref)
);

-- append-only history (distinct from progress: shows the trail)
create table if not exists library_history (
  user_id    text not null,
  media_ref  text not null,
  item_slug  text not null,
  viewed_at  timestamptz not null default now(),
  primary key (user_id, media_ref, item_slug)
);

create index if not exists idx_progress_user_updated on library_progress (user_id, updated_at desc);
create index if not exists idx_history_user_viewed  on library_history  (user_id, viewed_at desc);
create index if not exists idx_bookmark_user_created on library_bookmark (user_id, created_at desc);
```

Custom lists (`/library/lists`) = phase 2; adds `library_list` + `library_list_item`.
Keep MVP to bookmark/progress/history.

## Query layer — `src/lib/library.ts`

Repository-pattern module, all parameterized queries (no string interpolation):

```
getSession(): resolve better-auth session -> userId | null   (server-only)
toggleBookmark(userId, media): upsert/delete, returns bool
listBookmarks(userId, {type?, limit, offset})
upsertProgress(userId, media, item)      -- called from episode/chapter pages
listProgress(userId, kind: 'watch'|'read')  -- kind maps media_type set
recordHistory(userId, mediaRef, itemSlug)
listHistory(userId, {limit})
```

Every write validates userId present (auth boundary) and media_ref shape.

## Wiring

- Each `/library/*/page.tsx`: server component, `getSession()` → if null render
  "sign in" CTA (reuse EmptyState `as="h1"`), else query + render grid.
- Bookmark button: client component on media detail; server action `toggleBookmark`.
- `upsertProgress` / `recordHistory`: called in episode/chapter page server component
  after a successful source load (fire-and-forget, wrapped so a DB error never breaks playback).

## Migration strategy

`bun run db:migrate` script executing the SQL above idempotently (all `if not exists`).
Runs once against Supabase after env approved. No ORM migration framework — raw SQL,
YAGNI. Ship the script; owner runs it (or it runs in a one-off Vercel build step).

## Testing

- Unit: `library.ts` query builders with a mocked pg Pool (assert SQL + params, no live DB).
- The `pg-missing-table-graceful-fallback` learned skill applies: if tables absent
  (env set but migration not run), reads return `[]` and writes no-op with a logged
  warning — never 500. One test per surface for this fallback.
- Integration against a real DB deferred to when infra exists.

## Build order (when unblocked)

1. `library.ts` + schema SQL + `db:migrate` script + unit tests (RED→GREEN)
2. Wire bookmark toggle (detail page + server action)
3. Wire the 6 library surfaces to queries
4. Wire progress/history writes into episode/chapter pages
5. Preview deploy → owner inspect → prod approval

## Out of scope (YAGNI)

- Custom lists (phase 2)
- Blob cover uploads
- Cross-device sync beyond what Postgres already gives
- Social/sharing features
```
