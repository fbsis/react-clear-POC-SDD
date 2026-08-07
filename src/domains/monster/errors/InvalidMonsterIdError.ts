export class InvalidMonsterIdError extends Error {
  public constructor() {
    super('Monster ID must not be blank.');
    this.name = 'InvalidMonsterIdError';
  }
}
