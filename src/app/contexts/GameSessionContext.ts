import { createContext } from 'react';
import type { GameSessionContextValue } from './GameSessionContextValue';

export const GameSessionContext = createContext<GameSessionContextValue | undefined>(undefined);
