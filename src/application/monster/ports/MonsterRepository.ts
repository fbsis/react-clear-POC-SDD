import type { Monster, MonsterId } from '@domains/monster';
import type { PersistedUploadedImageContent } from './PersistedUploadedImageContent';

export interface MonsterRepository {
  add(monster: Monster, uploadedImage?: PersistedUploadedImageContent): Promise<void>;
  findById(id: MonsterId): Promise<Monster | null>;
  list(): Promise<readonly Monster[]>;
}
