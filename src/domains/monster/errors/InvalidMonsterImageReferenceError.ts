export class InvalidMonsterImageReferenceError extends Error {
  public constructor() {
    super('Monster image reference must not be blank.');
    this.name = 'InvalidMonsterImageReferenceError';
  }
}
