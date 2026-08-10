import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { MonsterCollectionContext } from '@app/contexts/MonsterCollectionContext';
import type { MonsterCollectionContextValue } from '@app/contexts/MonsterCollectionContextValue';
import { LocalDataManager } from './LocalDataManager';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('LocalDataManager', () => {
  it('uses an icon-only accessible trigger and a labelled modal', () => {
    renderManager();

    const trigger = screen.getByRole('button', { name: 'Gerenciar dados locais' });
    expect(trigger).toHaveTextContent('');
    expect(trigger.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('dialog', { name: 'Gerenciar coleção' })).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Gerenciar coleção' })).toHaveTextContent(
      'Escolha entre dispensar a companhia atual ou reiniciar todo o banco deste navegador.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog', { name: 'Gerenciar coleção' })).not.toBeInTheDocument();
  });

  it('confirms and dispatches each cleanup intent separately', async () => {
    const clearMonsters = vi.fn().mockResolvedValue(undefined);
    const resetDatabase = vi.fn().mockResolvedValue(undefined);
    const onDataCleared = vi.fn();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderManager({ clearMonsters, resetDatabase }, onDataCleared);

    openDataDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar monstros convocados' }));
    await waitFor(() => {
      expect(clearMonsters).toHaveBeenCalledOnce();
    });
    expect(resetDatabase).not.toHaveBeenCalled();
    expect(onDataCleared).toHaveBeenCalledOnce();
    expect(confirm).toHaveBeenLastCalledWith(expect.stringContaining('monstros convocados'));

    openDataDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar todo o banco de dados' }));
    await waitFor(() => {
      expect(resetDatabase).toHaveBeenCalledOnce();
    });
    expect(onDataCleared).toHaveBeenCalledTimes(2);
    expect(confirm).toHaveBeenLastCalledWith(
      expect.stringContaining('todo o banco de dados local')
    );
  });

  it('does not clean local data when confirmation is declined', () => {
    const clearMonsters = vi.fn();
    const resetDatabase = vi.fn();
    const onDataCleared = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderManager({ clearMonsters, resetDatabase }, onDataCleared);

    openDataDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar monstros convocados' }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpar todo o banco de dados' }));

    expect(clearMonsters).not.toHaveBeenCalled();
    expect(resetDatabase).not.toHaveBeenCalled();
    expect(onDataCleared).not.toHaveBeenCalled();
  });

  it('keeps the modal open and explains a cleanup failure', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderManager({ clearMonsters: vi.fn().mockRejectedValue(new Error('Banco indisponível.')) });

    openDataDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar monstros convocados' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Banco indisponível.');
    expect(screen.getByRole('dialog', { name: 'Gerenciar coleção' })).toBeVisible();
  });

  it('dismisses a successful database cleanup message after four seconds', async () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderManager({ resetDatabase: vi.fn().mockResolvedValue(undefined) });

    openDataDialog();
    await act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Limpar todo o banco de dados' }));
      return Promise.resolve();
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      'O banco de dados local foi limpo e recriado vazio.'
    );

    act(() => {
      vi.advanceTimersByTime(4_000);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

function openDataDialog(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Gerenciar dados locais' }));
}

function renderManager(
  overrides: Partial<MonsterCollectionContextValue> = {},
  onDataCleared = vi.fn()
): void {
  render(
    <MonsterCollectionContext.Provider
      value={{
        monsters: [monsterFixture()],
        images: [],
        status: 'ready',
        error: null,
        registerMonster: vi.fn(),
        clearMonsters: vi.fn(),
        resetDatabase: vi.fn(),
        refresh: vi.fn(),
        ...overrides
      }}
    >
      <LocalDataManager disabled={false} onDataCleared={onDataCleared} />
    </MonsterCollectionContext.Provider>
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
