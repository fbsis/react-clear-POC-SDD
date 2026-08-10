export type MonsterImageUrlState =
  | Readonly<{ status: 'loading'; url: null }>
  | Readonly<{ status: 'ready'; url: string }>
  | Readonly<{ status: 'error'; url: null }>;
