import type { Metadata } from 'next';
import { getRandom } from '@/lib/api';
import { mediaHref } from '@/components/sections/MediaGrid';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function RandomPage() {
  const content = await getRandom();

  if (!content) {
    redirect('/');
  }

  // ponytail: redirect straight to canonical /media/[type]/[slug] via mediaHref,
  // skipping the /media/<slug> → 301 catch-all hop.
  redirect(mediaHref(content));
}
