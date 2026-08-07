import { describe, expect, it } from 'vitest';
import { InvalidMonsterNameError } from '../errors/InvalidMonsterNameError';
import { MonsterName } from './MonsterName';

describe('MonsterName', () => {
  it.each(['', '   ', 'x'.repeat(81)])('rejects invalid value %j', (value) => {
    expect(() => MonsterName.create(value)).toThrow(InvalidMonsterNameError);
  });

  it('normalizes and compares names by value', () => {
    const name = MonsterName.create('  Pyraxis  ');

    expect(name.value).toBe('Pyraxis');
    expect(name.equals(MonsterName.create('Pyraxis'))).toBe(true);
    expect(Object.isFrozen(name)).toBe(true);
  });
});
