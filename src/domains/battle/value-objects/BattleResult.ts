import { validateBattleResult } from '../validations/validateBattleResult';

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
    const [winnerId, loserId] = validateBattleResult(input);
    return new BattleResult(winnerId, loserId, input.finalRoundNumber, input.finalEventSequence);
  }
}
