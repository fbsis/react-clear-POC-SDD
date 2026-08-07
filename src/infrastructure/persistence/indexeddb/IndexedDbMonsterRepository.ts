import type { MonsterRepository } from '@application/monster/ports/MonsterRepository';
import type { PersistedUploadedImageContent } from '@application/monster/ports/PersistedUploadedImageContent';
import type { Monster, MonsterId } from '@domains/monster';
import type { ImageAssetRecord } from './ImageAssetRecord';
import { MonsterRecordMapper } from './MonsterRecordMapper';
import type { ReviDatabase } from './ReviDatabase';

export class IndexedDbMonsterRepository implements MonsterRepository {
  private readonly mapper = new MonsterRecordMapper();
  private readonly database: ReviDatabase;

  public constructor(database: ReviDatabase) {
    this.database = database;
  }

  public async add(monster: Monster, uploadedImage?: PersistedUploadedImageContent): Promise<void> {
    const connection = await this.database.open();
    const transaction = connection.transaction(['monsters', 'imageAssets'], 'readwrite');

    try {
      if (uploadedImage) {
        const asset: ImageAssetRecord = {
          id: uploadedImage.id,
          blob: new Blob([Uint8Array.from(uploadedImage.bytes).buffer], {
            type: uploadedImage.mediaType
          }),
          fileName: uploadedImage.fileName,
          mediaType: this.toSupportedMediaType(uploadedImage.mediaType),
          sizeBytes: uploadedImage.sizeBytes,
          createdAt: monster.createdAt.toISOString()
        };
        await transaction.objectStore('imageAssets').add(asset);
      }

      await transaction.objectStore('monsters').add(this.mapper.toRecord(monster));
      await transaction.done;
    } catch (error) {
      await transaction.done.catch(() => undefined);
      throw error;
    }
  }

  public async findById(id: MonsterId): Promise<Monster | null> {
    const record = await (await this.database.open()).get('monsters', id.value);
    return record ? this.mapper.toDomain(record) : null;
  }

  public async list(): Promise<readonly Monster[]> {
    const records = await (await this.database.open()).getAllFromIndex('monsters', 'by-name');
    return records.map((record) => this.mapper.toDomain(record));
  }

  private toSupportedMediaType(mediaType: string): 'image/jpeg' | 'image/png' | 'image/webp' {
    if (mediaType === 'image/jpeg' || mediaType === 'image/png' || mediaType === 'image/webp') {
      return mediaType;
    }
    throw new Error('Unsupported persisted image media type.');
  }
}
