import type { Metadata } from 'next';
import { getRandom } from '@/lib/api';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function RandomPage() {
  const content = await getRandom();
  
  if (!content) {
    redirect('/');
  }

  redirect(`/media/${content.slug}`);
}
