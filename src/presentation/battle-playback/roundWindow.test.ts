import { describe, expect, it } from 'vitest';
import { createRoundWindow } from './roundWindow';

describe('createRoundWindow', () => {
  it('shows every marker for battles up to 200 rounds', () => {
    const model = createRoundWindow(200, 100);

    expect(model.visibleRoundNumbers).toHaveLength(200);
    expect(model.visibleRoundNumbers[0]).toBe(1);
    expect(model.visibleRoundNumbers[199]).toBe(200);
    expect(model.isWindowed).toBe(false);
  });

  it('centers a bounded marker window inside a 9,999 round battle', () => {
    const model = createRoundWindow(9_999, 5_000);

    expect(model.visibleRoundNumbers).toEqual([
      4996, 4997, 4998, 4999, 5000, 5001, 5002, 5003, 5004
    ]);
    expect(model.isWindowed).toBe(true);
    expect(model.activeRoundNumber).toBe(5_000);
  });

  it('clamps direct selection to valid round boundaries', () => {
    expect(createRoundWindow(9_999, -10).activeRoundNumber).toBe(1);
    expect(createRoundWindow(9_999, 20_000).activeRoundNumber).toBe(9_999);
  });
});
