import { InvalidBattleError } from './errors/InvalidBattleError';

export class BattleResult {
  public readonly winnerId: string;
  public readonly loserId: string;
  public readonly finalRoundNumber: number;
  public readonly finalEventSequence: number;

  private constructor(
    winnerId: string,
    loserId: string,
    finalRoundNumber: number,
    finalEventSequence: number
  ) {
    this.winnerId = winnerId;
    this.loserId = loserId;
    this.finalRoundNumber = finalRoundNumber;
    this.finalEventSequence = finalEventSequence;
    Object.freeze(this);
  }

  public static create(
    input: Readonly<{
      winnerId: string;
      loserId: string;
      finalRoundNumber: number;
      finalEventSequence: number;
    }>
  ): BattleResult {
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

    return new BattleResult(winnerId, loserId, input.finalRoundNumber, input.finalEventSequence);
  }
}
