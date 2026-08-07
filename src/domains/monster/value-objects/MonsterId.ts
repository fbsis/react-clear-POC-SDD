import { validateMonsterId } from '../validations/validateMonsterId';

export class MonsterId {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  public static create(value: string): MonsterId {
    return new MonsterId(validateMonsterId(value));
  }

  public equals(other: MonsterId): boolean {
    return this.value === other.value;
  }
}
