'use client';
import { Reveal } from '@/components/motion/Reveal';

export default function Template({ children }: { children: React.ReactNode }) {
  return <Reveal className="flex-1">{children}</Reveal>;
}
