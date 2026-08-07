import { InvalidMonsterImageReferenceError } from '../errors/InvalidMonsterImageReferenceError';

export function validateMonsterImageReference(reference: string): string {
  const normalized = reference.trim();
  if (!normalized) {
    throw new InvalidMonsterImageReferenceError();
  }
  return normalized;
}
