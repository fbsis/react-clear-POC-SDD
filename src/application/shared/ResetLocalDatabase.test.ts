import { describe, expect, it, vi } from 'vitest';
import { ResetLocalDatabase } from './ResetLocalDatabase';
import type { LocalDatabaseResetter } from './ports/LocalDatabaseResetter';

describe('ResetLocalDatabase', () => {
  it('delegates the destructive reset through its injected port', async () => {
    const reset = vi.fn<LocalDatabaseResetter['reset']>().mockResolvedValue();

    await new ResetLocalDatabase({ reset }).execute();

    expect(reset).toHaveBeenCalledOnce();
  });
});
