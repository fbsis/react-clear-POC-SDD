import type { BattleEventDto } from '@application/battle/dtos/BattleEventDto';
import type { BattleRoundDto } from '@application/battle/dtos/BattleRoundDto';
import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import styles from './BattlePlaybackPage.module.css';

export function RoundBattleLog({
  round,
  fighters,
  currentEvent
}: Readonly<{
  round: BattleRoundDto;
  fighters: readonly [MonsterDto, MonsterDto];
  currentEvent: BattleEventDto | null;
}>) {
  return (
    <section className={styles.battleLog} aria-label={`Log do round ${String(round.number)}`}>
      <header className={styles.battleLogHeader}>
        <div>
          <span>Ordem dos ataques</span>
          <h2>Log do round {round.number}</h2>
        </div>
        <strong>
          {currentEvent
            ? `Ação ${String(actionNumber(round.events, currentEvent))} de ${String(round.events.length)}`
            : `${String(round.events.length)} ações previstas`}
        </strong>
      </header>

      <ol className={styles.battleLogList}>
        {round.events.map((event, index) => {
          const attacker = monsterName(fighters, event.attackerId);
          const defender = monsterName(fighters, event.defenderId);
          const state = eventState(event, currentEvent);
          return (
            <li key={event.sequence} className={styles.battleLogEntry} data-state={state}>
              <span className={styles.logSequence}>{index + 1}</span>
              <div>
                <span className={styles.logState}>{stateLabel(state)}</span>
                <strong>
                  {attacker} {attackVerb(state)} {defender}
                </strong>
                <small>
                  {event.defenderHpBefore} → {event.defenderHpAfter} HP (-{event.damage})
                </small>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function actionNumber(events: readonly BattleEventDto[], currentEvent: BattleEventDto): number {
  return events.findIndex((event) => event.sequence === currentEvent.sequence) + 1;
}

function monsterName(fighters: readonly MonsterDto[], monsterId: string): string {
  return fighters.find((fighter) => fighter.id === monsterId)?.name ?? 'Monstro desconhecido';
}

function eventState(
  event: BattleEventDto,
  currentEvent: BattleEventDto | null
): 'completed' | 'current' | 'upcoming' {
  if (!currentEvent || event.sequence > currentEvent.sequence) return 'upcoming';
  if (event.sequence === currentEvent.sequence) return 'current';
  return 'completed';
}

function stateLabel(state: 'completed' | 'current' | 'upcoming'): string {
  if (state === 'completed') return 'Concluída';
  if (state === 'current') return 'Agora';
  return 'Próxima';
}

function attackVerb(state: 'completed' | 'current' | 'upcoming'): string {
  if (state === 'completed') return 'atacou';
  if (state === 'upcoming') return 'atacará';
  return 'ataca';
}
