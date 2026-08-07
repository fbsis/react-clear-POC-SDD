import type { BattleDto } from '../dtos/BattleDto';
import type { StartBattleInput } from '../dtos/StartBattleInput';

export interface StartBattleUseCase {
  execute(input: StartBattleInput): Promise<BattleDto>;
}
