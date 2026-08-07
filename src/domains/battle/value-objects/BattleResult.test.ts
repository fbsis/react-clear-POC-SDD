import { describe, expect, it } from 'vitest';
import { InvalidBattleError } from '../errors/InvalidBattleError';
import { BattleResult } from './BattleResult';

describe('BattleResult', () => {
  it('normalizes IDs and remains immutable', () => {
    const result = BattleResult.create({
      winnerId: ' first ',
      loserId: ' second ',
      finalRoundNumber: 2,
      finalEventSequence: 3
    });

    expect(result).toMatchObject({ winnerId: 'first', loserId: 'second' });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('delegates equal fighter IDs to its dedicated validation', () => {
    expect(() =>
      BattleResult.create({
        winnerId: 'same',
        loserId: 'same',
        finalRoundNumber: 1,
        finalEventSequence: 0
      })
    ).toThrow(InvalidBattleError);
  });
});
