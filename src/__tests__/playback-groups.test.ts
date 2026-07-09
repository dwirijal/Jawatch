import { describe, expect, it } from 'vitest';
import { groupMirrorsByProvider, groupDownloadsByResolution } from '@/lib/playback-groups';

describe('groupMirrorsByProvider', () => {
  it('groups mirrors by provider label, preserving first-seen order', () => {
    const groups = groupMirrorsByProvider([
      { serverId: '1', label: 'filedon', quality: '360p' },
      { serverId: '2', label: 'mega', quality: '360p' },
      { serverId: '3', label: 'filedon', quality: '480p' },
    ]);
    expect(groups.map((g) => g.key)).toEqual(['filedon', 'mega']);
    expect(groups[0].items.map((m) => m.serverId)).toEqual(['1', '3']);
  });

  it('buckets missing labels under Lainnya', () => {
    const groups = groupMirrorsByProvider([{ serverId: '1', label: '', quality: '360p' }]);
    expect(groups[0].key).toBe('Lainnya');
  });
});

describe('groupDownloadsByResolution', () => {
  it('groups downloads by resolution, preserving first-seen order', () => {
    const groups = groupDownloadsByResolution([
      { url: 'a', label: 'Filedon', quality: '360p' },
      { url: 'b', label: 'Mega', quality: '720p' },
      { url: 'c', label: 'Pdrain', quality: '360p' },
    ]);
    expect(groups.map((g) => g.key)).toEqual(['360p', '720p']);
    expect(groups[0].items.map((d) => d.url)).toEqual(['a', 'c']);
  });
});
