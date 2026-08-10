import { afterEach, describe, expect, it, vi } from 'vitest';
import { BundledMonsterImageCatalog } from './BundledMonsterImageCatalog';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundledMonsterImageCatalog', () => {
  it('evicts a rejected request and retries the manifest', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(Response.json(catalogRecords()));
    vi.stubGlobal('fetch', fetchMock);
    const catalog = new BundledMonsterImageCatalog('/base/');

    await expect(catalog.list()).rejects.toThrow('could not be loaded');
    await expect(catalog.list()).resolves.toHaveLength(6);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects duplicate or malformed manifest records', async () => {
    const records = catalogRecords();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json([...records.slice(0, 5), { ...records[5], id: records[0]?.id }])
        )
    );

    await expect(new BundledMonsterImageCatalog('/').list()).rejects.toThrow('duplicate IDs');
  });
});

function catalogRecords() {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `monster-${String(index)}`,
    name: `Monster ${String(index)}`,
    file: `monster-${String(index)}.webp`,
    alt: `Retrato ${String(index)}`,
    width: 1024,
    height: 1280
  }));
}
