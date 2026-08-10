import type { Application } from '@application/Application';
import { StartBattle } from '@application/battle/StartBattle';
import { ClearMonsterCollection } from '@application/monster/ClearMonsterCollection';
import { ListMonsterImages } from '@application/monster/ListMonsterImages';
import { ListMonsters } from '@application/monster/ListMonsters';
import { LoadMonsterImage } from '@application/monster/LoadMonsterImage';
import { RegisterMonster } from '@application/monster/RegisterMonster';
import { ResetLocalDatabase } from '@application/shared/ResetLocalDatabase';
import { CryptoIdGenerator } from '@infrastructure/identity/CryptoIdGenerator';
import { BrowserImageValidator } from '@infrastructure/images/BrowserImageValidator';
import { BundledMonsterImageCatalog } from '@infrastructure/images/BundledMonsterImageCatalog';
import { IndexedDbMonsterImageReader } from '@infrastructure/persistence/indexeddb/IndexedDbMonsterImageReader';
import { IndexedDbMonsterRepository } from '@infrastructure/persistence/indexeddb/IndexedDbMonsterRepository';
import { IndexedDbDatabaseResetter } from '@infrastructure/persistence/indexeddb/IndexedDbDatabaseResetter';
import { ReviDatabase } from '@infrastructure/persistence/indexeddb/ReviDatabase';
import { BrowserStorageStatus } from '@infrastructure/storage/BrowserStorageStatus';

export function createApplication(): Application {
  const database = new ReviDatabase();
  const catalog = new BundledMonsterImageCatalog(import.meta.env.BASE_URL);
  const repository = new IndexedDbMonsterRepository(database);

  return Object.freeze({
    registerMonster: new RegisterMonster(
      repository,
      new CryptoIdGenerator(),
      new BrowserImageValidator(),
      catalog
    ),
    clearMonsterCollection: new ClearMonsterCollection(repository),
    listMonsters: new ListMonsters(repository),
    listMonsterImages: new ListMonsterImages(catalog),
    loadMonsterImage: new LoadMonsterImage(new IndexedDbMonsterImageReader(database, catalog)),
    startBattle: new StartBattle(repository),
    resetLocalDatabase: new ResetLocalDatabase(new IndexedDbDatabaseResetter(database)),
    storageStatus: new BrowserStorageStatus()
  });
}
