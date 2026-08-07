import { validateRound } from '../validations/validateRound';
import type { AttackEvent } from './AttackEvent';

export class Round {
  public readonly number: number;
  public readonly startingHp: Readonly<Record<string, number>>;
  public readonly events: readonly AttackEvent[];
  public readonly endingHp: Readonly<Record<string, number>>;

  private constructor(
    number: number,
    startingHp: Readonly<Record<string, number>>,
    events: readonly AttackEvent[],
    endingHp: Readonly<Record<string, number>>
  ) {
    this.number = number;
    this.startingHp = Object.freeze({ ...startingHp });
    this.events = Object.freeze([...events]);
    this.endingHp = Object.freeze({ ...endingHp });
    Object.freeze(this);
  }

  public static create(
    input: Readonly<{
      number: number;
      startingHp: Readonly<Record<string, number>>;
      events: readonly AttackEvent[];
      endingHp: Readonly<Record<string, number>>;
    }>
  ): Round {
    validateRound(input);
    return new Round(input.number, input.startingHp, input.events, input.endingHp);
  }
}
