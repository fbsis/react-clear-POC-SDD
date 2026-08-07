import { describe, expect, it, vi } from 'vitest';
import { LoadMonsterImage } from './LoadMonsterImage';
import type { MonsterImageReader } from './ports/MonsterImageReader';

describe('LoadMonsterImage', () => {
  it('returns uploaded bytes without creating an object URL', async () => {
    const reader = {
      read: vi.fn().mockResolvedValue({
        kind: 'uploaded' as const,
        bytes: new Uint8Array([1, 2, 3]),
        mediaType: 'image/png',
        alt: 'Imagem enviada de Pyraxis'
      })
    } satisfies MonsterImageReader;

    const result = await new LoadMonsterImage(reader).execute({
      kind: 'upload',
      reference: 'asset-1'
    });

    expect(result.kind).toBe('uploaded');
  });
});
