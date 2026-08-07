export class InvalidBattleSequenceError extends Error {
  public constructor(
    message = 'Battle rounds and events must form one contiguous valid sequence.'
  ) {
    super(message);
    this.name = 'InvalidBattleSequenceError';
  }
}
