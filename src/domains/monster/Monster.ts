import { CombatStats } from './value-objects/CombatStats';
import type { MonsterId } from './value-objects/MonsterId';
import type { MonsterImageRef } from './value-objects/MonsterImageRef';
import { MonsterName } from './value-objects/MonsterName';
import { validateMonsterCreatedAt } from './validations/validateMonsterCreatedAt';

export class Monster {
  public readonly id: MonsterId;
  public readonly name: MonsterName;
  public readonly stats: CombatStats;
  public readonly image: MonsterImageRef;
  private readonly createdAtTimestamp: number;

  private constructor(
    id: MonsterId,
    name: MonsterName,
    stats: CombatStats,
    image: MonsterImageRef,
    createdAtTimestamp: number
  ) {
    this.id = id;
    this.name = name;
    this.stats = stats;
    this.image = image;
    this.createdAtTimestamp = createdAtTimestamp;
    Object.freeze(this);
  }

  public get createdAt(): Date {
    return new Date(this.createdAtTimestamp);
  }

  public static create(
    input: Readonly<{
      id: MonsterId;
      name: string;
      attack: number;
      defense: number;
      speed: number;
      hp: number;
      image: MonsterImageRef;
      createdAt: Date;
    }>
  ): Monster {
    return new Monster(
      input.id,
      MonsterName.create(input.name),
      CombatStats.create(input),
      input.image,
      validateMonsterCreatedAt(input.createdAt)
    );
  }
}
