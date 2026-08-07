import { InvalidMonsterIdError } from '../errors/InvalidMonsterIdError';

export function validateMonsterId(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new InvalidMonsterIdError();
  }
  return normalized;
}
