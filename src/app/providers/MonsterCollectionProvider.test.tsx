import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import { ApplicationProvider } from './ApplicationProvider';
import { MonsterCollectionProvider } from './MonsterCollectionProvider';
import { useMonsterCollection } from '../hooks/useMonsterCollection';

describe('MonsterCollectionProvider', () => {
  it('hydrates on mount and refreshes after a successful registration', async () => {
    const listMonsters = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([monsterFixture()]);
    const application = createApplicationFake({ listMonsters: { execute: listMonsters } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApplicationProvider application={application}>
        <MonsterCollectionProvider>{children}</MonsterCollectionProvider>
      </ApplicationProvider>
    );
    const { result } = renderHook(() => useMonsterCollection(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    await act(() => {
      return result.current.registerMonster({
        name: 'Pyraxis',
        attack: 86,
        defense: 68,
        speed: 72,
        hp: 180,
        image: { kind: 'catalog', imageId: 'pyraxis' }
      });
    });

    expect(result.current.monsters).toEqual([monsterFixture()]);
    expect(listMonsters).toHaveBeenCalledTimes(2);
  });

  it('refreshes the projection after collection cleanup and complete database reset', async () => {
    const listMonsters = vi.fn().mockResolvedValueOnce([monsterFixture()]).mockResolvedValue([]);
    const clear = vi.fn().mockResolvedValue(undefined);
    const reset = vi.fn().mockResolvedValue(undefined);
    const application = createApplicationFake({
      listMonsters: { execute: listMonsters },
      clearMonsterCollection: { execute: clear },
      resetLocalDatabase: { execute: reset }
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApplicationProvider application={application}>
        <MonsterCollectionProvider>{children}</MonsterCollectionProvider>
      </ApplicationProvider>
    );
    const { result } = renderHook(() => useMonsterCollection(), { wrapper });
    await waitFor(() => {
      expect(result.current.monsters).toHaveLength(1);
    });

    await act(() => result.current.clearMonsters());
    expect(clear).toHaveBeenCalledOnce();
    expect(result.current.monsters).toEqual([]);

    await act(() => result.current.resetDatabase());
    expect(reset).toHaveBeenCalledOnce();
    expect(result.current.monsters).toEqual([]);
    expect(listMonsters).toHaveBeenCalledTimes(3);
  });
});

function createApplicationFake(overrides: Partial<Application> = {}): Application {
  return {
    registerMonster: { execute: vi.fn().mockResolvedValue(monsterFixture()) },
    clearMonsterCollection: { execute: vi.fn().mockResolvedValue(undefined) },
    listMonsters: { execute: vi.fn().mockResolvedValue([]) },
    listMonsterImages: {
      execute: vi.fn().mockResolvedValue([
        {
          id: 'pyraxis',
          name: 'Pyraxis',
          src: '/monster-catalog/pyraxis.webp',
          alt: 'Wyvern vermelho'
        }
      ])
    },
    loadMonsterImage: { execute: vi.fn() },
    startBattle: { execute: vi.fn() },
    resetLocalDatabase: { execute: vi.fn().mockResolvedValue(undefined) },
    storageStatus: { estimate: vi.fn(), requestPersistence: vi.fn() },
    ...overrides
  };
}

function monsterFixture() {
  return {
    id: 'monster-1',
    name: 'Pyraxis',
    attack: 86,
    defense: 68,
    speed: 72,
    hp: 180,
    image: { kind: 'catalog' as const, reference: 'pyraxis' }
  };
}
