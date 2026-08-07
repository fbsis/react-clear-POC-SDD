export class MonsterId {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): MonsterId {
    const normalized = value.trim();
    if (!normalized) {
      throw new Error('Monster ID must not be blank.');
    }
    return new MonsterId(normalized);
  }

  public equals(other: MonsterId): boolean {
    return this.value === other.value;
  }
}
