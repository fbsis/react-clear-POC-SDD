export type FighterSelectionAction =
  | Readonly<{ type: 'focus'; monsterId: string }>
  | Readonly<{ type: 'select'; monsterId: string }>
  | Readonly<{ type: 'activate'; side: 'first' | 'second' }>
  | Readonly<{ type: 'remove'; side: 'first' | 'second' }>;
