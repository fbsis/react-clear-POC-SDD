// @vitest-environment node

import { deleteDB } from 'idb';
import { describe, expect, it, vi } from 'vitest';
import type { MonsterImageCatalog } from '@application/monster/ports/MonsterImageCatalog';
import { Monster, MonsterId, MonsterImageRef } from '@domains/monster';
import { runMonsterRepositoryContract } from '@tests/contracts/monsterRepositoryContract';
import { IndexedDbMonsterImageReader } from './IndexedDbMonsterImageReader';
import { IndexedDbMonsterRepository } from './IndexedDbMonsterRepository';
import { ReviDatabase } from './ReviDatabase';

let database: ReviDatabase | null = null;

runMonsterRepositoryContract({
  create() {
    database = new ReviDatabase();
    return Promise.resolve(new IndexedDbMonsterRepository(database));
  },
  async reset() {
    await database?.close();
    database = null;
    await deleteDB('monster-arena');
  }
});

describe('IndexedDbMonsterRepository integration', () => {
  it('persists an uploaded image atomically and reads it after reopening the database', async () => {
    const firstDatabase = new ReviDatabase();
    const repository = new IndexedDbMonsterRepository(firstDatabase);
    const monster = createUploadedMonster('monster-upload', 'asset-upload');

    await repository.add(monster, {
      id: 'asset-upload',
      fileName: 'guardian.png',
      mediaType: 'image/png',
      sizeBytes: 8,
      bytes: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
    });
    await firstDatabase.close();

    const reopenedDatabase = new ReviDatabase();
    const reader = new IndexedDbMonsterImageReader(reopenedDatabase, emptyCatalog());
    await expect(
      new IndexedDbMonsterRepository(reopenedDatabase).findById(monster.id)
    ).resolves.toEqual(monster);
    await expect(reader.read({ kind: 'upload', reference: 'asset-upload' })).resolves.toEqual(
      expect.objectContaining({
        kind: 'uploaded',
        mediaType: 'image/png',
        bytes: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
      })
    );

    await reopenedDatabase.close();
    await deleteDB('monster-arena');
  });

  it('rolls back the uploaded image when the monster write fails', async () => {
    const database = new ReviDatabase();
    const repository = new IndexedDbMonsterRepository(database);
    const original = createUploadedMonster('duplicate-id', 'original-asset');
    await repository.add(original);

    await expect(
      repository.add(createUploadedMonster('duplicate-id', 'rolled-back-asset'), {
        id: 'rolled-back-asset',
        fileName: 'rolled-back.png',
        mediaType: 'image/png',
        sizeBytes: 8,
        bytes: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
      })
    ).rejects.toBeDefined();

    await expect(
      (await database.open()).get('imageAssets', 'rolled-back-asset')
    ).resolves.toBeUndefined();
    await database.close();
    await deleteDB('monster-arena');
  });

  it('preserves the browser quota error for application-level mapping', async () => {
    const database = new ReviDatabase();
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
    vi.spyOn(database, 'open').mockRejectedValue(quotaError);

    await expect(
      new IndexedDbMonsterRepository(database).add(
        createUploadedMonster('quota-monster', 'quota-asset')
      )
    ).rejects.toBe(quotaError);
  });
});

function createUploadedMonster(id: string, assetId: string): Monster {
  return Monster.create({
    id: MonsterId.create(id),
    name: 'Guardian',
    attack: 30,
    defense: 40,
    speed: 20,
    hp: 100,
    image: MonsterImageRef.upload(assetId),
    createdAt: new Date('2026-08-07T12:00:00.000Z')
  });
}

function emptyCatalog(): MonsterImageCatalog {
  return {
    list: () => Promise.resolve([]),
    findById: () => Promise.resolve(null)
  };
}
