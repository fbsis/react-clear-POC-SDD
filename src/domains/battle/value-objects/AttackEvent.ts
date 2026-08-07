import { validateAttackEvent } from '../validations/validateAttackEvent';

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
    const [attackerId, defenderId] = validateAttackEvent(input);
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
