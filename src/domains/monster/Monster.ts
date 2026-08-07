import { CombatStats } from './CombatStats';
import { InvalidMonsterNameError } from './errors/InvalidMonsterNameError';
import type { MonsterId } from './MonsterId';
import type { MonsterImageRef } from './MonsterImageRef';

export class Monster {
  public readonly id: MonsterId;
  public readonly name: string;
  public readonly stats: CombatStats;
  public readonly image: MonsterImageRef;
  public readonly createdAt: Date;

  private constructor(
    id: MonsterId,
    name: string,
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
    const name = input.name.trim();
    if (name.length < 1 || name.length > 80) {
      throw new InvalidMonsterNameError();
    }

    return new Monster(
      input.id,
      name,
      CombatStats.create(input),
      input.image,
      new Date(input.createdAt)
    );
  }
}
