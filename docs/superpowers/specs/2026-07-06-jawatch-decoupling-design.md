# Jawatch Decoupling Design

Date: 2026-07-06
Scope: `the repo root` only.

## Goal

Make `jawatch` standalone. Remove tracked runtime, config, and documentation coupling to `private workspace`, `private backend A`, and `private backend B`.

## Non-goals

- Do not edit sibling repos or files outside `this repo`.
- Do not change git history.
- Do not add a new auth system.
- Do not add new dependencies.

## Approach

Use the smallest runtime purge that preserves current user-facing behavior:

1. Make Sanka the only media source in `src/lib/api.ts`.
2. Remove legacy proxy API envs and fallbacks tied to local/private backend assumptions.
3. Remove backend-dependent NSFW/auth middleware behavior.
4. Clean docs/config/tests so banned names and old backend labels are gone from tracked source.

## Files likely affected

- `src/lib/api.ts`
- `src/middleware.ts`
- `src/__tests__/api.test.ts`
- `.env.example`
- `vercel.json`
- `AGENT.md`
- Any other tracked file found by final grep

## Runtime behavior

- Media/catalog/search/episode/chapter flows call Sanka directly.
- `NEXT_PUBLIC_SANKA_API_URL` may remain as a public endpoint override.
- `NEXT_PUBLIC_SANKA_TIMEOUT_MS` may remain as a timeout knob.
- `legacy public API env`, `legacy adapter toggle env`, Better Auth DB vars, and private backend assumptions are removed unless still required by live code.

## Middleware/auth

Remove the API-backed NSFW/auth gate from `src/middleware.ts`. It depends on private backend metadata and cookie conventions. No replacement auth is added.

## Error handling

Keep existing safe failures: failed upstream requests return empty states, `notFound()`, or existing UI error states depending on call site. Do not silently add broad fallbacks that hide real adapter bugs.

## Testing/verification

Run the smallest checks that prove decoupling:

1. grep tracked files for `private workspace|private backend A|private backend B|legacy private API|legacy public API env|legacy adapter toggle env|database connection env|auth env prefix`.
2. `bun test`.
3. Type/build command from existing scripts.

## Acceptance criteria

- No tracked source/config/doc refs to `private workspace`, `private backend A`, `private backend B`, or `legacy private API`.
- No runtime use of private backend env vars.
- No edits outside `the repo root`.
- Tests/build pass or failures are reported with exact output.
