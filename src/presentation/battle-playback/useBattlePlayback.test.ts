import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { battleFixture, singleEventBattleFixture } from './battleFixture.test-support';
import { useBattlePlayback } from './useBattlePlayback';

describe('useBattlePlayback', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('shows event zero immediately and advances exactly at 3,000 ms', () => {
    const { result } = renderHook(() => useBattlePlayback(battleFixture()));

    act(() => {
      result.current.play();
    });
    expect(result.current.state.eventIndex).toBe(0);
    act(() => {
      vi.advanceTimersByTime(2_999);
    });
    expect(result.current.state.eventIndex).toBe(0);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.state.eventIndex).toBe(1);
  });

  it('finishes a single-event battle immediately without scheduling a timer', () => {
    const { result } = renderHook(() => useBattlePlayback(singleEventBattleFixture()));
    const baselineTimerCount = vi.getTimerCount();

    act(() => {
      result.current.play();
    });

    expect(result.current.state).toMatchObject({ status: 'complete', eventIndex: 0 });
    expect(vi.getTimerCount()).toBe(baselineTimerCount);
  });

  it('cancels pending work after manual selection, restart and unmount', () => {
    const { result, unmount } = renderHook(() => useBattlePlayback(battleFixture()));
    const baselineTimerCount = vi.getTimerCount();
    act(() => {
      result.current.play();
    });
    expect(vi.getTimerCount()).toBe(baselineTimerCount + 1);

    act(() => {
      result.current.selectEvent(3);
    });
    expect(vi.getTimerCount()).toBe(baselineTimerCount);
    act(() => {
      result.current.play();
    });
    expect(result.current.state.eventIndex).toBe(0);
    expect(vi.getTimerCount()).toBe(baselineTimerCount + 1);

    unmount();
    expect(vi.getTimerCount()).toBe(baselineTimerCount);
  });
});
