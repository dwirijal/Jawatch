import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/sections/EmptyState';

export default function NotFound() {
  return (
    <Container y="80px">
      <EmptyState
        eyebrow="404"
        title="Halaman tidak ditemukan"
        description="Judul yang kamu cari mungkin sudah dipindah atau tidak tersedia."
        href="/"
        actionLabel="Kembali ke beranda"
      />
    </Container>
  );
}
