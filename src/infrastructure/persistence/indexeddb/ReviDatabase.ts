import { type IDBPDatabase, openDB } from 'idb';
import { migrateDatabase } from './migrations';
import type { ReviDatabaseSchema } from './ReviDatabaseSchema';

const DATABASE_NAME = 'monster-arena';
const DATABASE_VERSION = 1;

export class ReviDatabase {
  private connection: Promise<IDBPDatabase<ReviDatabaseSchema>> | null = null;

  public open(): Promise<IDBPDatabase<ReviDatabaseSchema>> {
    this.connection ??= openDB<ReviDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
      upgrade: migrateDatabase,
      blocking: () => {
        void this.close();
      }
    });

    return this.connection;
  }

  public async close(): Promise<void> {
    if (!this.connection) {
      return;
    }

    const database = await this.connection;
    database.close();
    this.connection = null;
  }
}
