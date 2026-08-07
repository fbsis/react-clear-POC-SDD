export interface FighterSelectionState {
  readonly focusedMonsterId: string | null;
  readonly activeSide: 'first' | 'second';
  readonly firstMonsterId: string | null;
  readonly secondMonsterId: string | null;
  readonly message: string | null;
}
