export class InvalidBattleError extends Error {
  public constructor(message = 'Battle requires two distinct valid fighters.') {
    super(message);
    this.name = 'InvalidBattleError';
  }
}
