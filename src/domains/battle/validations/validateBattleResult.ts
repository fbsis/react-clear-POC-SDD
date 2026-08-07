import { InvalidBattleError } from '../errors/InvalidBattleError';

export function validateBattleResult(
  input: Readonly<{
    winnerId: string;
    loserId: string;
    finalRoundNumber: number;
    finalEventSequence: number;
  }>
): readonly [string, string] {
  const winnerId = input.winnerId.trim();
  const loserId = input.loserId.trim();
  if (
    !winnerId ||
    !loserId ||
    winnerId === loserId ||
    !Number.isInteger(input.finalRoundNumber) ||
    input.finalRoundNumber < 1 ||
    !Number.isInteger(input.finalEventSequence) ||
    input.finalEventSequence < 0
  ) {
    throw new InvalidBattleError('Battle result is invalid.');
  }

  return Object.freeze([winnerId, loserId]);
}
