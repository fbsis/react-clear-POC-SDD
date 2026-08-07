import type { DBSchema } from 'idb';
import type { ImageAssetRecord } from './ImageAssetRecord';
import type { MonsterRecord } from './MonsterRecord';

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
    value: ImageAssetRecord;
    indexes: {
      'by-created-at': string;
    };
  };
}
