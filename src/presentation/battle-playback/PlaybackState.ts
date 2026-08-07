export interface PlaybackState {
  readonly status: 'ready' | 'playing' | 'paused' | 'complete';
  readonly eventIndex: number | null;
  readonly totalEvents: number;
  readonly generation: number;
}
