import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Application } from '@application/Application';
import { ApplicationContext } from '@app/contexts/ApplicationContext';
import { MonsterImage } from './MonsterImage';

afterEach(cleanup);

describe('MonsterImage', () => {
  it('shows a finite fallback when the image use case rejects', async () => {
    renderImage(vi.fn().mockRejectedValue(new Error('Missing image')));

    expect(await screen.findByText('Retrato indisponível para Pyraxis')).toBeVisible();
  });

  it('shows the same fallback when the browser cannot render the returned URL', async () => {
    renderImage(
      vi.fn().mockResolvedValue({
        kind: 'catalog',
        src: '/missing.webp',
        alt: 'Retrato'
      })
    );

    fireEvent.error(await screen.findByRole('img', { name: 'Retrato de Pyraxis' }));
    expect(screen.getByText('Retrato indisponível para Pyraxis')).toBeVisible();
  });
});

function renderImage(execute: Application['loadMonsterImage']['execute']): void {
  render(
    <ApplicationContext.Provider value={applicationFake(execute)}>
      <MonsterImage monsterName="Pyraxis" reference={{ kind: 'catalog', reference: 'pyraxis' }} />
    </ApplicationContext.Provider>
  );
}

function applicationFake(execute: Application['loadMonsterImage']['execute']): Application {
  return {
    registerMonster: { execute: vi.fn() },
    clearMonsterCollection: { execute: vi.fn() },
    listMonsters: { execute: vi.fn() },
    listMonsterImages: { execute: vi.fn() },
    loadMonsterImage: { execute },
    startBattle: { execute: vi.fn() },
    resetLocalDatabase: { execute: vi.fn() },
    storageStatus: { estimate: vi.fn(), requestPersistence: vi.fn() }
  };
}
