export class InvalidMonsterCreatedAtError extends Error {
  public constructor() {
    super('Monster creation date must be valid.');
    this.name = 'InvalidMonsterCreatedAtError';
  }
}
