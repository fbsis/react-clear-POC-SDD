import { InvalidBattleSequenceError } from '../errors/InvalidBattleSequenceError';

export function validateAttackEvent(
  input: Readonly<{
    sequence: number;
    roundNumber: number;
    attackerId: string;
    defenderId: string;
    damage: number;
    defenderHpBefore: number;
    defenderHpAfter: number;
  }>
): readonly [string, string] {
  const attackerId = input.attackerId.trim();
  const defenderId = input.defenderId.trim();
  const expectedHpAfter = Math.max(input.defenderHpBefore - input.damage, 0);
  const valid =
    Number.isInteger(input.sequence) &&
    input.sequence >= 0 &&
    Number.isInteger(input.roundNumber) &&
    input.roundNumber >= 1 &&
    attackerId.length > 0 &&
    defenderId.length > 0 &&
    attackerId !== defenderId &&
    Number.isInteger(input.damage) &&
    input.damage >= 1 &&
    Number.isInteger(input.defenderHpBefore) &&
    input.defenderHpBefore >= 1 &&
    Number.isInteger(input.defenderHpAfter) &&
    input.defenderHpAfter === expectedHpAfter;

  if (!valid) {
    throw new InvalidBattleSequenceError('Attack event contains an invalid HP transition.');
  }

  return Object.freeze([attackerId, defenderId]);
}
