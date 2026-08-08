import type { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import type { BattleDto } from '@application/battle/dtos/BattleDto';
import { useGameSession } from '../hooks/useGameSession';
import { ApplicationProvider } from './ApplicationProvider';
import { GameSessionProvider } from './GameSessionProvider';

describe('GameSessionProvider', () => {
  it('starts a battle through the injected use case and owns the completed session DTO', async () => {
    const battle = battleFixture();
    const execute = vi.fn().mockResolvedValue(battle);
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApplicationProvider application={applicationFake(execute)}>
        <GameSessionProvider>{children}</GameSessionProvider>
      </ApplicationProvider>
    );
    const { result } = renderHook(() => useGameSession(), { wrapper });

    await act(() => result.current.startBattle('first', 'second'));

    expect(execute).toHaveBeenCalledWith({
      firstMonsterId: 'first',
      secondMonsterId: 'second'
    });
    expect(result.current.screen).toBe('battle');
    expect(result.current.selectedMonsterIds).toEqual(['first', 'second']);
    expect(result.current.battle).toBe(battle);

    act(() => {
      result.current.prepareNewBattle();
    });

    expect(result.current.screen).toBe('selection');
    expect(result.current.battle).toBeNull();
  });
});

function applicationFake(execute: Application['startBattle']['execute']): Application {
  return {
    registerMonster: { execute: vi.fn() },
    clearMonsterCollection: { execute: vi.fn() },
    listMonsters: { execute: vi.fn().mockResolvedValue([]) },
    listMonsterImages: { execute: vi.fn().mockResolvedValue([]) },
    loadMonsterImage: { execute: vi.fn() },
    startBattle: { execute },
    resetLocalDatabase: { execute: vi.fn() },
    storageStatus: { estimate: vi.fn(), requestPersistence: vi.fn() }
  };
}

function battleFixture(): BattleDto {
  const first = monsterFixture('first');
  const second = monsterFixture('second');
  return {
    id: 'first:second',
    fighters: [first, second],
    attackOrder: ['first', 'second'],
    rounds: [
      {
        number: 1,
        startingHp: { first: 10, second: 5 },
        events: [
          {
            sequence: 0,
            roundNumber: 1,
            attackerId: 'first',
            defenderId: 'second',
            damage: 5,
            defenderHpBefore: 5,
            defenderHpAfter: 0,
            defeated: true
          }
        ],
        endingHp: { first: 10, second: 0 }
      }
    ],
    winnerId: 'first',
    loserId: 'second',
    finalRoundNumber: 1,
    finalEventSequence: 0
  };
}

function monsterFixture(id: string) {
  return {
    id,
    name: id,
    attack: 5,
    defense: 0,
    speed: 5,
    hp: 10,
    image: { kind: 'catalog' as const, reference: id }
  };
}
