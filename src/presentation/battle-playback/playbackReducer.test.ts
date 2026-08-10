import { describe, expect, it } from 'vitest';
import { createPlaybackState, playbackReducer } from './playbackReducer';

describe('playbackReducer', () => {
  it('loads a battle into a ready state and starts immediately at event zero', () => {
    const loaded = playbackReducer(createPlaybackState(0), { type: 'load', totalEvents: 3 });
    const playing = playbackReducer(loaded, { type: 'play' });

    expect(loaded).toMatchObject({ status: 'ready', eventIndex: null, totalEvents: 3 });
    expect(playing).toMatchObject({ status: 'playing', eventIndex: 0, generation: 2 });
  });

  it('completes immediately when event zero is also the final event', () => {
    const state = playbackReducer(createPlaybackState(1), { type: 'play' });

    expect(state).toMatchObject({ status: 'complete', eventIndex: 0, totalEvents: 1 });
  });

  it('ignores stale ticks after restart and advances a current generation', () => {
    const initial = playbackReducer(createPlaybackState(3), { type: 'play' });
    const restarted = playbackReducer(initial, { type: 'play' });
    const stale = playbackReducer(restarted, { type: 'tick', generation: initial.generation });
    const current = playbackReducer(restarted, {
      type: 'tick',
      generation: restarted.generation
    });

    expect(stale).toBe(restarted);
    expect(current.eventIndex).toBe(1);
    expect(current.status).toBe('playing');
  });

  it('invalidates playback on manual selection and marks the last event complete', () => {
    const playing = playbackReducer(createPlaybackState(3), { type: 'play' });
    const paused = playbackReducer(playing, { type: 'select', eventIndex: 1 });
    const complete = playbackReducer(paused, { type: 'select', eventIndex: 2 });

    expect(paused).toMatchObject({ status: 'paused', eventIndex: 1 });
    expect(paused.generation).toBeGreaterThan(playing.generation);
    expect(complete).toMatchObject({ status: 'complete', eventIndex: 2 });
  });

  it('completes when a current tick reaches the final event and pauses explicitly', () => {
    const playing = playbackReducer(createPlaybackState(2), { type: 'play' });
    const complete = playbackReducer(playing, {
      type: 'tick',
      generation: playing.generation
    });
    const paused = playbackReducer(complete, { type: 'pause' });

    expect(complete).toMatchObject({ status: 'complete', eventIndex: 1 });
    expect(paused.status).toBe('paused');
  });
});
