import { describe, expect, it } from 'vitest';
import { InvalidBattleSequenceError } from '../errors/InvalidBattleSequenceError';
import { AttackEvent } from './AttackEvent';
import { Round } from './Round';

describe('Round', () => {
  it('creates an immutable round when events explain its ending HP', () => {
    const round = Round.create({
      number: 1,
      startingHp: { first: 10, second: 7 },
      events: [attackEvent()],
      endingHp: { first: 10, second: 3 }
    });

    expect(round.endingHp).toEqual({ first: 10, second: 3 });
    expect(Object.isFrozen(round.events)).toBe(true);
    expect(Object.isFrozen(round)).toBe(true);
  });

  it('delegates inconsistent ending HP to its dedicated validation', () => {
    expect(() =>
      Round.create({
        number: 1,
        startingHp: { first: 10, second: 7 },
        events: [attackEvent()],
        endingHp: { first: 10, second: 7 }
      })
    ).toThrow(InvalidBattleSequenceError);
  });
});

function attackEvent(): AttackEvent {
  return AttackEvent.create({
    sequence: 0,
    roundNumber: 1,
    attackerId: 'first',
    defenderId: 'second',
    damage: 4,
    defenderHpBefore: 7,
    defenderHpAfter: 3
  });
}
