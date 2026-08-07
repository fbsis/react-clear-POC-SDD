import type { MonsterDto } from '../dtos/MonsterDto';

export interface ListMonstersUseCase {
  execute(): Promise<readonly MonsterDto[]>;
}
