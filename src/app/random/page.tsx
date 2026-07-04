import { getRandom } from '@/lib/api';
import { redirect } from 'next/navigation';

export default async function RandomPage() {
  const content = await getRandom();
  
  if (!content) {
    redirect('/');
  }

  const route = (content.type === 'anime' || content.type === 'donghua' || content.type === 'movie') 
    ? `/watch/${content.slug}` 
    : `/read/${content.slug}`;

  redirect(route);
}
