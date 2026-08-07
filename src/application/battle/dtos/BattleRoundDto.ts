import type { BattleEventDto } from './BattleEventDto';

export interface BattleRoundDto {
  readonly number: number;
  readonly startingHp: Readonly<Record<string, number>>;
  readonly events: readonly BattleEventDto[];
  readonly endingHp: Readonly<Record<string, number>>;
}
