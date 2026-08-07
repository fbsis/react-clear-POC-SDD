import { validateBattle } from './validations/validateBattle';
import type { BattleResult } from './value-objects/BattleResult';
import type { MonsterSnapshot } from './value-objects/MonsterSnapshot';
import type { Round } from './value-objects/Round';

export class Battle {
  public readonly id: string;
  public readonly fighters: readonly [MonsterSnapshot, MonsterSnapshot];
  public readonly attackOrder: readonly [string, string];
  public readonly rounds: readonly Round[];
  public readonly result: BattleResult;

  private constructor(
    fighters: readonly [MonsterSnapshot, MonsterSnapshot],
    attackOrder: readonly [string, string],
    rounds: readonly Round[],
    result: BattleResult
  ) {
    this.id = `${fighters[0].id}:${fighters[1].id}`;
    this.fighters = Object.freeze([...fighters]);
    this.attackOrder = Object.freeze([...attackOrder]);
    this.rounds = Object.freeze([...rounds]);
    this.result = result;
    Object.freeze(this);
  }

  public static create(
    input: Readonly<{
      fighters: readonly [MonsterSnapshot, MonsterSnapshot];
      attackOrder: readonly [string, string];
      rounds: readonly Round[];
      result: BattleResult;
    }>
  ): Battle {
    validateBattle(input);
    return new Battle(input.fighters, input.attackOrder, input.rounds, input.result);
  }
}
