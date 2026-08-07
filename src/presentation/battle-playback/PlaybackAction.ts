export type PlaybackAction =
  | Readonly<{ type: 'load'; totalEvents: number }>
  | Readonly<{ type: 'play' }>
  | Readonly<{ type: 'tick'; generation: number }>
  | Readonly<{ type: 'select'; eventIndex: number }>
  | Readonly<{ type: 'pause' }>;
