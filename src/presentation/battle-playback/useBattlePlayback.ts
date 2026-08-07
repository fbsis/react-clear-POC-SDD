import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { BattleDto } from '@application/battle/dtos/BattleDto';
import { createPlaybackState, playbackReducer } from './playbackReducer';

const EVENT_INTERVAL_MS = 3_000;

export function useBattlePlayback(battle: BattleDto) {
  const totalEvents = useMemo(
    () => battle.rounds.reduce((total, round) => total + round.events.length, 0),
    [battle.rounds]
  );
  const [state, dispatch] = useReducer(playbackReducer, totalEvents, createPlaybackState);

  useEffect(() => {
    dispatch({ type: 'load', totalEvents });
  }, [battle.id, totalEvents]);

  useEffect(() => {
    if (state.status !== 'playing' || state.eventIndex === state.totalEvents - 1) return;
    const generation = state.generation;
    const timeout = window.setTimeout(() => {
      dispatch({ type: 'tick', generation });
    }, EVENT_INTERVAL_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.eventIndex, state.generation, state.status, state.totalEvents]);

  const play = useCallback(() => {
    dispatch({ type: 'play' });
  }, []);
  const pause = useCallback(() => {
    dispatch({ type: 'pause' });
  }, []);
  const selectEvent = useCallback((eventIndex: number) => {
    dispatch({ type: 'select', eventIndex });
  }, []);

  return { state, play, pause, selectEvent } as const;
}
