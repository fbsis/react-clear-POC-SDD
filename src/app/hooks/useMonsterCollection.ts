import { useContext } from 'react';
import { MonsterCollectionContext } from '../contexts/MonsterCollectionContext';
import type { MonsterCollectionContextValue } from '../contexts/MonsterCollectionContextValue';

export function useMonsterCollection(): MonsterCollectionContextValue {
  const collection = useContext(MonsterCollectionContext);
  if (!collection) {
    throw new Error('useMonsterCollection must be used inside MonsterCollectionProvider.');
  }
  return collection;
}
