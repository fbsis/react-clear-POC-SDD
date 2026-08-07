import type { DBSchema } from 'idb';
import type { MonsterRecord } from './MonsterRecord';
import type { StoredImageAssetRecord } from './StoredImageAssetRecord';

export interface ReviDatabaseSchema extends DBSchema {
  monsters: {
    key: string;
    value: MonsterRecord;
    indexes: {
      'by-name': string;
      'by-created-at': string;
    };
  };
  imageAssets: {
    key: string;
    value: StoredImageAssetRecord;
    indexes: {
      'by-created-at': string;
    };
  };
}
