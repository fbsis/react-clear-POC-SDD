import { describe, expect, it } from 'vitest';
import { Monster } from '@domains/monster/Monster';
import { MonsterId } from '@domains/monster/MonsterId';
import { MonsterImageRef } from '@domains/monster/MonsterImageRef';
import { Battle } from './Battle';
import { InvalidBattleSequenceError } from './errors/InvalidBattleSequenceError';
import { resolveBattle } from './resolveBattle';

describe('Battle', () => {
  it('contains immutable fighter snapshots, contiguous rounds and a final result', () => {
    const first = monster('first', { attack: 6, defense: 4, speed: 8, hp: 8 });
    const second = monster('second', { attack: 5, defense: 2, speed: 3, hp: 9 });

    const battle = resolveBattle(first, second);

    expect(battle.fighters.map((fighter) => fighter.id)).toEqual(['first', 'second']);
    expect(battle.attackOrder).toEqual(['first', 'second']);
    expect(battle.rounds.map((round) => round.number)).toEqual([1, 2, 3]);
    expect(battle.rounds.flatMap((round) => round.events).map((event) => event.sequence)).toEqual([
      0, 1, 2, 3, 4
    ]);
    expect(battle.result).toMatchObject({
      winnerId: 'first',
      loserId: 'second',
      finalRoundNumber: 3,
      finalEventSequence: 4
    });
    expect(Object.isFrozen(battle.fighters[0])).toBe(true);
    expect(Object.isFrozen(battle.rounds)).toBe(true);
  });

  it('rejects a battle whose rounds are not contiguous', () => {
    const first = monster('first', { attack: 5, defense: 0, speed: 2, hp: 10 });
    const second = monster('second', { attack: 4, defense: 0, speed: 1, hp: 10 });
    const valid = resolveBattle(first, second);
    const firstRound = valid.rounds[0];
    const secondRound = valid.rounds[1];
    if (!firstRound || !secondRound) {
      throw new Error('Fixture must contain two rounds.');
    }
    expect(() =>
      Battle.create({
        fighters: valid.fighters,
        attackOrder: valid.attackOrder,
        rounds: [secondRound, firstRound],
        result: valid.result
      })
    ).toThrow(InvalidBattleSequenceError);
  });
});

function monster(
  id: string,
  stats: Readonly<{ attack: number; defense: number; speed: number; hp: number }>
): Monster {
  return Monster.create({
    id: MonsterId.create(id),
    name: id,
    ...stats,
    image: MonsterImageRef.catalog(id),
    createdAt: new Date('2026-08-07T00:00:00.000Z')
  });
}
