import type { Monster } from '@domains/monster/Monster';
import type { MonsterId } from '@domains/monster/MonsterId';
import type { PersistedUploadedImageContent } from './PersistedUploadedImageContent';

export interface MonsterRepository {
  add(monster: Monster, uploadedImage?: PersistedUploadedImageContent): Promise<void>;
  findById(id: MonsterId): Promise<Monster | null>;
  list(): Promise<readonly Monster[]>;
}
