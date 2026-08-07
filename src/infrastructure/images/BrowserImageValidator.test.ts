import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserImageValidator } from './BrowserImageValidator';

describe('BrowserImageValidator', () => {
  const validator = new BrowserImageValidator();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts a valid PNG signature', async () => {
    await expect(
      validator.inspect({
        fileName: 'monster.png',
        mediaType: 'image/png',
        sizeBytes: 8,
        bytes: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
      })
    ).resolves.toEqual({ valid: true });
  });

  it.each([
    ['unsupported type', 'image/gif' as const, 4, new Uint8Array([1, 2, 3, 4])],
    ['oversized file', 'image/png' as const, 10_485_761, new Uint8Array([137, 80, 78, 71])],
    ['corrupt content', 'image/png' as const, 4, new Uint8Array([1, 2, 3, 4])]
  ])('rejects %s', async (_case, mediaType, sizeBytes, bytes) => {
    await expect(
      validator.inspect({ fileName: 'monster.img', mediaType, sizeBytes, bytes })
    ).resolves.toEqual(expect.objectContaining({ valid: false }));
  });

  it('rejects content with a valid signature that the browser cannot decode', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('decode failed')));

    await expect(
      validator.inspect({
        fileName: 'corrupt.png',
        mediaType: 'image/png',
        sizeBytes: 8,
        bytes: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
      })
    ).resolves.toEqual(expect.objectContaining({ valid: false }));
  });
});
