import type { Monster } from '@domains/monster';
import type { MonsterDto } from './dtos/MonsterDto';

export function mapMonsterToDto(monster: Monster): MonsterDto {
  return {
    id: monster.id.value,
    name: monster.name.value,
    attack: monster.stats.attack,
    defense: monster.stats.defense,
    speed: monster.stats.speed,
    hp: monster.stats.hp,
    image: { kind: monster.image.kind, reference: monster.image.reference }
  };
}
