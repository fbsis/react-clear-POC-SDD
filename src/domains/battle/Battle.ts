import type { BattleResult } from './BattleResult';
import { InvalidBattleError } from './errors/InvalidBattleError';
import { InvalidBattleSequenceError } from './errors/InvalidBattleSequenceError';
import type { MonsterSnapshot } from './MonsterSnapshot';
import type { Round } from './Round';

export class Battle {
  public readonly id: string;
  public readonly fighters: readonly [MonsterSnapshot, MonsterSnapshot];
  public readonly attackOrder: readonly [string, string];
  public readonly rounds: readonly Round[];
  public readonly result: BattleResult;

  private constructor(
    fighters: readonly [MonsterSnapshot, MonsterSnapshot],
    attackOrder: readonly [string, string],
    rounds: readonly Round[],
    result: BattleResult
  ) {
    this.id = `${fighters[0].id}:${fighters[1].id}`;
    this.fighters = Object.freeze([...fighters]) as readonly [MonsterSnapshot, MonsterSnapshot];
    this.attackOrder = Object.freeze([...attackOrder]) as readonly [string, string];
    this.rounds = Object.freeze([...rounds]);
    this.result = result;
    Object.freeze(this);
  }

  public static create(
    input: Readonly<{
      fighters: readonly [MonsterSnapshot, MonsterSnapshot];
      attackOrder: readonly [string, string];
      rounds: readonly Round[];
      result: BattleResult;
    }>
  ): Battle {
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
        fighterIds.some(
          (fighterId) => previousEndingHp?.[fighterId] !== round.startingHp[fighterId]
        )
      ) {
        throw new InvalidBattleSequenceError('Round HP must continue from the previous round.');
      }
      for (const event of round.events) {
        if (
          event.sequence !== expectedEventSequence ||
          !fighterIds.includes(event.attackerId) ||
          !fighterIds.includes(event.defenderId)
        ) {
          throw new InvalidBattleSequenceError('Attack events must be global and contiguous.');
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
      throw new InvalidBattleSequenceError(
        'Battle result must describe the final defeating attack.'
      );
    }

    return new Battle(input.fighters, input.attackOrder, input.rounds, input.result);
  }
}
