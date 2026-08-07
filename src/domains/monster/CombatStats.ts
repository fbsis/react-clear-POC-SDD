import { InvalidCombatStatsError } from './errors/InvalidCombatStatsError';

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
  }

  public static create(
    input: Readonly<{ attack: number; defense: number; speed: number; hp: number }>
  ): CombatStats {
    CombatStats.assertRange('attack', input.attack, 0, 9_999);
    CombatStats.assertRange('defense', input.defense, 0, 9_999);
    CombatStats.assertRange('speed', input.speed, 0, 9_999);
    CombatStats.assertRange('hp', input.hp, 1, 9_999);
    return new CombatStats(input.attack, input.defense, input.speed, input.hp);
  }

  public toSnapshot(): Readonly<{ attack: number; defense: number; speed: number; hp: number }> {
    return { attack: this.attack, defense: this.defense, speed: this.speed, hp: this.hp };
  }

  private static assertRange(field: string, value: number, minimum: number, maximum: number): void {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new InvalidCombatStatsError(field);
    }
  }
}
