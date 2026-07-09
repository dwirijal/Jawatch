import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/sections/EmptyState';
import { COPY } from '@/lib/copy';

export default function NotFound() {
  return (
    <Container y="80px">
      <EmptyState
        eyebrow="404"
        title={COPY.empty.pageNotFound}
        description={COPY.empty.notAvailableDesc('Judul')}
        href="/"
        actionLabel={COPY.empty.backToHome}
      />
    </Container>
  );
}
