import type { MonsterRepository } from '@application/monster/ports/MonsterRepository';

export interface MonsterRepositoryFactory {
  create(): Promise<MonsterRepository>;
  reset(): Promise<void>;
}
