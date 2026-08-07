import type { PlaybackAction } from './PlaybackAction';
import type { PlaybackState } from './PlaybackState';

export function createPlaybackState(totalEvents: number): PlaybackState {
  return {
    status: 'ready',
    eventIndex: null,
    totalEvents: Math.max(0, totalEvents),
    generation: 0
  };
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'load':
      return {
        status: 'ready',
        eventIndex: null,
        totalEvents: Math.max(0, action.totalEvents),
        generation: state.generation + 1
      };
    case 'play':
      return {
        ...state,
        status: state.totalEvents === 0 ? 'complete' : 'playing',
        eventIndex: state.totalEvents === 0 ? null : 0,
        generation: state.generation + 1
      };
    case 'tick': {
      if (action.generation !== state.generation || state.status !== 'playing') return state;
      const nextEventIndex = Math.min((state.eventIndex ?? -1) + 1, state.totalEvents - 1);
      return {
        ...state,
        status: nextEventIndex === state.totalEvents - 1 ? 'complete' : 'playing',
        eventIndex: nextEventIndex
      };
    }
    case 'select': {
      if (state.totalEvents === 0) return state;
      const eventIndex = Math.min(Math.max(0, action.eventIndex), state.totalEvents - 1);
      return {
        ...state,
        status: eventIndex === state.totalEvents - 1 ? 'complete' : 'paused',
        eventIndex,
        generation: state.generation + 1
      };
    }
    case 'pause':
      return {
        ...state,
        status: 'paused',
        generation: state.generation + 1
      };
  }
}
