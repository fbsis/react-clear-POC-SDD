import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { ApplicationProvider } from '@app/providers/ApplicationProvider';
import { MonsterCollectionContext } from '@app/contexts/MonsterCollectionContext';
import type { MonsterCollectionContextValue } from '@app/contexts/MonsterCollectionContextValue';
import { MonsterCollection } from './MonsterCollection';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('MonsterCollection', () => {
  it('shows a helpful empty state', () => {
    renderCollection([]);
    expect(screen.getByText(/ainda não há monstros/iu)).toBeVisible();
  });

  it('renders saved monster stats in a labelled article', () => {
    renderCollection([
      {
        id: 'monster-1',
        name: 'Pyraxis',
        attack: 86,
        defense: 68,
        speed: 72,
        hp: 180,
        image: { kind: 'catalog', reference: 'pyraxis' }
      }
    ]);

    expect(screen.getByRole('article', { name: 'Pyraxis' })).toBeVisible();
    expect(screen.getByText('86')).toBeVisible();
  });

  it('confirms and dispatches each cleanup intent separately', async () => {
    const clearMonsters = vi.fn().mockResolvedValue(undefined);
    const resetDatabase = vi.fn().mockResolvedValue(undefined);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderCollection([monsterFixture()], { clearMonsters, resetDatabase });

    fireEvent.click(screen.getByRole('button', { name: 'Limpar monstros convocados' }));
    await waitFor(() => {
      expect(clearMonsters).toHaveBeenCalledOnce();
    });
    expect(resetDatabase).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenLastCalledWith(expect.stringContaining('monstros convocados'));

    fireEvent.click(screen.getByRole('button', { name: 'Limpar todo o banco de dados' }));
    await waitFor(() => {
      expect(resetDatabase).toHaveBeenCalledOnce();
    });
    expect(confirm).toHaveBeenLastCalledWith(
      expect.stringContaining('todo o banco de dados local')
    );
  });

  it('does not clean local data when confirmation is declined', () => {
    const clearMonsters = vi.fn();
    const resetDatabase = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderCollection([monsterFixture()], { clearMonsters, resetDatabase });

    fireEvent.click(screen.getByRole('button', { name: 'Limpar monstros convocados' }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpar todo o banco de dados' }));

    expect(clearMonsters).not.toHaveBeenCalled();
    expect(resetDatabase).not.toHaveBeenCalled();
  });
});

function renderCollection(
  monsters: MonsterCollectionContextValue['monsters'],
  overrides: Partial<MonsterCollectionContextValue> = {}
): void {
  render(
    <ApplicationProvider application={applicationFake()}>
      <MonsterCollectionContext.Provider
        value={{
          monsters,
          images: [
            {
              id: 'pyraxis',
              name: 'Pyraxis',
              src: '/monster-catalog/pyraxis.webp',
              alt: 'Wyvern vermelho'
            }
          ],
          status: 'ready',
          error: null,
          registerMonster: vi.fn(),
          clearMonsters: vi.fn(),
          resetDatabase: vi.fn(),
          refresh: vi.fn(),
          ...overrides
        }}
      >
        <MonsterCollection />
      </MonsterCollectionContext.Provider>
    </ApplicationProvider>
  );
}

function monsterFixture(): MonsterDto {
  return {
    id: 'monster-1',
    name: 'Pyraxis',
    attack: 86,
    defense: 68,
    speed: 72,
    hp: 180,
    image: { kind: 'catalog', reference: 'pyraxis' }
  };
}

function applicationFake(): Application {
  return {
    registerMonster: { execute: vi.fn() },
    clearMonsterCollection: { execute: vi.fn() },
    listMonsters: { execute: vi.fn() },
    listMonsterImages: { execute: vi.fn() },
    loadMonsterImage: {
      execute: vi.fn().mockResolvedValue({
        kind: 'catalog',
        src: '/monster-catalog/pyraxis.webp',
        alt: 'Wyvern vermelho'
      })
    },
    startBattle: { execute: vi.fn() },
    resetLocalDatabase: { execute: vi.fn() },
    storageStatus: { estimate: vi.fn(), requestPersistence: vi.fn() }
  };
}
