import { describe, expect, it } from 'vitest';
import { InvalidBattleSequenceError } from '../errors/InvalidBattleSequenceError';
import { AttackEvent } from './AttackEvent';

describe('AttackEvent', () => {
  it('creates an immutable value from a valid HP transition', () => {
    const event = AttackEvent.create({
      sequence: 0,
      roundNumber: 1,
      attackerId: ' first ',
      defenderId: ' second ',
      damage: 4,
      defenderHpBefore: 7,
      defenderHpAfter: 3
    });

    expect(event).toMatchObject({ attackerId: 'first', defenderId: 'second', defeated: false });
    expect(Object.isFrozen(event)).toBe(true);
  });

  it('delegates inconsistent HP transitions to its dedicated validation', () => {
    expect(() =>
      AttackEvent.create({
        sequence: 0,
        roundNumber: 1,
        attackerId: 'first',
        defenderId: 'second',
        damage: 4,
        defenderHpBefore: 7,
        defenderHpAfter: 4
      })
    ).toThrow(InvalidBattleSequenceError);
  });
});
