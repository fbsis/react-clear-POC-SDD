import { InvalidBattleError } from '../errors/InvalidBattleError';
import { InvalidBattleSequenceError } from '../errors/InvalidBattleSequenceError';
import type { BattleResult } from '../value-objects/BattleResult';
import type { MonsterSnapshot } from '../value-objects/MonsterSnapshot';
import type { Round } from '../value-objects/Round';

export function validateBattle(
  input: Readonly<{
    fighters: readonly [MonsterSnapshot, MonsterSnapshot];
    attackOrder: readonly [string, string];
    rounds: readonly Round[];
    result: BattleResult;
  }>
): void {
  const fighterIds = input.fighters.map((fighter) => fighter.id);
  if (
    fighterIds[0] === fighterIds[1] ||
    input.attackOrder[0] === input.attackOrder[1] ||
    input.attackOrder.some((fighterId) => !fighterIds.includes(fighterId))
  ) {
    throw new InvalidBattleError();
  }
  if (input.rounds.length < 1) {
    throw new InvalidBattleSequenceError('Battle must contain at least one round.');
  }

  let expectedEventSequence = 0;
  let previousEndingHp: Readonly<Record<string, number>> | undefined;
  for (const [roundIndex, round] of input.rounds.entries()) {
    if (round.number !== roundIndex + 1) {
      throw new InvalidBattleSequenceError('Round numbers must be contiguous from one.');
    }
    if (
      previousEndingHp &&
      fighterIds.some((fighterId) => previousEndingHp?.[fighterId] !== round.startingHp[fighterId])
    ) {
      throw new InvalidBattleSequenceError('Round HP must continue from the previous round.');
    }
    if (
      roundIndex === 0 &&
      input.fighters.some((fighter) => round.startingHp[fighter.id] !== fighter.stats.hp)
    ) {
      throw new InvalidBattleSequenceError('Battle must start with the fighters maximum HP.');
    }
    for (const [eventIndex, event] of round.events.entries()) {
      const expectedAttackerId = input.attackOrder[eventIndex];
      const expectedDefenderId = input.attackOrder[eventIndex === 0 ? 1 : 0];
      const attacker = input.fighters.find((fighter) => fighter.id === event.attackerId);
      const defender = input.fighters.find((fighter) => fighter.id === event.defenderId);
      const expectedDamage =
        attacker && defender ? Math.max(attacker.stats.attack - defender.stats.defense, 1) : null;
      if (
        event.sequence !== expectedEventSequence ||
        !fighterIds.includes(event.attackerId) ||
        !fighterIds.includes(event.defenderId) ||
        event.attackerId !== expectedAttackerId ||
        event.defenderId !== expectedDefenderId ||
        event.damage !== expectedDamage
      ) {
        throw new InvalidBattleSequenceError(
          'Attack events must follow the fixed order, damage rule and global sequence.'
        );
      }
      expectedEventSequence += 1;
    }
    if (round.events.at(-1)?.defeated && roundIndex !== input.rounds.length - 1) {
      throw new InvalidBattleSequenceError('No round may follow a defeating attack.');
    }
    previousEndingHp = round.endingHp;
  }

  const finalRound = input.rounds.at(-1);
  const finalEvent = finalRound?.events.at(-1);
  if (
    !finalRound ||
    !finalEvent?.defeated ||
    input.result.finalRoundNumber !== finalRound.number ||
    input.result.finalEventSequence !== finalEvent.sequence ||
    input.result.winnerId !== finalEvent.attackerId ||
    input.result.loserId !== finalEvent.defenderId
  ) {
    throw new InvalidBattleSequenceError('Battle result must describe the final defeating attack.');
  }
}
