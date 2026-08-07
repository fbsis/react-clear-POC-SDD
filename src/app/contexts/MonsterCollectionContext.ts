import { createContext } from 'react';
import type { MonsterCollectionContextValue } from './MonsterCollectionContextValue';

export const MonsterCollectionContext = createContext<MonsterCollectionContextValue | undefined>(
  undefined
);
