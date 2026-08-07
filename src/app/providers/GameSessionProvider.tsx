import { useCallback, useMemo, useState } from 'react';
import type { BattleDto } from '@application/battle/dtos/BattleDto';
import type { AppScreen } from '../AppScreen';
import { GameSessionContext } from '../contexts/GameSessionContext';
import type { GameSessionContextValue } from '../contexts/GameSessionContextValue';
import { useApplication } from '../hooks/useApplication';
import type { GameSessionProviderProps } from './GameSessionProviderProps';

export function GameSessionProvider({ children }: GameSessionProviderProps) {
  const application = useApplication();
  const [screen, setScreen] = useState<AppScreen>('registration');
  const [selectedMonsterIds, setSelectedMonsterIds] = useState<readonly string[]>([]);
  const [battle, setBattle] = useState<BattleDto | null>(null);

  const navigate = useCallback((nextScreen: AppScreen): void => {
    setScreen(nextScreen);
  }, []);
  const selectMonster = useCallback((monsterId: string): void => {
    setSelectedMonsterIds((current) =>
      current.includes(monsterId) || current.length === 2 ? current : [...current, monsterId]
    );
  }, []);
  const resetSelection = useCallback((): void => {
    setSelectedMonsterIds([]);
  }, []);
  const startBattle = useCallback(
    async (firstMonsterId: string, secondMonsterId: string): Promise<void> => {
      const completedBattle = await application.startBattle.execute({
        firstMonsterId,
        secondMonsterId
      });
      setSelectedMonsterIds([firstMonsterId, secondMonsterId]);
      setBattle(completedBattle);
      setScreen('battle');
    },
    [application.startBattle]
  );
  const clearBattle = useCallback((): void => {
    setBattle(null);
    setSelectedMonsterIds([]);
    setScreen('selection');
  }, []);

  const value = useMemo<GameSessionContextValue>(
    () => ({
      screen,
      selectedMonsterIds,
      battle,
      navigate,
      selectMonster,
      resetSelection,
      startBattle,
      clearBattle
    }),
    [
      battle,
      clearBattle,
      navigate,
      resetSelection,
      screen,
      selectMonster,
      selectedMonsterIds,
      startBattle
    ]
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}
