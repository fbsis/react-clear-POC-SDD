import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import type { ImageContentDto } from '@application/monster/dtos/ImageContentDto';
import type { MonsterImageReferenceDto } from '@application/monster/dtos/MonsterImageReferenceDto';
import type { MonsterCollectionContextValue } from '@app/contexts/MonsterCollectionContextValue';
import type { GameSessionContextValue } from '@app/contexts/GameSessionContextValue';
import { ApplicationContext } from '@app/contexts/ApplicationContext';
import { GameSessionContext } from '@app/contexts/GameSessionContext';
import { MonsterCollectionContext } from '@app/contexts/MonsterCollectionContext';
import { FighterSelectionPage } from './FighterSelectionPage';

afterEach(cleanup);

describe('FighterSelectionPage', () => {
  it('supports roving keyboard focus, preview, slots and battle handoff', async () => {
    const startBattle = vi.fn().mockResolvedValue(undefined);
    renderPage(startBattle);
    const user = userEvent.setup();
    const first = screen.getByRole('button', { name: 'Selecionar Pyraxis' });
    const second = screen.getByRole('button', { name: 'Selecionar Aeralune' });

    expect(first).toHaveAttribute('tabindex', '0');
    expect(second).toHaveAttribute('tabindex', '-1');
    first.focus();
    await user.keyboard('{ArrowRight}');

    expect(second).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Aeralune' })).toBeVisible();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('region', { name: 'Lutador 1' })).toHaveTextContent('Aeralune');

    await user.keyboard('{Home}{Enter}');
    expect(screen.getByRole('region', { name: 'Lutador 2' })).toHaveTextContent('Pyraxis');
    await user.click(screen.getByRole('button', { name: 'Iniciar batalha' }));

    await waitFor(() => {
      expect(startBattle).toHaveBeenCalledWith('monster-2', 'monster-1');
    });
  });

  it('rejects duplicate fighters without moving keyboard focus', async () => {
    renderPage(vi.fn());
    const user = userEvent.setup();
    const first = screen.getByRole('button', { name: 'Selecionar Pyraxis' });
    first.focus();

    await user.keyboard('{Enter}{Enter}');

    expect(first).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Escolha dois monstros diferentes.');
  });
});

function renderPage(startBattle: GameSessionContextValue['startBattle']) {
  return render(
    <ApplicationContext.Provider value={applicationFake()}>
      <MonsterCollectionContext.Provider value={collectionValue()}>
        <GameSessionContext.Provider value={sessionValue(startBattle)}>
          <FighterSelectionPage />
        </GameSessionContext.Provider>
      </MonsterCollectionContext.Provider>
    </ApplicationContext.Provider>
  );
}

function applicationFake(): Application {
  return {
    registerMonster: { execute: vi.fn() },
    clearMonsterCollection: { execute: vi.fn() },
    listMonsters: { execute: vi.fn() },
    listMonsterImages: { execute: vi.fn() },
    loadMonsterImage: {
      execute: vi.fn((reference: MonsterImageReferenceDto): Promise<ImageContentDto> =>
        Promise.resolve({
          kind: 'catalog',
          src: `/monster-catalog/${reference.reference}.webp`,
          alt: 'Retrato de monstro'
        })
      )
    },
    startBattle: { execute: vi.fn() },
    resetLocalDatabase: { execute: vi.fn() },
    storageStatus: { estimate: vi.fn(), requestPersistence: vi.fn() }
  };
}

function collectionValue(): MonsterCollectionContextValue {
  return {
    monsters: [
      monster('monster-1', 'Pyraxis', 'pyraxis'),
      monster('monster-2', 'Aeralune', 'aeralune')
    ],
    images: [],
    status: 'ready',
    error: null,
    registerMonster: vi.fn(),
    clearMonsters: vi.fn(),
    resetDatabase: vi.fn(),
    refresh: vi.fn()
  };
}

function sessionValue(
  startBattle: GameSessionContextValue['startBattle']
): GameSessionContextValue {
  return {
    screen: 'selection',
    selectedMonsterIds: [],
    battle: null,
    navigate: vi.fn(),
    selectMonster: vi.fn(),
    resetSelection: vi.fn(),
    startBattle,
    prepareNewBattle: vi.fn()
  };
}

function monster(id: string, name: string, reference: string) {
  return {
    id,
    name,
    attack: 80,
    defense: 60,
    speed: 70,
    hp: 160,
    image: { kind: 'catalog' as const, reference }
  };
}
