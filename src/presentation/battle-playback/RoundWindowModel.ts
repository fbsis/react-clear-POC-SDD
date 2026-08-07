export interface RoundWindowModel {
  readonly activeRoundNumber: number;
  readonly totalRounds: number;
  readonly visibleRoundNumbers: readonly number[];
  readonly isWindowed: boolean;
}
