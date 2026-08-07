import type { IDBPDatabase } from 'idb';
import type { ReviDatabaseSchema } from './ReviDatabaseSchema';

export function migrateDatabase(
  database: IDBPDatabase<ReviDatabaseSchema>,
  oldVersion: number
): void {
  if (oldVersion < 1) {
    const monsters = database.createObjectStore('monsters', { keyPath: 'id' });
    monsters.createIndex('by-name', 'normalizedName');
    monsters.createIndex('by-created-at', 'createdAt');

    const imageAssets = database.createObjectStore('imageAssets', { keyPath: 'id' });
    imageAssets.createIndex('by-created-at', 'createdAt');
  }
}
