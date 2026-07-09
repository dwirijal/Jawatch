# M2 — Analytics, Monitoring, Ad Slots

## Goal
GA4 + Vercel Analytics, Google Ads with ad slots, judi-online blocklist guard,
/api/health monitoring. CSP widened for 3p scripts. Preview-only deploy.

## What shipped
- CSP (next.config.js): googletagmanager, google-analytics, googletagservices,
  doubleclick.net, va.jawatch.web.id in script-src/img-src/connect-src/frame-src.
  unsafe-inline kept (nonce-migration ceiling noted).
- @vercel/analytics + GoogleAnalytics.tsx (next/script, NEXT_PUBLIC_GA_MEASUREMENT_ID).
- GoogleAds.tsx loader (NEXT_PUBLIC_GADS_CLIENT_ID) + SlotIklan container.
- CRITICAL: gambling-blocklist.ts + SafeSlotIklan — returns null on judi/slot/casino/
  togel/sbobet/rtp/gacor/... 5 passing tests. jawatch NEVER renders online gambling.
- app/api/health/route.ts → {ok,upstream,ts} 200 always (uptime-bot safe).
- layout.tsx injects VercelAnalytics + GoogleAnalytics + GoogleAds.

## Verification
bun build green. Env unset → zero 3p tags. Env set → GA/Ads inlined in chunk.
/api/health 200. Routes 200 with upstream down (M1 holds).

## Owner action
Set NEXT_PUBLIC_GA_MEASUREMENT_ID + NEXT_PUBLIC_GADS_CLIENT_ID in Vercel dashboard.

## Out of scope (later)
M3: Better Auth + Supabase (update AGENT.md), Vercel Blob.
M4: WCAG 2.2 AA + Lighthouse pass.
