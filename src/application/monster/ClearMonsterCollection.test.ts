import { describe, expect, it, vi } from 'vitest';
import { ClearMonsterCollection } from './ClearMonsterCollection';
import type { MonsterCollectionCleaner } from './ports/MonsterCollectionCleaner';

describe('ClearMonsterCollection', () => {
  it('delegates collection cleanup through its injected port', async () => {
    const clear = vi.fn<MonsterCollectionCleaner['clear']>().mockResolvedValue();

    await new ClearMonsterCollection({ clear }).execute();

    expect(clear).toHaveBeenCalledOnce();
  });
});
