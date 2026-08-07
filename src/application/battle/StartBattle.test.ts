import { describe, expect, it, vi } from 'vitest';
import type { ApplicationError } from '@application/shared/errors/ApplicationError';
import { Monster } from '@domains/monster/Monster';
import { MonsterId } from '@domains/monster/MonsterId';
import { MonsterImageRef } from '@domains/monster/MonsterImageRef';
import type { MonsterRepository } from '@application/monster/ports/MonsterRepository';
import { StartBattle } from './StartBattle';

describe('StartBattle', () => {
  it('rejects equal fighter IDs before consulting the repository', async () => {
    const findById = vi.fn<MonsterRepository['findById']>();
    const repository = {
      add: vi.fn(),
      list: vi.fn().mockResolvedValue([]),
      findById
    } satisfies MonsterRepository;

    await expect(
      new StartBattle(repository).execute({ firstMonsterId: 'same', secondMonsterId: 'same' })
    ).rejects.toMatchObject({ code: 'BATTLE_INVALID' } satisfies Partial<ApplicationError>);
    expect(findById).not.toHaveBeenCalled();
  });

  it('reports a missing selected monster', async () => {
    const repository = repositoryWith([monster('first', 10, 5)]);

    await expect(
      new StartBattle(repository).execute({ firstMonsterId: 'first', secondMonsterId: 'missing' })
    ).rejects.toMatchObject({
      code: 'MONSTER_NOT_FOUND',
      details: { monsterId: 'missing' }
    } satisfies Partial<ApplicationError>);
  });

  it('maps the complete battle to readonly DTOs without changing stored HP', async () => {
    const first = monster('first', 9, 10);
    const second = monster('second', 4, 7);
    const useCase = new StartBattle(repositoryWith([first, second]));

    const result = await useCase.execute({
      firstMonsterId: 'first',
      secondMonsterId: 'second'
    });

    expect(result.fighters.map((fighter) => fighter.id)).toEqual(['first', 'second']);
    expect(result.attackOrder).toEqual(['first', 'second']);
    expect(result.rounds[0]?.events[0]).toMatchObject({
      sequence: 0,
      roundNumber: 1,
      attackerId: 'first',
      defenderId: 'second',
      damage: 9,
      defenderHpBefore: 7,
      defenderHpAfter: 0,
      defeated: true
    });
    expect(result).toMatchObject({
      winnerId: 'first',
      loserId: 'second',
      finalRoundNumber: 1,
      finalEventSequence: 0
    });
    expect(first.stats.hp).toBe(10);
    expect(second.stats.hp).toBe(7);
    expect(Object.isFrozen(result.rounds)).toBe(true);
  });
});

function repositoryWith(monsters: readonly Monster[]): MonsterRepository {
  return {
    add: vi.fn(),
    list: vi.fn().mockResolvedValue(monsters),
    findById: vi.fn(async (id: MonsterId) =>
      Promise.resolve(monsters.find((monsterValue) => monsterValue.id.equals(id)) ?? null)
    )
  };
}

function monster(id: string, attack: number, hp: number): Monster {
  return Monster.create({
    id: MonsterId.create(id),
    name: id,
    attack,
    defense: 0,
    speed: attack,
    hp,
    image: MonsterImageRef.catalog(id),
    createdAt: new Date('2026-08-07T00:00:00.000Z')
  });
}
