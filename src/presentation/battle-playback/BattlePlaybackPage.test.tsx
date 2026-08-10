import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import type { BattleDto } from '@application/battle/dtos/BattleDto';
import type { ImageContentDto } from '@application/monster/dtos/ImageContentDto';
import type { MonsterImageReferenceDto } from '@application/monster/dtos/MonsterImageReferenceDto';
import type { GameSessionContextValue } from '@app/contexts/GameSessionContextValue';
import { ApplicationContext } from '@app/contexts/ApplicationContext';
import { GameSessionContext } from '@app/contexts/GameSessionContext';
import { battleFixture, singleEventBattleFixture } from './battleFixture.test-support';
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

  it('makes every attack in the current round and the active action explicit', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(screen.getByText('Ação 1 de 2')).toBeVisible();
    const battleLog = screen.getByRole('region', { name: 'Log do round 1' });
    const firstAction = within(battleLog).getAllByRole('listitem')[0];
    const secondAction = within(battleLog).getAllByRole('listitem')[1];
    expect(firstAction).toHaveTextContent('Agora');
    expect(firstAction).toHaveTextContent('Pyraxis ataca Aeralune');
    expect(firstAction).toHaveTextContent('90 → 60 HP (-30)');
    expect(secondAction).toHaveTextContent('Próxima');
    expect(secondAction).toHaveTextContent('Aeralune atacará Pyraxis');
    expect(secondAction).toHaveTextContent('100 → 80 HP (-20)');

    await user.click(screen.getByRole('button', { name: 'Round 1 de 3' }));

    expect(screen.getByText('Ação 2 de 2')).toBeVisible();
    expect(firstAction).toHaveTextContent('Concluída');
    expect(firstAction).toHaveTextContent('Pyraxis atacou Aeralune');
    expect(secondAction).toHaveTextContent('Agora');
    expect(secondAction).toHaveTextContent('Aeralune ataca Pyraxis');
  });

  it('reveals a single-event result without leaving transient combat states active', async () => {
    renderPage(singleEventBattleFixture());
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(screen.getByRole('heading', { name: 'Teste 2 vence!' })).toBeVisible();
    expect(screen.queryByText('Atacando')).not.toBeInTheDocument();
    expect(screen.queryByText('Impacto')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pausar' })).not.toBeInTheDocument();
  });
});

function renderPage(battle = battleFixture()) {
  return render(
    <ApplicationContext.Provider value={applicationFake()}>
      <GameSessionContext.Provider value={sessionValue(battle)}>
        <BattlePlaybackPage />
      </GameSessionContext.Provider>
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

function sessionValue(battle: BattleDto): GameSessionContextValue {
  return {
    screen: 'battle',
    selectedMonsterIds: ['first', 'second'],
    battle,
    status: 'idle',
    navigate: vi.fn(),
    selectMonster: vi.fn(),
    resetSelection: vi.fn(),
    resetSession: vi.fn(),
    startBattle: vi.fn(),
    prepareNewBattle: vi.fn()
  };
}
