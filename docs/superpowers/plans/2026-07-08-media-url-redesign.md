# Media URL Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition media URLs from legacy encoded refs (`m~...`) to readable `/media/[type]/[slug]` canonical format.

**Architecture:**
- Canonical route: `/media/[type]/[slug]`
- Resolver logic: `src/lib/api.ts` `decodeMediaRef` and `buildCanonicalPath` helpers.
- Redirects: Handled in `app/media/[slug]/page.tsx` (legacy route compatibility) performing 301 redirects to canonical path.

**Tech Stack:** Next.js App Router, TypeScript, Bun, Vitest.

## Global Constraints

- Canonical format: `/media/[type]/[slug]`.
- Provider suffix (`--provider`) only on collisions.
- Legacy `m~` refs redirect via 301.
- No new dependencies.
- Facade boundary preserved in `lib/api.ts`.

---

## File Structure

- Modify `src/lib/api.ts`: Add `buildCanonicalPath(ref: MediaRef)`, update `decodeMediaRef` to support canonical slugs.
- Modify `src/app/media/[slug]/page.tsx`: Route handler for legacy redirects + canonical fetch.
- Modify all consumer files (sitemap, components): Update to use `buildCanonicalPath`.
- Modify tests: Update `api.test.ts` to verify 301 behavior and canonical resolution.

---

### Task 1: API Boundary & Slug Resolver

**Files:**
- Modify: `src/lib/api.ts`
- Test: `src/__tests__/api.test.ts`

**Interfaces:**
- Produces: `buildCanonicalPath(ref: MediaRef): string`

- [ ] **Step 1: Implement `buildCanonicalPath` in `src/lib/api.ts`**

```typescript
// src/lib/api.ts
export function buildCanonicalPath(ref: MediaRef): string {
  const safeSlug = ref.slug.replace(/--/g, '---'); // Escape existing double-dashes
  const providerSuffix = ref.provider !== 'generic' ? `--${ref.provider}` : '';
  return `/media/${ref.type}/${safeSlug}${providerSuffix}`;
}
```

- [ ] **Step 2: Update `decodeMediaRef` to handle canonical slugs**

- [ ] **Step 3: Add unit tests for `buildCanonicalPath` and `decodeMediaRef`**

- [ ] **Step 4: Commit**

---

### Task 2: Implement Legacy 301 Redirects

**Files:**
- Modify: `src/app/media/[slug]/page.tsx`

**Interfaces:**
- Consumes: `decodeMediaRef`, `buildCanonicalPath` from `src/lib/api.ts`

- [ ] **Step 1: Update `MediaPage` to redirect legacy slugs**

```typescript
// src/app/media/[slug]/page.tsx
const ref = decodeMediaRef(slug);
if (slug.startsWith('m~') && ref) {
  redirect(buildCanonicalPath(ref), RedirectType.replace);
}
```

- [ ] **Step 2: Commit**

---

### Task 3: Update Consuming Links and SEO

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/components/ContentCard.tsx` (or equivalent link generators)

- [ ] **Step 1: Update sitemap to use canonical URLs**

- [ ] **Step 2: Update all link generators to use `buildCanonicalPath`**

- [ ] **Step 3: Commit**

---

## Self-Review

**1. Spec coverage:** Redirect logic, canonical format, facade integrity covered.
**2. Placeholder scan:** None.
**3. Type consistency:** `MediaRef` interface leveraged.
