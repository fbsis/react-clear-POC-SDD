import type { Monster } from '@domains/monster/Monster';

export type MonsterSnapshot = Readonly<{
  id: string;
  name: string;
  stats: Readonly<{
    attack: number;
    defense: number;
    speed: number;
    hp: number;
  }>;
  image: Readonly<{
    kind: 'catalog' | 'upload';
    reference: string;
  }>;
}>;

export function snapshotMonster(monster: Monster): MonsterSnapshot {
  return Object.freeze({
    id: monster.id.value,
    name: monster.name,
    stats: Object.freeze(monster.stats.toSnapshot()),
    image: Object.freeze({ kind: monster.image.kind, reference: monster.image.reference })
  });
}
