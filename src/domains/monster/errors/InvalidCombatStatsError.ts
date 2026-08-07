export class InvalidCombatStatsError extends Error {
  public constructor(field: string) {
    super(`Invalid combat stat: ${field}.`);
    this.name = 'InvalidCombatStatsError';
  }
}
