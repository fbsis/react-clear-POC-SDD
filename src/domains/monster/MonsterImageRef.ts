import { InvalidMonsterImageReferenceError } from './errors/InvalidMonsterImageReferenceError';

export class MonsterImageRef {
  public readonly kind: 'catalog' | 'upload';
  public readonly reference: string;

  private constructor(kind: 'catalog' | 'upload', reference: string) {
    this.kind = kind;
    this.reference = reference;
  }

  public static catalog(imageId: string): MonsterImageRef {
    return new MonsterImageRef('catalog', MonsterImageRef.normalize(imageId));
  }

  public static upload(assetId: string): MonsterImageRef {
    return new MonsterImageRef('upload', MonsterImageRef.normalize(assetId));
  }

  private static normalize(reference: string): string {
    const normalized = reference.trim();
    if (!normalized) {
      throw new InvalidMonsterImageReferenceError();
    }
    return normalized;
  }
}
