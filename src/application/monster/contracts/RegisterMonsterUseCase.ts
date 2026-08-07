import type { MonsterDto } from '../dtos/MonsterDto';
import type { RegisterMonsterInput } from '../dtos/RegisterMonsterInput';

export interface RegisterMonsterUseCase {
  execute(input: RegisterMonsterInput): Promise<MonsterDto>;
}
