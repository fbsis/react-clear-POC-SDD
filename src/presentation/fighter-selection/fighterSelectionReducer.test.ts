import { describe, expect, it } from 'vitest';
import {
  createInitialFighterSelectionState,
  fighterSelectionReducer
} from './fighterSelectionReducer';

describe('fighterSelectionReducer', () => {
  it('tracks focus without changing the active fighter side', () => {
    const state = fighterSelectionReducer(createInitialFighterSelectionState('one'), {
      type: 'focus',
      monsterId: 'two'
    });

    expect(state.focusedMonsterId).toBe('two');
    expect(state.activeSide).toBe('first');
  });

  it('fills both fighter slots in order and permits explicit side activation', () => {
    const first = fighterSelectionReducer(createInitialFighterSelectionState('one'), {
      type: 'select',
      monsterId: 'one'
    });
    const second = fighterSelectionReducer(first, { type: 'select', monsterId: 'two' });
    const reactivated = fighterSelectionReducer(second, { type: 'activate', side: 'first' });

    expect(second).toMatchObject({
      firstMonsterId: 'one',
      secondMonsterId: 'two',
      activeSide: 'second',
      message: null
    });
    expect(reactivated.activeSide).toBe('first');
  });

  it('rejects a duplicate while preserving focus and the existing selection', () => {
    const first = fighterSelectionReducer(createInitialFighterSelectionState('one'), {
      type: 'select',
      monsterId: 'one'
    });
    const duplicate = fighterSelectionReducer(first, { type: 'select', monsterId: 'one' });

    expect(duplicate).toMatchObject({
      focusedMonsterId: 'one',
      firstMonsterId: 'one',
      secondMonsterId: null,
      activeSide: 'second',
      message: 'Escolha dois monstros diferentes.'
    });
  });

  it('removes a fighter and makes its side active', () => {
    const first = fighterSelectionReducer(createInitialFighterSelectionState('one'), {
      type: 'select',
      monsterId: 'one'
    });
    const second = fighterSelectionReducer(first, { type: 'select', monsterId: 'two' });
    const removed = fighterSelectionReducer(second, { type: 'remove', side: 'first' });

    expect(removed).toMatchObject({
      firstMonsterId: null,
      secondMonsterId: 'two',
      activeSide: 'first',
      message: null
    });
  });
});
