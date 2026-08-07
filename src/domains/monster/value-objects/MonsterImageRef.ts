import { validateMonsterImageReference } from '../validations/validateMonsterImageReference';

export class MonsterImageRef {
  public readonly kind: 'catalog' | 'upload';
  public readonly reference: string;

  private constructor(kind: 'catalog' | 'upload', reference: string) {
    this.kind = kind;
    this.reference = reference;
    Object.freeze(this);
  }

  public static catalog(imageId: string): MonsterImageRef {
    return new MonsterImageRef('catalog', validateMonsterImageReference(imageId));
  }

  public static upload(assetId: string): MonsterImageRef {
    return new MonsterImageRef('upload', validateMonsterImageReference(assetId));
  }

  public equals(other: MonsterImageRef): boolean {
    return this.kind === other.kind && this.reference === other.reference;
  }
}
