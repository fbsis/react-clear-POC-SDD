import { describe, expect, it, vi } from 'vitest';
import { ListMonsterImages } from './ListMonsterImages';
import type { MonsterImageCatalog } from './ports/MonsterImageCatalog';

describe('ListMonsterImages', () => {
  it('maps catalog entries to readonly DTOs', async () => {
    const catalog = {
      list: vi
        .fn()
        .mockResolvedValue([
          { id: 'pyraxis', name: 'Pyraxis', src: '/monster-catalog/pyraxis.webp', alt: 'Dragão' }
        ]),
      findById: vi.fn()
    } satisfies MonsterImageCatalog;

    await expect(new ListMonsterImages(catalog).execute()).resolves.toEqual([
      expect.objectContaining({ id: 'pyraxis', alt: 'Dragão' })
    ]);
  });
});
