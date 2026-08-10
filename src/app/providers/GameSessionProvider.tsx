import { useCallback, useMemo, useRef, useState } from 'react';
import type { BattleDto } from '@application/battle/dtos/BattleDto';
import type { AppScreen } from '../AppScreen';
import type { GameSessionStatus } from '../contexts/GameSessionStatus';
import { GameSessionContext } from '../contexts/GameSessionContext';
import type { GameSessionContextValue } from '../contexts/GameSessionContextValue';
import { useApplication } from '../hooks/useApplication';
import type { GameSessionProviderProps } from './GameSessionProviderProps';

export function GameSessionProvider({ children }: GameSessionProviderProps) {
  const application = useApplication();
  const [screen, setScreen] = useState<AppScreen>('registration');
  const [selectedMonsterIds, setSelectedMonsterIds] = useState<readonly string[]>([]);
  const [battle, setBattle] = useState<BattleDto | null>(null);
  const [status, setStatus] = useState<GameSessionStatus>('idle');
  const generation = useRef(0);

  const navigate = useCallback((nextScreen: AppScreen): void => {
    generation.current += 1;
    setStatus('idle');
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
      const battleGeneration = ++generation.current;
      setStatus('starting');
      try {
        const completedBattle = await application.startBattle.execute({
          firstMonsterId,
          secondMonsterId
        });
        if (battleGeneration !== generation.current) return;
        setSelectedMonsterIds([firstMonsterId, secondMonsterId]);
        setBattle(completedBattle);
        setScreen('battle');
      } finally {
        if (battleGeneration === generation.current) setStatus('idle');
      }
    },
    [application.startBattle]
  );
  const prepareNewBattle = useCallback((): void => {
    generation.current += 1;
    setStatus('idle');
    setBattle(null);
    setSelectedMonsterIds([]);
    setScreen('selection');
  }, []);
  const resetSession = useCallback((): void => {
    generation.current += 1;
    setStatus('idle');
    setBattle(null);
    setSelectedMonsterIds([]);
    setScreen('registration');
  }, []);

  const value = useMemo<GameSessionContextValue>(
    () => ({
      screen,
      selectedMonsterIds,
      battle,
      status,
      navigate,
      selectMonster,
      resetSelection,
      resetSession,
      startBattle,
      prepareNewBattle
    }),
    [
      battle,
      navigate,
      prepareNewBattle,
      resetSelection,
      resetSession,
      screen,
      selectMonster,
      selectedMonsterIds,
      status,
      startBattle
    ]
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}
