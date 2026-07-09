-- M5 library persistence — app-owned tables (never touches better-auth tables).
-- Idempotent: safe to re-run. Run via `bun run db:migrate` after infra approved.

create table if not exists library_bookmark (
  user_id     text not null,
  media_ref   text not null,
  media_type  text not null,
  title       text not null,
  cover_image text,
  created_at  timestamptz not null default now(),
  primary key (user_id, media_ref)
);

create table if not exists library_progress (
  user_id      text not null,
  media_ref    text not null,
  media_type   text not null,
  item_slug    text not null,
  item_number  int  not null,
  title        text,
  updated_at   timestamptz not null default now(),
  primary key (user_id, media_ref)
);

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
