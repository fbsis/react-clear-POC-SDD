import type { IdGenerator } from '@application/shared/ports/IdGenerator';

export class CryptoIdGenerator implements IdGenerator {
  public next(): string {
    return crypto.randomUUID();
  }
}
