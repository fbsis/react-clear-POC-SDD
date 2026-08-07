import { CombatStats } from './value-objects/CombatStats';
import type { MonsterId } from './value-objects/MonsterId';
import type { MonsterImageRef } from './value-objects/MonsterImageRef';
import { MonsterName } from './value-objects/MonsterName';

export class Monster {
  public readonly id: MonsterId;
  public readonly name: MonsterName;
  public readonly stats: CombatStats;
  public readonly image: MonsterImageRef;
  public readonly createdAt: Date;

  private constructor(
    id: MonsterId,
    name: MonsterName,
    stats: CombatStats,
    image: MonsterImageRef,
    createdAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.stats = stats;
    this.image = image;
    this.createdAt = createdAt;
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
      new Date(input.createdAt)
    );
  }
}
