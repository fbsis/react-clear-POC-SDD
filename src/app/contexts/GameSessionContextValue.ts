import type { BattleDto } from '@application/battle/dtos/BattleDto';
import type { AppScreen } from '../AppScreen';
import type { GameSessionStatus } from './GameSessionStatus';

export interface GameSessionContextValue {
  readonly screen: AppScreen;
  readonly selectedMonsterIds: readonly string[];
  readonly battle: BattleDto | null;
  readonly status: GameSessionStatus;
  readonly navigate: (screen: AppScreen) => void;
  readonly selectMonster: (monsterId: string) => void;
  readonly resetSelection: () => void;
  readonly resetSession: () => void;
  readonly startBattle: (firstMonsterId: string, secondMonsterId: string) => Promise<void>;
  readonly prepareNewBattle: () => void;
}
