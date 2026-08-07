import type { ListMonsterImagesUseCase } from './monster/contracts/ListMonsterImagesUseCase';
import type { ListMonstersUseCase } from './monster/contracts/ListMonstersUseCase';
import type { LoadMonsterImageUseCase } from './monster/contracts/LoadMonsterImageUseCase';
import type { RegisterMonsterUseCase } from './monster/contracts/RegisterMonsterUseCase';
import type { StorageStatus } from './shared/ports/StorageStatus';

export interface Application {
  readonly registerMonster: RegisterMonsterUseCase;
  readonly listMonsters: ListMonstersUseCase;
  readonly listMonsterImages: ListMonsterImagesUseCase;
  readonly loadMonsterImage: LoadMonsterImageUseCase;
  readonly storageStatus: StorageStatus;
}
