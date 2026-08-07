export type MonsterImageReferenceDto =
  | Readonly<{ kind: 'catalog'; reference: string }>
  | Readonly<{ kind: 'upload'; reference: string }>;
