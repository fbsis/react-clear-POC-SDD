import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import { useGameSession } from '@app/hooks/useGameSession';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';
import { ApplicationProvider } from '@app/providers/ApplicationProvider';
import { GameSessionProvider } from '@app/providers/GameSessionProvider';
import { MonsterCollectionProvider } from '@app/providers/MonsterCollectionProvider';

describe('Context render isolation', () => {
  it('updates session and collection consumers independently', async () => {
    const collectionRendered = vi.fn();
    const sessionRendered = vi.fn();

    render(
      <Providers>
        <CollectionProbe onCommit={collectionRendered} />
        <SessionProbe onCommit={sessionRendered} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Atualizar coleção ready' })).toBeVisible();
      expect(collectionRendered).toHaveBeenCalledTimes(2);
    });

    const collectionRendersBeforeSessionUpdate = collectionRendered.mock.calls.length;
    const sessionRendersBeforeSessionUpdate = sessionRendered.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: 'Ir para seleção registration' }));

    await waitFor(() => {
      expect(sessionRendered.mock.calls.length).toBe(sessionRendersBeforeSessionUpdate + 1);
    });
    expect(collectionRendered).toHaveBeenCalledTimes(collectionRendersBeforeSessionUpdate);

    const sessionRendersBeforeCollectionUpdate = sessionRendered.mock.calls.length;
    const collectionRendersBeforeCollectionUpdate = collectionRendered.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: 'Atualizar coleção ready' }));
    await waitFor(() => {
      expect(collectionRendered.mock.calls.length).toBeGreaterThan(
        collectionRendersBeforeCollectionUpdate
      );
    });

    expect(sessionRendered).toHaveBeenCalledTimes(sessionRendersBeforeCollectionUpdate);
  });
});

function CollectionProbe({ onCommit }: { readonly onCommit: () => void }) {
  const { refresh, status } = useMonsterCollection();
  useEffect(() => {
    onCommit();
  });
  return (
    <button
      type="button"
      onClick={() => {
        void refresh();
      }}
    >
      Atualizar coleção {status}
    </button>
  );
}

function SessionProbe({ onCommit }: { readonly onCommit: () => void }) {
  const { navigate, screen: currentScreen } = useGameSession();
  useEffect(() => {
    onCommit();
  });
  return (
    <button
      type="button"
      onClick={() => {
        navigate('selection');
      }}
    >
      Ir para seleção {currentScreen}
    </button>
  );
}

function Providers({ children }: PropsWithChildren) {
  return (
    <ApplicationProvider application={applicationFake()}>
      <MonsterCollectionProvider>
        <GameSessionProvider>{children}</GameSessionProvider>
      </MonsterCollectionProvider>
    </ApplicationProvider>
  );
}

function applicationFake(): Application {
  return {
    registerMonster: { execute: vi.fn() },
    listMonsters: { execute: vi.fn().mockImplementation(() => Promise.resolve([])) },
    listMonsterImages: { execute: vi.fn().mockImplementation(() => Promise.resolve([])) },
    loadMonsterImage: { execute: vi.fn() },
    startBattle: { execute: vi.fn() },
    storageStatus: { estimate: vi.fn(), requestPersistence: vi.fn() }
  };
}
