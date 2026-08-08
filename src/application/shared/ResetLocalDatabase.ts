import type { ResetLocalDatabaseUseCase } from './contracts/ResetLocalDatabaseUseCase';
import type { LocalDatabaseResetter } from './ports/LocalDatabaseResetter';

export class ResetLocalDatabase implements ResetLocalDatabaseUseCase {
  private readonly resetter: LocalDatabaseResetter;

  public constructor(resetter: LocalDatabaseResetter) {
    this.resetter = resetter;
  }

  public execute(): Promise<void> {
    return this.resetter.reset();
  }
}
