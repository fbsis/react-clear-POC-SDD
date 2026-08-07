import type { MonsterDto } from '../../monster/dtos/MonsterDto';
import type { BattleRoundDto } from './BattleRoundDto';

export interface BattleDto {
  readonly id: string;
  readonly fighters: readonly [MonsterDto, MonsterDto];
  readonly attackOrder: readonly [string, string];
  readonly rounds: readonly BattleRoundDto[];
  readonly winnerId: string;
  readonly loserId: string;
  readonly finalRoundNumber: number;
  readonly finalEventSequence: number;
}
