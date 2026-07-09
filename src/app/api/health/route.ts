import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  const upstream = process.env.JAWATCH_MEDIA_API_URL;
  let upstreamOk = null as boolean | null;
  if (upstream) {
    const ab = new AbortController();
    const t = setTimeout(() => ab.abort(), 2500);
    try {
      const r = await fetch(upstream, { method: 'HEAD', signal: ab.signal, cache: 'no-store' });
      upstreamOk = r.ok || r.status < 500;
    } catch { upstreamOk = false; } finally { clearTimeout(t); }
  }
  return NextResponse.json({ ok: true, upstream: upstream ? (upstreamOk ? 'up' : 'down') : 'unconfigured', ts: new Date().toISOString() }, { status: 200 });
}
