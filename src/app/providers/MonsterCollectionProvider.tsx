import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CatalogImageDto } from '@application/monster/dtos/CatalogImageDto';
import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import type { RegisterMonsterInput } from '@application/monster/dtos/RegisterMonsterInput';
import { mapApplicationError } from '@application/shared/errors/mapApplicationError';
import { MonsterCollectionContext } from '../contexts/MonsterCollectionContext';
import type { MonsterCollectionContextValue } from '../contexts/MonsterCollectionContextValue';
import type { MonsterCollectionStatus } from '../contexts/MonsterCollectionStatus';
import { useApplication } from '../hooks/useApplication';
import type { MonsterCollectionProviderProps } from './MonsterCollectionProviderProps';

export function MonsterCollectionProvider({ children }: MonsterCollectionProviderProps) {
  const application = useApplication();
  const [monsters, setMonsters] = useState<readonly MonsterDto[]>([]);
  const [images, setImages] = useState<readonly CatalogImageDto[]>([]);
  const [status, setStatus] = useState<MonsterCollectionStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setStatus('loading');
    setError(null);
    try {
      const [storedMonsters, catalogImages] = await Promise.all([
        application.listMonsters.execute(),
        application.listMonsterImages.execute()
      ]);
      setMonsters(storedMonsters);
      setImages(catalogImages);
      setStatus('ready');
    } catch (cause) {
      setError(mapApplicationError(cause).message);
      setStatus('error');
    }
  }, [application]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [refresh]);

  const registerMonster = useCallback(
    async (input: RegisterMonsterInput): Promise<void> => {
      setStatus('saving');
      setError(null);
      try {
        if (input.image.kind === 'upload') {
          await application.storageStatus.requestPersistence();
        }
        await application.registerMonster.execute(input);
        await refresh();
      } catch (cause) {
        const mappedError = mapApplicationError(cause);
        setError(mappedError.message);
        setStatus('error');
        throw mappedError;
      }
    },
    [application, refresh]
  );

  const value = useMemo<MonsterCollectionContextValue>(
    () => ({ monsters, images, status, error, registerMonster, refresh }),
    [error, images, monsters, refresh, registerMonster, status]
  );

  return (
    <MonsterCollectionContext.Provider value={value}>{children}</MonsterCollectionContext.Provider>
  );
}
