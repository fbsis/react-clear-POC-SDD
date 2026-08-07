export class InvalidMonsterNameError extends Error {
  public constructor() {
    super('Monster name must contain between 1 and 80 visible characters.');
    this.name = 'InvalidMonsterNameError';
  }
}
