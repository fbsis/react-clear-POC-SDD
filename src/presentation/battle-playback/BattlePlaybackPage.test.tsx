import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import type { ImageContentDto } from '@application/monster/dtos/ImageContentDto';
import type { MonsterImageReferenceDto } from '@application/monster/dtos/MonsterImageReferenceDto';
import type { GameSessionContextValue } from '@app/contexts/GameSessionContextValue';
import { ApplicationContext } from '@app/contexts/ApplicationContext';
import { GameSessionContext } from '@app/contexts/GameSessionContext';
import { battleFixture } from './battleFixture.test-support';
import { BattlePlaybackPage } from './BattlePlaybackPage';

afterEach(cleanup);

describe('BattlePlaybackPage', () => {
  it('renders semantic fighter cards, HP, timeline and textual effects', async () => {
    renderPage();
    const user = userEvent.setup();

    expect(screen.getByRole('article', { name: 'Pyraxis' })).toBeVisible();
    expect(screen.getByRole('article', { name: 'Aeralune' })).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Vida de Pyraxis' })).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
    expect(screen.getByRole('button', { name: 'Round 1 de 3' })).toHaveAttribute(
      'aria-current',
      'step'
    );

    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Round 1: Pyraxis atacou Aeralune, causando 30 de dano. Vida restante: 60.'
    );
    expect(screen.getByText('-30 HP')).toBeVisible();
  });

  it('supports round navigation and reveals the winner at the final event', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Round 3 de 3' }));

    expect(screen.getByText('Vencedor')).toBeVisible();
    expect(screen.getByText('Derrotado')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Pyraxis vence!' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Próximo round indisponível' })).toBeDisabled();
  });
});

function renderPage() {
  return render(
    <ApplicationContext.Provider value={applicationFake()}>
      <GameSessionContext.Provider value={sessionValue()}>
        <BattlePlaybackPage />
      </GameSessionContext.Provider>
    </ApplicationContext.Provider>
  );
}

function applicationFake(): Application {
  return {
    registerMonster: { execute: vi.fn() },
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
    storageStatus: { estimate: vi.fn(), requestPersistence: vi.fn() }
  };
}

function sessionValue(): GameSessionContextValue {
  return {
    screen: 'battle',
    selectedMonsterIds: ['first', 'second'],
    battle: battleFixture(),
    navigate: vi.fn(),
    selectMonster: vi.fn(),
    resetSelection: vi.fn(),
    startBattle: vi.fn(),
    prepareNewBattle: vi.fn()
  };
}
