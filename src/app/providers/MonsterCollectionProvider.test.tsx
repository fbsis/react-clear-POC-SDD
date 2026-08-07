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
});

function createApplicationFake(overrides: Partial<Application> = {}): Application {
  return {
    registerMonster: { execute: vi.fn().mockResolvedValue(monsterFixture()) },
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
