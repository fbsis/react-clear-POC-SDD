import { InvalidMonsterCreatedAtError } from '../errors/InvalidMonsterCreatedAtError';

export function validateMonsterCreatedAt(value: Date): number {
  const timestamp = value.getTime();
  if (!Number.isFinite(timestamp)) {
    throw new InvalidMonsterCreatedAtError();
  }
  return timestamp;
}
