import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MonsterCollectionContext } from '@app/contexts/MonsterCollectionContext';
import type { MonsterCollectionContextValue } from '@app/contexts/MonsterCollectionContextValue';
import { MonsterRegistrationPage } from './MonsterRegistrationPage';

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
    refresh: vi.fn()
  };
}
