import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import { ApplicationProvider } from './ApplicationProvider';
import { MonsterCollectionProvider } from './MonsterCollectionProvider';
import { useMonsterCollection } from '../hooks/useMonsterCollection';

describe('MonsterCollectionProvider', () => {
  it('hydrates on mount and refreshes after a successful registration', async () => {
    const listMonsters = vi.fn().mockResolvedValue([]);
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
    expect(result.current.status).toBe('ready');
    expect(listMonsters).toHaveBeenCalledOnce();
  });

  it('refreshes the projection after collection cleanup and complete database reset', async () => {
    const listMonsters = vi.fn().mockResolvedValue([monsterFixture()]);
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
    expect(listMonsters).toHaveBeenCalledOnce();
  });

  it('keeps stored monsters visible when catalog hydration fails', async () => {
    const application = createApplicationFake({
      listMonsters: { execute: vi.fn().mockResolvedValue([monsterFixture()]) },
      listMonsterImages: { execute: vi.fn().mockRejectedValue(new Error('Catalog unavailable')) }
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApplicationProvider application={application}>
        <MonsterCollectionProvider>{children}</MonsterCollectionProvider>
      </ApplicationProvider>
    );
    const { result } = renderHook(() => useMonsterCollection(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.monsters).toEqual([monsterFixture()]);
    expect(result.current.images).toEqual([]);
  });

  it('rejects a second collection command while registration is in progress', async () => {
    let finishRegistration: ((monster: ReturnType<typeof monsterFixture>) => void) | undefined;
    const pendingRegistration = new Promise<ReturnType<typeof monsterFixture>>((resolve) => {
      finishRegistration = resolve;
    });
    const application = createApplicationFake({
      registerMonster: { execute: vi.fn(() => pendingRegistration) }
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApplicationProvider application={application}>
        <MonsterCollectionProvider>{children}</MonsterCollectionProvider>
      </ApplicationProvider>
    );
    const { result } = renderHook(() => useMonsterCollection(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    let registration: Promise<void> | undefined;
    act(() => {
      registration = result.current.registerMonster({
        name: 'Pyraxis',
        attack: 86,
        defense: 68,
        speed: 72,
        hp: 180,
        image: { kind: 'catalog', imageId: 'pyraxis' }
      });
    });
    await waitFor(() => {
      expect(result.current.status).toBe('saving');
    });
    await expect(result.current.clearMonsters()).rejects.toMatchObject({
      code: 'OPERATION_IN_PROGRESS'
    });

    await act(async () => {
      finishRegistration?.(monsterFixture());
      await registration;
    });
    expect(result.current.monsters).toEqual([monsterFixture()]);
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
