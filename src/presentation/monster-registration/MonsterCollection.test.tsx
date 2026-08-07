import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import { ApplicationProvider } from '@app/providers/ApplicationProvider';
import { MonsterCollectionContext } from '@app/contexts/MonsterCollectionContext';
import type { MonsterCollectionContextValue } from '@app/contexts/MonsterCollectionContextValue';
import { MonsterCollection } from './MonsterCollection';

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
});

function renderCollection(monsters: MonsterCollectionContextValue['monsters']): void {
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
          refresh: vi.fn()
        }}
      >
        <MonsterCollection />
      </MonsterCollectionContext.Provider>
    </ApplicationProvider>
  );
}

function applicationFake(): Application {
  return {
    registerMonster: { execute: vi.fn() },
    listMonsters: { execute: vi.fn() },
    listMonsterImages: { execute: vi.fn() },
    loadMonsterImage: {
      execute: vi.fn().mockResolvedValue({
        kind: 'catalog',
        src: '/monster-catalog/pyraxis.webp',
        alt: 'Wyvern vermelho'
      })
    },
    storageStatus: { estimate: vi.fn(), requestPersistence: vi.fn() }
  };
}
