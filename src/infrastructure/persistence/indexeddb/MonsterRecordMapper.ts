import { Monster } from '@domains/monster/Monster';
import { MonsterId } from '@domains/monster/MonsterId';
import { MonsterImageRef } from '@domains/monster/MonsterImageRef';
import type { MonsterRecord } from './MonsterRecord';

export class MonsterRecordMapper {
  public toRecord(monster: Monster): MonsterRecord {
    return {
      id: monster.id.value,
      name: monster.name,
      normalizedName: monster.name.toLocaleLowerCase('pt-BR'),
      attack: monster.stats.attack,
      defense: monster.stats.defense,
      speed: monster.stats.speed,
      hp: monster.stats.hp,
      imageKind: monster.image.kind,
      imageReference: monster.image.reference,
      createdAt: monster.createdAt.toISOString()
    };
  }

  public toDomain(record: MonsterRecord): Monster {
    return Monster.create({
      id: MonsterId.create(record.id),
      name: record.name,
      attack: record.attack,
      defense: record.defense,
      speed: record.speed,
      hp: record.hp,
      image:
        record.imageKind === 'catalog'
          ? MonsterImageRef.catalog(record.imageReference)
          : MonsterImageRef.upload(record.imageReference),
      createdAt: new Date(record.createdAt)
    });
  }
}
