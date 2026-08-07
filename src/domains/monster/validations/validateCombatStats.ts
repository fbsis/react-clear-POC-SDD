import { InvalidCombatStatsError } from '../errors/InvalidCombatStatsError';

export function validateCombatStats(
  input: Readonly<{ attack: number; defense: number; speed: number; hp: number }>
): void {
  assertIntegerInRange('attack', input.attack, 0, 9_999);
  assertIntegerInRange('defense', input.defense, 0, 9_999);
  assertIntegerInRange('speed', input.speed, 0, 9_999);
  assertIntegerInRange('hp', input.hp, 1, 9_999);
}

function assertIntegerInRange(
  field: string,
  value: number,
  minimum: number,
  maximum: number
): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new InvalidCombatStatsError(field);
  }
}
