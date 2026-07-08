# Media URL Redesign: Flat Readable

**Canonical Path:** `/media/[slug]`

## 1. Design
- **Slug**: Upstream slug sanitized (`slugFromTitle`).
- **Collisions**: Provider suffix added only if collision detected during ingestion (`[slug]--[provider]`).
- **Redirection**: Legacy `m~...` or `type~provider~slug` paths 301-redirect to `/media/[slug]`.
- **Sitemap**: Canonical `/media/[slug]` only.
- **Resolver**: Ingestion map slug -> media_id.

## 2. SEO
- **Canonical URLs**: `/media/[slug]`
- **Robots**: Legacy routes 301-redirect to indexable canonicals.

## 3. Implementation
- `src/lib/api.ts`: Add `buildCanonicalPath` and ingestion slug-check.
- `app/media/[slug]/page.tsx`: Route handler for legacy 301 redirects + canonical fetch.
