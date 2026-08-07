import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserStorageStatus } from './BrowserStorageStatus';

describe('BrowserStorageStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('degrades safely when the Storage API is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    const status = new BrowserStorageStatus();

    await expect(status.estimate()).resolves.toEqual({});
    await expect(status.requestPersistence()).resolves.toBe(false);
  });

  it('does not block storage when the persistence request is rejected', async () => {
    vi.stubGlobal('navigator', {
      storage: {
        persist: vi.fn().mockRejectedValue(new DOMException('Unavailable', 'NotSupportedError'))
      }
    });
    const status = new BrowserStorageStatus();

    await expect(status.requestPersistence()).resolves.toBe(false);
  });
});
