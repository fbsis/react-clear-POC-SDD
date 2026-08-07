import type { BattleDto } from '@application/battle/dtos/BattleDto';

export function battleFixture(): BattleDto {
  const first = monster('first', 'Pyraxis', 'pyraxis', 100);
  const second = monster('second', 'Aeralune', 'aeralune', 90);
  return {
    id: 'battle-fixture',
    fighters: [first, second],
    attackOrder: ['first', 'second'],
    rounds: [
      {
        number: 1,
        startingHp: { first: 100, second: 90 },
        events: [
          event(0, 1, 'first', 'second', 30, 90, 60, false),
          event(1, 1, 'second', 'first', 20, 100, 80, false)
        ],
        endingHp: { first: 80, second: 60 }
      },
      {
        number: 2,
        startingHp: { first: 80, second: 60 },
        events: [
          event(2, 2, 'first', 'second', 30, 60, 30, false),
          event(3, 2, 'second', 'first', 20, 80, 60, false)
        ],
        endingHp: { first: 60, second: 30 }
      },
      {
        number: 3,
        startingHp: { first: 60, second: 30 },
        events: [event(4, 3, 'first', 'second', 30, 30, 0, true)],
        endingHp: { first: 60, second: 0 }
      }
    ],
    winnerId: 'first',
    loserId: 'second',
    finalRoundNumber: 3,
    finalEventSequence: 4
  };
}

function monster(id: string, name: string, reference: string, hp: number) {
  return {
    id,
    name,
    attack: id === 'first' ? 80 : 65,
    defense: id === 'first' ? 45 : 50,
    speed: id === 'first' ? 75 : 60,
    hp,
    image: { kind: 'catalog' as const, reference }
  };
}

function event(
  sequence: number,
  roundNumber: number,
  attackerId: string,
  defenderId: string,
  damage: number,
  defenderHpBefore: number,
  defenderHpAfter: number,
  defeated: boolean
) {
  return {
    sequence,
    roundNumber,
    attackerId,
    defenderId,
    damage,
    defenderHpBefore,
    defenderHpAfter,
    defeated
  };
}
