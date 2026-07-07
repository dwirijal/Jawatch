# Jawatch

Standalone Next.js media frontend backed by a server-side media source.

## Env

```dotenv
JAWATCH_MEDIA_API_URL=https://media-source.example
JAWATCH_MEDIA_API_TIMEOUT_MS=8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See `.env.example`.

## Routes

```text
/                  home
/discover          catalog browse
/latest            latest releases
/search?q=         search results
/media/[slug]      media detail
/media/[slug]/episodes/[episodeSlug] video player
/media/[slug]/chapters/[chapterSlug] reader
/sitemap.xml       public sitemap
```

## Run

```bash
cp .env.example .env.local
bun install
bun dev
bun run test:run
bun build
```
