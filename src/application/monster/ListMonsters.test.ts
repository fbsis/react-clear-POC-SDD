import { describe, expect, it, vi } from 'vitest';
import { Monster, MonsterId, MonsterImageRef } from '@domains/monster';
import { ListMonsters } from './ListMonsters';
import type { MonsterRepository } from './ports/MonsterRepository';

describe('ListMonsters', () => {
  it('returns DTOs in deterministic repository order', async () => {
    const monster = Monster.create({
      id: MonsterId.create('monster-1'),
      name: 'Pyraxis',
      attack: 86,
      defense: 68,
      speed: 72,
      hp: 180,
      image: MonsterImageRef.catalog('pyraxis'),
      createdAt: new Date('2026-08-07T12:00:00.000Z')
    });
    const repository = {
      add: vi.fn(),
      findById: vi.fn(),
      list: vi.fn().mockResolvedValue([monster])
    } satisfies MonsterRepository;

    await expect(new ListMonsters(repository).execute()).resolves.toEqual([
      expect.objectContaining({ id: 'monster-1', name: 'Pyraxis' })
    ]);
  });
});
