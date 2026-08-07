import { useContext } from 'react';
import { GameSessionContext } from '../contexts/GameSessionContext';
import type { GameSessionContextValue } from '../contexts/GameSessionContextValue';

export function useGameSession(): GameSessionContextValue {
  const session = useContext(GameSessionContext);
  if (!session) {
    throw new Error('useGameSession must be used inside GameSessionProvider.');
  }
  return session;
}
