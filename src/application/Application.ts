import type { StartBattleUseCase } from './battle/contracts/StartBattleUseCase';
import type { ClearMonsterCollectionUseCase } from './monster/contracts/ClearMonsterCollectionUseCase';
import type { ListMonsterImagesUseCase } from './monster/contracts/ListMonsterImagesUseCase';
import type { ListMonstersUseCase } from './monster/contracts/ListMonstersUseCase';
import type { LoadMonsterImageUseCase } from './monster/contracts/LoadMonsterImageUseCase';
import type { RegisterMonsterUseCase } from './monster/contracts/RegisterMonsterUseCase';
import type { ResetLocalDatabaseUseCase } from './shared/contracts/ResetLocalDatabaseUseCase';
import type { StorageStatus } from './shared/ports/StorageStatus';

export interface Application {
  readonly registerMonster: RegisterMonsterUseCase;
  readonly clearMonsterCollection: ClearMonsterCollectionUseCase;
  readonly listMonsters: ListMonstersUseCase;
  readonly listMonsterImages: ListMonsterImagesUseCase;
  readonly loadMonsterImage: LoadMonsterImageUseCase;
  readonly startBattle: StartBattleUseCase;
  readonly resetLocalDatabase: ResetLocalDatabaseUseCase;
  readonly storageStatus: StorageStatus;
}
