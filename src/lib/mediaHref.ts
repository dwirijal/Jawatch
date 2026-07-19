// Client-safe media link builder. Public path:
//   /{type}/{workSlug}              detail
//   /{type}/{workSlug}/e{n}|c{n}    player
// Provider never in path — optional ?src= soft hint only.
// Decodes m~ base64 and local "type;provider;upstream" / "type;public" slugs.

const MEDIA_TYPES = new Set(['anime', 'donghua', 'comic', 'manga', 'movie', 'novel']);

export function decodeMediaRefSlug(slug: string): { type: string; slug: string; provider?: string } | null {
  if (!slug) return null;

  // Local API: "anime;samehadaku;upstream" OR "anime;public_slug"
  if (!slug.startsWith('m~') && !slug.includes('/') && slug.includes(';')) {
    const parts = slug.split(';');
    if (parts.length >= 3) {
      const type = parts[0];
      const provider = parts[1];
      const upstream = parts.slice(2).join(';');
      if (type && provider && upstream) {
        return { type, slug: upstream, provider };
      }
    }
    if (parts.length === 2 && MEDIA_TYPES.has(parts[0]) && parts[1]) {
      return { type: parts[0], slug: parts[1] };
    }
  }

  if (!slug.startsWith('m~')) return null;
  try {
    const b64 = slug.slice(2).replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(
      typeof atob !== 'undefined'
        ? atob(b64)
        : Buffer.from(b64, 'base64').toString('utf8'),
    );
    if (json?.type && json?.slug) {
      return {
        type: json.type,
        slug: json.slug,
        provider: typeof json.provider === 'string' ? json.provider : undefined,
      };
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Work detail path: /{type}/{workSlug} */
export function mediaHref(slug: string, type?: string): string {
  const m = decodeMediaRefSlug(slug);
  if (m) {
    const path = `/${m.type}/${encodeURIComponent(m.slug)}`;
    if (m.provider && m.provider !== 'resolve' && m.provider !== 'generic') {
      return `${path}?src=${encodeURIComponent(m.provider)}`;
    }
    return path;
  }
  // Canonical "type/slug" refs
  if (slug.includes('/')) {
    const parts = slug.split('/');
    if (parts.length === 2 && MEDIA_TYPES.has(parts[0])) {
      return `/${parts[0]}/${encodeURIComponent(parts[1])}`;
    }
  }
  // Bare work slug + type (home rails / public_slug)
  if (type && MEDIA_TYPES.has(type) && !slug.includes('/')) {
    return `/${type}/${encodeURIComponent(slug)}`;
  }
  if (type && MEDIA_TYPES.has(type)) return `/${type}/${encodeURIComponent(slug)}`;
  return `/${encodeURIComponent(slug)}`;
}

/** Item path: /{type}/{workSlug}/e1|c1 */
export function mediaItemHref(workHref: string, itemSlug: string): string {
  const base = workHref.split('?')[0].replace(/\/$/, '');
  return `${base}/${encodeURIComponent(itemSlug)}`;
}
