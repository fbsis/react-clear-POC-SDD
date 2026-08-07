export interface BattleEventDto {
  readonly sequence: number;
  readonly roundNumber: number;
  readonly attackerId: string;
  readonly defenderId: string;
  readonly damage: number;
  readonly defenderHpBefore: number;
  readonly defenderHpAfter: number;
  readonly defeated: boolean;
}
