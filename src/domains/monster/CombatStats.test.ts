import { describe, expect, it } from 'vitest';
import { CombatStats } from './CombatStats';
import { InvalidCombatStatsError } from './errors/InvalidCombatStatsError';

describe('CombatStats', () => {
  it.each([
    ['attack', -1, 10, 10, 10],
    ['attack', 10_000, 10, 10, 10],
    ['defense', 10, -1, 10, 10],
    ['speed', 10, 10, 1.5, 10],
    ['hp', 10, 10, 10, 0],
    ['hp', 10, 10, 10, 10_000]
  ])('rejects invalid %s', (_field, attack, defense, speed, hp) => {
    expect(() => CombatStats.create({ attack, defense, speed, hp })).toThrow(
      InvalidCombatStatsError
    );
  });

  it('accepts combat limits and exposes immutable values', () => {
    const stats = CombatStats.create({ attack: 0, defense: 9_999, speed: 0, hp: 1 });

    expect(stats.toSnapshot()).toEqual({ attack: 0, defense: 9_999, speed: 0, hp: 1 });
  });
});
