import { InvalidMonsterNameError } from '../errors/InvalidMonsterNameError';

export function validateMonsterName(value: string): string {
  const normalized = value.trim();
  if (normalized.length < 1 || normalized.length > 80) {
    throw new InvalidMonsterNameError();
  }
  return normalized;
}
