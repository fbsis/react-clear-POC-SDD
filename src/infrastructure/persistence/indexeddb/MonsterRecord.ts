export interface MonsterRecord {
  readonly id: string;
  readonly name: string;
  readonly normalizedName: string;
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
  readonly hp: number;
  readonly imageKind: 'catalog' | 'upload';
  readonly imageReference: string;
  readonly createdAt: string;
}
