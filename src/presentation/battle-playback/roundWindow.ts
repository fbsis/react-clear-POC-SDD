import type { RoundWindowModel } from './RoundWindowModel';

const FULL_TIMELINE_LIMIT = 200;
const WINDOW_SIZE = 9;

export function createRoundWindow(
  totalRounds: number,
  requestedActiveRoundNumber: number
): RoundWindowModel {
  const safeTotalRounds = Math.max(1, totalRounds);
  const activeRoundNumber = Math.min(Math.max(1, requestedActiveRoundNumber), safeTotalRounds);
  if (safeTotalRounds <= FULL_TIMELINE_LIMIT) {
    return {
      activeRoundNumber,
      totalRounds: safeTotalRounds,
      visibleRoundNumbers: createRange(1, safeTotalRounds),
      isWindowed: false
    };
  }

  const halfWindow = Math.floor(WINDOW_SIZE / 2);
  const start = Math.min(
    Math.max(1, activeRoundNumber - halfWindow),
    safeTotalRounds - WINDOW_SIZE + 1
  );
  return {
    activeRoundNumber,
    totalRounds: safeTotalRounds,
    visibleRoundNumbers: createRange(start, start + WINDOW_SIZE - 1),
    isWindowed: true
  };
}

function createRange(start: number, end: number): readonly number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
