import { getUserId } from '@/lib/session';
import { listProgress } from '@/lib/library';
import { SectionHeader } from './SectionHeader';
import { ProgressList } from './ProgressList';

// Home "Continue watching/reading" rail. Reads session (dynamic) — renders
// nothing for guests or when there's no progress, so it costs guests zero space.
export async function ContinueRail() {
  const userId = await getUserId();
  if (!userId) return null;

  const [watch, read] = await Promise.all([
    listProgress(userId, 'watch').catch(() => []),
    listProgress(userId, 'read').catch(() => []),
  ]);
  if (watch.length === 0 && read.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1160px] px-4 pt-16 sm:px-8">
      {watch.length > 0 && (
        <section>
          <SectionHeader eyebrow="Lanjut" title="Lanjut tonton" href="/library/watch-progress" />
          <ProgressList items={watch.slice(0, 6)} kind="episodes" />
        </section>
      )}
      {read.length > 0 && (
        <section className={watch.length > 0 ? 'mt-12' : ''}>
          <SectionHeader eyebrow="Lanjut" title="Lanjut baca" href="/library/reading-progress" />
          <ProgressList items={read.slice(0, 6)} kind="chapters" />
        </section>
      )}
    </div>
  );
}
