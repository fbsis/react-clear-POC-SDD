import { InvalidBattleSequenceError } from './errors/InvalidBattleSequenceError';

export class AttackEvent {
  public readonly sequence: number;
  public readonly roundNumber: number;
  public readonly attackerId: string;
  public readonly defenderId: string;
  public readonly damage: number;
  public readonly defenderHpBefore: number;
  public readonly defenderHpAfter: number;
  public readonly defeated: boolean;

  private constructor(
    sequence: number,
    roundNumber: number,
    attackerId: string,
    defenderId: string,
    damage: number,
    defenderHpBefore: number,
    defenderHpAfter: number
  ) {
    this.sequence = sequence;
    this.roundNumber = roundNumber;
    this.attackerId = attackerId;
    this.defenderId = defenderId;
    this.damage = damage;
    this.defenderHpBefore = defenderHpBefore;
    this.defenderHpAfter = defenderHpAfter;
    this.defeated = defenderHpAfter === 0;
    Object.freeze(this);
  }

  public static create(
    input: Readonly<{
      sequence: number;
      roundNumber: number;
      attackerId: string;
      defenderId: string;
      damage: number;
      defenderHpBefore: number;
      defenderHpAfter: number;
    }>
  ): AttackEvent {
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

    return new AttackEvent(
      input.sequence,
      input.roundNumber,
      attackerId,
      defenderId,
      input.damage,
      input.defenderHpBefore,
      input.defenderHpAfter
    );
  }
}
