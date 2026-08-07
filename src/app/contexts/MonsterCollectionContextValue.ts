import type { CatalogImageDto } from '@application/monster/dtos/CatalogImageDto';
import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import type { RegisterMonsterInput } from '@application/monster/dtos/RegisterMonsterInput';
import type { MonsterCollectionStatus } from './MonsterCollectionStatus';

export interface MonsterCollectionContextValue {
  readonly monsters: readonly MonsterDto[];
  readonly images: readonly CatalogImageDto[];
  readonly status: MonsterCollectionStatus;
  readonly error: string | null;
  readonly registerMonster: (input: RegisterMonsterInput) => Promise<void>;
  readonly refresh: () => Promise<void>;
}
