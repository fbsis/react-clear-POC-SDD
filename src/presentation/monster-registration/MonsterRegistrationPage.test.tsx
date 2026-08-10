import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MonsterCollectionContext } from '@app/contexts/MonsterCollectionContext';
import type { MonsterCollectionContextValue } from '@app/contexts/MonsterCollectionContextValue';
import { MonsterRegistrationPage } from './MonsterRegistrationPage';

afterEach(cleanup);

describe('MonsterRegistrationPage', () => {
  it('submits a keyboard-accessible catalog registration form', async () => {
    const registerMonster = vi.fn().mockResolvedValue(undefined);
    render(
      <MonsterCollectionContext.Provider value={contextValue(registerMonster)}>
        <MonsterRegistrationPage />
      </MonsterCollectionContext.Provider>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nome'), 'Pyraxis');
    await user.type(screen.getByLabelText('Ataque'), '86');
    await user.type(screen.getByLabelText('Defesa'), '68');
    await user.type(screen.getByLabelText('Velocidade'), '72');
    await user.type(screen.getByLabelText('Vida'), '180');
    await user.click(screen.getByRole('radio', { name: /Pyraxis/u }));
    await user.click(screen.getByRole('button', { name: 'Guardar monstro' }));

    expect(registerMonster).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Pyraxis', image: { kind: 'catalog', imageId: 'pyraxis' } })
    );
    expect(screen.getByRole('status')).toHaveTextContent('Pyraxis entrou para a coleção.');
  });

  it('keeps form data and handles a rejected registration without false success', async () => {
    const registerMonster = vi.fn().mockRejectedValue(new Error('storage unavailable'));
    render(
      <MonsterCollectionContext.Provider
        value={{ ...contextValue(registerMonster), error: 'Não foi possível guardar o monstro.' }}
      >
        <MonsterRegistrationPage />
      </MonsterCollectionContext.Provider>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nome'), 'Pyraxis');
    await user.type(screen.getByLabelText('Ataque'), '86');
    await user.type(screen.getByLabelText('Defesa'), '68');
    await user.type(screen.getByLabelText('Velocidade'), '72');
    await user.type(screen.getByLabelText('Vida'), '180');
    await user.click(screen.getByRole('button', { name: 'Guardar monstro' }));

    expect(registerMonster).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Nome')).toHaveValue('Pyraxis');
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível guardar o monstro.');
    expect(screen.queryByText('Pyraxis entrou para a coleção.')).not.toBeInTheDocument();
  });

  it('shows an actionable error when the selected upload cannot be read', async () => {
    const registerMonster = vi.fn();
    render(
      <MonsterCollectionContext.Provider value={contextValue(registerMonster)}>
        <MonsterRegistrationPage />
      </MonsterCollectionContext.Provider>
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Minha imagem' }));
    const form = screen.getByRole('button', { name: 'Guardar monstro' }).closest('form');
    if (!form) throw new Error('Registration form was not found.');
    fireEvent.submit(form);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível ler a imagem escolhida. Selecione outro arquivo.'
    );
    expect(registerMonster).not.toHaveBeenCalled();
  });
});

function contextValue(
  registerMonster: MonsterCollectionContextValue['registerMonster']
): MonsterCollectionContextValue {
  return {
    monsters: [],
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
    registerMonster,
    clearMonsters: vi.fn(),
    resetDatabase: vi.fn(),
    refresh: vi.fn()
  };
}
