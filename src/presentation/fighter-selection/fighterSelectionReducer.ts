import type { FighterSelectionAction } from './FighterSelectionAction';
import type { FighterSelectionState } from './FighterSelectionState';

export function createInitialFighterSelectionState(
  focusedMonsterId: string | null
): FighterSelectionState {
  return {
    focusedMonsterId,
    activeSide: 'first',
    firstMonsterId: null,
    secondMonsterId: null,
    message: null
  };
}

export function fighterSelectionReducer(
  state: FighterSelectionState,
  action: FighterSelectionAction
): FighterSelectionState {
  switch (action.type) {
    case 'focus':
      return { ...state, focusedMonsterId: action.monsterId };
    case 'activate':
      return { ...state, activeSide: action.side, message: null };
    case 'remove':
      return {
        ...state,
        activeSide: action.side,
        firstMonsterId: action.side === 'first' ? null : state.firstMonsterId,
        secondMonsterId: action.side === 'second' ? null : state.secondMonsterId,
        message: null
      };
    case 'select': {
      const otherMonsterId =
        state.activeSide === 'first' ? state.secondMonsterId : state.firstMonsterId;
      if (otherMonsterId === action.monsterId) {
        return {
          ...state,
          focusedMonsterId: action.monsterId,
          message: 'Escolha dois monstros diferentes.'
        };
      }
      return {
        ...state,
        focusedMonsterId: action.monsterId,
        activeSide: state.activeSide === 'first' ? 'second' : 'second',
        firstMonsterId: state.activeSide === 'first' ? action.monsterId : state.firstMonsterId,
        secondMonsterId: state.activeSide === 'second' ? action.monsterId : state.secondMonsterId,
        message: null
      };
    }
  }
}
