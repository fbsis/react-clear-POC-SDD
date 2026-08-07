import { describe, expect, it } from 'vitest';
import { Monster, MonsterId, MonsterImageRef } from '@domains/monster';
import { resolveBattle } from './resolveBattle';

describe('resolveBattle', () => {
  it.each([
    {
      name: 'higher speed attacks first',
      first: { attack: 4, defense: 0, speed: 2, hp: 5 },
      second: { attack: 9, defense: 0, speed: 8, hp: 5 },
      expectedOrder: ['second', 'first']
    },
    {
      name: 'higher attack breaks a speed tie',
      first: { attack: 9, defense: 0, speed: 5, hp: 5 },
      second: { attack: 4, defense: 0, speed: 5, hp: 5 },
      expectedOrder: ['first', 'second']
    },
    {
      name: 'first selection breaks a complete tie',
      first: { attack: 5, defense: 0, speed: 5, hp: 5 },
      second: { attack: 5, defense: 0, speed: 5, hp: 5 },
      expectedOrder: ['first', 'second']
    }
  ])('$name', ({ first, second, expectedOrder }) => {
    const battle = resolveBattle(monster('first', first), monster('second', second));

    expect(battle.attackOrder).toEqual(expectedOrder);
    expect(battle.rounds[0]?.events[0]?.attackerId).toBe(expectedOrder[0]);
  });

  it('uses minimum damage one when attack does not exceed defense', () => {
    const battle = resolveBattle(
      monster('first', { attack: 4, defense: 10, speed: 2, hp: 2 }),
      monster('second', { attack: 3, defense: 10, speed: 1, hp: 2 })
    );

    expect(battle.rounds.flatMap((round) => round.events).map((event) => event.damage)).toEqual([
      1, 1, 1
    ]);
  });

  it('clamps HP to zero and does not allow a defeated defender to counterattack', () => {
    const first = monster('first', { attack: 100, defense: 0, speed: 2, hp: 10 });
    const second = monster('second', { attack: 100, defense: 0, speed: 1, hp: 5 });

    const battle = resolveBattle(first, second);

    expect(battle.rounds).toHaveLength(1);
    expect(battle.rounds[0]?.events).toHaveLength(1);
    expect(battle.rounds[0]?.events[0]).toMatchObject({
      defenderHpBefore: 5,
      defenderHpAfter: 0,
      defeated: true
    });
    expect(first.stats.hp).toBe(10);
    expect(second.stats.hp).toBe(5);
  });

  it('keeps the initial attack order fixed in every round', () => {
    const battle = resolveBattle(
      monster('first', { attack: 2, defense: 1, speed: 8, hp: 4 }),
      monster('second', { attack: 2, defense: 1, speed: 3, hp: 4 })
    );

    expect(battle.rounds.map((round) => round.events[0]?.attackerId)).toEqual([
      'first',
      'first',
      'first',
      'first'
    ]);
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
