// Client-safe media link builder. Decodes an `m~` base64 media ref
// ({ type, provider, slug }) into a clean canonical URL so SEO pages stay
// free of opaque base64 (#SEO m~ task). Avoids server-only graph deps.
export function decodeMediaRefSlug(slug: string): { type: string; slug: string } | null {
  if (!slug.startsWith('m~')) return null;
  try {
    const b64 = slug.slice(2).replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(
      typeof atob !== 'undefined'
        ? atob(b64)
        : Buffer.from(b64, 'base64').toString('utf8'),
    );
    if (json?.type && json?.slug) return { type: json.type, slug: json.slug };
  } catch {
    /* fall through */
  }
  return null;
}

export function mediaHref(slug: string): string {
  const m = decodeMediaRefSlug(slug);
  if (m) return `/media/${m.type}/${m.slug}`;
  // Handle canonical "type/slug" refs from local DB
  if (slug.includes('/')) {
    const parts = slug.split('/');
    if (parts.length === 2) return `/media/${parts[1]}?type=${parts[0]}`;
  }
  return `/media/${slug}`;
}
