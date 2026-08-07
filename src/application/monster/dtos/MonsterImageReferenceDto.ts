export type MonsterImageReferenceDto = Readonly<{
  kind: 'catalog' | 'upload';
  reference: string;
}>;
