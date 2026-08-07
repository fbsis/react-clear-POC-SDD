import { validateCombatStats } from '../validations/validateCombatStats';

export class CombatStats {
  public readonly attack: number;
  public readonly defense: number;
  public readonly speed: number;
  public readonly hp: number;

  private constructor(attack: number, defense: number, speed: number, hp: number) {
    this.attack = attack;
    this.defense = defense;
    this.speed = speed;
    this.hp = hp;
    Object.freeze(this);
  }

  public static create(
    input: Readonly<{ attack: number; defense: number; speed: number; hp: number }>
  ): CombatStats {
    validateCombatStats(input);
    return new CombatStats(input.attack, input.defense, input.speed, input.hp);
  }

  public equals(other: CombatStats): boolean {
    return (
      this.attack === other.attack &&
      this.defense === other.defense &&
      this.speed === other.speed &&
      this.hp === other.hp
    );
  }

  public toSnapshot(): Readonly<{ attack: number; defense: number; speed: number; hp: number }> {
    return Object.freeze({
      attack: this.attack,
      defense: this.defense,
      speed: this.speed,
      hp: this.hp
    });
  }
}
