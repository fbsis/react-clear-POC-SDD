import type { Monster } from '@domains/monster';
import { AttackEvent } from './AttackEvent';
import { Battle } from './Battle';
import { BattleResult } from './BattleResult';
import { InvalidBattleError } from './errors/InvalidBattleError';
import { snapshotMonster } from './MonsterSnapshot';
import type { MonsterSnapshot } from './MonsterSnapshot';
import { Round } from './Round';

export function resolveBattle(firstMonster: Monster, secondMonster: Monster): Battle {
  if (firstMonster.id.equals(secondMonster.id)) {
    throw new InvalidBattleError();
  }

  const fighters: readonly [MonsterSnapshot, MonsterSnapshot] = Object.freeze([
    snapshotMonster(firstMonster),
    snapshotMonster(secondMonster)
  ]);
  const attackOrder = determineAttackOrder(fighters);
  const currentHp: Record<string, number> = {
    [fighters[0].id]: fighters[0].stats.hp,
    [fighters[1].id]: fighters[1].stats.hp
  };
  const rounds: Round[] = [];
  let eventSequence = 0;
  let result: BattleResult | undefined;

  while (!result) {
    const roundNumber = rounds.length + 1;
    const startingHp = { ...currentHp };
    const events: AttackEvent[] = [];

    for (const attackerId of attackOrder) {
      const defenderId = attackerId === attackOrder[0] ? attackOrder[1] : attackOrder[0];
      const attacker = fighterById(fighters, attackerId);
      const defender = fighterById(fighters, defenderId);
      const damage = Math.max(attacker.stats.attack - defender.stats.defense, 1);
      const defenderHpBefore = currentHp[defenderId];
      if (defenderHpBefore === undefined || defenderHpBefore <= 0) {
        throw new InvalidBattleError('A defeated monster cannot be attacked again.');
      }
      const defenderHpAfter = Math.max(defenderHpBefore - damage, 0);
      const event = AttackEvent.create({
        sequence: eventSequence,
        roundNumber,
        attackerId,
        defenderId,
        damage,
        defenderHpBefore,
        defenderHpAfter
      });
      events.push(event);
      currentHp[defenderId] = defenderHpAfter;
      eventSequence += 1;

      if (event.defeated) {
        result = BattleResult.create({
          winnerId: attackerId,
          loserId: defenderId,
          finalRoundNumber: roundNumber,
          finalEventSequence: event.sequence
        });
        break;
      }
    }

    rounds.push(Round.create({ number: roundNumber, startingHp, events, endingHp: currentHp }));
  }

  return Battle.create({ fighters, attackOrder, rounds, result });
}

function determineAttackOrder(
  fighters: readonly [MonsterSnapshot, MonsterSnapshot]
): readonly [string, string] {
  const [first, second] = fighters;
  const secondStarts =
    second.stats.speed > first.stats.speed ||
    (second.stats.speed === first.stats.speed && second.stats.attack > first.stats.attack);
  return Object.freeze(secondStarts ? [second.id, first.id] : [first.id, second.id]);
}

function fighterById(
  fighters: readonly [MonsterSnapshot, MonsterSnapshot],
  fighterId: string
): MonsterSnapshot {
  const fighter = fighters.find((candidate) => candidate.id === fighterId);
  if (!fighter) {
    throw new InvalidBattleError('Attack order references an unknown fighter.');
  }
  return fighter;
}
