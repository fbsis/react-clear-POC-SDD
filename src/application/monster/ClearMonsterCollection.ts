import type { ClearMonsterCollectionUseCase } from './contracts/ClearMonsterCollectionUseCase';
import type { MonsterCollectionCleaner } from './ports/MonsterCollectionCleaner';

export class ClearMonsterCollection implements ClearMonsterCollectionUseCase {
  private readonly cleaner: MonsterCollectionCleaner;

  public constructor(cleaner: MonsterCollectionCleaner) {
    this.cleaner = cleaner;
  }

  public execute(): Promise<void> {
    return this.cleaner.clear();
  }
}
