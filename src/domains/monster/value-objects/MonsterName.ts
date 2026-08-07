import { validateMonsterName } from '../validations/validateMonsterName';

export class MonsterName {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  public static create(value: string): MonsterName {
    return new MonsterName(validateMonsterName(value));
  }

  public equals(other: MonsterName): boolean {
    return this.value === other.value;
  }
}
