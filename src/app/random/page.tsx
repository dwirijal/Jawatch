import type { Metadata } from 'next';
import { getRandom, buildMediaLink, decodeMediaRef } from '@/lib/api';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function RandomPage() {
  const content = await getRandom();
  if (!content) redirect('/');

  // Resolve slug to canonical mediaRef for buildMediaLink
  const ref = decodeMediaRef(content.slug);
  const href = ref ? buildMediaLink(ref) : `/media/${content.slug}`;
  redirect(href);
}
