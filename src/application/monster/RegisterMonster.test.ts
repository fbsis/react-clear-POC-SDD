import { describe, expect, it, vi } from 'vitest';
import type { IdGenerator } from '@application/shared/ports/IdGenerator';
import type { ImageValidator } from './ports/ImageValidator';
import type { MonsterRepository } from './ports/MonsterRepository';
import { RegisterMonster } from './RegisterMonster';

describe('RegisterMonster', () => {
  it('creates and persists a catalog monster through injected ports', async () => {
    const add = vi.fn<MonsterRepository['add']>();
    const repository = { add, findById: vi.fn(), list: vi.fn() } satisfies MonsterRepository;
    const idGenerator = { next: () => 'monster-1' } satisfies IdGenerator;
    const validator = { inspect: vi.fn() } satisfies ImageValidator;
    const useCase = new RegisterMonster(repository, idGenerator, validator);

    const result = await useCase.execute({
      name: 'Pyraxis',
      attack: 86,
      defense: 68,
      speed: 72,
      hp: 180,
      image: { kind: 'catalog', imageId: 'pyraxis' }
    });

    expect(result.id).toBe('monster-1');
    expect(add).toHaveBeenCalledOnce();
    expect(validator.inspect).not.toHaveBeenCalled();
  });

  it('validates upload bytes before persistence', async () => {
    const callOrder: string[] = [];
    const repository = {
      add: vi.fn().mockImplementation(() => {
        callOrder.push('persist');
        return Promise.resolve();
      }),
      findById: vi.fn(),
      list: vi.fn()
    } satisfies MonsterRepository;
    const validator = {
      inspect: vi.fn().mockImplementation(() => {
        callOrder.push('inspect');
        return Promise.resolve({ valid: true });
      })
    } satisfies ImageValidator;
    const useCase = new RegisterMonster(repository, { next: () => 'monster-2' }, validator);

    await useCase.execute({
      name: 'Terralith',
      attack: 74,
      defense: 92,
      speed: 48,
      hp: 200,
      image: {
        kind: 'upload',
        fileName: 'terralith.png',
        mediaType: 'image/png',
        sizeBytes: 4,
        bytes: new Uint8Array([137, 80, 78, 71])
      }
    });

    expect(callOrder).toEqual(['inspect', 'persist']);
  });
});
