import { describe, expect, it } from 'vitest';
import { InvalidMonsterNameError } from './errors/InvalidMonsterNameError';
import { InvalidMonsterCreatedAtError } from './errors/InvalidMonsterCreatedAtError';
import { Monster } from './Monster';
import { MonsterId } from './value-objects/MonsterId';
import { MonsterImageRef } from './value-objects/MonsterImageRef';

describe('Monster', () => {
  it.each(['', '   ', 'x'.repeat(81)])('rejects invalid name %j', (name) => {
    expect(() =>
      Monster.create({
        id: MonsterId.create('monster-1'),
        name,
        attack: 10,
        defense: 10,
        speed: 10,
        hp: 10,
        image: MonsterImageRef.catalog('pyraxis'),
        createdAt: new Date('2026-08-07T12:00:00.000Z')
      })
    ).toThrow(InvalidMonsterNameError);
  });

  it('trims a valid name and preserves immutable combat data', () => {
    const monster = Monster.create({
      id: MonsterId.create('monster-1'),
      name: '  Pyraxis  ',
      attack: 86,
      defense: 68,
      speed: 72,
      hp: 180,
      image: MonsterImageRef.catalog('pyraxis'),
      createdAt: new Date('2026-08-07T12:00:00.000Z')
    });

    expect(monster.name.value).toBe('Pyraxis');
    expect(monster.stats.toSnapshot()).toEqual({ attack: 86, defense: 68, speed: 72, hp: 180 });
    expect(Object.isFrozen(monster)).toBe(true);

    const exposedDate = monster.createdAt;
    exposedDate.setFullYear(2000);
    expect(monster.createdAt.toISOString()).toBe('2026-08-07T12:00:00.000Z');
  });

  it('rejects an invalid creation date', () => {
    expect(() =>
      Monster.create({
        id: MonsterId.create('monster-1'),
        name: 'Pyraxis',
        attack: 86,
        defense: 68,
        speed: 72,
        hp: 180,
        image: MonsterImageRef.catalog('pyraxis'),
        createdAt: new Date('invalid')
      })
    ).toThrow(InvalidMonsterCreatedAtError);
  });

  it('rejects blank image references', () => {
    expect(() => MonsterImageRef.catalog(' ')).toThrow();
    expect(() => MonsterImageRef.upload('')).toThrow();
  });
});
