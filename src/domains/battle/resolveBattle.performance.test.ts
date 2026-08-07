import { describe, expect, it } from 'vitest';
import { Monster } from '@domains/monster/Monster';
import { MonsterId } from '@domains/monster/MonsterId';
import { MonsterImageRef } from '@domains/monster/MonsterImageRef';
import { resolveBattle } from './resolveBattle';

describe('resolveBattle performance', () => {
  it('calculates the 9,999-round worst case within the one-second budget', () => {
    const first = monster('first');
    const second = monster('second');
    const startedAt = performance.now();

    const battle = resolveBattle(first, second);
    const elapsedMilliseconds = performance.now() - startedAt;

    expect(battle.rounds).toHaveLength(9_999);
    expect(battle.rounds.flatMap((round) => round.events)).toHaveLength(19_997);
    expect(elapsedMilliseconds).toBeLessThan(1_000);
  });
});

function monster(id: string): Monster {
  return Monster.create({
    id: MonsterId.create(id),
    name: id,
    attack: 0,
    defense: 9_999,
    speed: 0,
    hp: 9_999,
    image: MonsterImageRef.catalog(id),
    createdAt: new Date('2026-08-07T00:00:00.000Z')
  });
}
