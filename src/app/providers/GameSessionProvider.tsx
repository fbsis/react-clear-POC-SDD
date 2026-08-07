import { useCallback, useMemo, useState } from 'react';
import type { AppScreen } from '../AppScreen';
import { GameSessionContext } from '../contexts/GameSessionContext';
import type { GameSessionContextValue } from '../contexts/GameSessionContextValue';
import type { GameSessionProviderProps } from './GameSessionProviderProps';

export function GameSessionProvider({ children }: GameSessionProviderProps) {
  const [screen, setScreen] = useState<AppScreen>('registration');
  const [selectedMonsterIds, setSelectedMonsterIds] = useState<readonly string[]>([]);

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

  const value = useMemo<GameSessionContextValue>(
    () => ({ screen, selectedMonsterIds, navigate, selectMonster, resetSelection }),
    [navigate, resetSelection, screen, selectMonster, selectedMonsterIds]
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}
