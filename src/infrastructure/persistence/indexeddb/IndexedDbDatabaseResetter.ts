import type { LocalDatabaseResetter } from '@application/shared/ports/LocalDatabaseResetter';
import type { ReviDatabase } from './ReviDatabase';

export class IndexedDbDatabaseResetter implements LocalDatabaseResetter {
  private readonly database: ReviDatabase;

  public constructor(database: ReviDatabase) {
    this.database = database;
  }

  public reset(): Promise<void> {
    return this.database.reset();
  }
}
