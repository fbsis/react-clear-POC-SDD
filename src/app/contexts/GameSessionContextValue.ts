import type { AppScreen } from '../AppScreen';

export interface GameSessionContextValue {
  readonly screen: AppScreen;
  readonly selectedMonsterIds: readonly string[];
  readonly navigate: (screen: AppScreen) => void;
  readonly selectMonster: (monsterId: string) => void;
  readonly resetSelection: () => void;
}
