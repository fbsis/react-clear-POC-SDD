import { InvalidBattleSequenceError } from '../errors/InvalidBattleSequenceError';
import type { AttackEvent } from '../value-objects/AttackEvent';

export function validateRound(
  input: Readonly<{
    number: number;
    startingHp: Readonly<Record<string, number>>;
    events: readonly AttackEvent[];
    endingHp: Readonly<Record<string, number>>;
  }>
): void {
  if (!Number.isInteger(input.number) || input.number < 1 || input.events.length < 1) {
    throw new InvalidBattleSequenceError('Round number and events are invalid.');
  }
  if (input.events.length > 2) {
    throw new InvalidBattleSequenceError('A round contains at most two attacks.');
  }

  const fighterIds = Object.keys(input.startingHp);
  if (fighterIds.length !== 2 || !sameKeys(input.startingHp, input.endingHp)) {
    throw new InvalidBattleSequenceError('Round HP must describe exactly two fighters.');
  }

  const currentHp = { ...input.startingHp };
  for (const [eventIndex, event] of input.events.entries()) {
    if (
      event.roundNumber !== input.number ||
      currentHp[event.defenderId] !== event.defenderHpBefore ||
      currentHp[event.attackerId] === undefined ||
      (eventIndex > 0 && input.events[eventIndex - 1]?.defeated)
    ) {
      throw new InvalidBattleSequenceError('Round events do not match its HP state.');
    }
    currentHp[event.defenderId] = event.defenderHpAfter;
  }

  if (fighterIds.some((fighterId) => currentHp[fighterId] !== input.endingHp[fighterId])) {
    throw new InvalidBattleSequenceError('Round ending HP does not match its attacks.');
  }
}

function sameKeys(
  first: Readonly<Record<string, number>>,
  second: Readonly<Record<string, number>>
): boolean {
  const firstKeys = Object.keys(first).sort();
  const secondKeys = Object.keys(second).sort();
  return (
    firstKeys.length === secondKeys.length &&
    firstKeys.every((key, index) => key === secondKeys[index])
  );
}
