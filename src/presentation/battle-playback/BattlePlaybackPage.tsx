import { useMemo } from 'react';
import type { BattleDto } from '@application/battle/dtos/BattleDto';
import type { BattleEventDto } from '@application/battle/dtos/BattleEventDto';
import { useGameSession } from '@app/hooks/useGameSession';
import { Button } from '@presentation/shared/components/Button';
import { BattleCard } from './BattleCard';
import { BattleEventSummary } from './BattleEventSummary';
import { RoundBattleLog } from './RoundBattleLog';
import { RoundTimeline } from './RoundTimeline';
import { useBattlePlayback } from './useBattlePlayback';
import styles from './BattlePlaybackPage.module.css';

export function BattlePlaybackPage() {
  const session = useGameSession();

  if (!session.battle) {
    return (
      <section className={styles.emptyBattle}>
        <h1>Nenhuma batalha preparada</h1>
        <Button type="button" onClick={session.prepareNewBattle}>
          Escolher lutadores
        </Button>
      </section>
    );
  }

  return <BattleContent battle={session.battle} onNewBattle={session.prepareNewBattle} />;
}

function BattleContent({
  battle,
  onNewBattle
}: Readonly<{ battle: BattleDto; onNewBattle: () => void }>) {
  const events = useMemo(() => battle.rounds.flatMap((round) => round.events), [battle.rounds]);
  const playback = useBattlePlayback(battle);
  const hpFrames = useMemo(() => createHpFrames(battle, events), [battle, events]);
  const event =
    playback.state.eventIndex === null ? null : (events[playback.state.eventIndex] ?? null);
  const activeRoundNumber = event?.roundNumber ?? 1;
  const activeRound = battle.rounds[activeRoundNumber - 1] ?? battle.rounds[0];
  const activeActionNumber =
    event && activeRound
      ? activeRound.events.findIndex((candidate) => candidate.sequence === event.sequence) + 1
      : null;
  const hp =
    playback.state.eventIndex === null
      ? Object.fromEntries(battle.fighters.map((fighter) => [fighter.id, fighter.hp]))
      : (hpFrames[playback.state.eventIndex] ?? {});
  const attacker = event
    ? (battle.fighters.find((fighter) => fighter.id === event.attackerId) ?? null)
    : null;
  const defender = event
    ? (battle.fighters.find((fighter) => fighter.id === event.defenderId) ?? null)
    : null;
  const winner = battle.fighters.find((fighter) => fighter.id === battle.winnerId);
  const complete = playback.state.status === 'complete';

  function selectRound(roundNumber: number): void {
    const round = battle.rounds[roundNumber - 1];
    const lastEvent = round?.events.at(-1);
    if (!lastEvent) return;
    const eventIndex = events.findIndex((candidate) => candidate.sequence === lastEvent.sequence);
    if (eventIndex >= 0) playback.selectEvent(eventIndex);
  }

  return (
    <section className={styles.page} aria-labelledby="battle-title">
      <header className={styles.hero}>
        <span>Grande arena do castelo</span>
        <h1 id="battle-title">Arena de batalha</h1>
        <p>Acompanhe cada golpe mágico e explore os rounds no seu ritmo.</p>
      </header>

      <div className={styles.arena}>
        <BattleCard
          monster={battle.fighters[0]}
          currentHp={hp[battle.fighters[0].id] ?? battle.fighters[0].hp}
          isAttacker={!complete && event?.attackerId === battle.fighters[0].id}
          isDefender={!complete && event?.defenderId === battle.fighters[0].id}
          isWinner={complete && battle.winnerId === battle.fighters[0].id}
          isDefeated={complete && battle.loserId === battle.fighters[0].id}
        />
        <div className={styles.centerStage}>
          <span className={styles.roundCrest}>Round {activeRoundNumber}</span>
          <BattleEventSummary
            event={event}
            attacker={attacker}
            defender={defender}
            actionNumber={activeActionNumber}
            totalActions={activeRound?.events.length ?? 0}
          />
          <div className={styles.playbackControls}>
            <Button type="button" onClick={playback.play}>
              {playback.state.eventIndex === null ? 'Play' : 'Reiniciar'}
            </Button>
            {playback.state.status === 'playing' ? (
              <Button type="button" variant="secondary" onClick={playback.pause}>
                Pausar
              </Button>
            ) : null}
          </div>
        </div>
        <BattleCard
          monster={battle.fighters[1]}
          currentHp={hp[battle.fighters[1].id] ?? battle.fighters[1].hp}
          isAttacker={!complete && event?.attackerId === battle.fighters[1].id}
          isDefender={!complete && event?.defenderId === battle.fighters[1].id}
          isWinner={complete && battle.winnerId === battle.fighters[1].id}
          isDefeated={complete && battle.loserId === battle.fighters[1].id}
        />
      </div>

      {activeRound ? (
        <RoundBattleLog round={activeRound} fighters={battle.fighters} currentEvent={event} />
      ) : null}

      <div className={styles.liveRegion} role="status" aria-live="polite" aria-atomic="true">
        {event && attacker && defender
          ? `Round ${String(event.roundNumber)}: ${attacker.name} atacou ${defender.name}, causando ${String(event.damage)} de dano. Vida restante: ${String(event.defenderHpAfter)}.`
          : 'Batalha pronta. Pressione Play para começar.'}
      </div>

      {complete && winner ? (
        <section className={styles.result} aria-label="Resultado da batalha">
          <span>Resultado final</span>
          <h2>{winner.name} vence!</h2>
          <p>Vitória definida no round {battle.finalRoundNumber}.</p>
        </section>
      ) : null}

      <RoundTimeline
        totalRounds={battle.rounds.length}
        activeRoundNumber={activeRoundNumber}
        onSelectRound={selectRound}
      />

      <div className={styles.footerActions}>
        <Button type="button" variant="ghost" onClick={onNewBattle}>
          Escolher nova batalha
        </Button>
      </div>
    </section>
  );
}

function createHpFrames(
  battle: BattleDto,
  events: readonly BattleEventDto[]
): readonly Readonly<Record<string, number>>[] {
  const hp: Record<string, number> = Object.fromEntries(
    battle.fighters.map((fighter) => [fighter.id, fighter.hp])
  );
  return events.map((event) => {
    hp[event.defenderId] = event.defenderHpAfter;
    return { ...hp };
  });
}
