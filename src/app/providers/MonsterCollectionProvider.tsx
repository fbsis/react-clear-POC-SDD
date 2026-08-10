import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogImageDto } from '@application/monster/dtos/CatalogImageDto';
import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import type { RegisterMonsterInput } from '@application/monster/dtos/RegisterMonsterInput';
import { mapApplicationError } from '@application/shared/errors/mapApplicationError';
import { ApplicationError } from '@application/shared/errors/ApplicationError';
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
  const operationInProgress = useRef(false);
  const generation = useRef(0);

  const refresh = useCallback(async (): Promise<void> => {
    if (operationInProgress.current) return;
    const refreshGeneration = ++generation.current;
    setStatus('loading');
    setError(null);
    const [monstersResult, imagesResult] = await Promise.allSettled([
      application.listMonsters.execute(),
      application.listMonsterImages.execute()
    ]);
    if (refreshGeneration !== generation.current) return;

    if (monstersResult.status === 'fulfilled') setMonsters(monstersResult.value);
    if (imagesResult.status === 'fulfilled') setImages(imagesResult.value);
    const failure: unknown =
      monstersResult.status === 'rejected'
        ? monstersResult.reason
        : imagesResult.status === 'rejected'
          ? imagesResult.reason
          : null;
    if (failure) {
      setError(mapApplicationError(failure).message);
      setStatus('error');
      return;
    }
    setStatus('ready');
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
      assertOperationAvailable(operationInProgress.current);
      operationInProgress.current = true;
      const commandGeneration = ++generation.current;
      setStatus('saving');
      setError(null);
      try {
        if (input.image.kind === 'upload') {
          await application.storageStatus.requestPersistence();
        }
        const registeredMonster = await application.registerMonster.execute(input);
        if (commandGeneration !== generation.current) return;
        setMonsters((current) => sortMonsters([...current, registeredMonster]));
        setStatus('ready');
      } catch (cause) {
        const mappedError = mapApplicationError(cause);
        if (commandGeneration === generation.current) {
          setError(mappedError.message);
          setStatus('error');
        }
        throw mappedError;
      } finally {
        operationInProgress.current = false;
      }
    },
    [application]
  );

  const runCleanup = useCallback(async (operation: () => Promise<void>): Promise<void> => {
    assertOperationAvailable(operationInProgress.current);
    operationInProgress.current = true;
    const commandGeneration = ++generation.current;
    setStatus('clearing');
    setError(null);
    try {
      await operation();
      if (commandGeneration !== generation.current) return;
      setMonsters([]);
      setStatus('ready');
    } catch (cause) {
      const mappedError = mapApplicationError(cause);
      if (commandGeneration === generation.current) {
        setError(mappedError.message);
        setStatus('error');
      }
      throw mappedError;
    } finally {
      operationInProgress.current = false;
    }
  }, []);

  const clearMonsters = useCallback(
    (): Promise<void> => runCleanup(() => application.clearMonsterCollection.execute()),
    [application.clearMonsterCollection, runCleanup]
  );

  const resetDatabase = useCallback(
    (): Promise<void> => runCleanup(() => application.resetLocalDatabase.execute()),
    [application.resetLocalDatabase, runCleanup]
  );

  const value = useMemo<MonsterCollectionContextValue>(
    () => ({
      monsters,
      images,
      status,
      error,
      registerMonster,
      clearMonsters,
      resetDatabase,
      refresh
    }),
    [clearMonsters, error, images, monsters, refresh, registerMonster, resetDatabase, status]
  );

  return (
    <MonsterCollectionContext.Provider value={value}>{children}</MonsterCollectionContext.Provider>
  );
}

function assertOperationAvailable(operationInProgress: boolean): void {
  if (operationInProgress) {
    throw new ApplicationError(
      'OPERATION_IN_PROGRESS',
      'Aguarde a operação atual terminar antes de iniciar outra.'
    );
  }
}

function sortMonsters(monsters: readonly MonsterDto[]): readonly MonsterDto[] {
  return [...monsters].sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
}
