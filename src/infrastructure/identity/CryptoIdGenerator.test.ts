import { afterEach, describe, expect, it, vi } from 'vitest';
import { CryptoIdGenerator } from './CryptoIdGenerator';

describe('CryptoIdGenerator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses cryptographic random bytes when randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.fill(17);
        return bytes;
      }
    });

    expect(new CryptoIdGenerator().next()).toBe('11111111-1111-4111-9111-111111111111');
  });
});
