import type { Battle } from '@domains/battle/Battle';
import type { MonsterSnapshot } from '@domains/battle';
import type { MonsterDto } from '../monster/dtos/MonsterDto';
import type { BattleDto } from './dtos/BattleDto';
import type { BattleEventDto } from './dtos/BattleEventDto';
import type { BattleRoundDto } from './dtos/BattleRoundDto';

export function mapBattleToDto(battle: Battle): BattleDto {
  const fighters: readonly [MonsterDto, MonsterDto] = Object.freeze([
    mapFighter(battle.fighters[0]),
    mapFighter(battle.fighters[1])
  ]);
  const rounds = Object.freeze(
    battle.rounds.map((round): BattleRoundDto =>
      Object.freeze({
        number: round.number,
        startingHp: Object.freeze({ ...round.startingHp }),
        events: Object.freeze(
          round.events.map((event): BattleEventDto =>
            Object.freeze({
              sequence: event.sequence,
              roundNumber: event.roundNumber,
              attackerId: event.attackerId,
              defenderId: event.defenderId,
              damage: event.damage,
              defenderHpBefore: event.defenderHpBefore,
              defenderHpAfter: event.defenderHpAfter,
              defeated: event.defeated
            })
          )
        ),
        endingHp: Object.freeze({ ...round.endingHp })
      })
    )
  );
  const attackOrder: readonly [string, string] = Object.freeze([
    battle.attackOrder[0],
    battle.attackOrder[1]
  ]);

  return Object.freeze({
    id: battle.id,
    fighters,
    attackOrder,
    rounds,
    winnerId: battle.result.winnerId,
    loserId: battle.result.loserId,
    finalRoundNumber: battle.result.finalRoundNumber,
    finalEventSequence: battle.result.finalEventSequence
  });
}

function mapFighter(fighter: MonsterSnapshot): MonsterDto {
  return Object.freeze({
    id: fighter.id,
    name: fighter.name,
    attack: fighter.stats.attack,
    defense: fighter.stats.defense,
    speed: fighter.stats.speed,
    hp: fighter.stats.hp,
    image: Object.freeze({ ...fighter.image })
  });
}
