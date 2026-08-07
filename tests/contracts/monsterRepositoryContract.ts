import { afterEach, describe, expect, it } from 'vitest';
import { Monster, MonsterId, MonsterImageRef } from '@domains/monster';
import type { MonsterRepositoryFactory } from './MonsterRepositoryFactory';

export function runMonsterRepositoryContract(factory: MonsterRepositoryFactory): void {
  describe('MonsterRepository contract', () => {
    afterEach(() => factory.reset());

    it('rehydrates an added monster without changing domain values', async () => {
      const repository = await factory.create();
      const monster = Monster.create({
        id: MonsterId.create('monster-1'),
        name: 'Pyraxis',
        attack: 86,
        defense: 68,
        speed: 72,
        hp: 180,
        image: MonsterImageRef.catalog('pyraxis'),
        createdAt: new Date('2026-08-07T12:00:00.000Z')
      });

      await repository.add(monster);

      await expect(repository.findById(monster.id)).resolves.toEqual(monster);
    });

    it('does not replace a stored aggregate when a duplicate write fails', async () => {
      const repository = await factory.create();
      const original = Monster.create({
        id: MonsterId.create('monster-duplicate'),
        name: 'Original',
        attack: 10,
        defense: 10,
        speed: 10,
        hp: 10,
        image: MonsterImageRef.catalog('pyraxis'),
        createdAt: new Date('2026-08-07T12:00:00.000Z')
      });
      const duplicate = Monster.create({
        id: original.id,
        name: 'Replacement',
        attack: 20,
        defense: 20,
        speed: 20,
        hp: 20,
        image: MonsterImageRef.catalog('terralith'),
        createdAt: new Date('2026-08-07T13:00:00.000Z')
      });

      await repository.add(original);
      await expect(repository.add(duplicate)).rejects.toBeDefined();

      await expect(repository.findById(original.id)).resolves.toEqual(original);
    });
  });
}
